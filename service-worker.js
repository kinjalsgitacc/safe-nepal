// Service Worker for SafeNepal PWA
const CACHE_NAME = 'safenepal-cache-v2';

// Files to cache for offline use
const filesToCache = [
  '/',
  '/index.html',
  '/safety.html',
  '/contacts.html',
  '/shelters.html',
  '/simulation.html',
  '/community-reports.html',
  '/style.css',
  '/js/earthquake-api.js',
  '/js/weather-api.js',
  '/js/maps.js',
  '/js/contacts.js',
  '/js/offline.js',
  '/js/language.js',
  '/js/notifications.js',
  '/js/settings.js',
  '/js/push-service.js',
  '/js/simulation.js',
  '/js/community-reports.js',
  '/manifest.json',
  '/images/logo.svg',
  '/images/icons/icon-72x72.png',
  '/images/icons/icon-96x96.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-144x144.png',
  '/images/icons/icon-152x152.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-384x384.png',
  '/images/icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Install event - cache files for offline use
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell and content');
        return cache.addAll(filesToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Cache failure:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Ensure the service worker takes control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('cdn.jsdelivr.net') && 
      !event.request.url.includes('cdnjs.cloudflare.com') && 
      !event.request.url.includes('fonts.googleapis.com')) {
    return;
  }
  
  // For API requests, try network first, then fall back to cached response
  if (event.request.url.includes('api.openweathermap.org') || 
      event.request.url.includes('earthquake.usgs.gov')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to store in cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              // Store the fresh data with an expiry time
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // If network fails, try to return cached data
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }
        
        // Not in cache - fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response to store in cache
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          });
      })
      .catch(error => {
        console.error('[Service Worker] Fetch error:', error);
        
        // If the request is for an HTML page, show the offline page
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html');
        }
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received');
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Alert from SafeNepal',
    icon: '/images/logo.svg',
    badge: '/images/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'SafeNepal Alert', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click received');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});