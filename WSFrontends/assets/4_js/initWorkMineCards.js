class InitMineCards {
    constructor(today) {
        this.today = today
        this.lookElement();
        this._updateDateLabel(this.today);
        this.initDatePicker();
        this.initSwiper();
        this.bindClick();
        this._getBanTypeInfo().then(r => {
        });
    }

    init() {
        this.getStartEndDate();
        this.getRecordsFromServer();
    }

    _updateDateLabel(date) {
        // 写入日期: XX年XX月
        this.dateLabel.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    }

    _renderBantypeInfoCard(divBan) {
        let ban = divBan.dataset.ban;
        let bantype_info = JSON.parse(sessionStorage.getItem('bantype_info'));
        let start_time = bantype_info[ban]['start_time'];
        let end_time = bantype_info[ban]['end_time'];
        let description = bantype_info[ban]['description'];

        return `
            <div class="card border-primary">
                  <div class="card-header bg-primary text-white py-2" style="padding-left: 8px;">
                    班种名称：<span class="badge bg-light text-primary">${ban}</span>
                  </div>
                  <div class="card-body p-1">
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item p-1">开始时间：<span class="fw-semibold">${start_time}</span>
                      </li>
                      <li class="list-group-item p-1">结束时间：<span class="fw-semibold">${end_time}</span></li>
                      <li class="list-group-item p-1">班种描述：<span
                          class="fw-normal">${description}</span>
                      </li>
                    </ul>
                  </div>
            </div>
        `;
    }

    async _getBanTypeInfo() {
        // 获取token
        const token = getToken();
        if (!token) {
            return;
        }

        if (sessionStorage.getItem('bantype_info')) {
            return;
        }

        try {
            let response = await fetch('/get_bantype_info', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            })

            let data = await response.json();

            if (!response.ok) {
                showAlert({
                    type: 'danger',
                    title: '获取班种信息失败！',
                    message: data.detail,
                });
            } else {
                sessionStorage.setItem('bantype_info', JSON.stringify(data));
            }
        } catch (error) {
            debugger;
            console.error('error!!!', error);
        }
    }

    lookElement() {
        this.swiper_wrapper = document.querySelector('#work-content-mine .swiper-wrapper');
        this.componentWrapper = document.querySelector('#work-content-mine .component-wrapper');
        this.swipeHint = document.querySelector('#work-content-mine .swipe-hint');
        this.preMonth = document.querySelector('#work-content-mine .pre-month');
        this.nextMonth = document.querySelector('#work-content-mine .next-month');
        this.datetimepicker2 = document.getElementById('datetimepicker2');
        this.dateLabel = document.querySelector('#work-content-mine .mounianmouyue');

        this.bantypeInfoModal = document.getElementById('bantypeInfoModal');
        this.bantypeInfoName = document.getElementById('bantypeInfoName');
        this.bantypeInfoDate = document.getElementById('bantypeInfoDate');
        this.bantypeInfoCards = document.getElementById('bantypeInfoCards');

        this.weekMap = getWeekMap();
        this.banTypeColor = getBanTypeColor();
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
        // 先设置一个初始日期, 免的swiper乱动
        this.picker.dates.setValue(new tempusDominus.DateTime(this.today));

        // 先把已有的日期选择控件删了
        let tempusDominusWidget = document.querySelector('.tempus-dominus-widget');
        if (tempusDominusWidget) {
            tempusDominusWidget.remove();
        }

        // 监听日期改变事件
        this.datetimepicker2.addEventListener('change.td', (event) => {
            this.today = event.detail.date;
            this.today.setDate(1);
            this._updateDateLabel(this.today);

            this.init();
        });

        // 监听日期显示事件
        this.datetimepicker2.addEventListener('show.td', () => {
            adjustDatePickerPosition(this.dateLabel);
            let datePicker = document.querySelector('.tempus-dominus-widget.show');
            datePicker.classList.remove('light');
            datePicker.classList.remove('dark');
            datePicker.classList.add(localStorage.getItem('theme'));
        });
    }

    handleCellClick(et) {
        let srcCell = et.currentTarget;
        let name = srcCell.dataset.name;
        let date = srcCell.dataset.date;
        let dateObj = dayjs(date);

        this.bantypeInfoName.textContent = name;
        this.bantypeInfoDate.textContent = `${dateObj.format('YYYY年M月D日')}（${this.weekMap[dateObj.day()]}）`;
        this.bantypeInfoCards.innerHTML = '';

        let bantypeInfoCard = this._renderBantypeInfoCard(srcCell);
        this.bantypeInfoCards.innerHTML += bantypeInfoCard;

        const modalInstance = new bootstrap.Modal(this.bantypeInfoModal);
        modalInstance.show();
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
        this.startDate = dayjs(this.today).startOf('month').startOf('isoWeek');
        this.endDate = dayjs(this.today).endOf('month').endOf('isoWeek');

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
            month_start: dayjs(this.startDate).format('YYYY-MM-DD'),
            month_end: dayjs(this.endDate).format('YYYY-MM-DD')
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
                } else {
                    loginExpiredAlert();
                }
            })
        }).catch(error => {
            debugger;
            console.error(error);
        })
    }

    generateCards() {
        this.swiper_wrapper.innerHTML = '';
        for (let i = 0; i < this.dateList.length; i = i + 7) {
            this.max_info_list_length = 0;
            //this.currentWeekNormalRestDateList = [];

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

                // 非本月, 加上那个月的日期
                if (this.dateList[i + j].getMonth() !== this.today.getMonth()) {
                    div_date_item.textContent = `${this.dateList[i + j].getDate()}/${this.dateList[i + j].getMonth() + 1}`;
                } else {
                    div_date_item.textContent = this.dateList[i + j].getDate();
                }
                div_date_item.dataset.date = dayjs(this.dateList[i + j]).format('YYYY-MM-DD');

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
            this.gotoTodayCard();

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
            //if (this.currentWeekNormalRestDateList.includes(date)) {
            //    return this.generateCommonInfoItem(div_info_item, '休息', name, date);
            //}
            return this.generateCommonInfoItem(div_info_item, 'null');
        }

        let coworkers = info_dict['coworkers']
        let ban = info_dict['ban']

        if (ban === '休息') {
            //this.currentWeekNormalRestDateList.push(date);
            return this.generateCommonInfoItem(div_info_item, '休息', name, date);
        }

        for (let i = -1; i < coworkers.length; i++) {
            let div_info = document.createElement('div');
            if (i === -1) {
                div_info.textContent = ban
                div_info.classList.add('badge');
                div_info.classList.add('mb-2');

                // 添加点击事件
                div_info.style.cursor = 'pointer';
                div_info.dataset.date = dayjs(date).format('YYYY-MM-DD');
                div_info.dataset.ban = ban;
                div_info.dataset.name = name;
                div_info.addEventListener('click', (et) => {
                    this.handleCellClick(et);
                });

                let color = this.banTypeColor[ban];
                if (color) {
                    div_info.style.backgroundColor = color;
                } else {
                    div_info.style.backgroundColor = 'red';
                }

            } else {
                div_info.textContent = coworkers[i]
            }
            div_info_item.appendChild(div_info)
        }

        return div_info_item
    }

    generateCommonInfoItem(div_info_item, text, ...rest) {
        if (text === 'null') {
            let div_info = document.createElement('div');
            div_info.textContent = '';
            div_info_item.style.backgroundColor = 'transparent';
            div_info_item.appendChild(div_info);
        } else {
            let div_info = document.createElement('div');
            div_info.textContent = text;
            div_info.classList.add('badge');
            div_info.classList.add('mb-2');

            // 添加点击事件
            div_info.style.cursor = 'pointer';
            div_info.dataset.date = dayjs(rest[1]).format('YYYY-MM-DD');
            div_info.dataset.ban = text;
            div_info.dataset.name = rest[0];
            div_info.addEventListener('click', (et) => {
                this.handleCellClick(et);
            });

            let color = this.banTypeColor[text];
            if (color) {
                div_info.style.backgroundColor = color;
            } else {
                div_info.style.backgroundColor = 'red';
            }

            div_info_item.appendChild(div_info);
        }
        return div_info_item
    }

    gotoTodayCard() {
        let swiperSlides = document.querySelectorAll('.swiper-wrapper .swiper-slide');
        let today_str = dayjs(this.today).format('YYYY-MM-DD');

        for (let i = 0; i < swiperSlides.length; i++) {
            let dateItems = swiperSlides[i].querySelectorAll('.date-item[data-date]');
            for (let j = 0; j < dateItems.length; j++) {
                if (dateItems[j].getAttribute('data-date') === today_str) {
                    this.swiper.slideTo(i);
                    return;
                }
            }
        }
    }
}

let iMCs = new InitMineCards(new Date());
iMCs.init();
