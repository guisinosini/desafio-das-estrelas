self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('SW instalado e aguardando ativação');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  console.log('SW ativado - Interceptação desativada');
});

// A interceptação de fetch foi removida para evitar erros de autenticação com Supabase
