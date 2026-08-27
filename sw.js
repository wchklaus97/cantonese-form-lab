const CACHE = "form-lab-v30";
const PRECACHE = [
  "./",
  "./index.html",
  "./css/tokens.css",
  "./css/layout.css",
  "./css/library.css",
  "./css/modal.css",
  "./css/agent-ui.css",
  "./css/agent-motion.css",
  "./js/main.js",
  "./js/bindings.js",
  "./js/locale-ui.js",
  "./js/render-library.js",
  "./js/modal.js",
  "./js/install.js",
  "./js/i18n-helpers.js",
  "./js/helpers.js",
  "./js/dom.js",
  "./js/state.js",
  "./js/constants.js",
  "./data/index.js",
  "./data/routines.js",
  "./i18n.js",
  "./agent.js",
  "./manifest.webmanifest",
  "./public/icons/icon-192.png",
  "./public/icons/icon-512.png",
];

function isAppShell(url) {
  try {
    const path = new URL(url).pathname;
    if (path.endsWith("/") || path.endsWith("/index.html")) return true;
    if (path.endsWith(".js") || path.endsWith(".css")) return true;
    if (path.endsWith("manifest.webmanifest")) return true;
    return false;
  } catch {
    return false;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (isAppShell(req.url)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
