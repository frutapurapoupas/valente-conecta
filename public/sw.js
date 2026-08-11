// public/sw.js
//
// CACHE_NAME precisa subir de versao a cada mudanca de estrategia (o
// listener de 'activate' so' apaga caches com nome diferente do atual) —
// sem isso, quem ja tinha o PWA instalado fica preso na versao antiga do
// app pra sempre, mesmo com deploys novos no servidor.
const CACHE_NAME = 'valente-conecta-v2';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json'
];

// Instalação — skipWaiting faz o novo service worker assumir na hora, sem
// esperar todas as abas antigas fecharem (senao um deploy so' "pega" depois
// que a pessoa fechar o app inteiro, o que na pratica quase nunca acontece).
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Ativação — apaga caches de versoes antigas e assume o controle das abas
// que ja estavam abertas (clients.claim), sem precisar de F5.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      )),
      self.clients.claim(),
    ])
  );
});

// Push recebido do servidor (ver lib/push.ts)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      data: payload.data || {},
    })
  );
});

// Clique na notificacao abre a URL indicada (ou o app, se ja estiver aberto)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// Fetch — network-first: tenta a rede sempre (pra nunca servir codigo
// desatualizado enquanto o usuario esta online) e so' usa o cache como
// fallback de verdade offline. A estrategia antiga (cache-first) fazia
// qualquer correcao de bug ficar invisivel pra quem ja tinha o app aberto
// antes, mesmo depois de um novo deploy.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return; // nunca intercepta POST/PUT/DELETE (APIs)

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/offline')))
  );
});