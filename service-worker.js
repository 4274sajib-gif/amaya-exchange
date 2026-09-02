const CACHE_NAME = 'amaya-exchange-v2';

const APP_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {

  // শুধু GET request handle করবে
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);

  // অন্য domain-এর request cache করবে না
  // যেমন Google Apps Script API
  if (requestURL.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {

        // সফল response হলে cache-এ রাখবে
        if (response && response.status === 200) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // Internet না থাকলে cache থেকে দেখাবে
        return caches.match(event.request);
      })
  );
});
