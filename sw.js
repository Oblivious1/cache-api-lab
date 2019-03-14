const filesToCache = [
  "/",
  "style/main.css",
  "images/still_life_medium.jpg",
  "index.html",
  "pages/offline.html",
  "pages/404.html",
];

var staticCacheName = "pages-cache-v2";

const FILE_NOT_FOUND_URL = "pages/404.html";
const OFFLINE_URL = "pages/offline.html";

self.addEventListener("install", event => {
  console.log("Attempting to install service worker and cache static assets");
  event.waitUntil(caches.open(staticCacheName).then(cache => cache.addAll(filesToCache)));
});

self.addEventListener("activate", event => {
  console.log("Activating new service worker...");

  const cacheWhitelist = [staticCacheName];

  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      ),
    ),
  );
});

self.addEventListener("fetch", event => {
  console.log("Fetch event for ", event.request.url);
  event.respondWith(
    caches
      .match(event.request)
      .then(response => {
        if (response) {
          console.log("Found ", event.request.url, " in cache");
          return response;
        }
        console.log("Network request for ", event.request.url);
        return fetch(event.request).then(async fetchResponse => {
          console.log(`response status: ${fetchResponse.status}`);

          let resultResponse;

          if (fetchResponse.status === 404) {
            resultResponse = await caches.match(FILE_NOT_FOUND_URL);
          } else {
            resultResponse = fetchResponse;
            const cache = await caches.open(staticCacheName);
            cache.put(event.request.url, fetchResponse.clone());
          }

          return resultResponse;
        });
      })
      .catch(error => {
        console.log("error:", error);
        // TODO 6 - Respond with custom offline page
        return caches.match(OFFLINE_URL);
      }),
  );
});
