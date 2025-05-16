"use strict";

class InitMineCards {
    constructor(today) {
        this.today = today
        this.lookElement();
        this._updateDateLabel(this.today);
        this.initDatePicker();
        this.initSwiper();
        this.bindClick();
    }

    init() {
        this.getStartEndDate();
        this.getRecordsFromServer();
    }

    _updateDateLabel(date) {
        // 写入日期: XX年XX月
        this.dateLabel.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    }

    lookElement() {
        this.swiper_wrapper = document.querySelector('#work-content-mine .swiper-wrapper');
        this.componentWrapper = document.querySelector('#work-content-mine .component-wrapper');
        this.swipeHint = document.querySelector('#work-content-mine .swipe-hint');
        this.preMonth = document.querySelector('#work-content-mine .pre-month');
        this.nextMonth = document.querySelector('#work-content-mine .next-month');
        this.datetimepicker2 = document.getElementById('datetimepicker2');
        this.dateLabel = document.querySelector('#work-content-mine .mounianmouyue');
    }

    initSwiper() {
        // 初始化Swiper
        this.swiper = new Swiper(".mySwiper", {
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
    }

    initDatePicker() {
        this.picker = new tempusDominus.TempusDominus(this.datetimepicker2, {
            display: {
                icons: {
                    // 自定义各个按钮的图标
                    today: 'bi bi-calendar-check', // Bootstrap Icons
                    clear: 'bi bi-x-circle',
                    close: 'bi bi-x-circle-fill',
                    time: 'bi bi-clock',
                    date: 'bi bi-calendar',
                    up: 'bi bi-arrow-up',
                    down: 'bi bi-arrow-down',
                    previous: 'bi bi-chevron-left',
                    next: 'bi bi-chevron-right',
                    type: 'icons' // 使用图标而不是SVG
                },
                viewMode: 'months',
                theme: 'auto',
                components: {
                    calendar: true,
                    decades: true,
                    year: true,
                    month: true,
                    date: false,
                    hours: false,
                    minutes: false,
                    seconds: false
                },
                buttons: {
                    today: true,
                    close: true
                },
            },
            localization: {
                locale: 'zh-CN'
            },
        });

        // 监听日期改变事件
        this.datetimepicker2.addEventListener('change.td', (event) => {
            this.today = event.detail.date;
            this._updateDateLabel(this.today);

            this.init();
        });

        // 监听日期显示事件
        this.datetimepicker2.addEventListener('show.td', () => {
            adjustDatePickerPosition(this.dateLabel);
        });
    }

    bindClick() {
        // 添加键盘导航
        this.componentWrapper.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.swiper.slidePrev();
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                this.swiper.slideNext();
                e.preventDefault();
            }
        });

        // 当组件获得焦点时显示提示
        this.componentWrapper.addEventListener('focus', () => {
            this.swipeHint.classList.add('show');
            setTimeout(() => {
                this.swipeHint.classList.remove('show');
            }, 2000);
        });

        // 确保组件在页面加载时自动获得焦点
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.componentWrapper.focus();
            }, 500);
        });

        // 触摸设备滑动提示
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
            this.swipeHint.textContent = "左右滑动查看";
            this.swipeHint.classList.add('show');
            setTimeout(() => {
                this.swipeHint.classList.remove('show');
            }, 2000);
        }

        // 添加Swiper触摸事件监听
        this.swiper.on('touchStart', () => {
            this.swipeHint.classList.remove('show');
        });

        this.preMonth.addEventListener('click', () => {
            // 获取当前月的上一个月的第一天
            this.today = new Date(this.today.getFullYear(), this.today.getMonth() - 1, 1);
            this.picker.dates.setValue(new tempusDominus.DateTime(this.today));
        });

        this.nextMonth.addEventListener('click', () => {
            // 获取当前月的下一个月的第一天
            this.today = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 1);
            this.picker.dates.setValue(new tempusDominus.DateTime(this.today));
        });
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
        //this.startDate = new Date(2024, 8, 30, 10, 0, 0, 0);
        //this.endDate = new Date(2024, 10, 3, 10, 0, 0, 0);

        this.dateList = goThroughDate(this.startDate, this.endDate);
    }

    getRecordsFromServer() {
        // 获取token
        const token = getToken();
        if (!token) {
            loginExpiredAlert()
            return;
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
        }).then(response => {
            response.json().then(data => {
                if (response.ok) {
                    this.records = data;
                    this.generateCards();
                    //this.initSwiper();
                } else {
                    loginExpiredAlert();
                    window.location.href = '/login';
                }
            })
        }).catch(error => {
            alert('未知错误！');
            console.error(error);
        })
    }

    generateCards() {
        this.swiper_wrapper.innerHTML = '';
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
            this.swiper_wrapper.appendChild(div_slide);
        }

        // 在添加完所有 slide 后更新 Swiper
        setTimeout(() => {
            this.swiper.update();

            // 如果需要更彻底的更新，可以加上这些
            //this.swiper.updateSize();
            //this.swiper.updateSlides();
            //this.swiper.updateProgress();
            //this.swiper.updateSlidesClasses();
        }, 200);
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
}

let iMCs = new InitMineCards(new Date());
iMCs.init();
