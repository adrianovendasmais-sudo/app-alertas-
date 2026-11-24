const V = 'agenda-pwa-v3';
const SHELL = ['./', 'config.js', 'api-shim.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;                       // chamadas ao servidor (POST) nunca passam pelo cache
  if (/(^|\.)google\.com$|googleusercontent\.com$/.test(u.hostname) && u.hostname.indexOf('fonts') < 0) return;
  if (u.origin === location.origin) {                    // arquivos do app: rede primeiro, cache se estiver offline
    e.respondWith(fetch(r).then(res => { if (res.ok && !res.redirected) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./'))));
    return;
  }
  e.respondWith(caches.open(V).then(c => c.match(r).then(m => {   // bibliotecas e fontes: cache primeiro
    const f = fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => m);
    return m || f;
  })));
});
