class InitTables {
    constructor(today) {
        this.today = today;
        this.lookElement();
        this._updateDateLabel(this.today);
        this.initDatePicker();
        this.bindClick();
        this._getBanTypeInfo().then(r => {
        });
    }

    init() {
        this.work_schedule_status = false;
        this.getStartEndDate();
        this.getRecordsFromServer();
    }

    _updateDateLabel(date) {
        // 写入日期: XX年XX月
        this.dateLabel.textContent = `${date.year()}年${date.month() + 1}月`;
    }

    _renderBantypeInfoCard(divBan) {
        let ban = divBan.dataset.ban;
        let bantype_info = JSON.parse(sessionStorage.getItem('bantype_info'));
        let start_time = bantype_info[ban]['start_time'];
        let end_time = bantype_info[ban]['end_time'];
        let description = bantype_info[ban]['description'];

        return `
            <div class="card border-primary mb-2">
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
        this.paibanTable = document.querySelector('#work-content-all .paiban-table');
        this.dateLabel = document.querySelector('#work-content-all .mounianmouyue');
        this.preMonth = document.querySelector('#work-content-all .pre-month');
        this.nextMonth = document.querySelector('#work-content-all .next-month');
        this.datetimepicker1 = document.getElementById('datetimepicker1');

        this.bantypeInfoModal = document.getElementById('bantypeInfoModal');
        this.bantypeInfoName = document.getElementById('bantypeInfoName');
        this.bantypeInfoDate = document.getElementById('bantypeInfoDate');
        this.bantypeInfoCards = document.getElementById('bantypeInfoCards');

        this.weekMap = getWeekMap();
        this.banTypeColor = getBanTypeColor();
    }

    handleCellClick(et) {
        let srcCell = et.currentTarget;
        let name = srcCell.dataset.name;
        let date = srcCell.dataset.date;
        let dateObj = dayjs(date);

        this.bantypeInfoName.textContent = name;
        this.bantypeInfoDate.textContent = `${dateObj.format('YYYY年M月D日')}（${this.weekMap[dateObj.day()]}）`;

        let div_bans = srcCell.querySelectorAll('div[data-ban]');

        if (div_bans.length === 0) {
            this.bantypeInfoCards.innerHTML = '<span class="badge border border-secondary text-secondary" style="font-size: 1.0rem">暂无班种信息</span>';
        } else {
            this.bantypeInfoCards.innerHTML = '';
            for (let divBan of div_bans) {
                let bantypeInfoCard = this._renderBantypeInfoCard(divBan);
                this.bantypeInfoCards.innerHTML += bantypeInfoCard;
            }
        }


        const modalInstance = new bootstrap.Modal(this.bantypeInfoModal);
        modalInstance.show();
    }

    bindClick() {
        this.preMonth.addEventListener('click', () => {
            // 获取当前月的上一个月的第一天
            this.today = this.today.subtract(1, 'month').startOf("month");
            this.picker.dates.setValue(new tempusDominus.DateTime(this.today));
        });

        this.nextMonth.addEventListener('click', () => {
            // 获取当前月的下一个月的第一天
            this.today = this.today.add(1, 'month').startOf("month");
            this.picker.dates.setValue(new tempusDominus.DateTime(this.today));
        });
    }

    initDatePicker() {
        this.picker = new tempusDominus.TempusDominus(this.datetimepicker1, {
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
        let tempusDominusWidget = document.querySelector('.tempus-dominus-widget');
        this.picker.dates.setValue(new tempusDominus.DateTime(this.today));

        // 先把已有的日期选择控件删了
        if (tempusDominusWidget) {
            tempusDominusWidget.remove();
        }

        // 监听日期改变事件
        this.datetimepicker1.addEventListener('change.td', (event) => {
            this.today = dayjs(event.detail.date);
            this._updateDateLabel(this.today);
            this.init();
        });

        // 监听日期显示事件
        this.datetimepicker1.addEventListener('show.td', () => {
            adjustDatePickerPosition(this.dateLabel);
            let datePicker = document.querySelector('.tempus-dominus-widget.show');
            datePicker.classList.remove('light');
            datePicker.classList.remove('dark');
            datePicker.classList.add(localStorage.getItem('theme'));
        });
    }

    getStartEndDate() {
        this.startDate = this.today.startOf('month');
        this.endDate = this.today.endOf('month');

        this.dateList = goThroughDate(this.startDate, this.endDate);
        this.dayMaps = {
            1: '周一',
            2: '周二',
            3: '周三',
            4: '周四',
            5: '周五',
            6: '周六',
            0: '周日',
        }
    }

    getRecordsFromServer() {
        // 获取token
        const token = getToken();
        if (!token) {
            return;
        }

        let data = {
            month_start: this.startDate.format('YYYY-MM-DD'),
            month_end: this.endDate.format('YYYY-MM-DD')
        }
        fetch('/select-month-schedule', {
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
                    //debugger;
                    this.records = data;
                    this.generateThead();
                    this.generateTbody();
                } else {
                    loginExpiredAlert();
                }
            })
        }).catch(error => {
            debugger;
            console.error(error);
        })
    }

    generateThead() {
        let thead = this.paibanTable.querySelector('thead');
        thead.innerHTML = '';
        let tr = document.createElement('tr');
        let personnel_list = this.records['personnels'];
        let personnel_list_length = personnel_list.length;

        for (let i = -1; i < this.dateList.length; i++) {
            let th = document.createElement('th');

            if (i === -1) {
                if (personnel_list_length === 0) {
                    th.textContent = '无数据';
                    th.style.backgroundColor = 'var(--bs-danger)';
                } else {
                    if (this.records['status'].includes('草稿')) {
                        th.textContent = '草稿';
                        th.style.backgroundColor = 'var(--bs-danger)';
                    } else {
                        if (this.records['status'].includes('待审核')) {
                            th.textContent = '待审核';
                            th.style.backgroundColor = 'var(--bs-warning)';
                        } else {
                            th.textContent = '已发布';
                            th.style.backgroundColor = 'var(--bs-success)';
                            this.work_schedule_status = true;
                        }
                    }
                }

                tr.appendChild(th);
                continue;
            }

            let div1 = document.createElement('div'); // 写星期
            let div2 = document.createElement('div'); // 写日子

            div1.textContent = this.dayMaps[this.dateList[i].day()];
            div2.textContent = String(this.dateList[i].date());
            th.appendChild(div1);
            th.appendChild(div2);

            // 新增特殊的休息日和节假日
            let date = this.dateList[i].format('YYYY-MM-DD');
            if (this.records['isHolidays'][date]) {
                let div4 = document.createElement('div');  // 写特殊日
                div4.textContent = this.records['isHolidays'][date];
                div4.classList.add('special-days');
                th.appendChild(div4);
            }

            tr.appendChild(th);
        }
        thead.appendChild(tr);
    }

    generateTbody() {
        let tbody = this.paibanTable.querySelector('tbody');
        tbody.innerHTML = '';

        // 发布了的排班才渲染
        if (!this.work_schedule_status) {
            return;
        }

        let daysNum = this.dateList.length;
        let personnel_list = this.records['personnels']

        for (let i = 0; i < personnel_list.length; i++) {
            let tr = document.createElement('tr');
            let td = document.createElement('td');
            let name = personnel_list[i];

            td.textContent = name;
            tr.appendChild(td);

            for (let j = 0; j < daysNum; j++) {
                td = document.createElement('td');
                let currDate = this.dateList[j]
                let _key = `${name}_${currDate.year()}_${currDate.month() + 1}_${currDate.date()}`
                let _value_list = this.records[_key]

                td.classList.add('clickable-paiban-cell');
                td.dataset.name = name;
                td.dataset.date = currDate.format('YYYY-MM-DD');
                td.addEventListener('click', (et) => {
                    this.handleCellClick(et);
                });

                if (_value_list === undefined) {
                    let div = document.createElement('div')
                    div.textContent = 'null'
                    div.classList.add('fake', "fst-italic", "text-muted");
                    td.appendChild(div)
                } else {
                    for (let _value of _value_list) {
                        let div = document.createElement('div');
                        div.textContent = _value;
                        div.dataset.ban = _value;

                        // 加点颜色，更好看
                        if (this.banTypeColor[_value]) {
                            div.style.backgroundColor = this.banTypeColor[_value];
                            div.classList.add('badge')
                        }
                        // 让badge强制换行，他是行内快标签，不会自动换行
                        let div_space = document.createElement('div');
                        td.appendChild(div)
                        td.appendChild(div_space)
                    }
                }
                // td去除最后一个空div元素
                if (td.lastElementChild.textContent === '') {
                    td.removeChild(td.lastElementChild);
                }

                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }
}

let iTs = new InitTables(dayjs());
iTs.init();
