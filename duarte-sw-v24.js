const CACHE_NAME="duarte-clan-v24-shell";
const SHELL=[
  "./",
  "./duarte-clan-production-v24.html",
  "./duarte-manifest-v23.webmanifest",
  "./duarte-icon-192.png",
  "./duarte-icon-512.png",
  "./duarte-icon-maskable-512.png",
  "./duarte-apple-touch-icon.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache=>{
      for(const url of SHELL){
        try{ await cache.add(url); }catch(_e){}
      }
    })
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith("duarte-clan-")&&k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("message",event=>{
  if(event.data&&event.data.type==="SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET") return;
  const url=new URL(req.url);

  if(req.mode==="navigate"){
    event.respondWith(
      fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(req,copy)).catch(()=>{});
        return res;
      }).catch(async()=>{
        return (await caches.match(req)) ||
               (await caches.match("./duarte-clan-production-v24.html")) ||
               (await caches.match("./")) ||
               new Response("Duarte Clan is offline.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
      })
    );
    return;
  }

  if(url.origin===self.location.origin){
    event.respondWith(
      caches.match(req).then(cached=>{
        const network=fetch(req).then(res=>{
          if(res&&res.ok){
            const copy=res.clone();
            caches.open(CACHE_NAME).then(c=>c.put(req,copy)).catch(()=>{});
          }
          return res;
        }).catch(()=>cached || new Response("",{status:503}));
        return cached || network;
      })
    );
  }
});
