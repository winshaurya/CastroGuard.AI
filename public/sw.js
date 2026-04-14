const APP_CACHE = 'congni-app-shell-v2';
const TILE_CACHE = 'congni-osm-tiles-v2';
const TILE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const APP_SHELL = ['/', '/index.html'];

function isOpenStreetMapTile(requestUrl) {
  return requestUrl.hostname === 'tile.openstreetmap.org' && requestUrl.pathname.endsWith('.png');
}

async function cacheAppShell() {
  const cache = await caches.open(APP_CACHE);
  await cache.addAll(APP_SHELL);
}

async function getCachedTile(request) {
  const cache = await caches.open(TILE_CACHE);
  const cacheKey = request.url;
  const metaRequest = new Request(`${cacheKey}__meta`);
  const cachedResponse = await cache.match(request);
  const cachedMeta = await cache.match(metaRequest);
  const cachedAt = cachedMeta ? Number(await cachedMeta.text()) : 0;

  if (cachedResponse && cachedAt && Date.now() - cachedAt < TILE_TTL_MS) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      await cache.put(request, response.clone());
      await cache.put(metaRequest, new Response(String(Date.now()), { headers: { 'Content-Type': 'text/plain' } }));
      return response;
    }
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }

  return cachedResponse || fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== APP_CACHE && cacheName !== TILE_CACHE) {
          return caches.delete(cacheName);
        }
        return undefined;
      }),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (isOpenStreetMapTile(requestUrl)) {
    event.respondWith(getCachedTile(event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (requestUrl.origin === self.location.origin) {
    event.respondWith(networkFirst(event.request));
  }
});
