/**
 * PoolGenAI — Proxy Anthropic API + Vérification d'email + Calibration
 * Cloudflare Worker
 *
 * SÉCURITÉ : le proxy /v1/messages exige un ID token Firebase valide (header
 * Authorization: Bearer <idToken>) avant de transmettre la requête à l'API
 * Anthropic. Sans ça, n'importe qui connaissant l'URL du worker pourrait
 * consommer la clé API.
 *
 * Ce worker gère aussi l'envoi et la validation des liens de vérification
 * d'email via Resend (système maison, indépendant de Firebase Auth email
 * verification), les demandes de récupération/suppression de données pour
 * les comptes supprimés (self-service), et depuis v1.38.0 l'agrégation
 * périodique des points de calibration (Lot B) en modèles de correction par
 * régression linéaire, lisibles par les clients.
 *
 * Déploiement :
 *   1. Va sur https://dash.cloudflare.com → Workers & Pages → Create Worker
 *   2. Colle ce code, clique "Deploy"
 *   3. Dans Settings → Variables → ajoute ces Secrets :
 *        ANTHROPIC_API_KEY        : ta clé sk-ant-...
 *        RESEND_API_KEY           : clé API Resend (permission "Sending access",
 *                                    restreinte au domaine poolgenai.com)
 *        FIREBASE_SERVICE_ACCOUNT : JSON complet du compte de service, sur une
 *                                    seule ligne. Récupération :
 *                                    Firebase Console → Paramètres du projet →
 *                                    Comptes de service → Générer une nouvelle
 *                                    clé privée
 *   4. Vérifie que FIREBASE_PROJECT_ID ci-dessous correspond à ton projet
 *   5. Vérifie que ALLOWED_ORIGINS contient bien l'origine réelle de ton PWA
 *   6. Note l'URL du worker (ex: poolgenai-proxy.ton-compte.workers.dev)
 *   7. NOUVEAU v1.38.0 — Settings → Triggers → Cron Triggers → Add :
 *        - garde le trigger mensuel existant "1 0 1 * *" (nettoyage tokens)
 *        - ajoute un second trigger "0 3 * * *" (tous les jours à 3h UTC) —
 *          agrégation calibrationModels, distinguée via event.cron dans
 *          scheduled() ci-dessous. Fréquence quotidienne choisie pour que les
 *          modèles s'améliorent rapidement pendant que le volume de données
 *          est encore faible ; à espacer plus tard si le volume grossit.
 */

const ANTHROPIC_API = "https://api.anthropic.com";
const FIREBASE_PROJECT_ID = "poolgenai-prod";
const GOOGLE_JWK_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const IDENTITY_TOOLKIT_URL = "https://identitytoolkit.googleapis.com/v1/accounts:update";
const RESEND_API_URL = "https://api.resend.com/emails";

const VERIFICATION_LINK_BASE = "https://app.poolgenai.com/";
const VERIFICATION_TOKEN_TTL_HOURS = 24;
// v1.55.0 — Utilisateurs secondaires (brique 2)
const INVITATION_TOKEN_TTL_HOURS = 24;
// v1.95.0 — Avant cette version, MAX_SECONDARY_USERS plafonnait le nombre
// total d'invités sur l'ENSEMBLE du compte propriétaire, tous bassins
// confondus, et ce même pour un compte gratuit (aucune vérification
// isPremium du propriétaire n'existait). Nouvelle règle : un compte gratuit
// ne peut inviter personne (0), un compte Premium peut inviter jusqu'à 2
// personnes PAR BASSIN (donc jusqu'à 6 au total sur les 3 bassins max
// autorisés en Premium). Voir handleInviteSecondaryUser et
// handleRespondInvitation.
const MAX_SECONDARY_USERS_PER_POOL = 2;
const MAX_POOLS_PREMIUM = 3;
// v1.59.3 — Limite du nombre de bassins sur lesquels un compte gratuit peut
// avoir le statut invité (tous propriétaires confondus). Aucune limite si le
// compte invité lui-même est premium (son propre abonnement, jamais celui
// hérité d'un propriétaire — voir handleRespondInvitation).
const MAX_INVITED_POOLS_FREE = 2;
// v1.60.0 — Demande de révocation initiée par l'invité, confirmée par le
// propriétaire via un lien envoyé par email (voir /request-revoke-own-access,
// /revocation-info, /respond-revocation). Délai plus long que les invitations
// (7 jours) car le propriétaire n'est pas forcément pressé de réagir.
const REVOCATION_TOKEN_TTL_HOURS = 24 * 7;
// v1.55.0 — Pseudo (brique 3) : 2-24 caractères, lettres/chiffres/espaces/
// tirets/apostrophes (accents inclus), pas d'emoji ni caractères de contrôle.
const PSEUDO_REGEX = /^[\p{L}\p{N} '-]{2,24}$/u;
function normalizePseudoKey(pseudo) {
  return pseudo.trim().toLowerCase();
}
const RESEND_FROM = "PoolGenAI <noreply@poolgenai.com>";
const SUPPORT_EMAIL = "support.poolgenai@gmail.com";

// Cron Triggers — voir instructions de déploiement ci-dessus, point 7.
const CRON_CLEANUP_TOKENS = "1 0 1 * *";
const CRON_AGGREGATE_CALIBRATION = "0 3 * * *";

// v1.38.0 — Lot B : seuils de qualité et de suffisance pour accepter un
// modèle de calibration. Valeurs heuristiques, pas de certitude scientifique
// à ce stade — à ajuster une fois qu'on a des données réelles en volume.
const MIN_SHARPNESS = 5; // variance de Laplace en dessous = tampon jugé trop flou
const MIN_POINTS = 8; // nombre minimum de points de qualité suffisante par modèle+paramètre
// Écart minimum requis entre la valeur la plus basse et la plus haute observées
// parmi les points retenus, par paramètre — évite d'ajuster une droite sur des
// points quasi identiques (régression non significative). Basé sur la
// granularité usuelle des bandelettes du commerce, pas sur une échelle
// officielle (elle varie par marque, cf. discussion Lot B point 2).
const MIN_VALUE_SPREAD = {
  pH: 1.0, fCl: 2, tCl: 2, ccl: 0.5, tac: 40, cya: 20, hard: 100,
  phos: 50, copper: 0.1, iron: 0.05, temp: 4, brome: 2, o2: 5, sel: 1000,
};

const ALLOWED_ORIGINS = [
  "https://app.poolgenai.com",
];

// v1.41.0 — Rate-limiting par UID sur /v1/messages (analyse IA photos +
// diagnostics texte). Sans ça, un bug client en boucle ou un abus peut
// consommer la clé API Anthropic sans limite. 300/jour est large pour un
// usage normal (quelques mesures par jour avec photos) tout en bloquant un
// emballement. Stocké dans Firestore (collection rateLimits, accès service
// account uniquement — voir firestore.rules) plutôt que Workers KV, pour ne
// pas ajouter de binding/ressource Cloudflare supplémentaire à provisionner.
const DAILY_LIMIT_PER_UID = 300;

// v1.89.0 — Stripe (Phase B). Mêmes clés de test sur TEST et DEV (voir env
// STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / STRIPE_PRICE_MONTHLY /
// STRIPE_PRICE_YEARLY, à définir en Secrets Cloudflare, identiques sur les
// deux Workers). PROD utilisera les clés live le jour de la bascule.
const STRIPE_API = "https://api.stripe.com/v1";
const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300; // anti-rejeu

function corsHeaders(origin) {
  const allowed =
    ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)
      ? origin || "*"
      : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, anthropic-version, Authorization, x-uid",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

function jsonError(message, status, origin, code) {
  return jsonResponse(code ? { error: message, code } : { error: message }, status, origin);
}

// ---------- Encodage / décodage base64url ----------
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlEncode(bytes) {
  let binary = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ---------- Récupération des clés publiques Google (mises en cache par Cloudflare) ----------
async function getGooglePublicKeys() {
  const cache = caches.default;
  let response = await cache.match(GOOGLE_JWK_URL);
  if (!response) {
    response = await fetch(GOOGLE_JWK_URL);
    if (!response.ok) throw new Error("Impossible de récupérer les clés publiques Google");
    await cache.put(GOOGLE_JWK_URL, response.clone());
  }
  const data = await response.json();
  return data.keys;
}

// ---------- Vérification d'un ID token Firebase (RS256) ----------
async function verifyFirebaseIdToken(idToken) {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Token malformé");
  const [headerB64, payloadB64, sigB64] = parts;

  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64)));
  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));

  if (header.alg !== "RS256") throw new Error("Algorithme non supporté");

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) throw new Error("Token expiré");
  if (!payload.iat || payload.iat > now + 60) throw new Error("Token invalide (iat)");
  if (payload.aud !== FIREBASE_PROJECT_ID) throw new Error("Audience invalide");
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) {
    throw new Error("Émetteur invalide");
  }
  if (!payload.sub) throw new Error("UID manquant dans le token");

  const keys = await getGooglePublicKeys();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("Clé publique introuvable pour ce token");

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlDecode(sigB64);

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signature,
    signedData
  );
  if (!valid) throw new Error("Signature invalide");

  return payload; // payload.sub = uid Firebase vérifié, payload.email = email vérifié
}

// ---------- Obtention d'un access token OAuth2 Google (compte de service) ----------
// Signe un JWT avec la clé privée du compte de service et l'échange contre un
// access token Google. Mis en cache en mémoire (durée de vie de l'isolate)
// pour éviter de resigner un JWT à chaque requête.
let cachedGoogleToken = null; // { token, expiresAt }

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getGoogleAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedGoogleToken && cachedGoogleToken.expiresAt > now + 60) {
    return cachedGoogleToken.token;
  }

  const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const scopes = [
    "https://www.googleapis.com/auth/datastore",
    "https://www.googleapis.com/auth/identitytoolkit",
  ].join(" ");

  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: serviceAccount.client_email,
    scope: scopes,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const claimsB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(claims)));
  const signInput = `${headerB64}.${claimsB64}`;

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signInput)
  );

  const jwt = `${signInput}.${base64UrlEncode(signature)}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`Échec d'obtention du token Google : ${errText}`);
  }

  const tokenData = await tokenResponse.json();
  cachedGoogleToken = {
    token: tokenData.access_token,
    expiresAt: now + tokenData.expires_in,
  };
  return cachedGoogleToken.token;
}

// ---------- Conversion vers le format Firestore REST ----------
// v1.38.0 — étendu pour supporter nombres, objets imbriqués (map) et tableaux,
// nécessaires pour écrire les modèles de calibration (coefficients, plages de
// valeurs). Les usages existants (chaînes, booléens, dates) sont inchangés.
function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === "object") return { mapValue: { fields: toFirestoreFields(value) } };
  throw new Error(`Type non supporté pour Firestore: ${typeof value}`);
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = toFirestoreValue(value);
  }
  return fields;
}

// ---------- Conversion depuis le format Firestore REST ----------
// v1.38.0 — étendu pour supporter nombres, null, maps et tableaux (nécessaire
// pour relire les documents calibrationPoints, qui contiennent des maps
// imbriquées comme sampledColor: {r, g, b}).
function fromFirestoreValue(value) {
  if (value == null) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return parseInt(value.integerValue, 10);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return new Date(value.timestampValue);
  if ("nullValue" in value) return null;
  if ("mapValue" in value) return fromFirestoreFields(value.mapValue.fields);
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  return null;
}

function fromFirestoreFields(fields) {
  const obj = {};
  for (const [key, value] of Object.entries(fields || {})) {
    obj[key] = fromFirestoreValue(value);
  }
  return obj;
}

// ---------- Firestore : créer un document avec un ID choisi (échoue si existe) ----------
async function firestoreCreateDoc(env, collection, documentId, data) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}/${collection}?documentId=${documentId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec de création Firestore : ${errText}`);
  }
  return response.json();
}

// ---------- Firestore : créer OU remplacer entièrement un document (upsert) ----------
// v1.38.0 — nécessaire pour calibrationModels : chaque passage du cron doit
// pouvoir écraser le modèle précédent avec les données à jour. Différent de
// firestorePatchDoc (qui ne modifie que des champs précis d'un document
// existant) : ici, l'absence de paramètre updateMask dans l'URL indique à
// l'API Firestore de remplacer le document entier (ou de le créer s'il
// n'existe pas), exactement comme un .set() sans merge côté SDK client.
async function firestoreSetDoc(env, collection, documentId, data) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}/${collection}/${documentId}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec d'écriture Firestore : ${errText}`);
  }
  return response.json();
}

// ---------- Firestore : lire un document ----------
async function firestoreGetDoc(env, collection, documentId) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}/${collection}/${documentId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec de lecture Firestore : ${errText}`);
  }
  const data = await response.json();
  return fromFirestoreFields(data.fields);
}

// ---------- Firestore : lister TOUS les documents d'une collection (paginé) ----------
// v1.38.0 — nécessaire pour l'agrégation calibrationModels : il faut relire
// l'ensemble de calibrationPoints (contributions de tous les utilisateurs)
// pour construire les modèles. Pagine par lots de 300 tant qu'un
// nextPageToken est renvoyé.
async function firestoreListAllDocs(env, collection) {
  const accessToken = await getGoogleAccessToken(env);
  const docs = [];
  let pageToken;
  do {
    const url = new URL(`${FIRESTORE_BASE}/${collection}`);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Échec de listage Firestore : ${errText}`);
    }
    const data = await response.json();
    for (const doc of data.documents || []) {
      docs.push({ id: doc.name.split("/").pop(), ...fromFirestoreFields(doc.fields) });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return docs;
}

// ---------- Firestore : mettre à jour des champs précis d'un document ----------
async function firestorePatchDoc(env, collection, documentId, data) {
  const accessToken = await getGoogleAccessToken(env);
  const fieldNames = Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join("&");
  const url = `${FIRESTORE_BASE}/${collection}/${documentId}?${fieldNames}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec de mise à jour Firestore : ${errText}`);
  }
  return response.json();
}

// ---------- Firestore : incrément atomique d'un champ (fieldTransforms) ----------
// Contrairement à checkAndIncrementRateLimit (get-puis-set, non atomique),
// on utilise ici le vrai mécanisme d'incrément côté serveur Firestore via
// l'endpoint :commit. Nécessaire pour callCount sur commonProducts : deux
// utilisateurs confirmant le même produit en même temps ne doivent jamais
// perdre un incrément. Retourne la nouvelle valeur du champ.
async function firestoreIncrementField(env, collection, documentId, fieldPath, incrementBy) {
  const accessToken = await getGoogleAccessToken(env);
  const documentPath = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${documentId}`;
  const response = await fetch(`${FIRESTORE_BASE.replace(/\/documents$/, "")}:commit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      writes: [
        {
          transform: {
            document: documentPath,
            fieldTransforms: [
              {
                fieldPath,
                increment: { integerValue: String(incrementBy) },
              },
            ],
          },
        },
      ],
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec d'incrément Firestore : ${errText}`);
  }
  const data = await response.json();
  const transformed = data.writeResults?.[0]?.transformResults?.[0];
  return transformed ? fromFirestoreValue(transformed) : null;
}

// ---------- Rate-limiting par UID (v1.41.0) ----------
// Un document par UID+jour (rateLimits/{uid}_{YYYY-MM-DD}), incrémenté à
// chaque appel accepté. Le comptage repart naturellement à zéro chaque jour
// puisque l'ID du document change avec la date — pas besoin de logique de
// reset. Les vieux documents (jours passés) s'accumulent dans Firestore mais
// restent minuscules (quelques dizaines d'octets) : pas de nettoyage
// automatique pour l'instant, le volume est négligeable pour un usage perso.
function todayDateKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

async function checkAndIncrementRateLimit(env, uid) {
  const docId = `${uid}_${todayDateKey()}`;
  const existing = await firestoreGetDoc(env, "rateLimits", docId);
  const currentCount = existing?.count || 0;
  if (currentCount >= DAILY_LIMIT_PER_UID) {
    return { allowed: false, count: currentCount };
  }
  const newCount = currentCount + 1;
  await firestoreSetDoc(env, "rateLimits", docId, {
    uid,
    date: todayDateKey(),
    count: newCount,
    updatedAt: new Date().toISOString(),
  });
  return { allowed: true, count: newCount };
}

// ---------- Firestore : supprimer un document ----------
async function firestoreDeleteDoc(env, collection, documentId) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}/${collection}/${documentId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok && response.status !== 404) {
    const errText = await response.text();
    throw new Error(`Échec de suppression Firestore : ${errText}`);
  }
}

// ---------- Stripe : encodage form-urlencoded avec clés imbriquées ----------
// L'API Stripe attend du x-www-form-urlencoded, pas du JSON. Les objets/tableaux
// imbriqués se codent en notation crochets : line_items[0][price]=xxx.
function flattenStripeParams(obj, prefix, out) {
  for (const [key, value] of Object.entries(obj)) {
    const paramKey = prefix ? `${prefix}[${key}]` : key;
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((item, i) => flattenStripeParams({ [i]: item }, prefix ? `${prefix}[${key}]` : key, out));
    } else if (typeof value === "object") {
      flattenStripeParams(value, paramKey, out);
    } else {
      out.set(paramKey, String(value));
    }
  }
  return out;
}

async function stripeApiRequest(env, path, params) {
  const body = flattenStripeParams(params, "", new URLSearchParams());
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Erreur Stripe (${path}) : ${data.error?.message || response.status}`);
  }
  return data;
}

// ---------- Stripe : vérification de signature webhook (HMAC SHA-256) ----------
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader) throw new Error("Header stripe-signature manquant");
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k, v];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) throw new Error("Signature malformée");

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > STRIPE_WEBHOOK_TOLERANCE_SECONDS) {
    throw new Error("Signature expirée (rejeu possible)");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signedPayload = `${timestamp}.${rawBody}`;
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expectedHex !== signature) throw new Error("Signature invalide");
}

// ---------- Stripe : détermine le plan (monthly/yearly) depuis un price ID ----------
function planFromPriceId(env, priceId) {
  if (priceId === env.STRIPE_PRICE_MONTHLY) return "monthly";
  if (priceId === env.STRIPE_PRICE_YEARLY) return "yearly";
  return null;
}

// ---------- Firestore : liste des IDs de documents expirés (structured query) ----------
async function firestoreQueryExpiredTokenIds(env, nowIso, limit) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: "verificationTokens" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "expiresAt" },
          op: "LESS_THAN",
          value: { timestampValue: nowIso },
        },
      },
      limit,
    },
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec de la requête Firestore : ${errText}`);
  }
  const rows = await response.json();
  return rows
    .filter((r) => r.document)
    .map((r) => r.document.name.split("/").pop());
}

// ---------- Firestore : requête structurée générique (égalités combinées en AND) ----------
// v1.56.0 — Utilisé par list-pending-invitations et cancel-invitation pour éviter
// de lister toute la collection "invitations" et filtrer en mémoire (ancien
// comportement, notait déjà "à revoir avec une requête structurée si le volume
// grossit"). N'accepte que des égalités simples (stringValue) — suffisant pour
// filtrer par primaryUid/status, aucun index composite requis côté Firestore
// tant qu'il n'y a pas de tri ou d'inégalité combinée.
async function firestoreQueryDocsByEquality(env, collectionId, equalityFilters, limit) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}:runQuery`;
  const filters = Object.entries(equalityFilters).map(([fieldPath, value]) => ({
    fieldFilter: {
      field: { fieldPath },
      op: "EQUAL",
      value: { stringValue: value },
    },
  }));
  const where = filters.length === 1
    ? filters[0]
    : { compositeFilter: { op: "AND", filters } };
  const body = {
    structuredQuery: {
      from: [{ collectionId }],
      where,
      limit: limit || 300,
    },
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec de la requête Firestore : ${errText}`);
  }
  const rows = await response.json();
  return rows
    .filter((r) => r.document)
    .map((r) => ({ id: r.document.name.split("/").pop(), ...fromFirestoreFields(r.document.fields) }));
}

// ---------- Identity Toolkit : marquer un compte comme vérifié ----------
async function markFirebaseAccountVerified(env, uid) {
  const accessToken = await getGoogleAccessToken(env);
  const response = await fetch(IDENTITY_TOOLKIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ localId: uid, emailVerified: true }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec de mise à jour du compte Firebase : ${errText}`);
  }
  return response.json();
}

// ---------- Resend : envoi de l'email de vérification ----------
async function sendVerificationEmail(env, toEmail, token) {
  const link = `${VERIFICATION_LINK_BASE}?token=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <p style="color:#555;font-size:13px;margin-bottom:4px;">Ce n'est pas un spam</p>
      <h2>Vérifie ton adresse email</h2>
      <p>Clique sur le lien ci-dessous pour activer ton compte PoolGenAI :</p>
      <p><a href="${link}" style="background:#0ea5e9;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Vérifier mon email</a></p>
      <p>Ce lien expire dans ${VERIFICATION_TOKEN_TTL_HOURS} heures.</p>
      <p style="color:#888;font-size:12px;">Si tu n'es pas à l'origine de cette inscription, ignore cet email.</p>
    </div>
  `;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: toEmail,
      subject: "Vérifie ton adresse email — PoolGenAI",
      html,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec d'envoi Resend : ${errText}`);
  }
  return response.json();
}

// ---------- Génération d'un token de vérification cryptographiquement sûr ----------
function generateVerificationToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64UrlEncode(bytes);
}

// ---------- Nettoyage automatique des tokens de vérification expirés ----------
// Déclenché par le Cron Trigger CRON_CLEANUP_TOKENS (voir export default →
// scheduled). Supprime tous les documents verificationTokens dont expiresAt
// est dépassé — qu'ils aient été utilisés ou non. Boucle par lots de 500
// (limite raisonnable pour le volume de PoolGenAI) jusqu'à ce qu'il n'y en
// ait plus.
async function cleanupExpiredVerificationTokens(env) {
  const nowIso = new Date().toISOString();
  let totalDeleted = 0;
  for (let i = 0; i < 20; i++) {
    const ids = await firestoreQueryExpiredTokenIds(env, nowIso, 500);
    if (ids.length === 0) break;
    for (const id of ids) {
      try {
        await firestoreDeleteDoc(env, "verificationTokens", id);
        totalDeleted++;
      } catch (e) {
        console.error(`Échec suppression token ${id} : ${e.message}`);
      }
    }
    if (ids.length < 500) break;
  }
  console.log(`Nettoyage verificationTokens : ${totalDeleted} document(s) supprimé(s)`);
  return totalDeleted;
}

// ---------- v1.38.0 — Lot B : résolution d'un système linéaire n×n ----------
// Élimination de Gauss avec pivot partiel. Retourne null si la matrice est
// singulière (couleurs trop peu variées parmi les points retenus pour qu'une
// régression ait un sens — évite de renvoyer des coefficients aberrants).
function solveLinearSystem(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[pivot][col])) pivot = row;
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];
    if (Math.abs(M[col][col]) < 1e-8) return null;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col] / M[col][col];
      for (let k = col; k <= n; k++) M[row][k] -= factor * M[col][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

// ---------- v1.38.0 — Lot B : régression linéaire trueValue ~ R,G,B ----------
// Ajuste trueValue = a·R + b·G + c·B + d par moindres carrés (équations
// normales : (XᵀX)β = Xᵀy, résolu par élimination de Gauss). Régression
// directe sur la couleur brute du tampon échantillonné — pas de modèle
// physique de colorimétrie supposé, juste l'ajustement le plus simple
// possible sur les données réellement collectées.
function fitLinearRegression(points) {
  const n = points.length;
  const X = points.map((p) => [p.r, p.g, p.b, 1]);
  const y = points.map((p) => p.trueValue);
  const XtX = Array.from({ length: 4 }, () => new Array(4).fill(0));
  const Xty = new Array(4).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < 4; j++) {
      Xty[j] += X[i][j] * y[i];
      for (let k = 0; k < 4; k++) {
        XtX[j][k] += X[i][j] * X[i][k];
      }
    }
  }
  const beta = solveLinearSystem(XtX, Xty);
  if (!beta) return null;
  return { a: beta[0], b: beta[1], c: beta[2], d: beta[3] };
}

// ---------- v1.38.0 — Lot B : agrégation des points en modèles de calibration ----------
// Relit tous les calibrationPoints, groupe par {stripModel, param}, filtre
// les points de qualité insuffisante (netteté trop basse, exposition
// saturée), vérifie qu'il y a assez de points ET assez d'écart entre les
// valeurs observées (sinon la régression n'a pas de sens), puis ajuste une
// régression linéaire et écrit le résultat dans calibrationModels. Tourne
// entièrement à chaque exécution — pas d'état incrémental — le volume actuel
// ne justifie pas la complexité d'un traitement incrémental.
async function aggregateCalibrationModels(env) {
  const points = await firestoreListAllDocs(env, "calibrationPoints");

  const groups = {};
  for (const p of points) {
    if (!p.stripModel || !p.param || !p.sampledColor || typeof p.trueValue !== "number") continue;
    if (p.exposureClipped === true) continue;
    if (typeof p.sharpness === "number" && p.sharpness < MIN_SHARPNESS) continue;
    const key = `${p.stripModel}_${p.param}`;
    (groups[key] = groups[key] || []).push(p);
  }

  let updated = 0;
  let skipped = 0;
  for (const [key, group] of Object.entries(groups)) {
    const values = group.map((p) => p.trueValue);
    const spread = Math.max(...values) - Math.min(...values);
    const minSpread = MIN_VALUE_SPREAD[group[0].param] ?? 0;
    if (group.length < MIN_POINTS || spread < minSpread) { skipped++; continue; }

    const regressionPoints = group.map((p) => ({
      r: p.sampledColor.r, g: p.sampledColor.g, b: p.sampledColor.b, trueValue: p.trueValue,
    }));
    const model = fitLinearRegression(regressionPoints);
    if (!model) { skipped++; continue; }

    await firestoreSetDoc(env, "calibrationModels", key, {
      stripModel: group[0].stripModel,
      param: group[0].param,
      coefficients: model,
      sampleCount: group.length,
      valueMin: Math.min(...values),
      valueMax: Math.max(...values),
      updatedAt: new Date(),
    });
    updated++;
  }

  console.log(`Agrégation calibrationModels : ${updated} modèle(s) mis à jour, ${skipped} groupe(s) sous le seuil, ${points.length} point(s) source`);
  return { updated, skipped, totalPoints: points.length };
}

// ---------- Base commune de produits : normalisation et matching flou ----------
// Minuscule, sans accents, ponctuation réduite à des espaces simples.
// Utilisé à la fois côté écriture (normalizedName stocké) et côté lecture
// (comparaison de la requête entrante contre les documents existants).
function normalizeProductString(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Score de recouvrement simple entre deux chaînes normalisées : proportion
// de mots de la requête retrouvés dans la cible. Pas de librairie de
// similarité (Levenshtein, etc.) — le volume de la base commune reste
// modeste au démarrage, un recouvrement de mots suffit et reste lisible.
function tokenOverlapScore(query, target) {
  const queryTokens = query.split(" ").filter(Boolean);
  if (queryTokens.length === 0) return 0;
  const targetTokens = new Set(target.split(" ").filter(Boolean));
  const matched = queryTokens.filter((t) => targetTokens.has(t)).length;
  return matched / queryTokens.length;
}

const FUZZY_MATCH_THRESHOLD = 0.6; // seuil pour proposer un candidat de fusion
const MERGE_TOKEN_TTL_DAYS = 7;

function generateProductId() {
  return `gen_${crypto.randomUUID().replace(/-/g, "")}`;
}

// ---------- Route : POST /product-lookup ----------
// Cherche un produit dans la base commune : d'abord par code-barre (alias
// bc_{barcode} → doc gen_ réel), sinon par recherche floue sur nom +
// substance active parmi les fiches sans code-barre. Si un candidat flou
// suffisamment proche est trouvé ET qu'un code-barre est fourni, déclenche
// automatiquement une demande de fusion (email + confirmation manuelle) tout
// en retournant déjà les données du candidat pour un usage immédiat — pas de
// blocage utilisateur en attendant la confirmation (voir Bloc 5 de la synthèse).
async function handleProductLookup(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }

  const barcode = body.barcode ? String(body.barcode).trim() : null;
  const normalizedName = normalizeProductString(body.name);
  const normalizedSubstance = normalizeProductString(body.activeSubstance);

  // 1. Lookup direct par alias code-barre
  if (barcode) {
    try {
      const alias = await firestoreGetDoc(env, "commonProducts", `bc_${barcode}`);
      if (alias?.aliasOf) {
        const product = await firestoreGetDoc(env, "commonProducts", alias.aliasOf);
        if (product) {
          return jsonResponse({ matchType: "alias", productId: alias.aliasOf, product }, 200, origin);
        }
      }
    } catch (e) {
      return jsonError(`Erreur de lookup : ${e.message}`, 500, origin);
    }
  }

  // 2. Recherche floue parmi tous les produits (nom + substance active)
  let candidates = [];
  try {
    const allProducts = await firestoreListAllDocs(env, "commonProducts");
    candidates = allProducts
      .filter((p) => p.id?.startsWith("gen_")) // exclut les alias bc_
      .map((p) => {
        const nameScore = tokenOverlapScore(normalizedName, p.normalizedName || "");
        const substanceScore = tokenOverlapScore(normalizedSubstance, p.activeSubstance ? normalizeProductString(p.activeSubstance) : "");
        return { product: p, score: (nameScore + substanceScore) / 2 };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  } catch (e) {
    return jsonError(`Erreur de recherche : ${e.message}`, 500, origin);
  }

  if (candidates.length === 0) {
    return jsonResponse({ matchType: "none" }, 200, origin);
  }

  const best = candidates[0];
  // Match suffisamment fort + code-barre fourni + pas déjà lié à un alias :
  // déclenche la demande de fusion automatiquement, sans bloquer la réponse.
  if (barcode && best.score >= FUZZY_MATCH_THRESHOLD && !best.product.barcode) {
    try {
      await requestProductMerge(env, best.product.id, barcode);
    } catch (e) {
      console.error(`Échec de la demande de fusion automatique : ${e.message}`);
    }
    return jsonResponse(
      { matchType: "fuzzy_pending_merge", productId: best.product.id, product: best.product },
      200,
      origin
    );
  }

  return jsonResponse(
    { matchType: "fuzzy_candidates", candidates: candidates.map((c) => ({ productId: c.product.id, product: c.product, score: c.score })) },
    200,
    origin
  );
}

// ---------- Route : POST /product-create ----------
// Crée une nouvelle fiche produit dans la base commune (aucun match trouvé
// par /product-lookup, confirmé par l'utilisateur). Toujours un ID gen_ —
// le code-barre, s'il est fourni, donne lieu à un alias bc_ séparé, jamais
// à un ID gen_ basé sur le code-barre (cohérence avec le schéma de fusion).
async function handleProductCreate(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }

  const required = ["normalizedName", "action", "quantity", "effect", "forXm3"];
  const missing = required.filter((k) => body[k] === undefined || body[k] === null || body[k] === "");
  if (missing.length > 0) {
    return jsonError(`Champs manquants : ${missing.join(", ")}`, 400, origin);
  }

  const productId = generateProductId();
  const now = new Date();
  const productData = {
    barcode: body.barcode || null,
    normalizedName: normalizeProductString(body.normalizedName),
    displayName: body.displayName || body.normalizedName,
    activeSubstance: body.activeSubstance || null,
    action: body.action,
    quantity: body.quantity,
    effect: body.effect,
    forXm3: body.forXm3,
    delay: body.delay ?? null,
    container: body.container ?? null,
    photoUrl: body.photoUrl || null,
    source: body.source === "web" ? "web" : "etiquette",
    callCount: 0,
    createdAt: now,
    lastVerifiedAt: now,
  };

  try {
    await firestoreCreateDoc(env, "commonProducts", productId, productData);
    if (body.barcode) {
      await firestoreCreateDoc(env, "commonProducts", `bc_${body.barcode}`, {
        aliasOf: productId,
        createdAt: now,
      });
    }
    await sendNewProductNotificationEmail(env, productId, productData);
  } catch (e) {
    return jsonError(`Échec de création : ${e.message}`, 500, origin);
  }

  return jsonResponse({ success: true, productId }, 200, origin);
}

// ---------- Route : POST /product-photo-upload ----------
// v1.51.0 — Upload de la photo utilisateur vers R2 (binding PRODUCT_PHOTOS),
// pour illustrer une fiche commonProducts qui n'a pas encore de photo.
// Dédupliqué côté serveur : si le document a déjà un photoUrl (contribution
// antérieure, peu importe l'utilisateur), l'upload est un no-op — jamais
// d'écrasement, jamais de double stockage pour le même produit partagé.
async function handleProductPhotoUpload(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }

  const productId = body.productId ? String(body.productId) : null;
  const photoBase64 = body.photoBase64 ? String(body.photoBase64) : null;
  if (!productId || !photoBase64) {
    return jsonError("productId et photoBase64 requis", 400, origin);
  }
  // Seuls les vrais produits (gen_...) ont une photo, pas les alias bc_...
  if (!productId.startsWith("gen_")) {
    return jsonError("productId invalide", 400, origin);
  }

  let existing;
  try {
    existing = await firestoreGetDoc(env, "commonProducts", productId);
  } catch (e) {
    return jsonError(`Erreur de lecture : ${e.message}`, 500, origin);
  }
  if (!existing) {
    return jsonError("Produit introuvable", 404, origin);
  }
  if (existing.photoUrl) {
    // Déjà une photo (contribution antérieure) : pas d'upload, pas d'erreur.
    return jsonResponse({ success: true, skipped: true, photoUrl: existing.photoUrl }, 200, origin);
  }

  // Limite défensive : la photo vient déjà compressée côté client (300px /
  // qualité 0.5, quelques dizaines de Ko attendues). 2 Mo de marge large
  // avant de rejeter, pour parer un bug client ou un appel direct abusif.
  const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
  let bytes;
  try {
    const binary = atob(photoBase64);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  } catch (e) {
    return jsonError("photoBase64 invalide", 400, origin);
  }
  if (bytes.length > MAX_PHOTO_BYTES) {
    return jsonError("Photo trop volumineuse", 413, origin);
  }

  try {
    await env.PRODUCT_PHOTOS.put(productId, bytes, {
      httpMetadata: { contentType: "image/jpeg" },
    });
  } catch (e) {
    return jsonError(`Échec d'upload R2 : ${e.message}`, 500, origin);
  }

  const reqUrl = new URL(request.url);
  const photoUrl = `${reqUrl.origin}/product-photo?id=${productId}`;
  try {
    await firestorePatchDoc(env, "commonProducts", productId, { photoUrl });
  } catch (e) {
    return jsonError(`Échec de mise à jour Firestore : ${e.message}`, 500, origin);
  }

  return jsonResponse({ success: true, photoUrl }, 200, origin);
}

// ---------- Route : GET /product-photo?id=... ----------
// v1.51.0 — Sert les photos produit uploadées par les utilisateurs (R2,
// binding PRODUCT_PHOTOS). Route publique, sans auth : un <img src> ne peut
// pas envoyer de header Authorization, et la photo d'un produit partagé
// n'est pas une donnée sensible. Cache long car le contenu est immuable une
// fois écrit (jamais remplacé, voir dédup dans handleProductPhotoUpload).
async function handleProductPhotoServe(request, env, origin) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("id");
  if (!productId) return new Response("Missing id", { status: 400 });

  let object;
  try {
    object = await env.PRODUCT_PHOTOS.get(productId);
  } catch (e) {
    return new Response("R2 error", { status: 500 });
  }
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ---------- Route : POST /product-use ----------
// Incrément atomique de callCount à chaque confirmation d'usage d'un produit
// de la base commune. Au multiple de 50, déclenche une re-vérification web
// (texte seul, pas de photo — voir échange du 260706) et notifie le support.
// Fait en synchrone (pas de ctx.waitUntil, non disponible dans la signature
// actuelle de fetch()) : un léger surcoût de latence tous les 50 appels,
// acceptable vu la fréquence.
async function handleProductUse(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }

  const productId = body.productId;
  if (!productId) return jsonError("productId manquant", 400, origin);

  let newCount;
  try {
    newCount = await firestoreIncrementField(env, "commonProducts", productId, "callCount", 1);
  } catch (e) {
    return jsonError(`Échec d'incrément : ${e.message}`, 500, origin);
  }

  if (typeof newCount === "number" && newCount > 0 && newCount % 50 === 0) {
    try {
      await revalidateProductViaWebSearch(env, productId);
    } catch (e) {
      // Ne bloque jamais la réponse au client pour un échec de re-vérification
      console.error(`Échec de re-vérification produit ${productId} : ${e.message}`);
    }
  }

  return jsonResponse({ success: true, callCount: newCount }, 200, origin);
}

// ---------- Re-vérification web au 50e appel (sans photo) ----------
async function revalidateProductViaWebSearch(env, productId) {
  const product = await firestoreGetDoc(env, "commonProducts", productId);
  if (!product) return;

  const prompt = `Cherche la notice officielle du produit "${product.displayName || product.normalizedName}"` +
    (product.barcode ? ` (code-barre ${product.barcode})` : "") +
    (product.activeSubstance ? `, substance active : ${product.activeSubstance}` : "") +
    `. Donne quantité, effet, et pour X m³ recommandés par le fabricant, au format JSON strict ` +
    `{ "quantity": number, "effect": number, "forXm3": number, "found": boolean }.`;

  const upstream = await fetch(`${ANTHROPIC_API}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });

  if (!upstream.ok) throw new Error(`Échec appel Anthropic : ${await upstream.text()}`);
  const data = await upstream.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) return;

  let parsed;
  try {
    parsed = JSON.parse(textBlock.text.replace(/```json|```/g, "").trim());
  } catch {
    return; // réponse non structurée, on ne casse rien, on retente au prochain multiple de 50
  }
  if (!parsed.found) return;

  const now = new Date();
  await firestorePatchDoc(env, "commonProducts", productId, {
    quantity: parsed.quantity,
    effect: parsed.effect,
    forXm3: parsed.forXm3,
    lastVerifiedAt: now,
  });
  await sendProductRevalidationEmail(env, productId, product, parsed);
}

// ---------- Demande de fusion : création + email de confirmation ----------
async function requestProductMerge(env, existingProductId, barcode) {
  const mergeId = crypto.randomUUID();
  const token = generateVerificationToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MERGE_TOKEN_TTL_DAYS * 24 * 3600 * 1000);

  await firestoreCreateDoc(env, "pendingMerges", mergeId, {
    existingProductId,
    barcode,
    token,
    createdAt: now,
    expiresAt,
    used: false,
  });

  const confirmUrl = `${VERIFICATION_LINK_BASE}?confirmMerge=${mergeId}&token=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Fusion de produit en attente de confirmation</h2>
      <p>Un code-barre (${barcode}) a été détecté pour une fiche existante sans code-barre (${existingProductId}).</p>
      <p><a href="${confirmUrl}">Confirmer la fusion</a> (lien valable ${MERGE_TOKEN_TTL_DAYS} jours)</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: SUPPORT_EMAIL,
      subject: "PoolGenAI — Fusion de produit à confirmer",
      html,
    }),
  });
  if (!response.ok) throw new Error(`Échec d'envoi Resend : ${await response.text()}`);
}

// ---------- Route : POST /confirm-merge ----------
// Appelée par la page "Confirmer la fusion ?" côté PWA après clic sur le
// lien email. Vérifie le token, applique la fusion, marque la demande
// comme utilisée. Pas d'authentification Firebase requise ici : le clic
// email est la preuve d'autorisation (usage unique, expiration 7 jours).
async function handleConfirmMerge(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }

  const { mergeId, token } = body;
  if (!mergeId || !token) return jsonError("mergeId ou token manquant", 400, origin);

  let pending;
  try {
    pending = await firestoreGetDoc(env, "pendingMerges", mergeId);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }

  if (!pending) return jsonResponse({ status: "invalid" }, 404, origin);
  if (pending.used) return jsonResponse({ status: "already_merged" }, 200, origin);
  if (pending.token !== token) return jsonError("Token invalide", 403, origin);
  if (pending.expiresAt && pending.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }

  try {
    const now = new Date();
    await firestorePatchDoc(env, "commonProducts", pending.existingProductId, {
      barcode: pending.barcode,
    });
    await firestoreCreateDoc(env, "commonProducts", `bc_${pending.barcode}`, {
      aliasOf: pending.existingProductId,
      createdAt: now,
    });
    await firestorePatchDoc(env, "pendingMerges", mergeId, { used: true });
  } catch (e) {
    return jsonError(`Échec de la fusion : ${e.message}`, 500, origin);
  }

  return jsonResponse({ status: "merged", productId: pending.existingProductId }, 200, origin);
}

// ---------- Emails de notification (nouvelle fiche / re-vérification) ----------
async function sendNewProductNotificationEmail(env, productId, productData) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Nouvelle fiche produit créée</h2>
      <p><strong>${productData.displayName}</strong> (${productId})</p>
      <p>Code-barre : ${productData.barcode || "aucun"} — Source : ${productData.source}</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: SUPPORT_EMAIL, subject: "PoolGenAI — Nouvelle fiche produit", html }),
  });
  if (!response.ok) throw new Error(`Échec d'envoi Resend : ${await response.text()}`);
}

async function sendProductRevalidationEmail(env, productId, oldData, newData) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Fiche produit re-vérifiée (50e appel)</h2>
      <p><strong>${oldData.displayName}</strong> (${productId})</p>
      <table style="border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Quantité</td><td>${oldData.quantity} → ${newData.quantity}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Effet</td><td>${oldData.effect} → ${newData.effect}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Pour X m³</td><td>${oldData.forXm3} → ${newData.forXm3}</td></tr>
      </table>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: SUPPORT_EMAIL, subject: "PoolGenAI — Fiche produit re-vérifiée", html }),
  });
  if (!response.ok) throw new Error(`Échec d'envoi Resend : ${await response.text()}`);
}

async function handleSendVerificationEmail(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }

  const uid = payload.sub;
  const email = payload.email;
  if (!email) return jsonError("Aucun email associé à ce compte", 400, origin);

  const token = generateVerificationToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + VERIFICATION_TOKEN_TTL_HOURS * 3600 * 1000);

  try {
    await firestoreCreateDoc(env, "verificationTokens", token, {
      uid,
      email,
      createdAt: now,
      expiresAt,
      used: false,
    });
    await sendVerificationEmail(env, email, token);
  } catch (e) {
    return jsonError(`Échec de l'envoi : ${e.message}`, 500, origin);
  }

  return jsonResponse({ success: true }, 200, origin);
}

// ---------- Route : POST /verify-email ----------
async function handleVerifyEmail(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }

  const token = body.token;
  if (!token) return jsonError("Token manquant", 400, origin);

  let tokenDoc;
  try {
    tokenDoc = await firestoreGetDoc(env, "verificationTokens", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }

  if (!tokenDoc) {
    return jsonResponse({ status: "invalid" }, 404, origin);
  }
  if (tokenDoc.used) {
    return jsonResponse({ status: "already_verified" }, 200, origin);
  }
  if (tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }

  try {
    await markFirebaseAccountVerified(env, tokenDoc.uid);
    await firestorePatchDoc(env, "verificationTokens", token, { used: true });
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }

  return jsonResponse({ status: "verified" }, 200, origin);
}

// ---------- Resend : email de demande (récupération/suppression) envoyé au support ----------
async function sendAccountDataRequestEmail(env, action, uid, email) {
  const actionLabels = {
    erase: "Effacer toutes les données",
    recover: "Récupérer toutes les données, ne pas les effacer",
    recover_and_erase: "Récupérer puis effacer toutes les données",
  };
  const label = actionLabels[action] || action;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Demande liée à un compte supprimé</h2>
      <table style="border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Action demandée</td><td><strong>${label}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Email du compte</td><td>${email || "inconnu"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">UID Firebase</td><td>${uid}</td></tr>
      </table>
    </div>
  `;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: SUPPORT_EMAIL,
      subject: `PoolGenAI — Demande données compte supprimé (${label})`,
      html,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec d'envoi Resend : ${errText}`);
  }
  return response.json();
}

// ---------- Route : POST /account-data-request ----------
// Appelée depuis l'écran "Compte supprimé" (bouton "Demander la récupération
// ou la suppression de mes données"). L'uid et l'email sont dérivés du token
// Firebase vérifié, jamais du corps de la requête, pour empêcher un client de
// se faire passer pour un autre compte.
async function handleAccountDataRequest(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }

  const allowedActions = ["erase", "recover", "recover_and_erase"];
  if (!allowedActions.includes(body.action)) {
    return jsonError("Action invalide", 400, origin);
  }

  try {
    await sendAccountDataRequestEmail(env, body.action, payload.sub, payload.email);
  } catch (e) {
    return jsonError(`Échec de l'envoi : ${e.message}`, 500, origin);
  }

  return jsonResponse({ success: true }, 200, origin);
}

// ==========================================================================
// v1.55.0 — Utilisateurs secondaires (brique 2 : routes Worker)
// Les routes ci-dessous sont les seules à écrire dans secondaryUsers/
// linkedAccounts/invitations/revocationRequests (voir firestore.rules :
// write:false côté client, écriture réservée au compte de service via ces
// routes). Depuis v1.60.0 : /request-revoke-own-access, /revocation-info,
// /respond-revocation (demande de révocation initiée par l'invité).
// ==========================================================================

// ---------- Resend : email d'invitation ----------
async function sendSecondaryInvitationEmail(env, toEmail, primaryEmail, poolName, token) {
  const link = `${VERIFICATION_LINK_BASE}?respondInvitation=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Invitation PoolGenAI</h2>
      <p><strong>${primaryEmail}</strong> t'invite à accéder au bassin <strong>${poolName}</strong> sur PoolGenAI.</p>
      <p>Si tu n'as pas encore de compte, crée-le d'abord avec cette adresse email, puis reviens sur ce lien.</p>
      <p><a href="${link}" style="background:#0ea5e9;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Voir l'invitation</a></p>
      <p>Ce lien expire dans ${INVITATION_TOKEN_TTL_HOURS} heures.</p>
      <p style="color:#888;font-size:12px;">Si tu n'es pas concerné par cette invitation, ignore cet email.</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: toEmail, subject: "Invitation PoolGenAI", html }),
  });
  if (!response.ok) throw new Error(`Échec d'envoi Resend : ${await response.text()}`);
}

// ---------- Resend : email de notification de révocation ----------
async function sendSecondaryRevokedEmail(env, toEmail, primaryEmail, poolName) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Accès révoqué</h2>
      <p><strong>${primaryEmail}</strong> a mis fin à ton accès au bassin <strong>${poolName}</strong> sur PoolGenAI.</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: toEmail, subject: "PoolGenAI — Accès révoqué", html }),
  });
  if (!response.ok) throw new Error(`Échec d'envoi Resend : ${await response.text()}`);
}

// ---------- Resend : email de demande de révocation (invité -> propriétaire) ----------
// v1.60.0 — L'invité ne peut pas révoquer son propre accès (écriture réservée
// au Worker) : cet email porte un lien que le PROPRIÉTAIRE doit confirmer.
async function sendRevocationRequestEmail(env, toEmail, secondaryDisplayName, poolName, token) {
  const link = `${VERIFICATION_LINK_BASE}?respondRevocation=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Demande de révocation — PoolGenAI</h2>
      <p><strong>${secondaryDisplayName}</strong> a demandé la révocation de son accès au bassin <strong>${poolName}</strong> sur PoolGenAI.</p>
      <p><a href="${link}" style="background:#0ea5e9;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Voir la demande</a></p>
      <p>Ce lien expire dans ${Math.round(REVOCATION_TOKEN_TTL_HOURS / 24)} jours.</p>
      <p style="color:#888;font-size:12px;">Si tu n'es pas concerné par cette demande, ignore cet email.</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: toEmail, subject: "PoolGenAI — Demande de révocation", html }),
  });
  if (!response.ok) throw new Error(`Échec d'envoi Resend : ${await response.text()}`);
}

// ---------- Route : POST /invite-secondary-user ----------
async function handleInviteSecondaryUser(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const primaryUid = payload.sub;
  const primaryEmail = payload.email;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }
  const { poolId, invitedEmail } = body;
  if (!poolId || !invitedEmail) return jsonError("poolId ou invitedEmail manquant", 400, origin);
  if (invitedEmail.toLowerCase() === (primaryEmail || "").toLowerCase()) {
    return jsonError("Tu ne peux pas t'inviter toi-même", 400, origin);
  }

  let config, existingSecondaries;
  try {
    config = await firestoreGetDoc(env, `users/${primaryUid}/config`, "main");
    existingSecondaries = await firestoreListAllDocs(env, `users/${primaryUid}/secondaryUsers`);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }

  const pool = (config?.pools || []).find((p) => p.id === poolId);
  if (!pool) return jsonError("Bassin introuvable", 404, origin);

  // v1.95.0 — Un compte gratuit ne peut inviter personne. Avant cette
  // version, aucune vérification isPremium n'existait ici : un compte
  // gratuit pouvait inviter jusqu'à MAX_SECONDARY_USERS personnes.
  if (!config?.isPremium) {
    return jsonError("Les invitations sont réservées à la version Premium", 403, origin, "invite_requires_premium");
  }

  // v1.95.0 — Limite désormais posée PAR BASSIN (poolId), et non plus sur
  // l'ensemble du compte tous bassins confondus.
  const activeSecondariesForPool = existingSecondaries.filter((s) => s.status === "active" && s.poolId === poolId);
  if (activeSecondariesForPool.length >= MAX_SECONDARY_USERS_PER_POOL) {
    return jsonError(`Nombre maximum d'invités atteint pour ce bassin (${MAX_SECONDARY_USERS_PER_POOL})`, 409, origin);
  }
  const activeSecondaries = existingSecondaries.filter((s) => s.status === "active");
  if (activeSecondaries.some((s) => (s.email || "").toLowerCase() === invitedEmail.toLowerCase())) {
    return jsonError("Cette personne a déjà accès à un bassin", 409, origin);
  }

  const token = generateVerificationToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVITATION_TOKEN_TTL_HOURS * 3600 * 1000);

  try {
    await firestoreCreateDoc(env, "invitations", token, {
      primaryUid,
      primaryEmail: primaryEmail || "",
      invitedEmail,
      poolId,
      poolName: pool.name || "",
      createdAt: now,
      expiresAt,
      status: "pending",
    });
    await sendSecondaryInvitationEmail(env, invitedEmail, primaryEmail || "", pool.name || "", token);
  } catch (e) {
    return jsonError(`Échec de l'invitation : ${e.message}`, 500, origin);
  }

  return jsonResponse({ success: true }, 200, origin);
}

// ---------- Route : POST /respond-invitation ----------
async function handleRespondInvitation(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const secondaryUid = payload.sub;
  const secondaryEmail = payload.email || "";

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }
  const { token, action } = body;
  if (!token || !["accept", "decline"].includes(action)) {
    return jsonError("token ou action invalide", 400, origin);
  }

  let invitation;
  try {
    invitation = await firestoreGetDoc(env, "invitations", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }

  if (!invitation) return jsonResponse({ status: "invalid" }, 404, origin);
  if (invitation.status !== "pending") {
    return jsonResponse({ status: invitation.status }, 200, origin);
  }
  if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }
  if (invitation.invitedEmail.toLowerCase() !== secondaryEmail.toLowerCase()) {
    return jsonError("Cette invitation ne correspond pas à ton compte", 403, origin);
  }
  if (invitation.primaryUid === secondaryUid) {
    return jsonError("Tu ne peux pas accepter ta propre invitation", 400, origin);
  }

  if (action === "decline") {
    try {
      await firestorePatchDoc(env, "invitations", token, { status: "declined" });
    } catch (e) {
      return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
    }
    return jsonResponse({ status: "declined" }, 200, origin);
  }

  // action === "accept"
  try {
    // v1.95.0 — Re-vérifie le statut Premium du propriétaire au moment de
    // l'acceptation (pas seulement à l'envoi de l'invitation) : si le
    // propriétaire est repassé gratuit entre-temps, l'invitation ne peut
    // plus être acceptée.
    const primaryConfig = await firestoreGetDoc(env, `users/${invitation.primaryUid}/config`, "main");
    if (!primaryConfig?.isPremium) {
      return jsonError("Ce compte n'est plus en version Premium, l'invitation ne peut pas être acceptée", 403, origin, "invite_requires_premium");
    }

    const existingSecondaries = await firestoreListAllDocs(env, `users/${invitation.primaryUid}/secondaryUsers`);
    // v1.95.0 — Limite par bassin (poolId de l'invitation), plus sur
    // l'ensemble du compte.
    const activeSecondariesForPool = existingSecondaries.filter(
      (s) => s.status === "active" && s.id !== secondaryUid && s.poolId === invitation.poolId
    );
    if (activeSecondariesForPool.length >= MAX_SECONDARY_USERS_PER_POOL) {
      return jsonError(`Nombre maximum d'invités atteint pour ce bassin (${MAX_SECONDARY_USERS_PER_POOL})`, 409, origin);
    }

    // v1.59.3 — Limite du nombre de bassins invités pour un compte gratuit
    // (tous propriétaires confondus). Le statut premium vérifié ici est
    // celui du compte de l'invité lui-même (jamais celui hérité d'un
    // propriétaire sur un bassin déjà accepté).
    const secondaryConfig = await firestoreGetDoc(env, `users/${secondaryUid}/config`, "main");
    const secondaryIsPremium = !!secondaryConfig?.isPremium;
    if (!secondaryIsPremium) {
      const existingLinks = await firestoreListAllDocs(env, `users/${secondaryUid}/linkedAccounts`);
      const activeLinks = existingLinks.filter((l) => l.status === "active" && l.id !== invitation.primaryUid);
      if (activeLinks.length >= MAX_INVITED_POOLS_FREE) {
        return jsonError(`Limite de ${MAX_INVITED_POOLS_FREE} bassins invités atteinte en version gratuite`, 409, origin, "invited_limit_reached");
      }
    }

    const now = new Date();
    await firestoreSetDoc(env, `users/${invitation.primaryUid}/secondaryUsers`, secondaryUid, {
      email: secondaryEmail,
      poolId: invitation.poolId,
      status: "active",
      addedAt: now,
    });
    await firestoreSetDoc(env, `users/${secondaryUid}/linkedAccounts`, invitation.primaryUid, {
      primaryEmail: invitation.primaryEmail,
      poolId: invitation.poolId,
      status: "active",
      addedAt: now,
    });
    await firestorePatchDoc(env, "invitations", token, { status: "accepted" });
  } catch (e) {
    return jsonError(`Échec de l'acceptation : ${e.message}`, 500, origin);
  }

  return jsonResponse(
    { status: "accepted", poolId: invitation.poolId, primaryEmail: invitation.primaryEmail },
    200,
    origin
  );
}

// ---------- Route : POST /revoke-secondary-access ----------
async function handleRevokeSecondaryAccess(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const primaryUid = payload.sub;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }
  const { secondaryUid } = body;
  if (!secondaryUid) return jsonError("secondaryUid manquant", 400, origin);

  let secondary, config;
  try {
    secondary = await firestoreGetDoc(env, `users/${primaryUid}/secondaryUsers`, secondaryUid);
    config = await firestoreGetDoc(env, `users/${primaryUid}/config`, "main");
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!secondary) return jsonError("Accès secondaire introuvable", 404, origin);

  const pool = (config?.pools || []).find((p) => p.id === secondary.poolId);

  try {
    await firestorePatchDoc(env, `users/${primaryUid}/secondaryUsers`, secondaryUid, {
      status: "revoked",
      revokedAt: new Date(),
    });
    // v1.60.0 — Fix : le doc réciproque linkedAccounts (côté invité) n'était
    // jamais mis à jour, alors que le client le filtre par status==="active"
    // pour construire le switcher et la liste "bassins où je suis invité".
    await firestorePatchDoc(env, `users/${secondaryUid}/linkedAccounts`, primaryUid, {
      status: "revoked",
      revokedAt: new Date(),
    });
  } catch (e) {
    return jsonError(`Échec de la révocation : ${e.message}`, 500, origin);
  }

  try {
    if (secondary.email) {
      await sendSecondaryRevokedEmail(env, secondary.email, payload.email || "", pool?.name || "");
    }
  } catch (e) {
    // La révocation Firestore a réussi ; un échec d'email ne doit pas faire
    // remonter une erreur au client (même logique que les autres routes).
    console.error(`Échec d'envoi email de révocation : ${e.message}`);
  }

  return jsonResponse({ status: "revoked" }, 200, origin);
}

// ---------- Route : POST /request-revoke-own-access ----------
// v1.60.0 — Permet à un utilisateur secondaire de demander la révocation de
// son propre accès (il ne peut pas se révoquer lui-même, écriture réservée
// au Worker) : crée une demande + envoie un email au propriétaire avec un
// lien de confirmation, sur le même modèle que l'invitation initiale.
async function handleRequestRevokeOwnAccess(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const secondaryUid = payload.sub;
  const secondaryEmail = payload.email || "";

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }
  const { primaryUid } = body;
  if (!primaryUid) return jsonError("primaryUid manquant", 400, origin);

  let link, secondaryConfig, primaryConfig;
  try {
    link = await firestoreGetDoc(env, `users/${secondaryUid}/linkedAccounts`, primaryUid);
    secondaryConfig = await firestoreGetDoc(env, `users/${secondaryUid}/config`, "main");
    primaryConfig = await firestoreGetDoc(env, `users/${primaryUid}/config`, "main");
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!link || link.status !== "active") {
    return jsonError("Accès introuvable ou déjà révoqué", 404, origin);
  }

  const pool = (primaryConfig?.pools || []).find((p) => p.id === link.poolId);
  const poolName = pool?.name || "";
  const secondaryDisplayName = secondaryConfig?.pseudo || secondaryEmail;

  const token = generateVerificationToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REVOCATION_TOKEN_TTL_HOURS * 3600 * 1000);

  try {
    await firestoreCreateDoc(env, "revocationRequests", token, {
      primaryUid,
      primaryEmail: link.primaryEmail || "",
      secondaryUid,
      secondaryEmail,
      secondaryPseudo: secondaryDisplayName,
      poolId: link.poolId || "",
      poolName,
      createdAt: now,
      expiresAt,
      status: "pending",
    });
    await sendRevocationRequestEmail(env, link.primaryEmail, secondaryDisplayName, poolName, token);
  } catch (e) {
    return jsonError(`Échec de la demande : ${e.message}`, 500, origin);
  }

  return jsonResponse({ success: true }, 200, origin);
}

// ---------- Route : GET /revocation-info?token=... ----------
// v1.60.0 — Aperçu avant confirmation (écran côté propriétaire), même
// modèle de confiance que /invitation-info : pas d'authentification, le
// token fait office de secret.
async function handleRevocationRequestInfo(request, env, origin) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return jsonError("token manquant", 400, origin);

  let reqDoc;
  try {
    reqDoc = await firestoreGetDoc(env, "revocationRequests", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!reqDoc) return jsonResponse({ status: "invalid" }, 404, origin);
  if (reqDoc.status !== "pending") {
    return jsonResponse({ status: reqDoc.status }, 200, origin);
  }
  if (reqDoc.expiresAt && reqDoc.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }
  return jsonResponse(
    {
      status: "pending",
      secondaryPseudo: reqDoc.secondaryPseudo || reqDoc.secondaryEmail,
      poolName: reqDoc.poolName || "",
    },
    200,
    origin
  );
}

// ---------- Route : POST /respond-revocation ----------
// v1.60.0 — Confirmation par le PROPRIÉTAIRE d'une demande de révocation
// initiée par l'invité (miroir de /respond-invitation, mais ici c'est le
// principal qui confirme, pas le secondaire). Un seul geste possible :
// accepter (pas de "refuser" — l'invité reste invité si le propriétaire
// ignore l'email, rien à faire côté serveur dans ce cas).
async function handleRespondRevocation(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const callerUid = payload.sub;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }
  const { token } = body;
  if (!token) return jsonError("token manquant", 400, origin);

  let reqDoc;
  try {
    reqDoc = await firestoreGetDoc(env, "revocationRequests", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!reqDoc) return jsonResponse({ status: "invalid" }, 404, origin);
  if (reqDoc.status !== "pending") {
    return jsonResponse({ status: reqDoc.status }, 200, origin);
  }
  if (reqDoc.expiresAt && reqDoc.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }
  if (reqDoc.primaryUid !== callerUid) {
    return jsonError("Cette demande ne concerne pas ton compte", 403, origin);
  }

  try {
    await firestorePatchDoc(env, `users/${reqDoc.primaryUid}/secondaryUsers`, reqDoc.secondaryUid, {
      status: "revoked",
      revokedAt: new Date(),
    });
    await firestorePatchDoc(env, `users/${reqDoc.secondaryUid}/linkedAccounts`, reqDoc.primaryUid, {
      status: "revoked",
      revokedAt: new Date(),
    });
    await firestorePatchDoc(env, "revocationRequests", token, { status: "done" });
  } catch (e) {
    return jsonError(`Échec de la révocation : ${e.message}`, 500, origin);
  }

  try {
    if (reqDoc.secondaryEmail) {
      await sendSecondaryRevokedEmail(env, reqDoc.secondaryEmail, payload.email || "", reqDoc.poolName || "");
    }
  } catch (e) {
    console.error(`Échec d'envoi email de révocation : ${e.message}`);
  }

  return jsonResponse({ status: "done", poolName: reqDoc.poolName || "" }, 200, origin);
}

// ---------- Route : POST /set-pseudo ----------
async function handleSetPseudo(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const uid = payload.sub;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }
  const pseudo = (body.pseudo || "").trim();
  if (!PSEUDO_REGEX.test(pseudo)) {
    return jsonError("Pseudo invalide (2 à 24 caractères, lettres/chiffres/espaces/tirets)", 400, origin);
  }
  const key = normalizePseudoKey(pseudo);

  let config, existing;
  try {
    config = await firestoreGetDoc(env, `users/${uid}/config`, "main");
    existing = await firestoreGetDoc(env, "pseudos", key);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }

  if (existing && existing.uid !== uid) {
    // Pseudo pris par quelqu'un d'autre : suggère une variante numérotée disponible.
    let suggestion = null;
    for (let i = 2; i <= 50; i++) {
      const candidate = `${pseudo}${i}`;
      const candidateKey = normalizePseudoKey(candidate);
      let candidateDoc;
      try {
        candidateDoc = await firestoreGetDoc(env, "pseudos", candidateKey);
      } catch (e) {
        return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
      }
      if (!candidateDoc) {
        suggestion = candidate;
        break;
      }
    }
    return jsonResponse({ available: false, suggestion }, 409, origin);
  }

  const oldPseudo = config?.pseudo || null;
  const oldKey = oldPseudo ? normalizePseudoKey(oldPseudo) : null;

  try {
    if (oldKey && oldKey !== key) {
      await firestoreDeleteDoc(env, "pseudos", oldKey);
    }
    await firestoreSetDoc(env, "pseudos", key, { uid, pseudo, createdAt: new Date() });
    await firestorePatchDoc(env, `users/${uid}/config`, "main", { pseudo });
  } catch (e) {
    return jsonError(`Échec de l'enregistrement : ${e.message}`, 500, origin);
  }

  return jsonResponse({ available: true, pseudo }, 200, origin);
}

// ---------- Route : GET /list-pending-invitations ----------
// v1.56.0 — Remplace le listage complet de la collection "invitations" +
// filtre en mémoire (v1.55.0) par une requête structurée sur primaryUid +
// status="pending". Expose aussi `token` (id du doc) pour permettre au
// client d'annuler une invitation via /cancel-invitation.
async function handleListPendingInvitations(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const primaryUid = payload.sub;

  let mineRaw;
  try {
    mineRaw = await firestoreQueryDocsByEquality(env, "invitations", {
      primaryUid,
      status: "pending",
    });
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }

  const now = Date.now();
  const mine = mineRaw.map((inv) => ({
    token: inv.id,
    invitedEmail: inv.invitedEmail,
    poolId: inv.poolId,
    poolName: inv.poolName || "",
    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt,
    expired: inv.expiresAt ? inv.expiresAt.getTime() < now : false,
  }));

  return jsonResponse({ invitations: mine }, 200, origin);
}

// ---------- Route : POST /cancel-invitation ----------
// v1.56.0 — Annule une invitation encore en attente (avant acceptation).
// Distinct de /revoke-secondary-access, qui ne s'applique qu'aux accès déjà
// actifs (secondaryUsers). Ici on supprime le doc invitations/{token} —
// aucune notification envoyée, l'invité n'a jamais eu accès à quoi que ce soit.
async function handleCancelInvitation(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const primaryUid = payload.sub;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }
  const { token } = body;
  if (!token) return jsonError("token manquant", 400, origin);

  let invitation;
  try {
    invitation = await firestoreGetDoc(env, "invitations", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!invitation) return jsonError("Invitation introuvable", 404, origin);
  if (invitation.primaryUid !== primaryUid) {
    return jsonError("Cette invitation ne t'appartient pas", 403, origin);
  }
  if (invitation.status !== "pending") {
    return jsonError("Cette invitation n'est plus en attente", 409, origin);
  }

  try {
    await firestoreDeleteDoc(env, "invitations", token);
  } catch (e) {
    return jsonError(`Échec de l'annulation : ${e.message}`, 500, origin);
  }

  return jsonResponse({ status: "cancelled" }, 200, origin);
}

// ---------- Route : GET /invitation-info?token=... ----------
// v1.55.0 — Aperçu avant accept/decline (écran de confirmation côté invité).
// Pas d'authentification : le token lui-même fait office de secret, même
// modèle de confiance que /confirm-merge.
async function handleInvitationInfo(request, env, origin) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return jsonError("token manquant", 400, origin);

  let invitation;
  try {
    invitation = await firestoreGetDoc(env, "invitations", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!invitation) return jsonResponse({ status: "invalid" }, 404, origin);
  if (invitation.status !== "pending") {
    return jsonResponse({ status: invitation.status }, 200, origin);
  }
  if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }
  let primaryConfig = null;
  try {
    primaryConfig = await firestoreGetDoc(env, `users/${invitation.primaryUid}/config`, "main");
  } catch (e) {
    // Non bloquant : on retombe sur l'email si le pseudo n'est pas lisible.
  }
  return jsonResponse(
    {
      status: "pending",
      primaryEmail: invitation.primaryEmail,
      primaryPseudo: primaryConfig?.pseudo || invitation.primaryEmail,
      poolName: invitation.poolName || "",
    },
    200,
    origin
  );
}

// ---------- Route existante : POST /v1/messages (proxy Anthropic) ----------
async function handleAnthropicProxy(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return jsonError("Authentification requise", 401, origin);
  }

  let uid;
  try {
    const payload = await verifyFirebaseIdToken(idToken);
    uid = payload.sub;
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }

  // v1.93.0 — Contrôle premium côté serveur. Le verrouillage de l'IA aux
  // comptes premium n'existait jusqu'ici que côté client (bouton masqué) :
  // un compte gratuit authentifié pouvait appeler cette route directement
  // et contourner totalement le paywall. On vérifie donc ici isPremium
  // dans Firestore avant d'autoriser l'appel à l'API Anthropic.
  let userConfig;
  try {
    userConfig = await firestoreGetDoc(env, `users/${uid}/config`, "main");
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!userConfig?.isPremium) {
    return jsonError("Analyse IA réservée aux comptes premium", 403, origin);
  }

  // v1.41.0 — Rate-limiting par UID, voir checkAndIncrementRateLimit.
  try {
    const rateCheck = await checkAndIncrementRateLimit(env, uid);
    if (!rateCheck.allowed) {
      return jsonError(
        `Limite quotidienne d'analyses atteinte (${DAILY_LIMIT_PER_UID}/jour). Réessaie demain.`,
        429,
        origin
      );
    }
  } catch (e) {
    // Panne du compteur (Firestore indisponible, etc.) : on laisse passer la
    // requête plutôt que de bloquer un usage normal à cause d'un problème
    // d'infra annexe. Le vrai plafond (clé API Anthropic) reste la limite
    // ultime de toute façon.
    console.error(`Rate-limit check échoué pour ${uid} : ${e.message}`);
  }

  let body;
  try {
    body = await request.text();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const upstream = await fetch(`${ANTHROPIC_API}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": request.headers.get("anthropic-version") || "2023-06-01",
    },
    body,
  });

  const responseHeaders = {
    ...corsHeaders(origin),
    "Content-Type": "application/json",
    "x-verified-uid": uid,
  };

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

// ---------- POST /stripe/create-checkout-session ----------
async function handleStripeCreateCheckoutSession(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let uid;
  try {
    const payload = await verifyFirebaseIdToken(idToken);
    uid = payload.sub;
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requête invalide", 400, origin);
  }

  const priceId = body.plan === "yearly" ? env.STRIPE_PRICE_YEARLY : env.STRIPE_PRICE_MONTHLY;
  if (!priceId) return jsonError("Plan invalide", 400, origin);

  let existingCustomerId = null;
  try {
    const config = await firestoreGetDoc(env, `users/${uid}/config`, "main");
    existingCustomerId = config?.subscription?.stripeCustomerId || null;
  } catch (e) {
    console.error(`Lecture config échouée pour ${uid} : ${e.message}`);
  }

  const params = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: uid,
    success_url: `${origin}/?stripe=success`,
    cancel_url: `${origin}/?stripe=cancel`,
    // v1.89.0 — metadata portée par l'abonnement lui-même (pas seulement la
    // session) : les events customer.subscription.* n'ont pas client_reference_id,
    // mais héritent de subscription_data.metadata. C'est notre lien uid <-> abonnement.
    subscription_data: { metadata: { uid } },
  };
  if (existingCustomerId) {
    params.customer = existingCustomerId;
  }

  try {
    const session = await stripeApiRequest(env, "/checkout/sessions", params);
    return jsonResponse({ url: session.url }, 200, origin);
  } catch (e) {
    console.error(`Création session Checkout échouée pour ${uid} : ${e.message}`);
    return jsonError("Impossible de créer la session de paiement", 500, origin);
  }
}

// ---------- POST /stripe/create-portal-session ----------
async function handleStripeCreatePortalSession(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);

  let uid;
  try {
    const payload = await verifyFirebaseIdToken(idToken);
    uid = payload.sub;
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }

  let customerId;
  try {
    const config = await firestoreGetDoc(env, `users/${uid}/config`, "main");
    customerId = config?.subscription?.stripeCustomerId;
  } catch (e) {
    return jsonError("Impossible de lire l'abonnement", 500, origin);
  }
  if (!customerId) return jsonError("Aucun abonnement actif", 400, origin);

  try {
    const portalSession = await stripeApiRequest(env, "/billing_portal/sessions", {
      customer: customerId,
      return_url: `${origin}/`,
    });
    return jsonResponse({ url: portalSession.url }, 200, origin);
  } catch (e) {
    console.error(`Création session Portal échouée pour ${uid} : ${e.message}`);
    return jsonError("Impossible d'ouvrir la gestion d'abonnement", 500, origin);
  }
}

// ---------- POST /stripe/webhook ----------
async function handleStripeWebhook(request, env, origin) {
  const rawBody = await request.text();
  const sigHeader = request.headers.get("stripe-signature");

  try {
    await verifyStripeSignature(rawBody, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error(`Signature webhook Stripe invalide : ${e.message}`);
    return new Response("Signature invalide", { status: 400 });
  }

  const event = JSON.parse(rawBody);

  // Idempotence : firestoreCreateDoc échoue si le document existe déjà.
  try {
    await firestoreCreateDoc(env, "stripeEvents", event.id, {
      type: event.type,
      processedAt: new Date(),
    });
  } catch (e) {
    // Déjà traité : on répond 200 tout de suite pour que Stripe arrête de réessayer.
    return jsonResponse({ received: true, alreadyProcessed: true }, 200, "");
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const uid = session.client_reference_id;
      if (uid && session.customer) {
        await firestorePatchDoc(env, `users/${uid}/config`, "main", {
          subscription: { stripeCustomerId: session.customer },
        });
        // Filet de secours pour les futurs events sans metadata.uid exploitable.
        await firestoreSetDoc(env, "stripeCustomers", session.customer, { uid });
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object;
      let uid = sub.metadata?.uid;
      if (!uid) {
        const mapping = await firestoreGetDoc(env, "stripeCustomers", sub.customer);
        uid = mapping?.uid;
      }
      if (uid) {
        // v1.89.1 — Coupure immédiate sur past_due/canceled/unpaid, pas de
        // délai de grâce (décidé le 260714). Écrit EN PREMIER et séparément
        // du détail "subscription" ci-dessous : c'est le champ qui compte
        // vraiment pour l'app, il ne doit jamais échouer à cause d'un souci
        // sur un champ secondaire (cf. bug current_period_end du 260714, où
        // une Date invalide faisait planter tout le patch, isPremium inclus).
        const isPremium = sub.status === "active";
        await firestorePatchDoc(env, `users/${uid}/config`, "main", { isPremium });

        try {
          const priceId = sub.items?.data?.[0]?.price?.id;
          const plan = planFromPriceId(env, priceId);
          // v1.89.1 — API 2026-06-24.dahlia : current_period_end n'existe plus
          // sur l'abonnement lui-même, déplacé dans items.data[0]. Fallback sur
          // sub.current_period_end au cas où (compat versions API antérieures).
          const rawPeriodEnd = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end;
          const currentPeriodEnd = typeof rawPeriodEnd === "number" ? new Date(rawPeriodEnd * 1000) : null;
          await firestorePatchDoc(env, `users/${uid}/config`, "main", {
            subscription: {
              status: sub.status,
              plan: plan || null,
              stripeCustomerId: sub.customer,
              currentPeriodEnd,
            },
          });
        } catch (e) {
          console.error(`Écriture détail subscription échouée pour ${uid} (isPremium=${isPremium} déjà écrit) : ${e.message}`);
        }
      } else {
        console.error(`Abonnement Stripe ${sub.id} sans uid retrouvable (customer ${sub.customer})`);
      }
    }
  } catch (e) {
    console.error(`Traitement event Stripe ${event.type} échoué : ${e.message}`);
    // On retourne quand même 200 : l'event est déjà marqué traité (stripeEvents),
    // un échec ici ne doit pas déclencher un rejeu Stripe.
  }

  return jsonResponse({ received: true }, 200, "");
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);

    // v1.51.0 — /product-photo sert les photos R2 (appelé par <img src>, pas de POST possible).
    // v1.56.0 — Fix bug pré-existant : /list-pending-invitations et /invitation-info sont
    // appelées en GET côté client (fetch sans method → GET par défaut), mais étaient
    // routées uniquement sous la branche POST ci-dessous → 405 systématique, jamais
    // visible côté UI car les erreurs y sont avalées silencieusement (catch vide /
    // data.invitations || []). Déplacées ici, dans la branche GET qui leur correspond.
    if (request.method === "GET") {
      if (url.pathname === "/product-photo") {
        return handleProductPhotoServe(request, env, origin);
      }
      if (url.pathname === "/list-pending-invitations") {
        return handleListPendingInvitations(request, env, origin);
      }
      if (url.pathname === "/invitation-info") {
        return handleInvitationInfo(request, env, origin);
      }
      if (url.pathname === "/revocation-info") {
        return handleRevocationRequestInfo(request, env, origin);
      }
      return new Response("Not found", { status: 404 });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/v1/messages") {
      return handleAnthropicProxy(request, env, origin);
    }
    if (url.pathname === "/send-verification-email") {
      return handleSendVerificationEmail(request, env, origin);
    }
    if (url.pathname === "/verify-email") {
      return handleVerifyEmail(request, env, origin);
    }
    if (url.pathname === "/account-data-request") {
      return handleAccountDataRequest(request, env, origin);
    }
    if (url.pathname === "/product-lookup") {
      return handleProductLookup(request, env, origin);
    }
    if (url.pathname === "/product-create") {
      return handleProductCreate(request, env, origin);
    }
    if (url.pathname === "/product-use") {
      return handleProductUse(request, env, origin);
    }
    if (url.pathname === "/confirm-merge") {
      return handleConfirmMerge(request, env, origin);
    }
    if (url.pathname === "/product-photo-upload") {
      return handleProductPhotoUpload(request, env, origin);
    }
    if (url.pathname === "/invite-secondary-user") {
      return handleInviteSecondaryUser(request, env, origin);
    }
    if (url.pathname === "/respond-invitation") {
      return handleRespondInvitation(request, env, origin);
    }
    if (url.pathname === "/revoke-secondary-access") {
      return handleRevokeSecondaryAccess(request, env, origin);
    }
    if (url.pathname === "/request-revoke-own-access") {
      return handleRequestRevokeOwnAccess(request, env, origin);
    }
    if (url.pathname === "/respond-revocation") {
      return handleRespondRevocation(request, env, origin);
    }
    if (url.pathname === "/set-pseudo") {
      return handleSetPseudo(request, env, origin);
    }
    if (url.pathname === "/cancel-invitation") {
      return handleCancelInvitation(request, env, origin);
    }
    if (url.pathname === "/stripe/create-checkout-session") {
      return handleStripeCreateCheckoutSession(request, env, origin);
    }
    if (url.pathname === "/stripe/create-portal-session") {
      return handleStripeCreatePortalSession(request, env, origin);
    }
    if (url.pathname === "/stripe/webhook") {
      return handleStripeWebhook(request, env, origin);
    }

    return new Response("Not found", { status: 404 });
  },

  // Deux Cron Triggers à configurer dans le dashboard Cloudflare (Workers &
  // Pages → ce Worker → Settings → Triggers → Cron Triggers → Add) :
  //   - CRON_CLEANUP_TOKENS ("1 0 1 * *")     : nettoyage mensuel, existant
  //   - CRON_AGGREGATE_CALIBRATION ("0 3 * * *") : agrégation quotidienne, nouveau
  // event.cron permet de distinguer laquelle a déclenché l'appel.
  async scheduled(event, env, ctx) {
    if (event.cron === CRON_CLEANUP_TOKENS) {
      ctx.waitUntil(
        cleanupExpiredVerificationTokens(env).catch((e) =>
          console.error(`Échec du nettoyage planifié : ${e.message}`)
        )
      );
    }
    if (event.cron === CRON_AGGREGATE_CALIBRATION) {
      ctx.waitUntil(
        aggregateCalibrationModels(env).catch((e) =>
          console.error(`Échec de l'agrégation calibrationModels : ${e.message}`)
        )
      );
    }
  },
};
