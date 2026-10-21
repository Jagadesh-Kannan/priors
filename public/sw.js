// Phase 0: enough for installability. Push handling arrives with alerts in Phase 4.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
