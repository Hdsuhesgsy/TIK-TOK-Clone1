const CACHE_NAME = 'tiktok-clone-v1.2.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/css/main.css',
  '/src/js/core/app.js',
  '/public/icons/icon-192.png',
  '/public/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
