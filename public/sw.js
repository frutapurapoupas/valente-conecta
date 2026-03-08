const CACHE_NAME = "valente-conecta-v3";
const APP_SHELL = ["/", "/manifest.webmanifest", "/icon?v=2", "/apple-icon?v=2"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();

      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of clientsList) {
        client.navigate(client.url);
      }
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned);
          });
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match("/");
        })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cloned);
            });
          }
          return response;
        });
      })
    );
  }
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Valente Conecta",
    body: "Você recebeu uma nova atualização.",
    url: "/",
    icon: "/icon?v=2",
    badge: "/icon?v=2",
  };

  try {
    const payload = event.data?.json();
    data = {
      ...data,
      ...payload,
    };
  } catch (error) {
    console.error("Erro ao ler payload do push:", error);
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icon?v=2",
      badge: data.badge || "/icon?v=2",
      data: {
        url: data.url || "/",
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || "/";

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});