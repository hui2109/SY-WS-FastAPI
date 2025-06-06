// PWA功能检测和注册
class PWAManager {
    constructor() {
        this.init();
    }

    async init() {
        // 注册Service Worker
        await this.registerServiceWorker();

        // 检测安装提示
        this.handleInstallPrompt();

        // 处理网络状态
        this.handleNetworkStatus();

        // 初始化推送通知
        await this.initPushNotifications();
    }

    // 注册Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/WSFrontends/assets/4_js/sw.js');
                console.log('Service Worker注册成功:', registration.scope);

                // 监听更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.log('Service Worker注册失败:', error);
            }
        }
    }

    // 处理安装提示
    handleInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            // 阻止默认的安装提示
            e.preventDefault();
            deferredPrompt = e;

            // 显示自定义安装按钮
            this.showInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA已安装');
            this.hideInstallButton();
        });
    }

    // 显示安装按钮
    showInstallButton(deferredPrompt) {
        const installButton = document.createElement('button');
        installButton.textContent = '安装应用';
        installButton.id = 'install-button';
        installButton.className = 'install-btn';
        installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #007bff;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,123,255,0.3);
      z-index: 1000;
      font-size: 14px;
      transition: all 0.3s ease;
    `;

        installButton.addEventListener('click', async () => {
            deferredPrompt.prompt();
            const {outcome} = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('用户接受了安装');
            } else {
                console.log('用户拒绝了安装');
            }

            deferredPrompt = null;
            this.hideInstallButton();
        });

        document.body.appendChild(installButton);
    }

    // 隐藏安装按钮
    hideInstallButton() {
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.remove();
        }
    }

    // 处理网络状态
    handleNetworkStatus() {
        const updateNetworkStatus = () => {
            const status = navigator.onLine ? 'online' : 'offline';
            document.body.setAttribute('data-network', status);

            if (!navigator.onLine) {
                this.showOfflineNotification();
            } else {
                this.hideOfflineNotification();
            }
        };

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        updateNetworkStatus(); // 初始检查
    }

    // 显示离线提示
    showOfflineNotification() {
        if (document.getElementById('offline-notification')) return;

        const notification = document.createElement('div');
        notification.id = 'offline-notification';
        notification.textContent = '您目前处于离线状态';
        notification.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff6b6b;
      color: white;
      text-align: center;
      padding: 10px;
      z-index: 1001;
      font-size: 14px;
    `;

        document.body.appendChild(notification);
    }

    // 隐藏离线提示
    hideOfflineNotification() {
        const notification = document.getElementById('offline-notification');
        if (notification) {
            notification.remove();
        }
    }

    // 显示更新提示
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.textContent = '应用有新版本可用，请刷新页面';
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border-radius: 5px;
      z-index: 1002;
      cursor: pointer;
    `;

        notification.addEventListener('click', () => {
            window.location.reload();
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // 初始化推送通知
    async initPushNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                console.log('通知权限:', permission);
            }
        }
    }
}

// 表单增强功能
class FormManager {
    constructor() {
        this.initForms();
    }

    initForms() {
        // 添加离线表单处理
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!navigator.onLine) {
                    e.preventDefault();
                    this.handleOfflineSubmit(form);
                }
            });
        });
    }

    handleOfflineSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // 存储到本地存储
        const offlineData = JSON.parse(localStorage.getItem('offlineSubmissions') || '[]');
        offlineData.push({
            url: form.action,
            method: form.method,
            data: data,
            timestamp: Date.now()
        });
        localStorage.setItem('offlineSubmissions', JSON.stringify(offlineData));

        // 显示提示
        alert('您当前离线，数据已保存，将在联网后自动提交');

        // 注册后台同步
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                return registration.sync.register('background-sync');
            });
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PWAManager();
    new FormManager();
});

// 添加触摸手势支持
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

// 页面可见性API
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('应用进入后台');
    } else {
        console.log('应用回到前台');
    }
});