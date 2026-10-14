/*
 * Service worker: makes the website work like an app on slow / no internet.
 *
 *  • Pages (home, menu…): network first, so guests always see today's menu,
 *    prices and sold-out dishes. If the network is down or very slow, the last
 *    copy saved on the phone is shown, then a friendly offline page.
 *  • Code, fonts, logo, photos: saved on the phone after the first visit
 *    (cache first), so repeat visits load fast and use less mobile data.
 *  • Never cached: the admin area, forms, API calls, other websites.
 *
 * Bump VERSION to force every phone to drop old caches.
 */
const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const IMAGES = `images-${VERSION}`;
const OFFLINE_URL = "/offline/";
const PRECACHE = [OFFLINE_URL, "/", "/menu/", "/icons/icon-192.png", "/icons/icon-512.png", "/restaurant/logo.png"];
const MAX_IMAGES = 80;
const NAV_TIMEOUT_MS = 5000; // after this, show the saved copy if we have one

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES);
      // one by one, so a single failure doesn't break the install
      await Promise.all(PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" })).catch(() => {})));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = [PAGES, ASSETS, IMAGES];
      for (const key of await caches.keys()) if (!keep.includes(key)) await caches.delete(key);
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

const isPrivate = (url) => url.pathname.startsWith("/admin") || url.pathname.startsWith("/api");

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || isPrivate(url)) return;
  // Next.js client navigation data (RSC): always live
  if (req.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  if (req.mode === "navigate") {
    event.respondWith(navigate(event));
    return;
  }
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/restaurant/")) {
    event.respondWith(cacheFirst(req, ASSETS));
    return;
  }
  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(staleWhileRevalidate(req, IMAGES));
  }
});

/** Pages: network first with a timeout, then saved copy, then the offline page. */
async function navigate(event) {
  const cache = await caches.open(PAGES);
  const network = (async () => {
    const res = (await event.preloadResponse) || (await fetch(event.request));
    if (res.ok && !res.redirected && res.type === "basic") cache.put(stripSearch(event.request.url), res.clone());
    return res;
  })();
  const saved = await cache.match(stripSearch(event.request.url));
  try {
    if (!saved) return await network;
    // Have a saved copy: give the network a few seconds, then use the copy.
    return await Promise.race([network, new Promise((_, reject) => setTimeout(() => reject(new Error("slow")), NAV_TIMEOUT_MS))]);
  } catch {
    network.catch(() => {}); // let a slow response still update the cache in the background
    return saved || (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

/** Static files with hashed names: once saved, never change. */
async function cacheFirst(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

/** Photos: show the saved one instantly, refresh it in the background. */
async function staleWhileRevalidate(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  const update = fetch(req)
    .then(async (res) => {
      if (res.ok) {
        await cache.put(req, res.clone());
        const keys = await cache.keys();
        for (const k of keys.slice(0, Math.max(0, keys.length - MAX_IMAGES))) await cache.delete(k);
      }
      return res;
    })
    .catch(() => hit);
  return hit || update;
}

/** Same page regardless of ?lang= / ?source= etc. (keeps one saved copy per page). */
function stripSearch(href) {
  const u = new URL(href);
  u.search = "";
  u.hash = "";
  return u.href;
}
