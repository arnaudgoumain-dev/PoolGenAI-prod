// PoolApp Service Worker — v1
// Stratégie : network-first pour JSX/HTML (toujours la dernière version),
// cache-first pour les assets statiques (icônes, librairies CDN).

const CACHE_NAME = "poolgenai-v3";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./lucide-shim.js",
];

// Installation : mise en cache des assets statiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Active immédiatement sans attendre la fermeture des onglets existants
  self.skipWaiting();
});

// Activation : supprime les anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : network-first pour HTML et JSX, cache-first pour le reste
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Requêtes Firebase, CDN externes → pas de cache SW
  if (
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("gstatic") ||
    url.hostname.includes("unpkg.com")
  ) {
    return;
  }

  // Network-first pour HTML et JSX (toujours la version déployée)
  if (
    event.request.url.endsWith(".html") ||
    event.request.url.endsWith(".jsx") ||
    event.request.url.endsWith("/")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first pour les autres assets (icônes, manifest, lucide-shim)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
