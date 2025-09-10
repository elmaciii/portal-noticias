/**
 * Service Worker Profesional para Portal de Noticias
 * Funcionalidades: Cache, offline, push notifications, actualizaciones automáticas
 */

const CACHE_NAME = 'noticias-profesional-v2.0.0';
const STATIC_CACHE = 'noticias-static-v2.0.0';
const DYNAMIC_CACHE = 'noticias-dynamic-v2.0.0';

// Archivos estáticos para cachear
const STATIC_FILES = [
    '/',
    '/index.html',
    '/admin.html',
    '/styles.css',
    '/admin-styles.css',
    '/app.js',
    '/admin.js',
    '/backend.js',
    '/data.json',
    '/logo.png',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// URLs de APIs externas para cachear
const API_CACHE_PATTERNS = [
    /^https:\/\/gnews\.io\/api\//,
    /^https:\/\/images\.unsplash\.com\//,
    /^https:\/\/stream-ssl\.radiosenlinea\.com\.ar\//
];

// ===== INSTALACIÓN DEL SERVICE WORKER =====
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Service Worker: Cacheando archivos estáticos...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Service Worker: Instalación completada');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Error en instalación:', error);
            })
    );
});

// ===== ACTIVACIÓN DEL SERVICE WORKER =====
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Eliminar caches antiguos
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activación completada');
                return self.clients.claim();
            })
    );
});

// ===== INTERCEPTACIÓN DE PETICIONES =====
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Estrategia para diferentes tipos de recursos
    if (request.method === 'GET') {
        // Archivos estáticos - Cache First
        if (STATIC_FILES.includes(url.pathname) || url.pathname === '/') {
            event.respondWith(cacheFirst(request));
        }
        // APIs externas - Network First con fallback
        else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
            event.respondWith(networkFirst(request));
        }
        // Otros recursos - Stale While Revalidate
        else {
            event.respondWith(staleWhileRevalidate(request));
        }
    }
});

// ===== ESTRATEGIAS DE CACHE =====

/**
 * Cache First - Para archivos estáticos
 */
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache First error:', error);
        return new Response('Recurso no disponible offline', { status: 503 });
    }
}

/**
 * Network First - Para APIs y datos dinámicos
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network First: Usando cache offline');
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Respuesta offline personalizada
        return new Response(JSON.stringify({
            error: 'Sin conexión',
            message: 'Los datos no están disponibles offline',
            offline: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Stale While Revalidate - Para recursos mixtos
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
}

// ===== NOTIFICACIONES PUSH =====
self.addEventListener('push', (event) => {
    console.log('📱 Service Worker: Push notification recibida');
    
    const options = {
        body: 'Nueva noticia disponible',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver noticia',
                icon: '/icons/action-explore.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/icons/action-close.png'
            }
        ]
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            options.body = data.body || options.body;
            options.title = data.title || 'Noticias en Vivo';
            options.data = { ...options.data, ...data };
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification('Noticias en Vivo', options)
    );
});

// ===== CLICKS EN NOTIFICACIONES =====
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Service Worker: Click en notificación');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Solo cerrar la notificación
        return;
    } else {
        // Click en el cuerpo de la notificación
        event.waitUntil(
            clients.matchAll().then((clientList) => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return clients.openWindow('/');
            })
        );
    }
});

// ===== SINCRONIZACIÓN EN SEGUNDO PLANO =====
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Sincronización en segundo plano');
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Sincronizar datos cuando se restablezca la conexión
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        
        for (const request of requests) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    await cache.put(request, response);
                }
            } catch (error) {
                console.log('Error sincronizando:', request.url);
            }
        }
        
        console.log('✅ Sincronización completada');
    } catch (error) {
        console.error('❌ Error en sincronización:', error);
    }
}

// ===== MENSAJES DEL CLIENTE =====
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

// ===== UTILIDADES =====

/**
 * Limpia caches antiguos
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const validCaches = [STATIC_CACHE, DYNAMIC_CACHE];
    
    const deletePromises = cacheNames
        .filter(cacheName => !validCaches.includes(cacheName))
        .map(cacheName => caches.delete(cacheName));
    
    await Promise.all(deletePromises);
    console.log('🧹 Service Worker: Caches antiguos eliminados');
}

/**
 * Obtiene estadísticas del cache
 */
async function getCacheStats() {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = keys.length;
    }
    
    return stats;
}

console.log('🎯 Service Worker: Cargado y listo');
