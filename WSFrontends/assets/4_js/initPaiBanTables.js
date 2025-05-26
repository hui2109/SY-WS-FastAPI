class InitPaiBanTables {
    constructor(today) {
        this.today = today
        this.lookElement();
        this._updateDateLabel(this.today);
        this.initDatePicker();
        this.bindCellClick();
        this.bindHeadClick();
    }

    init() {
        this.getStartEndDate();
        this.getRecordsFromServer();
    }

    _updateDateLabel(date) {
        // 写入日期: XX年XX月
        this.dateLabel.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    }

    _setExpectedRelax(data) {
        let sequence = data['sequence'];

        if (sequence) {
            this.expectedRelax.textContent = data['bantype'];
            this.expectedRelaxSequence.textContent = sequence;
        } else {
            this.expectedRelax.textContent = '暂无';
            this.expectedRelaxSequence.textContent = '';
        }
    }

    _resetAll() {
        this.paibanSelectHD.dataset.bantype = 'wu';
        this.paibanSelectHD.dataset.name = 'wu';
        this.paibanSelectHD.dataset.date = 'wu';

        this.expectedPaiban.textContent = this.expectedRelax.dataset.default;
        this.expectedPaibanReason.textContent = '';
        this.expectedRelax.textContent = this.expectedRelax.dataset.default;
        this.expectedRelaxSequence.textContent = '';

        this.repeatPaiban5.checked = false;
        this.repeatPaiban2.checked = false;
        this.dropdownToggle.textContent = this.dropdownToggle.dataset.default;
    }

    _resetConfigureDate() {
        this.switchCheckFirstDay.checked = false;
        for (let mustBanCB of this.mustBansCB) {
            mustBanCB.checked = false;
        }
    }

    _autoFillConfigureDate(date) {
        let dateObj = dayjs(date);
        let data = {
            "isFirstDay": false,
            "mustBans": []
        };

        // 如果是周一至周五，默认选中；如果是周六或者周天，默认不选中
        if (dateObj.day() >= 1 && dateObj.day() <= 5) {
            if (dateObj.day() === 1) {
                data['isFirstDay'] = true;
            }
            data.mustBans = this.mustBans.map(item => "mustBan" + item);
            localStorage[date] = JSON.stringify(data);
        }
    }

    _autoFillConfigureDates() {
        for (let configureDaysGear of this.paibanTable.querySelectorAll('.configure-days-cell')) {
            this._autoFillConfigureDate(configureDaysGear.dataset.date);
        }
    }

    _get_today_planed_schedule(date) {
        let clickablePaibanCells = this.paibanTable.querySelectorAll(`.clickable-paiban-cell[data-date="${date}"]`);
        let today_planed_schedule = {};

        for (let clickablePaibanCell of clickablePaibanCells) {
            if (clickablePaibanCell.textContent !== 'null') {
                today_planed_schedule[clickablePaibanCell.dataset.name] = clickablePaibanCell.textContent;
            }
        }

        return today_planed_schedule;
    }

    _renderSuggestedSchedule(data) {
        this.suggestedPaiban.innerHTML = '';
        let _keys = Object.keys(data);

        for (let i = 0; i < _keys.length; i++) {
            let div = document.createElement('div');
            div.classList.add('d-flex', 'align-items-center', 'mb-2');
            div.style.gap = '12px';

            let possi_span = document.createElement('span');
            possi_span.classList.add('badge', 'border', 'border-primary', 'text-primary');
            possi_span.textContent = _keys[i];
            div.appendChild(possi_span);

            if (i === 0) {
                for (let j = 0; j < data[_keys[i]].length; j++) {
                    let ban_span = document.createElement('span');
                    if (j === 0) {
                        ban_span.classList.add('badge', 'bg-primary');
                    } else {
                        ban_span.classList.add('badge', 'border', 'border-secondary', 'text-secondary');
                    }
                    ban_span.textContent = data[_keys[i]][j];
                    div.appendChild(ban_span);
                }
            } else {
                for (let j = 0; j < data[_keys[i]].length; j++) {
                    let ban_span = document.createElement('span');
                    ban_span.classList.add('badge', 'border', 'border-secondary', 'text-secondary');
                    ban_span.textContent = data[_keys[i]][j];
                    div.appendChild(ban_span);
                }
            }

            this.suggestedPaiban.appendChild(div);
        }
    }

    lookElement() {
        this.paibanTable = document.querySelector('#paiban-content-all .paiban-table');
        this.dateLabel = document.querySelector('#paiban-content-all .mounianmouyue');

        this.datetimepicker3 = document.getElementById('datetimepicker3');
        this.paibanModal = document.getElementById('paibanModal');
        this.paibanPerson = document.getElementById('paibanPerson');
        this.paibanDate = document.getElementById('paibanDate');
        this.expectedPaiban = document.getElementById('expectedPaiban');
        this.expectedPaibanReason = document.getElementById('expectedPaibanReason');
        this.expectedRelax = document.getElementById('expectedRelax');
        this.expectedRelaxSequence = document.getElementById('expectedRelaxSequence');
        this.paibanSelectDropdown = document.getElementById('paibanSelectDropdown');
        this.dropdownToggle = this.paibanSelectDropdown.querySelector('.dropdown-toggle');
        this.paibanSelectHD = document.getElementById('paibanSelectHD');
        this.repeatPaiban5 = document.getElementById('repeatPaiban5');
        this.repeatPaiban2 = document.getElementById('repeatPaiban2');
        this.deletePaiban = document.getElementById('deletePaiban');
        this.confirmPaiban = document.getElementById('confirmPaiban');
        this.suggestedPaiban = document.getElementById('suggestedPaiban');

        this.configureDateModal = document.getElementById('configureDateModal');
        this.switchCheckFirstDay = document.getElementById('switchCheckFirstDay');
        this.mustBans = document.getElementById('mustBans');
        this.mustBansCB = this.mustBans.querySelectorAll('input[type="checkbox"]');
        this.resetConfigureDate = document.getElementById('resetConfigureDate');
        this.confirmConfigureDate = document.getElementById('confirmConfigureDate');
        this.configureDateInfo = document.getElementById('configureDateInfo');

        this.weekMap = getWeekMap();
        this.banTypeColor = getBanTypeColor();
        this.mustBans = ["1A", "1B", "2A", "2B", "2C", "3A", "3B", "S1", "S2", "N1", "N2"]
    }

    initDatePicker() {
        this.picker = new tempusDominus.TempusDominus(this.datetimepicker3, {
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

        // 先把已有的日期选择控件删了
        if (tempusDominusWidget) {
            tempusDominusWidget.remove();
        }

        // 监听日期改变事件
        this.datetimepicker3.addEventListener('change.td', (event) => {
            this.today = event.detail.date;
            this._updateDateLabel(this.today);
            this.init();
        });

        // 监听日期显示事件
        this.datetimepicker3.addEventListener('show.td', () => {
            adjustDatePickerPosition(this.dateLabel);
        });
    }

    getStartEndDate() {
        this.startDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1, 10, 0, 0, 0);
        this.endDate = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0, 10, 0, 0, 0);

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
            month_start: this.startDate,
            month_end: this.endDate
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
                    this.records = data;
                    this.generateThead();  // 先渲染一次表格，让他有configure-days-cell元素
                    this._autoFillConfigureDates();  // 然后把配置日期的checkbox选中
                    this.generateThead();  // 再渲染一次表格，更新齿轮的样式
                    this.generateTbody();
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
                    th.textContent = '待排班'
                    th.style.backgroundColor = 'var(--bs-danger)';
                } else {
                    th.textContent = '已发布'
                }
                tr.appendChild(th);
                continue;
            }

            let div1 = document.createElement('div'); // 写星期
            let div2 = document.createElement('div'); // 写日子
            let div3 = document.createElement('div'); // 写齿轮

            div1.textContent = this.dayMaps[this.dateList[i].getDay()];
            div2.textContent = String(this.dateList[i].getDate());
            div3.innerHTML = '<i class="bi bi-gear"></i>'
            div3.classList.add('configure-days-cell');

            div3.dataset.date = this.dateList[i].toISOString().split("T")[0];
            div3.addEventListener('click', (et) => {
                this.handleHeadClick(et);
            })

            // 渲染已经有配置的齿轮样式
            let configureData = localStorage.getItem(div3.dataset.date);
            if (configureData) {
                div3.classList.add('configured');
            }

            th.appendChild(div1);
            th.appendChild(div2);
            th.appendChild(div3);
            tr.appendChild(th);
        }
        thead.appendChild(tr);
    }

    generateTbody() {
        let tbody = this.paibanTable.querySelector('tbody');
        tbody.innerHTML = '';

        let daysNum = this.dateList.length;
        let personnel_list = this.records['personnels']

        // 没有排班记录特殊处理
        if (personnel_list.length === 0) {
            let currentPersonnelList = sessionStorage.getItem('currentPersonnelList');
            if (currentPersonnelList) {
                currentPersonnelList = JSON.parse(currentPersonnelList);
                personnel_list = currentPersonnelList;
            }
        }

        for (let i = 0; i < personnel_list.length; i++) {
            let tr = document.createElement('tr');
            let td = document.createElement('td');
            let name = personnel_list[i];
            td.textContent = name;

            // td.classList.add('clickable-paiban-cell');
            td.dataset.name = name;
            td.addEventListener('click', (et) => {
                this.handleHeadClick(et);
            });

            tr.appendChild(td);

            for (let j = 0; j < daysNum; j++) {
                td = document.createElement('td');
                let currDate = this.dateList[j]

                let _key = `${name}_${currDate.getFullYear()}_${currDate.getMonth() + 1}_${currDate.getDate()}`
                let _value_list = this.records[_key]

                td.classList.add('clickable-paiban-cell');
                td.dataset.name = name;
                td.dataset.date = currDate.toISOString().split("T")[0];
                td.addEventListener('click', (et) => {
                    this.handleCellClick(et);
                });

                if (_value_list === undefined) {
                    td.textContent = 'null'
                } else {
                    for (let _value of _value_list) {
                        let div = document.createElement('div')
                        div.textContent = _value
                        td.appendChild(div)
                    }
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }

    handleHeadClick(et) {
        this._resetConfigureDate();

        let srcCell = et.currentTarget;
        let date = srcCell.dataset.date;
        let dateObj = dayjs(date);

        // 设置日期
        this.configureDateInfo.textContent = `${dateObj.format('YYYY年M月D日')}（${this.weekMap[dateObj.day()]}）`;
        this.configureDateInfo.value = date;

        // 加载已有日期设置
        let configureData = localStorage.getItem(date);
        if (configureData) {
            configureData = JSON.parse(configureData);

            let isFirstDay = configureData['isFirstDay'];
            let mustBans = configureData['mustBans'];

            if (isFirstDay) {
                this.switchCheckFirstDay.checked = true;
            }

            for (let mustBanID of mustBans) {
                document.getElementById(mustBanID).checked = true;
            }
        }

        const modalInstance = new bootstrap.Modal(this.configureDateModal);
        modalInstance.show();
    }

    handleCellClick(et) {
        this._resetAll();

        let srcCell = et.currentTarget;
        let name = srcCell.dataset.name;
        let date = srcCell.dataset.date;
        let dateObj = dayjs(date);

        this.paibanSelectHD.dataset.name = name;
        this.paibanSelectHD.dataset.date = date;
        this.paibanPerson.textContent = name;
        this.paibanDate.textContent = `${dateObj.format('YYYY年M月D日')}（${this.weekMap[dateObj.day()]}）`;

        this.getExpectedRelax(name, dateObj.format('YYYY-MM-DD'));
        this.getSuggestedSchedule(name, dateObj)

        const modalInstance = new bootstrap.Modal(this.paibanModal);
        modalInstance.show();
    }

    bindHeadClick() {
        this.resetConfigureDate.addEventListener('click', () => {
            let date = this.configureDateInfo.value;
            this._resetConfigureDate();
            localStorage.removeItem(date);
            this.generateThead();
        })

        this.confirmConfigureDate.addEventListener('click', () => {
            let date = this.configureDateInfo.value;
            let data = {
                "isFirstDay": false,
                "mustBans": []
            };

            data['isFirstDay'] = this.switchCheckFirstDay.checked;
            for (let mustBanCB of this.mustBansCB) {
                if (mustBanCB.checked) {
                    data['mustBans'].push(mustBanCB.id);
                }
            }

            if (data['mustBans'].length !== 0) {
                localStorage.setItem(date, JSON.stringify(data));
                this.generateThead();
            }

            // 隐藏对话框
            const modalInstance = bootstrap.Modal.getInstance(this.configureDateModal);
            modalInstance.hide();
        })
    }

    bindCellClick() {
        let dropDownItems = this.paibanSelectDropdown.querySelectorAll('.dropdown-item');

        dropDownItems.forEach((item) => {
            item.addEventListener('click', (event) => {
                let elementThis = event.currentTarget;

                let selectedText = elementThis.textContent;
                this.dropdownToggle.textContent = selectedText;
                this.paibanSelectHD.dataset.bantype = selectedText;
            });
        });

        this.repeatPaiban5.addEventListener('click', (event) => {
            let elementThis = event.currentTarget;

            if (elementThis.checked) {
                this.repeatPaiban2.checked = false;
            }
        });

        this.repeatPaiban2.addEventListener('click', (event) => {
            let elementThis = event.currentTarget;

            if (elementThis.checked) {
                this.repeatPaiban5.checked = false;
            }
        });
    }

    getExpectedRelax(name, date) {
        // 获取token
        const token = getToken();
        if (!token) {
            return;
        }

        let data = {
            name,
            month_start: date,
            month_end: date
        }

        fetch('/select_my-reservation', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            response.json().then(data => {
                if (response.ok) {
                    this._setExpectedRelax(data);
                } else {
                    showAlert({
                        type: 'danger',
                        title: '数据获取失败！',
                        message: data.detail
                    });
                    window.location.href = '/login';
                }
            })
        }).catch(error => {
            alert('未知错误！');
            console.error('error!!!', error);
        });
    }

    getSuggestedSchedule(name, dateObj) {
        let date = dateObj.format('YYYY-MM-DD');
        let data = {
            name: name,
            schedule_date: date,

            is_first_day: true,
            today_mandatory_schedule: [],
            today_planed_schedule: this._get_today_planed_schedule(date)
        }

        let todayConfig = localStorage.getItem(date);
        if (todayConfig) {
            todayConfig = JSON.parse(todayConfig);
            data['is_first_day'] = todayConfig['isFirstDay'];
            data['today_mandatory_schedule'] = todayConfig['mustBans'].map(item => item.replace('mustBan', ''));
        } else {
            return;
        }

        // 获取token
        const token = getToken();
        if (!token) {
            return;
        }

        fetch('/get_suggested_schedule', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            response.json().then(data => {
                if (response.ok) {
                    this._renderSuggestedSchedule(data);
                } else {
                    showAlert({
                        type: 'danger',
                        title: '数据获取失败！',
                        message: data.detail
                    });
                }
            })
        }).catch(error => {
            alert('未知错误！');
            console.error('error!!!', error);
        });
    }
}

let iPBTs = new InitPaiBanTables(new Date());
iPBTs.init();