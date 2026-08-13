/* Timeband service worker
   Bump CACHE when you change index.html so phones pick up the new version. */
var CACHE = "timeband-v2";

var SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./apple-touch-icon.png",
  "./icon-512.png"
];

/* Install: pre-cache the app shell. Individual failures are tolerated so one
   missing file cannot block the whole install. */
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(
        SHELL.map(function (u) {
          return c.add(new Request(u, { cache: "reload" })).catch(function () {});
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* Activate: drop caches from older versions and take control immediately. */
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          if (k !== CACHE) return caches.delete(k);
          return null;
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isFontHost(url) {
  return url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  var sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !isFontHost(url)) return;

  /* Page loads: try the network so updates arrive, fall back to cache offline. */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put("./index.html", copy); });
        return res;
      }).catch(function () {
        return caches.match("./index.html").then(function (hit) {
          return hit || new Response("Offline", { status: 503 });
        });
      })
    );
    return;
  }

  /* Everything else (fonts, icons): cache first, then network. */
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && (res.ok || res.type === "opaque")) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return new Response("", { status: 504 });
      });
    })
  );
});
