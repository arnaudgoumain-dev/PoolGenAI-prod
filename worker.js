/**
 * PoolGenAI — Proxy Anthropic API + Vérification d'email
 * Cloudflare Worker
 *
 * SÉCURITÉ : le proxy /v1/messages exige un ID token Firebase valide (header
 * Authorization: Bearer <idToken>) avant de transmettre la requête à l'API
 * Anthropic. Sans ça, n'importe qui connaissant l'URL du worker pourrait
 * consommer la clé API.
 *
 * Ce worker gère aussi l'envoi et la validation des liens de vérification
 * d'email via Resend (système maison, indépendant de Firebase Auth email
 * verification).
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

// À adapter avec l'origine réelle de ton PWA (github.io et/ou poolgenai.app)
const ALLOWED_ORIGINS = [
  "https://arnaudgoumain-dev.github.io",
  "https://poolgenai.app",
];

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

// ---------- Conversion vers/depuis le format Firestore REST ----------
function toFirestoreValue(value) {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  throw new Error(`Type non supporté pour Firestore: ${typeof value}`);
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = toFirestoreValue(value);
  }
  return fields;
}

function fromFirestoreFields(fields) {
  const obj = {};
  for (const [key, value] of Object.entries(fields || {})) {
    if ("stringValue" in value) obj[key] = value.stringValue;
    else if ("booleanValue" in value) obj[key] = value.booleanValue;
    else if ("timestampValue" in value) obj[key] = new Date(value.timestampValue);
  }
  return obj;
}

// ---------- Firestore : créer un document avec un ID choisi ----------
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

// ---------- Route : POST /send-verification-email ----------
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

    return new Response("Not found", { status: 404 });
  },
};
