// Service Worker for PRO PDF PWA
const CACHE_NAME = 'propdf-v2.0';
const RUNTIME_CACHE = 'propdf-runtime';

// Static assets to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/about',
  '/pricing',
  '/help',
  '/favicon.svg',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API calls and dynamic routes (they need fresh data)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/data/') ||
    request.method !== 'GET'
  ) {
    return;
  }

  // Network-first strategy for HTML pages (dynamic content)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cached) => {
            return (
              cached ||
              caches.match('/').then((fallback) => {
                return fallback || new Response('Offline - Please check your connection', {
                  status: 503,
                  statusText: 'Service Unavailable',
                });
              })
            );
          });
        })
    );
    return;
  }

  // Cache-first strategy for static assets (images, fonts, CSS, JS)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return a fallback for failed requests
          return new Response('Resource not available offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
    })
  );
});

// Background sync for failed requests (optional enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pdf-operations') {
    event.waitUntil(
      // Retry failed PDF operations
      Promise.resolve(console.log('[ServiceWorker] Syncing PDF operations'))
    );
  }
});

// Push notification support (optional enhancement)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'PDF operation completed',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: data,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'PRO PDF', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
