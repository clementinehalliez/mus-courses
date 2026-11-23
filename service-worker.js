const CACHE='menus-courses-pwa-v11-20261123';
const ASSETS=['./','./index.html','./pdf-export.v11.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('menus-courses-pwa-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 const url=new URL(e.request.url),isPage=e.request.mode==='navigate'||url.pathname.endsWith('/index.html');
 const isCode=url.pathname.endsWith('.js')||url.pathname.endsWith('/service-worker.js');
 if(isPage||isCode){e.respondWith(fetch(e.request,{cache:'no-store'}).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(isPage?'./index.html':e.request,copy))}return response}).catch(()=>caches.match(isPage?'./index.html':e.request)));return}
 e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));
});
