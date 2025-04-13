const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-link:not(.mine):not(.all)');
const navLink_mine = document.querySelector('.mine');
const navLink_all = document.querySelector('.all');
const indexLinks = [navLink_mine, navLink_all] as unknown as NodeListOf<HTMLAnchorElement>;

// 改变导航栏链接的状态
function changeLinkState(link: HTMLAnchorElement, _: any, parentNode: NodeListOf<HTMLAnchorElement>) {
    link.addEventListener('click', function (this, e) {
        e.preventDefault(); // 阻止默认的链接行为

        // 移除所有导航链接的active类
        parentNode.forEach(function (link) {
            link.classList.remove('active');
        });

        // 为当前点击的链接添加active类
        this.classList.add('active');
    })
}

function connectIndexAndNav(link: HTMLAnchorElement) {
    link.addEventListener('click', function (this, e) {
        // 调用当前active链接对应的点击事件
        const matchingLink = document.querySelector('.nav-link.active[data-bs-target]') as HTMLAnchorElement | null;
        if (matchingLink) {
            // 模拟点击该链接
            matchingLink.click();
        }
    })
}

// 改变内容区域的可见度
function changeContentState(link: HTMLAnchorElement) {
    link.addEventListener('click', function (this, e) {
        // 获取目标内容区域的ID
        const targetHalfId = this.getAttribute('data-bs-target');
        const mineBool = navLink_mine?.classList.contains('active');
        const suffix = mineBool ? '-mine' : '-all';
        const targetId = targetHalfId + suffix;

        // 隐藏所有内容区域
        const contentSections = document.querySelectorAll('.content-section');
        contentSections.forEach(function (section) {
            section.classList.add('d-none');
        });

        // // 显示目标内容区域
        document.getElementById(targetId)?.classList.remove('d-none');

        // // 更新URL的hash部分以反映当前页面
        window.location.hash = this.getAttribute('href') + suffix;
    })
}

function indexLinkBind(link: HTMLAnchorElement, _: any, parentNode: NodeListOf<HTMLAnchorElement>) {
    changeLinkState(link, _, parentNode)
    connectIndexAndNav(link)
}

function navLinkBind(link: HTMLAnchorElement, _: any, parentNode: NodeListOf<HTMLAnchorElement>) {
    changeLinkState(link, _, parentNode)
    changeContentState(link)
}

document.addEventListener('DOMContentLoaded', function () {
    // 为索引导航链接绑定点击事件
    indexLinks.forEach(indexLinkBind)

    // 为导航链接添加点击事件监听器
    navLinks.forEach(navLinkBind)

    // 页面加载时检查URL的hash部分以显示相应的内容
    function checkHash() {
        const hash = window.location.hash;
        if (hash) {
            const [navHref, classname] = hash.split('-');

            // nav全部都不激活
            navLinks.forEach(function (link) {
                link.classList.remove('active');
            });

            // 对应的nav激活
            document.querySelector(`a[href="${navHref}"]`)?.classList.add('active');

            // 模拟index点击
            const indexLink = document.querySelector(`.${classname}`) as HTMLElement | null;
            indexLink?.click();
        };
    }

    // 页面初始化
    (() => {
        window.location.hash = '#work-all'
        checkHash();
    })();

    // 监听hash变化
    // window.addEventListener('hashchange', checkHash);
});