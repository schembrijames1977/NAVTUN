const CACHE_NAME = 'tn-marine-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm',
  'https://unpkg.com/leaflet.tilelayer.mbtiles@0.1.0/Leaflet.TileLayer.MBTiles.js'
];

// Installation et mise en cache des scripts structurels
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Stratégie Réseau puis Cache (Network-first) pour toujours privilégier les données fraîches si dispo
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then((response) => {
      // Si la requête réussit, on met une copie dans le cache (utile pour stocker les dalles de cartes lues en ligne)
      if (e.request.url.includes('tile.openstreetmap') || e.request.url.includes('tiles.openseamap')) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
      }
      return response;
    }).catch(() => {
      // Si le réseau échoue (au large), on pioche dans le cache local
      return caches.match(e.request);
    })
  );
});