// LinkLog Service Worker
const CACHE = 'linklog-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Cache-first for the app shell, network-first for everything else
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Let Google APIs and X API go straight to network
  if (url.hostname.includes('google') ||
      url.hostname.includes('twitter') ||
      url.hostname.includes('corsproxy')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && e.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match(e.request))
  );
});
