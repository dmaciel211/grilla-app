// Grilla: guarda la app en el teléfono para que funcione sin internet
const V='grilla-073d3bcde3';
const FILES=["./", "index.html", "manifest.webmanifest", "fonts/IBMPlexMono-Medium.woff", "fonts/IBMPlexSans-Var.woff", "fonts/Kalam-Bold.woff", "fonts/Kalam-Regular.woff", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "pdfjs/pdf.min.js", "pdfjs/pdf.worker.min.js", "vendor/abcjs-basic-min.js", "vendor/lame.min.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;const u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin||/version\.json$/.test(u.pathname))return;
  if(r.mode==='navigate'){
    // la página: primero internet (así nunca arranca una versión vieja); sin conexión, o si tarda más de 3 s, la guardada
    e.respondWith(caches.open(V).then(c=>{
      const net=fetch(r,{cache:'no-store'}).then(res=>{if(res.ok)c.put('./',res.clone());return res});
      const late=new Promise(ok=>setTimeout(ok,3000)).then(()=>c.match('./'));
      return Promise.race([net.catch(()=>c.match('./')),late.then(hit=>hit||net)]).then(res=>res||net);
    }));
    return;
  }
  // el resto (fuentes, librerías, íconos): primero lo guardado, y se refresca por detrás
  e.respondWith(caches.open(V).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res});
    if(hit){net.catch(()=>{});return hit}
    return net.catch(()=>caches.match('./'));
  })));
});
