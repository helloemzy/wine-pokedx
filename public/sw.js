// Wine Pokédx Service Worker - Advanced PWA with enhanced performance caching
const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `wine-pokedx-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `wine-pokedx-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `wine-pokedx-dynamic-v${CACHE_VERSION}`;
const API_CACHE_NAME = `wine-pokedx-api-v${CACHE_VERSION}`;
const IMAGES_CACHE_NAME = `wine-pokedx-images-v${CACHE_VERSION}`;

// Enhanced cache configuration with performance optimizations
const CACHE_CONFIG = {
  static: {
    maxEntries: 200,
    maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days for static assets
  },
  dynamic: {
    maxEntries: 150,
    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days for dynamic content
  },
  api: {
    maxEntries: 100,
    maxAgeSeconds: 15 * 60, // 15 minutes for API responses
    staleWhileRevalidate: true,
  },
  images: {
    maxEntries: 500,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days for images
    compressionEnabled: true,
  },
};

// Static assets to cache immediately with critical path optimization
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/badge-72x72.png',
  '/images/wine-bottle-placeholder.webp',
  '/_next/static/css/app/layout.css',
  '/_next/static/css/app/globals.css',
];

// Routes that should work offline with enhanced support
const OFFLINE_ROUTES = [
  '/',
  '/collection',
  '/profile',
  '/settings',
  '/battles',
  '/trading',
  '/guilds',
  '/leaderboard',
];

// API endpoints with intelligent caching strategies
const API_CACHE_STRATEGIES = {
  // Cache first - rarely changing data
  CACHE_FIRST: [
    '/api/wine-types',
    '/api/regions',
    '/api/grapes',
    '/api/rarities',
  ],
  // Network first with fallback - frequently changing
  NETWORK_FIRST: [
    '/api/battles',
    '/api/trades/active',
    '/api/guilds/activities',
    '/api/leaderboard',
  ],
  // Stale while revalidate - balance of fresh and fast
  STALE_WHILE_REVALIDATE: [
    '/api/wines',
    '/api/search',
    '/api/stats',
    '/api/market',
    '/api/profile',
  ],
};

// Background sync tags
const SYNC_TAGS = {
  WINE_SYNC: 'wine-sync',
  BATTLE_SYNC: 'battle-sync',
  TRADE_SYNC: 'trade-sync',
  GUILD_SYNC: 'guild-sync',
};

// Images and assets patterns
const ASSET_PATTERNS = [
  /\.(?:png|jpg|jpeg|webp|svg|gif|ico)$/,
  /\/images\//,
  /\/wine-images\//,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('wine-pokedex-') && 
                     !cacheName.includes('v1.0.0');
            })
            .map((cacheName) => {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Enhanced fetch event with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests and chrome-extension requests
  if (!request.url.startsWith('http') || request.url.includes('chrome-extension://')) {
    return;
  }

  // Performance optimization: Skip caching for certain requests
  if (shouldSkipCaching(request)) {
    return;
  }

  // Route requests to appropriate caching strategies
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstWithExpiration(request, STATIC_CACHE_NAME, CACHE_CONFIG.static));
  } else if (isImage(request)) {
    event.respondWith(cacheFirstWithExpiration(request, IMAGES_CACHE_NAME, CACHE_CONFIG.images));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationWithPreload(request));
  } else {
    event.respondWith(staleWhileRevalidateWithExpiration(request, DYNAMIC_CACHE_NAME, CACHE_CONFIG.dynamic));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'wine-data-sync') {
    event.waitUntil(syncWineData());
  } else if (event.tag === 'rating-sync') {
    event.waitUntil(syncRatings());
  } else if (event.tag === 'notes-sync') {
    event.waitUntil(syncTastingNotes());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  const options = {
    body: 'New wine recommendations available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'View Collection',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'Wine Pokédex';
  }

  event.waitUntil(
    self.registration.showNotification('Wine Pokédex', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/collection')
    );
  }
});

// Enhanced helper functions with performance optimizations
function shouldSkipCaching(request) {
  // Skip caching for analytics, tracking, and authentication requests
  const skipPatterns = [
    /google-analytics\.com/,
    /googletagmanager\.com/,
    /auth\//,
    /logout/,
    /\?.*no-cache/,
    /socket\.io/,
    /hot-update/,
  ];
  
  return skipPatterns.some(pattern => pattern.test(request.url)) ||
         request.method !== 'GET';
}

function isStaticAsset(request) {
  return request.destination === 'script' || 
         request.destination === 'style' ||
         request.destination === 'manifest' ||
         request.url.includes('/_next/static/') ||
         request.url.includes('/manifest.json');
}

function isImage(request) {
  return request.destination === 'image' ||
         ASSET_PATTERNS.some(pattern => pattern.test(request.url)) ||
         /\.(png|jpg|jpeg|webp|svg|gif|ico|avif)(\?.*)?$/i.test(request.url);
}

function isAPIRequest(request) {
  return request.url.includes('/api/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && 
          request.headers.get('accept') && 
          request.headers.get('accept').includes('text/html'));
}

// Enhanced caching strategies with expiration and performance optimizations
async function cacheFirstWithExpiration(request, cacheName, config) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, config.maxAgeSeconds)) {
      console.log('SW: Serving fresh cache:', request.url);
      // Update access time for LRU
      updateAccessTime(cachedResponse);
      return cachedResponse;
    }

    console.log('SW: Cache miss or expired, fetching:', request.url);
    const response = await fetch(request, { 
      signal: AbortSignal.timeout(10000) // 10s timeout
    });
    
    if (response.ok) {
      await putInCacheWithMetadata(cache, request, response.clone(), config);
    }
    
    return response;
  } catch (error) {
    console.log('SW: Cache first failed:', error);
    
    // Try to serve expired cache as fallback
    const cache = await caches.open(cacheName);
    const staleResponse = await cache.match(request);
    if (staleResponse) {
      console.log('SW: Serving stale cache as fallback');
      return staleResponse;
    }
    
    return createOfflineResponse('Offline content not available');
  }
}

async function networkFirstWithTimeout(request, cacheName, config, timeout = 5000) {
  try {
    const response = await fetch(request, { 
      signal: AbortSignal.timeout(timeout)
    });
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await putInCacheWithMetadata(cache, request, response.clone(), config);
    }
    
    return response;
  } catch (error) {
    console.log('SW: Network failed, trying cache:', error);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('SW: Serving cached fallback');
      return cachedResponse;
    }
    
    return createOfflineResponse(JSON.stringify({ error: 'Offline', timestamp: Date.now() }), 'application/json');
  }
}

async function staleWhileRevalidateWithExpiration(request, cacheName, config) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Background revalidation with error handling
  const fetchPromise = fetch(request, { 
    signal: AbortSignal.timeout(8000) 
  }).then(async (response) => {
    if (response.ok) {
      await putInCacheWithMetadata(cache, request, response.clone(), config);
      
      // Notify clients of updated data
      notifyClientsOfUpdate(request.url);
    }
    return response;
  }).catch((error) => {
    console.log('SW: Background revalidation failed for:', request.url, error);
    return null;
  });

  // Return cached response immediately, or wait for network if no cache
  if (cachedResponse && !isExpired(cachedResponse, config.maxAgeSeconds)) {
    updateAccessTime(cachedResponse);
    return cachedResponse;
  }

  return fetchPromise || cachedResponse || createOfflineResponse('Content temporarily unavailable');
}

async function handleNavigation(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);
    
    // Cache successful navigation responses
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Check if we have a cached version
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Check if it's an offline-supported route
    const url = new URL(request.url);
    if (OFFLINE_ROUTES.some(route => url.pathname.startsWith(route))) {
      return caches.match('/offline') || 
             new Response('App is offline', { status: 503 });
    }
    
    // Fallback to main page
    return caches.match('/') || 
           new Response('Page not available offline', { status: 503 });
  }
}

// Helper functions for cache management
function isExpired(response, maxAgeSeconds) {
  const dateHeader = response.headers.get('date');
  const cacheDate = dateHeader ? new Date(dateHeader).getTime() : Date.now();
  const now = Date.now();
  return (now - cacheDate) > (maxAgeSeconds * 1000);
}

function updateAccessTime(response) {
  // Update access time in response headers for LRU cache management
  response.headers.set('x-cache-access', Date.now().toString());
}

async function putInCacheWithMetadata(cache, request, response, config) {
  const responseClone = response.clone();
  responseClone.headers.set('x-cache-date', Date.now().toString());
  responseClone.headers.set('x-cache-max-age', config.maxAgeSeconds.toString());
  
  await cache.put(request, responseClone);
  
  // Implement LRU cache cleanup
  await cleanupCache(cache, config.maxEntries);
}

async function cleanupCache(cache, maxEntries) {
  const keys = await cache.keys();
  
  if (keys.length <= maxEntries) return;
  
  // Sort by access time and remove oldest entries
  const entriesToRemove = keys.length - maxEntries;
  const keysWithAccess = await Promise.all(
    keys.map(async (key) => {
      const response = await cache.match(key);
      const accessTime = parseInt(response.headers.get('x-cache-access') || '0', 10);
      return { key, accessTime };
    })
  );
  
  keysWithAccess
    .sort((a, b) => a.accessTime - b.accessTime)
    .slice(0, entriesToRemove)
    .forEach(({ key }) => cache.delete(key));
}

function createOfflineResponse(content, contentType = 'text/html') {
  return new Response(content, {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    },
  });
}

function notifyClientsOfUpdate(url) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_UPDATED',
        url: url,
        timestamp: Date.now()
      });
    });
  });
}

async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Determine caching strategy based on API endpoint
  if (API_CACHE_STRATEGIES.CACHE_FIRST.some(pattern => pathname.includes(pattern))) {
    return cacheFirstWithExpiration(request, API_CACHE_NAME, CACHE_CONFIG.api);
  } else if (API_CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => pathname.includes(pattern))) {
    return networkFirstWithTimeout(request, API_CACHE_NAME, CACHE_CONFIG.api, 3000);
  } else if (API_CACHE_STRATEGIES.STALE_WHILE_REVALIDATE.some(pattern => pathname.includes(pattern))) {
    return staleWhileRevalidateWithExpiration(request, API_CACHE_NAME, CACHE_CONFIG.api);
  } else {
    // Default to network first for unknown API endpoints
    return networkFirstWithTimeout(request, API_CACHE_NAME, CACHE_CONFIG.api, 5000);
  }
}

async function handleNavigationWithPreload(request) {
  try {
    // Try network first for navigation with preload optimization
    const response = await fetch(request, { 
      signal: AbortSignal.timeout(8000)
    });
    
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
      
      // Preload critical resources for next navigation
      preloadCriticalResources();
    }
    
    return response;
  } catch (error) {
    return handleNavigation(request);
  }
}

async function preloadCriticalResources() {
  // Preload critical resources that are likely to be needed
  const criticalResources = [
    '/_next/static/chunks/main.js',
    '/_next/static/chunks/pages/_app.js',
    '/_next/static/css/app/layout.css',
    '/api/wines',
  ];
  
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  criticalResources.forEach(async (resource) => {
    try {
      const response = await fetch(resource);
      if (response.ok) {
        cache.put(resource, response);
      }
    } catch (error) {
      console.log('SW: Failed to preload resource:', resource);
    }
  });
}

// Background sync functions
async function syncWineData() {
  try {
    console.log('SW: Syncing wine data');
    
    // Get pending wine additions from IndexedDB
    const pendingWines = await getPendingWineData();
    
    for (const wine of pendingWines) {
      try {
        const response = await fetch('/api/wines', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wine),
        });
        
        if (response.ok) {
          await removePendingWineData(wine.id);
          console.log('SW: Synced wine:', wine.name);
        }
      } catch (error) {
        console.log('SW: Failed to sync wine:', wine.name, error);
      }
    }
  } catch (error) {
    console.log('SW: Wine data sync failed:', error);
  }
}

async function syncRatings() {
  try {
    console.log('SW: Syncing ratings');
    
    // Get pending ratings from IndexedDB
    const pendingRatings = await getPendingRatings();
    
    for (const rating of pendingRatings) {
      try {
        const response = await fetch(`/api/wines/${rating.wineId}/rating`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rating: rating.rating }),
        });
        
        if (response.ok) {
          await removePendingRating(rating.id);
          console.log('SW: Synced rating for wine:', rating.wineId);
        }
      } catch (error) {
        console.log('SW: Failed to sync rating:', rating.wineId, error);
      }
    }
  } catch (error) {
    console.log('SW: Rating sync failed:', error);
  }
}

async function syncTastingNotes() {
  try {
    console.log('SW: Syncing tasting notes');
    
    // Get pending notes from IndexedDB
    const pendingNotes = await getPendingTastingNotes();
    
    for (const note of pendingNotes) {
      try {
        const response = await fetch(`/api/wines/${note.wineId}/notes`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes: note.notes }),
        });
        
        if (response.ok) {
          await removePendingTastingNote(note.id);
          console.log('SW: Synced notes for wine:', note.wineId);
        }
      } catch (error) {
        console.log('SW: Failed to sync notes:', note.wineId, error);
      }
    }
  } catch (error) {
    console.log('SW: Tasting notes sync failed:', error);
  }
}

// IndexedDB helper functions (simplified - you'd implement these properly)
async function getPendingWineData() {
  // Implement IndexedDB query for pending wine data
  return [];
}

async function removePendingWineData(id) {
  // Implement IndexedDB removal
}

async function getPendingRatings() {
  // Implement IndexedDB query for pending ratings
  return [];
}

async function removePendingRating(id) {
  // Implement IndexedDB removal
}

async function getPendingTastingNotes() {
  // Implement IndexedDB query for pending notes
  return [];
}

async function removePendingTastingNote(id) {
  // Implement IndexedDB removal
}

// Periodic background sync for keeping data fresh
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'wine-data-refresh') {
    event.waitUntil(refreshWineData());
  }
});

async function refreshWineData() {
  try {
    console.log('SW: Refreshing wine data in background');
    
    // Fetch latest wine data and update cache
    const response = await fetch('/api/wines?updated=true');
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put('/api/wines', response);
      
      // Notify clients about updated data
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'DATA_UPDATED',
          payload: { wines: true }
        });
      });
    }
  } catch (error) {
    console.log('SW: Background refresh failed:', error);
  }
}