// Service Worker para PWA - Tarifa Zero - Versão Otimizada
const CACHE_NAME = 'tarifazero-v2';
const API_CACHE = 'tarifazero-api-v2';

// Arquivos essenciais para cache (somente críticos)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logoTarifaZero.png',
  '/manifest.json'
];

// Tamanho máximo do cache de API (limitar para evitar uso excessivo de memória)
const MAX_API_CACHE_SIZE = 50;

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');

  // Pular espera e ativar imediatamente
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Abrir caches após limpeza
      return Promise.all([
        caches.open(CACHE_NAME).then((cache) => {
          console.log('[SW] Cache estático aberto');
          return cache.addAll(STATIC_ASSETS);
        }),
        caches.open(API_CACHE)
      ]);
    })
  );

  // Assumir controle imediatamente
  return self.clients.claim();
});

// Interceptar requisições com estratégias otimizadas
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Estratégia para API: Network First com timeout e fallback para cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((response) => {
          // Clonar resposta para cache apenas se bem-sucedida
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              // Limitar tamanho do cache de API
              cache.keys().then((keys) => {
                if (keys.length >= MAX_API_CACHE_SIZE) {
                  cache.delete(keys[0]);
                }
                cache.put(request, responseClone);
              });
            });
          }
          return response;
        })
        .catch(() => {
          // Se falhar, tentar cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Servindo API do cache:', request.url);
              return cachedResponse;
            }

            // Retornar erro amigável
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Sem conexão. Dados não disponíveis offline.'
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // Estratégia para assets estáticos: Cache First com atualização em background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Atualizar em background apenas para requisições importantes
        if (!request.url.includes('localhost')) {
          fetch(request, { cache: 'no-cache' }).then((response) => {
            if (response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            }
          }).catch(() => {
            // Silenciosamente ignorar erros de atualização
          });
        }

        return cachedResponse;
      }

      // Se não estiver no cache, buscar da rede
      return fetch(request).then((response) => {
        // Cachear apenas respostas bem-sucedidas
        if (response.status === 200 && !request.url.includes('localhost')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      });
    })
  );
});

// Sincronização em background (quando voltar online)
self.addEventListener('sync', (event) => {
  console.log('[SW] Sincronização em background:', event.tag);

  if (event.tag === 'sync-tracking-data') {
    event.waitUntil(syncTrackingData());
  }
});

// Função para sincronizar dados de tracking
async function syncTrackingData() {
  console.log('[SW] Sincronizando dados de tracking...');
}

// Notificações push
self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido:', event);

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Tarifa Zero';
  const options = {
    body: data.body || 'Nova atualização disponível',
    icon: '/logoTarifaZero.png',
    badge: '/logoTarifaZero.png',
    vibrate: [200, 100, 200],
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event);

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
