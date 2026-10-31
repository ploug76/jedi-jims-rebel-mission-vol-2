/* auto-update: HTML/JS/CSS/JSON always revalidated with the server (no stale copies); cache is the offline fallback */
const __NC=r=>{try{const u=new URL(r.url);return u.origin==location.origin&&(r.mode=='navigate'||/(\/|\.html?|\.m?js|\.css|\.json)$/.test(u.pathname))?{cache:'no-cache'}:{}}catch(e){return {}}};
const CACHE='jjrm2-v7';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./', 'index.html', 'style.css?v=2', 'game.js?v=5', 'manifest.json', 'icon-192.png', 'art/meta.json'])).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 e.respondWith(fetch(e.request,__NC(e.request)).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))});
