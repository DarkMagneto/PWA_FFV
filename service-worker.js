

importScripts('serviceworker-cache-polyfill.js');

var CACHE_NAME = 'a2hs';

// File want to cache
var urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './serviceworker-cache-polyfill.js',
  './icon192.png',
  './icon512.png',
  './Logo-removebg-preview.png',
  './LogoFFV144.png',
  './LogoFFV168.png',
  './LogoFFV192.png',
  './LogoFFV48.png',
  './LogoFFV72.png',
  './LogoFFV96.png',
  './marker.png',
  './geoloc.js',
  './bibli_fonc.php',
  './config.php',
  './form_iscrip.php',
  './form_valid.php',
  './index.js',
  './service-worker.js',
  './style.css'
  // './build.js',
];


// Set the callback for the install step
self.oninstall = function (e) {
  console.log('[serviceWorker]: Installing...');
  // perform install steps
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('[serviceWorker]: Cache All');
        return cache.addAll(urlsToCache);
      })
      .then(function () {
        console.log('[serviceWorker]: Intalled And Skip Waiting on Install');
        return self.skipWaiting();
      })
  );
};


self.onfetch = function (e) {

  console.log('[serviceWorker]: Fetching ' + e.request.url);
  var raceUrl = 'API/';
  if(e.request.url.indexOf(raceUrl) > -1){
    e.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return fetch(e.request).then(function (res) {
          cache.put(e.request.url, res.clone());
          return res;
        }).catch(err => {
          console.log('[serviceWorker]: Fetch Error ' + err);
        });
      })
    );
  }

  else if (e.request.url.indexOf('images') > -1) {
    e.respondWith(
      caches.match(e.request).then(function (res) {

        if(res) return res

        return fetch(e.request.clone(), { mode: 'no-cors' }).then(function (newRes) {

          if(!newRes || newRes.status !== 200 || newRes.type !== 'basic') {
            return newRes;
          }

          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(e.request, newRes.clone());
          }).catch(err => {
            console.log('[serviceWorker]: Fetch Error ' + err);
          });

          return newRes;
        });

      })
    );
  }

  else {
    e.respondWith(
      caches.match(e.request).then(function (res) {
        return res || fetch(e.request)
      })
    );
  }

};


self.onactivate = function (e) {

  console.log('[serviceWorker]: Actived');

  var whiteList = ['a2hs'];

  e.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (whiteList.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      )
    }).then(function () {
      console.log('[serviceWorker]: Clients Claims');
      return self.clients.claim();
    })
  );

};
