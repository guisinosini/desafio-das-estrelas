const CACHE_NAME = 'desafio-estrelas-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/conquistas/icon.png',
  '/som 1.mp3',
  '/som 2.mp3',
  '/som 3.mp3',
  '/som 4.mp3',
  '/boa.mp4',
  '/Conquista.mp4'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar chamadas de API do Supabase e Stripe para evitar problemas de CORS/Auth
  if (
    event.request.url.includes('supabase.co') || 
    event.request.url.includes('stripe.com') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cachear dinamicamente novos assets estáticos (imagens, fontes)
        if (
          fetchResponse.status === 200 && 
          (event.request.url.includes('/images/') || event.request.url.includes('/conquistas/'))
        ) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Fallback para quando estiver offline e o asset não estiver no cache
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});
