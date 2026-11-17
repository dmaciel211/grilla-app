// Grilla: guarda la app en el teléfono para que funcione sin internet
const V='grilla-ee1658f0e2';
const FILES=["./", "index.html", "manifest.webmanifest", "fonts/IBMPlexMono-Medium.ttf", "fonts/IBMPlexSans-Var.ttf", "fonts/Kalam-Bold.ttf", "fonts/Kalam-Regular.ttf", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "pdfjs/pdf.min.js", "pdfjs/pdf.worker.min.js", "vendor/abcjs-basic-min.js", "vendor/lame.min.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  const nav=r.mode==='navigate';
  e.respondWith(caches.open(V).then(c=>c.match(nav?'./':r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res.ok&&!nav)c.put(r,res.clone());return res});
    if(hit){if(nav)net.catch(()=>{});return hit}
    return net.catch(()=>caches.match('./'));
  })));
});
