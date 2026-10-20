// Service worker do DEATH CLUB
// - Arquivos do app: rede primeiro, cache se estiver offline (edições aparecem logo)
// - CDNs (Tailwind, FontAwesome): cache com atualização em segundo plano
// - APIs de clima/alertas: nunca passam pelo cache (dados sempre frescos;
//   o script.js já tem seus próprios fallbacks quando estiver offline)
const VERSION = 'dc-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const SHELL = [
    './',
    'index.html',
    'styles.css',
    'script.js',
    'manifest.json',
    'deathclub.jpg',
    'favicon.ico',
    'icons/favicon-16.png',
    'icons/favicon-32.png',
    'icons/apple-touch-icon.png',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/maskable-192.png',
    'icons/maskable-512.png'
];

const CDN_HOSTS = ['cdn.tailwindcss.com', 'cdnjs.cloudflare.com'];
const API_HOSTS = [
    'api.open-meteo.com',
    'earthquake.usgs.gov',
    'eonet.gsfc.nasa.gov',
    'apiprevmet3.inmet.gov.br'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            .then((cache) => cache.addAll(SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

function isCacheable(res) {
    return res && (res.ok || res.type === 'opaque');
}

async function networkFirst(request, cacheName, fallbackUrl) {
    const cache = await caches.open(cacheName);
    try {
        const res = await fetch(request);
        if (isCacheable(res)) cache.put(request, res.clone());
        return res;
    } catch (err) {
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached) return cached;
        if (fallbackUrl) {
            const fallback = await cache.match(fallbackUrl);
            if (fallback) return fallback;
        }
        throw err;
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const network = fetch(request)
        .then((res) => {
            if (isCacheable(res)) cache.put(request, res.clone());
            return res;
        })
        .catch(() => null);
    return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // APIs: deixa o navegador resolver (sem cache)
    if (API_HOSTS.includes(url.hostname)) return;

    // Páginas: rede primeiro; offline cai no index em cache
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request, SHELL_CACHE, 'index.html'));
        return;
    }

    // Arquivos do próprio site
    if (url.origin === self.location.origin) {
        event.respondWith(networkFirst(request, SHELL_CACHE));
        return;
    }

    // Bibliotecas de CDN (e as fontes do FontAwesome que elas carregam)
    if (CDN_HOSTS.includes(url.hostname)) {
        event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    }
});
