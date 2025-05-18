document.addEventListener('DOMContentLoaded', function () {
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('.nav-link');

    // 为每个链接添加点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // 移除所有链接的active类
            navLinks.forEach(l => l.classList.remove('active'));

            // 为当前点击的链接添加active类
            this.classList.add('active');

            // 匹配相应的同名链接也添加active类
            const href = this.getAttribute('href');
            document.querySelectorAll(`.nav-link[href="${href}"]`).forEach(l => {
                l.classList.add('active');
            });

            // 显示对应的内容区域
            const targetId = href.substring(1);
            const tabPanes = document.querySelectorAll('.tab-pane');

            tabPanes.forEach(pane => {
                pane.classList.remove('show', 'active');
            });

            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('show', 'active');
            }
        });
    });

    // 用户头像下拉菜单（桌面端）
    const desktopUserDropdownToggle = document.getElementById('desktopUserDropdownToggle');
    const userDropdown = document.getElementById('userDropdown');

    desktopUserDropdownToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');

        // 关闭主题切换下拉菜单
        themeDropdown.classList.remove('show');
        mobileUserDropdown.classList.remove('show');
        mobileThemeDropdown.classList.remove('show');
    });

    // 用户头像下拉菜单（移动端）
    const mobileUserDropdownToggle = document.getElementById('mobileUserDropdownToggle');
    const mobileUserDropdown = document.getElementById('mobileUserDropdown');

    mobileUserDropdownToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        mobileUserDropdown.classList.toggle('show');

        // 关闭其他下拉菜单
        userDropdown.classList.remove('show');
        themeDropdown.classList.remove('show');
        mobileThemeDropdown.classList.remove('show');
    });

    // 主题切换下拉菜单（桌面端）
    const desktopThemeToggle = document.getElementById('desktopThemeToggle');
    const themeDropdown = document.getElementById('themeDropdown');

    desktopThemeToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        themeDropdown.classList.toggle('show');

        // 关闭用户下拉菜单
        userDropdown.classList.remove('show');
        mobileUserDropdown.classList.remove('show');
        mobileThemeDropdown.classList.remove('show');
    });

    // 主题切换下拉菜单（移动端）
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const mobileThemeDropdown = document.getElementById('mobileThemeDropdown');

    mobileThemeToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        mobileThemeDropdown.classList.toggle('show');

        // 关闭其他下拉菜单
        userDropdown.classList.remove('show');
        themeDropdown.classList.remove('show');
        mobileUserDropdown.classList.remove('show');
    });

    // 点击页面其他地方关闭所有下拉菜单
    document.addEventListener('click', function () {
        userDropdown.classList.remove('show');
        themeDropdown.classList.remove('show');
        mobileUserDropdown.classList.remove('show');
        mobileThemeDropdown.classList.remove('show');
    });

    // 阻止下拉菜单内部点击冒泡
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    dropdownMenus.forEach(menu => {
        menu.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });

    // 主题切换功能
    const themeOptions = document.querySelectorAll('.theme-option');
    const body = document.body;

    // 检查本地存储中的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // 如果没有保存的主题，检查系统偏好
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    }

    // 为主题选项添加点击事件
    themeOptions.forEach(option => {
        option.addEventListener('click', function (e) {
            e.preventDefault();
            const theme = this.getAttribute('data-theme');
            applyTheme(theme);

            // 保存主题设置到本地存储
            if (theme === 'auto') {
                localStorage.removeItem('theme');
            } else {
                localStorage.setItem('theme', theme);
            }

            // 关闭下拉菜单
            themeDropdown.classList.remove('show');
            mobileThemeDropdown.classList.remove('show');
        });
    });

    // 应用主题函数
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            updateThemeIcons('dark');
        } else if (theme === 'light') {
            body.classList.remove('dark-mode');
            updateThemeIcons('light');
        } else if (theme === 'auto') {
            // 跟随系统主题
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark-mode');
                updateThemeIcons('dark');
            } else {
                body.classList.remove('dark-mode');
                updateThemeIcons('light');
            }
        }
    }

    // 更新主题图标
    function updateThemeIcons(mode) {
        if (mode === 'dark') {
            desktopThemeToggle.innerHTML = '<i class="bi bi-moon"></i>';
            mobileThemeToggle.innerHTML = '<i class="bi bi-moon"></i>';
        } else {
            desktopThemeToggle.innerHTML = '<i class="bi bi-sun"></i>';
            mobileThemeToggle.innerHTML = '<i class="bi bi-sun"></i>';
        }
    }

    // 监听系统主题变化
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (localStorage.getItem('theme') === null) {
                applyTheme('auto');
            }
        });
    }

    // 响应窗口大小变化
    function handleResize() {
        const isMobile = window.innerWidth < 992;
        const body = document.body;

        if (isMobile) {
            body.style.paddingTop = '70px';
            body.style.paddingBottom = '64px'; // 增加底部内边距，确保内容不会被底部导航栏遮挡
        } else {
            body.style.paddingTop = '70px';
            body.style.paddingBottom = '20px';
        }
    }

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 初始化调用一次
    handleResize();

    // 滚动渐进式隐藏/显示顶部导航栏（仅移动端）
    const mobileTopBar = document.querySelector('.mobile-top-bar');
    let lastScrollTop = 0;
    const scrollDistance = 60; // 完全隐藏所需的滚动距离
    const topThreshold = 100; // 只有滚动到这个阈值内才开始显示导航栏

    window.addEventListener('scroll', function () {
        // 仅在移动端激活此功能
        if (window.innerWidth >= 992) return;

        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

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
        mobileTopBar.style.transform = `translateY(-${hideRatio * 100}%)`;

        lastScrollTop = currentScrollTop;
    });
});