/**
 * PoolGenAI — Proxy Anthropic API
 * Cloudflare Worker
 *
 * SÉCURITÉ : ce proxy exige un ID token Firebase valide (header Authorization:
 * Bearer <idToken>) avant de transmettre la requête à l'API Anthropic. Sans ça,
 * n'importe qui connaissant l'URL du worker pourrait consommer la clé API.
 *
 * Déploiement :
 *   1. Va sur https://dash.cloudflare.com → Workers & Pages → Create Worker
 *   2. Colle ce code, clique "Deploy"
 *   3. Dans Settings → Variables → ajoute un Secret :
 *        Nom : ANTHROPIC_API_KEY
 *        Valeur : ta clé sk-ant-...
 *   4. Vérifie que FIREBASE_PROJECT_ID ci-dessous correspond à ton projet Firebase
 *   5. Note l'URL du worker (ex: poolgenai-proxy.ton-compte.workers.dev)
 *   6. Dans PoolGenAI → Réglages, saisis cette URL à la place de la clé API
 */

const ANTHROPIC_API = "https://api.anthropic.com";
const FIREBASE_PROJECT_ID = "poolapp-ago";
const GOOGLE_JWK_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const ALLOWED_ORIGINS = [
  "https://arnaudgoumain-dev.github.io",
];

function corsHeaders(origin) {
  const allowed =
    ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)
      ? origin || "*"
      : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, anthropic-version, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonError(message, status, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

// ---------- Décodage base64url ----------
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
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

  return payload; // payload.sub = uid Firebase vérifié
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Seul endpoint exposé : /v1/messages
    const url = new URL(request.url);
    if (url.pathname !== "/v1/messages") {
      return new Response("Not found", { status: 404 });
    }

    // --- Authentification obligatoire ---
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
        "anthropic-version":
          request.headers.get("anthropic-version") || "2023-06-01",
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
  },
};
