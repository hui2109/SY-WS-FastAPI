"use strict";

class InitMineCards {
    constructor(today) {
        this.today = today
    }

    init() {
        this.getStartEndDate();
        this.getRecordsFromServer();
    }

    getStartEndDate() {
        const firstDay = new Date(this.today.getFullYear(), this.today.getMonth(), 1, 10, 0, 0, 0);
        const firstDayOfWeek = firstDay.getDay();
        const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        this.startDate = new Date(firstDay);
        this.startDate.setDate(firstDay.getDate() - daysToSubtract);

        const lastDay = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0, 10, 0, 0, 0);
        const lastDayOfWeek = lastDay.getDay();
        const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
        this.endDate = new Date(lastDay);
        this.endDate.setDate(lastDay.getDate() + daysToAdd);

        // 测试代码
        this.startDate = new Date(2024, 8, 30, 10, 0, 0, 0);
        this.endDate = new Date(2024, 10, 3, 10, 0, 0, 0);

        this.dateList = goThroughDate(this.startDate, this.endDate);
    }

    getRecordsFromServer() {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            // 如果没有令牌，重定向到登录页面
            window.location.href = '/login';
            return null;
        }
        let data = {
            month_start: this.startDate,
            month_end: this.endDate
        }
        fetch('/select-my-month-schedule', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                console.error('请求失败:', response.status, response.statusText);
                window.location.href = '/login';
                throw new Error('请求失败');
            }
        ).then(data => {
            this.records = data;
            console.log(this.records);
            this.generateCards();
            this.swiperSwitch();
        })
    }

    generateCards() {
        let swiper_wrapper = document.querySelector('.swiper-wrapper');
        for (let i = 0; i < this.dateList.length; i = i + 7) {
            this.max_info_list_length = 0;
            this.currentWeekNormalRestDateList = [];

            let div_slide = document.createElement('div');
            div_slide.classList.add('swiper-slide');

            let div_card = document.createElement('div');
            div_card.classList.add('card');

            let div_date_row = document.createElement('div');
            div_date_row.classList.add('date-row');

            let div_info_row = document.createElement('div');
            div_info_row.classList.add('info-row');

            for (let j = 0; j < 7; j++) {
                let div_date_item = document.createElement('div');
                div_date_item.classList.add('date-item');
                div_date_item.textContent = this.dateList[i + j].getDate();
                let div_info_item = this.getInfoItem(this.dateList[i + j], 0);

                div_date_row.appendChild(div_date_item);
                div_info_row.appendChild(div_info_item);
            }

            div_card.appendChild(div_date_row);
            div_card.appendChild(div_info_row);

            // 如果一个人一天有多个排班, 执行下面逻辑
            if (this.max_info_list_length !== 1) {
                for (let k = 1; k < this.max_info_list_length; k++) {
                    let div_info_row = document.createElement('div');
                    div_info_row.classList.add('info-row');

                    for (let m = 0; m < 7; m++) {
                        let div_info_item = this.getInfoItem(this.dateList[i + m], k);
                        div_info_row.appendChild(div_info_item);
                    }
                    div_card.appendChild(div_info_row);
                }
            }

            div_slide.appendChild(div_card);
            swiper_wrapper.appendChild(div_slide);
        }
    }

    getInfoItem(date, k) {
        let div_info_item = document.createElement('div');
        div_info_item.classList.add('info-item');

        // 如果根本没有记录, 证明这个人完全没有排班
        if (Object.keys(this.records).length === 0) {
            return this.generateCommonInfoItem(div_info_item, 'null');
        }

        let name = Object.keys(this.records)[0].split('_')[0]
        let _key = `${name}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`

        let info_list = this.records[_key];
        if (!info_list) {
            return this.generateCommonInfoItem(div_info_item, 'null');
        }

        this.max_info_list_length = Math.max(this.max_info_list_length || 0, info_list.length);

        let info_dict = info_list[k];
        if (!info_dict) {
            if (this.currentWeekNormalRestDateList.includes(date)) {
                return this.generateCommonInfoItem(div_info_item, '休息');
            }
            return this.generateCommonInfoItem(div_info_item, 'null');
        }

        let coworkers = info_dict['coworkers']
        let ban = info_dict['ban']

        if (ban === '休息') {
            this.currentWeekNormalRestDateList.push(date);
            return this.generateCommonInfoItem(div_info_item, '休息');
        }

        for (let i = -1; i < coworkers.length; i++) {
            let div_info = document.createElement('div');
            if (i === -1) {
                div_info.textContent = ban
            } else {
                div_info.textContent = coworkers[i]
            }
            div_info_item.appendChild(div_info)
        }

        return div_info_item
    }

    generateCommonInfoItem(div_info_item, text) {
        let div_info = document.createElement('div');
        div_info.textContent = text;
        div_info_item.appendChild(div_info);
        return div_info_item
    }

    swiperSwitch() {
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
    }
}


let iMCs = new InitMineCards(new Date());
iMCs.init();