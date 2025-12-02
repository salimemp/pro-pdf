// Service Worker for PRO PDF PWA - Enhanced with Push Notifications and Background Sync
const CACHE_NAME = 'propdf-v2.1';
const RUNTIME_CACHE = 'propdf-runtime';
const FAILED_REQUESTS_STORE = 'propdf-failed-requests';

// Static assets to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/about',
  '/pricing',
  '/help',
  '/favicon.svg',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
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
    // Handle API failures for background sync
    if (request.method === 'POST' || request.method === 'PUT') {
      event.respondWith(
        fetch(request).catch(async (error) => {
          // Store failed request for later retry
          await storeFailedRequest(request);
          // Try to register background sync
          if ('sync' in self.registration) {
            await self.registration.sync.register('retry-failed-requests');
          }
          throw error;
        })
      );
    }
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

// Store failed request for later retry
async function storeFailedRequest(request) {
  try {
    const db = await openDB();
    const tx = db.transaction(FAILED_REQUESTS_STORE, 'readwrite');
    const store = tx.objectStore(FAILED_REQUESTS_STORE);
    
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Array.from(request.headers.entries()),
      body: request.method !== 'GET' ? await request.clone().text() : null,
      timestamp: Date.now(),
    };
    
    await store.add(requestData);
    console.log('[ServiceWorker] Stored failed request for retry:', request.url);
  } catch (error) {
    console.error('[ServiceWorker] Failed to store request:', error);
  }
}

// Open IndexedDB for storing failed requests
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('propdf-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(FAILED_REQUESTS_STORE)) {
        db.createObjectStore(FAILED_REQUESTS_STORE, { keyPath: 'timestamp' });
      }
    };
  });
}

// Background sync - retry failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'retry-failed-requests') {
    event.waitUntil(retryFailedRequests());
  }
});

async function retryFailedRequests() {
  try {
    const db = await openDB();
    const tx = db.transaction(FAILED_REQUESTS_STORE, 'readwrite');
    const store = tx.objectStore(FAILED_REQUESTS_STORE);
    const requests = await store.getAll();
    
    console.log(`[ServiceWorker] Retrying ${requests.length} failed requests`);
    
    for (const requestData of requests) {
      try {
        const init = {
          method: requestData.method,
          headers: new Headers(requestData.headers),
          body: requestData.body,
        };
        
        const response = await fetch(requestData.url, init);
        
        if (response.ok) {
          // Request successful, remove from store
          await store.delete(requestData.timestamp);
          console.log('[ServiceWorker] Successfully retried request:', requestData.url);
        }
      } catch (error) {
        console.error('[ServiceWorker] Retry failed for:', requestData.url, error);
        // Keep in store for next sync attempt
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Error during sync:', error);
  }
}

// Push notification support
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');
  
  const data = event.data?.json() || {};
  const title = data.title || 'PRO PDF';
  const options = {
    body: data.body || 'Your PDF processing is complete!',
    icon: '/icon-192.png',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/dashboard',
      jobId: data.jobId,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'view',
        title: 'View Result',
        icon: '/icon-192.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
    tag: data.tag || 'pdf-notification',
    requireInteraction: false,
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Message handler for client-to-sw communication
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-jobs') {
    event.waitUntil(syncJobs());
  }
});

async function syncJobs() {
  try {
    const response = await fetch('/api/jobs?sync=true');
    if (response.ok) {
      const jobs = await response.json();
      const completedJobs = jobs.filter((job) => job.status === 'completed');
      
      // Notify user of completed jobs
      for (const job of completedJobs) {
        await self.registration.showNotification('PDF Task Complete', {
          body: `Your ${job.type} task has finished successfully!`,
          icon: '/icon-192.png',
          badge: '/favicon.svg',
          data: { url: `/jobs/${job.id}`, jobId: job.id },
          tag: `job-${job.id}`,
        });
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Job sync failed:', error);
  }
}
