const CACHE_NAME = "ssmbeans-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/story.json",
  "/favicon.png",
  "/assets/your-image.png" // add all your assets here
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
