// ── Service Worker — รายงานเข้าออก PWA ──
const CACHE = 'inout-v1';
const ASSETS = [
  '/Suwin/',
  '/Suwin/index.html',
  '/Suwin/icon-192.png',
  '/Suwin/icon-512.png',
  '/Suwin/manifest.json',
];

// Install — cache ไฟล์หลัก
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — ลบ cache เก่า
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — Network first, fallback to cache
self.addEventListener('fetch', e => {
  // ไม่ cache request ไป Google Apps Script (ต้องดึงสดเสมอ)
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // cache response ใหม่ถ้าเป็น GET และ OK
        if (e.request.method === 'GET' && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
