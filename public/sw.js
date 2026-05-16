const CACHE_NAME = 'desafio-estrelas-v2';
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
  // Ignorar chamadas de API, Stripe e métodos que não sejam GET
  if (
    event.request.url.includes('supabase.co') || 
    event.request.url.includes('stripe.com') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Estratégia Network-First: Tenta a internet primeiro. Se falhar, usa o cache.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a rede respondeu com sucesso, atualiza o cache com a versão nova
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Falha na rede (offline) -> Busca no cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Se for uma navegação de página e não tiver no cache, entrega a home offline
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
