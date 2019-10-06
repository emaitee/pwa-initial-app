const dataCacheName = 'weatherData-v2';
const cacheName = 'weatherPWA-v2';
const filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/scripts/localforage-1.4.0.js',
  '/styles/ud811.css',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png',
];

self.addEventListener('install', e => {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('[ServiceWorker] Caching App Shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', e => {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== cacheName && key !== dataCacheName) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', e => {
  console.log('[ServiceWorker] Fetch', e.request.url);
  if (e.request.url.startsWith(weatherAPIUrlBase)) {
    e.respondWith(
      fetch(e.request).then(response => {
        return caches.open(dataCacheName).then(cache => {
          cache.put(e.request.url, response.clone());
          console.log('[ServiceWorker] Fetched&CAched Data', e.request.url);
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(response => {
        console.log('[ServiceWorker] Fetch only', e.request.url);
        return response || fetch(e.request);
      })
    );
  }
});
