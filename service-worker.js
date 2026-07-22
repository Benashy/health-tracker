const CACHE_NAME = "health-dashboard-v0.47";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=0.47",
  "./app.js?v=0.47",
  "./supabase-config.js?v=0.47",
  "./privacy-guard.js?v=0.47",
  "./manifest.webmanifest?v=0.47",
  "./health-dashboard-favicon.ico?v=0.47",
  "./health-dashboard-favicon-16.png?v=0.47",
  "./health-dashboard-favicon-32.png?v=0.47",
  "./favicon.ico?v=0.47",
  "./favicon-16.png?v=0.47",
  "./favicon-32.png?v=0.47",
  "./favicon-48.png?v=0.47",
  "./favicon-64.png?v=0.47",
  "./app-icon.svg?v=0.47",
  "./app-icon-180.png?v=0.47",
  "./app-icon-192.png?v=0.47",
  "./app-icon-512.png?v=0.47",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("health-dashboard-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    }),
  );
});
