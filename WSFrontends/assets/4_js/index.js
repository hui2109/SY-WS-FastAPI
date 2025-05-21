class initIndex {
    constructor() {
        //this.init();
    }

    init() {
        this.lookElement();
        this.bindEvent();
        this.changeTheme();
    }

    _updateThemeIcons(mode) {
        if (mode === 'dark') {
            this.desktopThemeDropdownToggle.innerHTML = '<i class="bi bi-moon"></i>';
            this.mobileThemeDropdownToggle.innerHTML = '<i class="bi bi-moon"></i>';
        } else {
            this.desktopThemeDropdownToggle.innerHTML = '<i class="bi bi-sun"></i>';
            this.mobileThemeDropdownToggle.innerHTML = '<i class="bi bi-sun"></i>';
        }
    }

    _applyTheme(theme) {
        const body = document.body;
        const htmlEl = document.documentElement;

        if (theme === 'dark') {
            body.classList.add('dark-mode');
            htmlEl.dataset.bsTheme = 'dark';
            this._updateThemeIcons('dark');
        } else if (theme === 'light') {
            body.classList.remove('dark-mode');
            htmlEl.dataset.bsTheme = 'light';
            this._updateThemeIcons('light');
        } else if (theme === 'auto') {
            // 跟随系统主题
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark-mode');
                htmlEl.dataset.bsTheme = 'dark';
                this._updateThemeIcons('dark');
            } else {
                body.classList.remove('dark-mode');
                htmlEl.dataset.bsTheme = 'light';
                this._updateThemeIcons('light');
            }
        }
    }

    lookElement() {
        this.navLinks = document.querySelectorAll('.top-nav .nav-link, .bottom-nav .nav-link');
        this.tabPanes = document.querySelectorAll('#navContent .tab-pane');
        this.themeOptions = document.querySelectorAll('.theme-toggle-wrapper .theme-option');
        this.mobileTopBar = document.querySelector('.mobile-top-bar');

        this.desktopUserDropdownToggle = document.getElementById('desktopUserDropdownToggle');
        this.desktopUserDropdown = document.getElementById('desktopUserDropdown');

        this.mobileUserDropdownToggle = document.getElementById('mobileUserDropdownToggle');
        this.mobileUserDropdown = document.getElementById('mobileUserDropdown');

        this.desktopThemeDropdownToggle = document.getElementById('desktopThemeDropdownToggle');
        this.desktopThemeDropdown = document.getElementById('desktopThemeDropdown');

        this.mobileThemeDropdownToggle = document.getElementById('mobileThemeDropdownToggle');
        this.mobileThemeDropdown = document.getElementById('mobileThemeDropdown');
    }

    bindEvent() {
        // 点击导航栏，改变颜色及显示内容
        this.navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                let elementThis = event.currentTarget;
                event.preventDefault();

                // 移除所有链接的active类
                this.navLinks.forEach(navLink => navLink.classList.remove('active'));

                // 为当前点击的链接添加active类
                elementThis.classList.add('active');

                // 匹配相应的同名链接也添加active类
                const href = elementThis.getAttribute('href');
                document.querySelectorAll(`.nav-link[href="${href}"]`).forEach(link => {
                    link.classList.add('active');
                });

                // 显示对应的内容区域
                const targetId = href.substring(1);

                this.tabPanes.forEach(pane => {
                    pane.classList.remove('show', 'active');
                });

                const targetPane = document.getElementById(targetId);
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                }
            });
        });

        // 用户头像下拉菜单（桌面端）
        this.desktopUserDropdownToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            this.desktopUserDropdown.classList.toggle('show');

            // 关闭其他切换菜单
            this.mobileUserDropdown.classList.remove('show');
            this.desktopThemeDropdown.classList.remove('show');
            this.mobileThemeDropdown.classList.remove('show');
        });

        // 用户头像下拉菜单（移动端）
        this.mobileUserDropdownToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            this.mobileUserDropdown.classList.toggle('show');

            // 关闭其他切换菜单
            this.desktopUserDropdown.classList.remove('show');
            this.desktopThemeDropdown.classList.remove('show');
            this.mobileThemeDropdown.classList.remove('show');
        });

        // 主题切换下拉菜单（桌面端）
        this.desktopThemeDropdownToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            this.desktopThemeDropdown.classList.toggle('show');

            // 关闭其他切换菜单
            this.mobileUserDropdown.classList.remove('show');
            this.desktopUserDropdown.classList.remove('show');
            this.mobileThemeDropdown.classList.remove('show');
        });

        // 主题切换下拉菜单（移动端）
        this.mobileThemeDropdownToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            this.mobileThemeDropdown.classList.toggle('show');

            // 关闭其他切换菜单
            this.desktopUserDropdown.classList.remove('show');
            this.desktopThemeDropdown.classList.remove('show');
            this.mobileUserDropdown.classList.remove('show');
        });

        // 点击页面其他地方关闭所有下拉菜单
        document.addEventListener('click', () => {
            this.desktopUserDropdown.classList.remove('show');
            this.desktopThemeDropdown.classList.remove('show');
            this.mobileUserDropdown.classList.remove('show');
            this.mobileThemeDropdown.classList.remove('show');
        });

        // 主题切换
        this.themeOptions.forEach(option => {
            option.addEventListener('click', (event) => {
                event.preventDefault();
                let elementThis = event.currentTarget;

                const theme = elementThis.getAttribute('data-theme');
                this._applyTheme(theme);

                // 保存主题设置到本地存储
                if (theme === 'auto') {
                    localStorage.removeItem('theme');
                } else {
                    localStorage.setItem('theme', theme);
                }

                // 关闭下拉菜单
                this.desktopThemeDropdown.classList.remove('show');
                this.mobileThemeDropdown.classList.remove('show');
            });
        });

        // 监听系统主题变化
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (localStorage.getItem('theme') === null) {
                    this._applyTheme('auto');
                }
            });
        }

        // 滚动渐进式隐藏/显示顶部导航栏（仅移动端）
        let lastScrollTop = 0;
        const scrollDistance = 60; // 完全隐藏所需的滚动距离
        const topThreshold = 100; // 只有滚动到这个阈值内才开始显示导航栏

        window.addEventListener('scroll', () => {
            // 仅在移动端激活此功能
            if (window.innerWidth >= 992) return;

            const currentScrollTop = document.documentElement.scrollTop;

            // 计算应该隐藏的比例 (0 到 1)
            let hideRatio = 0;

            if (currentScrollTop > lastScrollTop) {
                // 向下滚动时
                if (currentScrollTop < scrollDistance) {
                    // 在滚动距离内，按比例隐藏
                    hideRatio = currentScrollTop / scrollDistance;
                } else {
                    // 超过滚动距离，完全隐藏
                    hideRatio = 1;
                }
            } else {
                // 向上滚动时，只有接近顶部才显示
                if (currentScrollTop <= topThreshold) {
                    // 在顶部阈值内，按比例显示
                    hideRatio = currentScrollTop / topThreshold;
                } else {
                    // 未接近顶部，保持隐藏
                    hideRatio = 1;
                }
            }

            // 应用变换
            this.mobileTopBar.style.transform = `translateY(-${hideRatio * 100}%)`;

            lastScrollTop = currentScrollTop;
        });
    }

    changeTheme() {
        // 检查本地存储中的主题设置
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this._applyTheme(savedTheme);
        } else {
            // 如果没有保存的主题，检查系统偏好
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this._applyTheme('dark');
            } else {
                this._applyTheme('light');
            }
        }
    }
}


let iI = new initIndex();
iI.init();
// 页面加载外部添加一个滚动控制
window.addEventListener('load', function () {
    setTimeout(function () {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
        });
    }, 10);
});