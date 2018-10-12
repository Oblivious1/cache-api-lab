const filesToCache = [
  "/",
  "style/main.css",
  "images/still_life_medium.jpg",
  "index.html",
  "pages/offline.html",
  "pages/404.html",
];

const staticCacheName = "pages-cache-v1";

const FILE_NOT_FOUND_URL = "pages/404.html";

self.addEventListener("install", event => {
  console.log("Attempting to install service worker and cache static assets");
  event.waitUntil(caches.open(staticCacheName).then(cache => cache.addAll(filesToCache)));
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
        return fetch(event.request).then(fetchResponse => {
          console.log(`response status: ${fetchResponse.status}`);

          if (fetchResponse.status === 404) {
            // requested page not found, so set our reponse to 404.html
          } else {
            return caches.open(staticCacheName).then(cache => {
              cache.put(event.request.url, fetchResponse.clone());
              return fetchResponse;
            });
          }
        });
      })
      .catch(error => {
        console.log("error:", error);
        // TODO 6 - Respond with custom offline page
      }),
  );
});
