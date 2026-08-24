/* GHITHARA / AMOS Maintenance Manager — service worker
   Caches this page's own HTML so the app can reopen while offline, and
   its mere presence/registration is what lets Chrome/Android treat the
   app as installable (triggers the "beforeinstallprompt" event used by
   the in-app "Install" button in Settings).

   Bump CACHE_NAME (e.g. amos-app-shell-v2) any time you upload a new
   version of the main HTML file, so returning users get the fresh copy
   instead of a stale cached one. */
const CACHE_NAME = "amos-app-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(self.registration.scope))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
    ])
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return resp;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(self.registration.scope)))
    );
  }
});
