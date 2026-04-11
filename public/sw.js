// public/sw.js — v3 (cache seguro: apenas assets estáticos, nunca RSC/JS chunks)
const CACHE_NAME = 'valente-conecta-v3'
const STATIC_ASSETS = [
  '/icone.png',
  '/manifest.json',
  '/admin-manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Instalação
self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
})

// Ativação — limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch — nunca intercepta RSC, API, chunks JS/CSS do Next.js
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Deixa passar: RSC payloads, API routes, Next.js chunks, HMR
  const bypass =
    url.searchParams.has('_rsc') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('__nextjs') ||
    event.request.method !== 'GET'

  if (bypass) return // não intercepta — vai direto para a rede

  // Para assets estáticos conhecidos, tenta cache primeiro
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  )
})
