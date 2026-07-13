// Cozy Cookbook — Service Worker
// CACHE bumped v2 → v3 after data fixes (dedup + ID collision fix). Returning
// users on stale v2 cached data.js were seeing inflated recipe counts and
// duplicate titles in Browse because the v2 cache didn't include the cleaned
// data.js. Also bumped index.html script src to data.js?v=3 to bypass the
// browser cache entirely.
const CACHE = 'cozy-cookbook-v3';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './data.js',
  './manifest.webmanifest',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => null)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});