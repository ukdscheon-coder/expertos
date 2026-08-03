const CACHE="expertos-v4";
const ASSETS=["./","./index.html","./styles.css?v=4","./app.js?v=4","./manifest.webmanifest","./icon.svg"];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET") return;

  const url=new URL(request.url);
  const isAppShell=url.origin===self.location.origin && (
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/styles.css")
  );

  if(isAppShell){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(request,{cache:"no-store"});
        const cache=await caches.open(CACHE);
        cache.put(request,fresh.clone());
        return fresh;
      }catch(error){
        return (await caches.match(request)) || (await caches.match("./index.html"));
      }
    })());
    return;
  }

  event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});