/* Service Worker - AWW Bihar ICDS v1 */
const CACHE = 'aww-bihar-v1';
const ASSETS = ['./','./index.html','./manifest.json','./css/style.css','./css/inventory.css','./css/responsive.css','./js/data.js','./js/i18n.js','./js/bihar-menu.js','./js/inventory.js','./js/auto-register.js','./js/mpr.js','./js/export.js','./js/app.js'];
self.addEventListener('install', function(e) { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); })); });
self.addEventListener('activate', function(e) { e.waitUntil(caches.keys().then(function(ks) { return Promise.all(ks.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })); }).then(function() { return self.clients.claim(); })); });
self.addEventListener('fetch', function(e) { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request).then(function(r) { if (r) return r; return fetch(e.request).catch(function() { return caches.match('./index.html'); }); })); });