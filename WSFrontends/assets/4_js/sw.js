const CACHE_NAME = 'SY-FastAPI-v6';
const urlsToCache = [
    '/login',
    '/register',
    '/WSFrontends/assets/icons/icon-72x72-v2.png',
    '/WSFrontends/assets/icons/icon-96x96-v2.png',
    '/WSFrontends/assets/icons/icon-128x128-v2.png',
    '/WSFrontends/assets/icons/icon-144x144-v2.png',
    '/WSFrontends/assets/icons/icon-152x152-v2.png',
    '/WSFrontends/assets/icons/icon-192x192-v2.png',
    '/WSFrontends/assets/icons/icon-384x384-v2.png',
    '/WSFrontends/assets/icons/icon-512x512-v2.png',
    '/WSFrontends/assets/manifest.json',
    '/WSFrontends/assets/plugin/node_modules/bootstrap/dist/css/bootstrap.min.css',
    '/WSFrontends/assets/plugin/node_modules/@eonasdan/tempus-dominus/dist/css/tempus-dominus.min.css',
    '/WSFrontends/assets/plugin/node_modules/bootstrap-icons/font/bootstrap-icons.min.css',
    '/WSFrontends/assets/plugin/node_modules/swiper/swiper-bundle.min.css',
    '/WSFrontends/assets/plugin/node_modules/@popperjs/core/dist/umd/popper.min.js',
    '/WSFrontends/assets/plugin/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    '/WSFrontends/assets/plugin/node_modules/@eonasdan/tempus-dominus/dist/js/tempus-dominus.min.js',
    '/WSFrontends/assets/plugin/node_modules/swiper/swiper-bundle.min.js',
    '/WSFrontends/assets/plugin/node_modules/dayjs/dayjs.min.js',
    '/WSFrontends/assets/plugin/node_modules/dayjs/plugin/isoWeek.js',
    '/WSFrontends/assets/plugin/node_modules/dayjs/plugin/localeData.js',
    '/WSFrontends/assets/plugin/node_modules/dayjs/locale/zh-cn.js',
    '/WSFrontends/assets/plugin/node_modules/html2canvas/html2canvas.min.js'
];

// 安装事件 - 缓存资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('缓存已打开');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('缓存失败:', error);
            })
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 拦截网络请求 - 缓存优先策略
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 检查是否是avatars目录下的文件
    if (url.pathname.startsWith('/WSFrontends/assets/img/avatars/')) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse; // 从缓存返回
                    }

                    // 从网络获取并缓存
                    return fetch(event.request)
                        .then((response) => {
                            if (response && response.status === 200) {
                                const responseToCache = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(event.request, responseToCache);
                                        console.log('Avatar已缓存:', event.request.url);
                                    });
                            }
                            return response;
                        });
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果缓存中有响应，返回缓存版本
                if (response) {
                    return response;
                }

                // 否则从网络获取
                return fetch(event.request)
                    .then((response) => {
                        // 检查是否为有效响应
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 克隆响应
                        const responseToCache = response.clone();

                        // 添加到缓存
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
            .catch(() => {
                // 网络失败时的离线页面
                if (event.request.destination === 'document') {
                    return caches.match('/');
                }
            })
    );
});

// 后台同步
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    return new Promise((resolve) => {
        // 处理离线时的数据同步
        console.log('后台同步执行');
        resolve();
    });
}

// 推送通知
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : '您有新消息',
        icon: '/WSFrontends/assets/icons/icon-192x192-v2.png',
        badge: '/WSFrontends/assets/icons/icon-72x72-v2.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '查看详情',
                icon: '/WSFrontends/assets/icons/icon-192x192-v2.png'
            },
            {
                action: 'close',
                title: '关闭',
                icon: '/WSFrontends/assets/icons/icon-192x192-v2.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('应用通知', options)
    );
});