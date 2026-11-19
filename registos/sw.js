// Registos de Trabalho — service worker: a app abre mesmo sem internet (os dados ficam no cofre encriptado local).
const CACHE = "registos-v1";
const BASE = ["./", "index.html", "manifest.json", "icon-192.png"];
const LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (r.url === LIB) { // biblioteca do Supabase: guardada para funcionar sem rede
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { const c = res.clone(); caches.open(CACHE).then((k) => k.put(r, c)); return res; })));
    return;
  }
  if (u.origin !== location.origin) return; // pedidos ao Supabase: sempre diretos
  e.respondWith(fetch(r).then((res) => { const c = res.clone(); caches.open(CACHE).then((k) => k.put(r, c)); return res; })
    .catch(() => caches.match(r).then((m) => m || caches.match("index.html"))));
});
