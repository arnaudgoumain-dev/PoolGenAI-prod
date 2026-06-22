/**
 * PoolApp — Proxy Anthropic API
 * Cloudflare Worker
 *
 * Déploiement :
 *   1. Va sur https://dash.cloudflare.com → Workers & Pages → Create Worker
 *   2. Colle ce code, clique "Deploy"
 *   3. Dans Settings → Variables → ajoute un Secret :
 *        Nom : ANTHROPIC_API_KEY
 *        Valeur : ta clé sk-ant-...
 *   4. Note l'URL du worker (ex: poolapp-proxy.ton-compte.workers.dev)
 *   5. Dans PoolApp → Réglages, saisis cette URL à la place de la clé API
 */

const ANTHROPIC_API = "https://api.anthropic.com";

const ALLOWED_ORIGINS = [
  // Ajoute ici les domaines autorisés à appeler ce proxy
  // ex: "https://ton-compte.github.io"
  // Laisser vide = accepte tout (ok pour dev, à restreindre en prod)
];

function corsHeaders(origin) {
  const allowed =
    ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)
      ? origin || "*"
      : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, anthropic-version",
    "Access-Control-Max-Age": "86400",
  };
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
    };

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  },
};
