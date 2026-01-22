// Placeholder service worker to prevent registration errors in development.
self.addEventListener("install", () => {
  // no-op
});

self.addEventListener("push", (event) => {
  // Skip handling push notifications for now
  event.waitUntil(Promise.resolve());
});
