const CACHE_NAME = 'watermark-tool-v37c-invisible';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

// インストール時にキャッシュ & 即座にアクティベート
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => {
            // 新しいSWを即座に有効化（待機しない）
            return self.skipWaiting();
        })
    );
});

// 新しいSWが有効になったら古いキャッシュを全削除 & 即座に制御開始
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] 古いキャッシュを削除:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            // 即座にページの制御を開始
            return self.clients.claim();
        })
    );
});

// フェッチ時: ネットワーク優先、失敗したらキャッシュ
// これにより最新版が常に優先される
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((response) => {
                // 成功したらキャッシュを更新
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // オフラインの場合はキャッシュから
                return caches.match(e.request);
            })
    );
});
