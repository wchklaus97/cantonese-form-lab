const CACHE = "form-lab-v33";
const THUMBNAILS = [
  "./public/cards/thumbs/arms-01-dumbbell-curl-cantonese.webp",
  "./public/cards/thumbs/arms-02-alternating-curl-cantonese.webp",
  "./public/cards/thumbs/arms-03-seated-curl-cantonese.webp",
  "./public/cards/thumbs/arms-04-triceps-kickback-cantonese.webp",
  "./public/cards/thumbs/arms-05-bench-dip-cantonese.webp",
  "./public/cards/thumbs/arms-06-overhead-extension-cantonese.webp",
  "./public/cards/thumbs/back-01-wide-elbow-row-cantonese.webp",
  "./public/cards/thumbs/back-02-bent-over-row-cantonese.webp",
  "./public/cards/thumbs/back-03-one-arm-row-cantonese.webp",
  "./public/cards/thumbs/back-04-close-elbow-row-cantonese.webp",
  "./public/cards/thumbs/back-05-incline-row-cantonese.webp",
  "./public/cards/thumbs/back-06-squeeze-row-cantonese.webp",
  "./public/cards/thumbs/back-gold-01-lat-pulldown-cantonese.webp",
  "./public/cards/thumbs/back-gold-02-seated-row-cantonese.webp",
  "./public/cards/thumbs/back-gold-03-pullups-cantonese.webp",
  "./public/cards/thumbs/back-gold-04-barbell-row-cantonese.webp",
  "./public/cards/thumbs/back-gold-05-weighted-pullups-cantonese.webp",
  "./public/cards/thumbs/back-gold-06-tbar-row-cantonese.webp",
  "./public/cards/thumbs/chest-01-bench-press-cantonese.webp",
  "./public/cards/thumbs/chest-02-incline-press-cantonese.webp",
  "./public/cards/thumbs/chest-03-decline-press-cantonese.webp",
  "./public/cards/thumbs/chest-04-floor-press-cantonese.webp",
  "./public/cards/thumbs/chest-05-squeeze-press-cantonese.webp",
  "./public/cards/thumbs/chest-06-pullover-cantonese.webp",
  "./public/cards/thumbs/home-01-rdl-cantonese.webp",
  "./public/cards/thumbs/home-02-glute-bridge-cantonese.webp",
  "./public/cards/thumbs/home-03-seated-press-cantonese.webp",
  "./public/cards/thumbs/home-04-chest-fly-cantonese.webp",
  "./public/cards/thumbs/home-05-reverse-fly-cantonese.webp",
  "./public/cards/thumbs/home-06-dead-bug-cantonese.webp",
  "./public/cards/thumbs/thighs-01-leg-press-cantonese.webp",
  "./public/cards/thumbs/thighs-02-leg-extension-cantonese.webp",
  "./public/cards/thumbs/thighs-03-goblet-squat-cantonese.webp",
  "./public/cards/thumbs/thighs-04-barbell-squat-cantonese.webp",
  "./public/cards/thumbs/thighs-05-hack-squat-cantonese.webp",
  "./public/cards/thumbs/thighs-06-bulgarian-split-squat-cantonese.webp",
];
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
  "./data/exercises/arms.js",
  "./data/exercises/chest.js",
  "./data/exercises/back.js",
  "./data/exercises/thighs.js",
  "./data/exercises/back-gold.js",
  "./data/exercises/home.js",
  "./i18n.js",
  "./agent.js",
  "./manifest.webmanifest",
  "./public/icons/icon-192.png",
  "./public/icons/icon-512.png",
  ...THUMBNAILS,
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
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((path) => new Request(path, { cache: "reload" }))))
      .then(() => self.skipWaiting())
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
  if (new URL(req.url).origin !== self.location.origin) return;

  if (isAppShell(req.url)) {
    event.respondWith(
      fetch(req, { cache: "no-cache" })
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
