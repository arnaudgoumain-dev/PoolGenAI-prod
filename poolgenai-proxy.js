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
const FIREBASE_PROJECT_ID = "poolapp-ago";
const GOOGLE_JWK_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const IDENTITY_TOOLKIT_URL = "https://identitytoolkit.googleapis.com/v1/accounts:update";
const RESEND_API_URL = "https://api.resend.com/emails";

const VERIFICATION_LINK_BASE = "https://arnaudgoumain-dev.github.io/PoolApp/";
const VERIFICATION_TOKEN_TTL_HOURS = 24;
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

// À adapter avec l'origine réelle de ton PWA
const ALLOWED_ORIGINS = [
  "https://arnaudgoumain-dev.github.io",
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

function jsonError(message, status, origin) {
  return jsonResponse({ error: message }, status, origin);
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

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);

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
