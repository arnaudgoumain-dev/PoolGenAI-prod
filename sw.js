// sw.js — PoolGenAI
//
// Rôle unique de ce service worker : mettre l'app en cache pour qu'elle
// reste utilisable hors connexion (coquille + librairies tierces).
// Il ne gère JAMAIS la détection de nouvelle version ni le reload — ce
// mécanisme reste exclusivement porté par version.json / PoolGenAI.jsx
// (écran de mise à jour bloquant non fermable). Voir le commentaire dans
// index.html à l'endroit où ce fichier est enregistré.

const CACHE_VERSION = "v1";
const STATIC_CACHE = `poolgenai-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `poolgenai-runtime-${CACHE_VERSION}`;

// Fichiers propres à l'app (même origine), résolus en URLs absolues par
// rapport à la portée du service worker.
const APP_SHELL_PATHS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./lucide-shim.js",
];
const APP_SHELL_URLS = APP_SHELL_PATHS.map((p) => new URL(p, self.location).href);

// Librairies tierces figées à une version exacte dans l'URL (unpkg / gstatic) :
// le contenu de cette URL précise ne changera jamais → cache-first pour
// toujours est sûr.
const PINNED_VENDOR_URLS = [
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "https://unpkg.com/prop-types@15/prop-types.min.js",
  "https://unpkg.com/recharts@2.15.1/umd/Recharts.js",
  "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js",
  "https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js",
];

// URL non figée en version (@babel/standalone sans tag de version) : son
// contenu peut changer côté CDN à tout moment → jamais de cache-first pur,
// toujours le réseau en priorité, cache en secours seulement hors-ligne.
const UNPINNED_VENDOR_URL = "https://unpkg.com/@babel/standalone/babel.min.js";

// Fichiers qui changent à chaque déploiement : réseau en priorité pour que
// le mécanisme de mise à jour voie toujours la vraie version en ligne ;
// cache uniquement en secours si hors-ligne.
const NETWORK_FIRST_SUFFIXES = ["/PoolGenAI.jsx", "/version.json"];

const STATIC_URL_SET = new Set([...APP_SHELL_URLS, ...PINNED_VENDOR_URLS]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // Précache un par un (pas cache.addAll, qui échoue en bloc si une
      // seule requête échoue) : un CDN momentanément indisponible ne doit
      // pas empêcher l'installation du reste du cache.
      await Promise.all(
        [...STATIC_URL_SET].map(async (url) => {
          try {
            const res = await fetch(url, { cache: "no-cache" });
            if (res.ok) await cache.put(url, res);
          } catch (e) {
            console.warn("[SW] précache échouée pour", url, e);
          }
        })
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      );
      self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1. Code applicatif + version.json : réseau en priorité.
  if (NETWORK_FIRST_SUFFIXES.some((suffix) => url.pathname.endsWith(suffix))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 2. Lib non figée en version : réseau en priorité.
  if (request.url === UNPINNED_VENDOR_URL) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 3. Coquille de l'app + libs figées en version : cache d'abord.
  if (STATIC_URL_SET.has(request.url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 4. Tout le reste (Google Identity Services, appels Firestore/API,
  //    proxy Cloudflare, etc.) : pas d'interception, comportement réseau
  //    normal du navigateur.
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch (e) {
    return cached || Response.error();
  }
}

async function networkFirst(request) {
  try {
    const res = await fetch(request, { cache: "no-cache" });
    if (res.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw e;
  }
}
