// 初始化Swiper
let swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullets: true,
    },
    effect: "slide",
    // 不显示导航箭头
    navigation: false,
    grabCursor: true, // 显示抓取光标
    touchRatio: 1,    // 触摸比例
});

// 添加键盘导航
const componentWrapper = document.querySelector('.component-wrapper');
componentWrapper.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
        swiper.slidePrev();
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        swiper.slideNext();
        e.preventDefault();
    }
});

// 当组件获得焦点时显示提示
componentWrapper.addEventListener('focus', function () {
    const swipeHint = document.querySelector('.swipe-hint');
    swipeHint.classList.add('show');
    setTimeout(() => {
        swipeHint.classList.remove('show');
    }, 2000);
});

// 确保组件在页面加载时自动获得焦点
window.addEventListener('load', function () {
    setTimeout(() => {
        componentWrapper.focus();
    }, 500);
});

// 触摸设备滑动提示
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) {
    const swipeHint = document.querySelector('.swipe-hint');
    swipeHint.textContent = "左右滑动查看";
    swipeHint.classList.add('show');
    setTimeout(() => {
        swipeHint.classList.remove('show');
    }, 2000);
}

// 添加Swiper触摸事件监听
swiper.on('touchStart', function () {
    document.querySelector('.swipe-hint').classList.remove('show');
});