const CACHE="duarte-clan-v11-shell";
const SHELL=["./"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{})));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{
    if(res&&res.ok&&r.destination!=="document"){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{})}
    return res;
  }).catch(()=>caches.match(r).then(hit=>hit||caches.match("./"))));
});