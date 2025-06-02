class InitPaiBanTables {
    constructor(today) {
        this.today = today;
        this.lookElement();
        this._updateDateLabel(this.today);
        this.initDatePicker();
        this.bindCellClick();
        this.bindHeadClick();
        this.bindToolsBtnClick();

        //this.checkAllSchedule.click();
    }

    init() {
        this.getStartEndDate();
        this.getRecordsFromServer();
    }

    _updateDateLabel(date) {
        // 写入日期: XX年XX月
        this.dateLabel.textContent = `${date.year()}年${date.month() + 1}月`;
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

        // 如果localStorage已有有了今天的配置，则不再自动填充
        if (!localStorage[date]) {
            // 默认 星期一是第一天
            if (dateObj.day() === 1) {
                data['isFirstDay'] = true;
            }
            data.mustBans = this.mustBansList.map(item => "mustBan" + item);
            localStorage[date] = JSON.stringify(data);
        }
    }

    _autoFillConfigureDates() {
        let configureDaysCells = this.paibanTable.querySelectorAll('.configure-days-cell')

        for (let configureDaysGear of configureDaysCells) {
            this._autoFillConfigureDate(configureDaysGear.dataset.date);

            // 渲染已经有配置的齿轮样式
            let configureData = localStorage.getItem(configureDaysGear.dataset.date);
            if (configureData) {
                configureDaysGear.classList.add('configured');
            }
        }
    }

    _get_today_planed_schedule(date, today_mandatory_schedule) {
        let clickablePaibanCells = this.paibanTable.querySelectorAll(`.clickable-paiban-cell[data-date="${date}"]`);
        let today_planed_schedule = {};

        for (let clickablePaibanCell of clickablePaibanCells) {
            for (let divElement of clickablePaibanCell.children) {
                // 如果是上个月的排班，则不计入今天的计划排班; 如果不在必备的排表列表里, 也排除; 如果是占位的空div，也排除
                if (!divElement.classList.contains('fake') && divElement.textContent !== '' && today_mandatory_schedule.includes(divElement.textContent)) {
                    today_planed_schedule[clickablePaibanCell.dataset.name] = divElement.textContent;
                    break; // 每个单元格只取第一个有效的排班
                }
            }
        }
        return today_planed_schedule;
    }

    _renderSuggestedSchedule(data) {
        this.suggestedPaiban.innerHTML = '';
        let _keys = Object.keys(data);

        if (_keys.length === 0) {
            this.suggestedPaiban.innerHTML = '<span class="badge bg-success" style="font-size: 0.9rem;">暂无</span>';
        }

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

    _deleteOnePaiban(event, name, work_date, ban) {
        // 确保这个函数可以单独调用
        if (event) {
            let elementThis = event.currentTarget;
            elementThis.parentElement.remove();
        }

        let data = {
            "name": name,
            "work_date": work_date.format('YYYY-MM-DD'),
            "ban": ban
        };
        // 获取token
        const token = getToken();
        if (!token) {
            return;
        }

        fetch('/delete_work_schedule', {
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
                    showAlert({
                        type: 'success',
                        title: '删除排班成功！',
                        message: `已为 ${name} 在 ${work_date.format('YYYY-MM-DD')} 删除排班 ${ban}`
                    });

                    // 不用重新渲染表格，只需将单元格的内容删了就行
                    this.getRecordsFromServer();
                    //let td = this.paibanTable.querySelector(`.clickable-paiban-cell[data-date="${work_date.format('YYYY-MM-DD')}"][data-name="${name}"]`);
                    //for (let child of td.children) {
                    //    if (child.textContent === ban) {
                    //        child.remove();
                    //        break;
                    //    }
                    //}

                    // 如果删除后没有排班了，则显示暂无
                    if (this.existingPaiban.children.length === 0) {
                        this.existingPaiban.innerHTML = '';

                        let span = document.createElement('span');
                        span.classList.add('badge', 'bg-success');
                        span.style.fontSize = '0.9rem';
                        span.textContent = '暂无';

                        this.existingPaiban.appendChild(span);
                    }

                    // 如果之前展示了上个月的排班，也展示
                    if (this.showLastSchedule.classList.contains('active')) {
                        this.showLastSchedule.classList.remove('active');
                        this.showLastSchedule.click();
                    }
                } else {
                    showAlert({
                        type: 'danger',
                        title: '删除排班失败！',
                        message: data.detail,
                    });
                }
            })
        }).catch(error => {
            debugger;
            console.error('error!!!', error);
        });
    }

    _show_last_month_schedule(data) {
        for (let i = 0; i < this.personnel_list.length; i++) {
            const this_month_start_date = this.startDate;
            const this_month_end_date = this.endDate;
            let this_month_current_date = dayjs(this_month_start_date);

            while (this_month_current_date <= this_month_end_date) {
                let td = this.paibanTable.querySelector(`td[data-date="${this_month_current_date.format('YYYY-MM-DD')}"][data-name="${this.personnel_list[i]}"]`);
                if (td && td.textContent === 'null') {
                    td.innerHTML = ''; // 清空当前单元格内容

                    let last_month_current_date = this_month_current_date.subtract(1, 'month');
                    let _key = `${this.personnel_list[i]}_${last_month_current_date.year()}_${last_month_current_date.month() + 1}_${last_month_current_date.date()}`;
                    let _value_list = data[_key];

                    if (_value_list === undefined) {
                        let div = document.createElement('div')
                        div.textContent = 'null'
                        div.classList.add('fake', "fst-italic", "text-muted", `${last_month_current_date.format('YYYY-MM-DD')}`);
                        td.appendChild(div)
                    } else {
                        for (let _value of _value_list) {
                            let div = document.createElement('div')
                            div.textContent = _value
                            div.classList.add('fake', "fst-italic", "text-muted", `${last_month_current_date.format('YYYY-MM-DD')}`);
                            td.appendChild(div)
                        }
                    }
                }
                this_month_current_date = this_month_current_date.add(1, 'day');
            }
        }
    }

    async _renderTableCell(ban, name, work_date, td, token) {
        td.innerHTML = ''; // 清空当前单元格内容

        // <div class="badge" style="background-color: rgb(55, 86, 35);">2C</div>
        let div = document.createElement('div');
        div.textContent = ban;
        div.classList.add('badge');
        if (this.banTypeColor[ban]) {
            div.style.backgroundColor = this.banTypeColor[ban];
        }

        td.appendChild(div);

        // 向服务器写入数据
        let schedule_data = {
            name: name,
            ban: ban,
            work_date: work_date.format('YYYY-MM-DD')
        };
        try {
            let response = await fetch('/create-schedule', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(schedule_data)
            })

            let data = await response.json();

            if (!response.ok) {
                showAlert({
                    type: 'danger',
                    title: '排班失败！',
                    message: data.detail,
                });
            }
        } catch (error) {
            debugger;
            console.error('error!!!', error);
        }
    }

    _prepareDataForSuggestedSchedule(name, dateObj) {
        let date = dateObj.format('YYYY-MM-DD');
        let data = {
            name: name,
            schedule_date: date,

            is_first_day: true,
            today_mandatory_schedule: [],
            today_planed_schedule: {}
        }

        let todayConfig = localStorage.getItem(date);
        if (todayConfig) {
            todayConfig = JSON.parse(todayConfig);
            data['is_first_day'] = todayConfig['isFirstDay'];
            data['today_mandatory_schedule'] = todayConfig['mustBans'].map(item => item.replace('mustBan', ''));
            data['today_planed_schedule'] = this._get_today_planed_schedule(date, data['today_mandatory_schedule']);

            return data;
        } else {
            this.suggestedPaiban.innerHTML = '<span class="badge bg-success" style="font-size: 0.9rem;">暂无</span>';
            return null;
        }
    }

    _changeCursorToEraser() {
        // 找到所有可点击的单元格，将光标设为none
        this.paibanTable.querySelectorAll('.clickable-paiban-cell').forEach(cell => {
            cell.style.cursor = 'none';
        });

        // 创建事件处理函数并保存引用
        this.mouseMoveHandler = (e) => {
            this.customCursor.style.left = e.clientX + 'px';
            this.customCursor.style.top = e.clientY + 'px';
        };

        this.mouseLeaveHandler = () => {
            this.customCursor.classList.add('hidden');
        };

        this.mouseEnterHandler = () => {
            this.customCursor.classList.remove('hidden');
        };

        // 添加事件监听器
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('mouseleave', this.mouseLeaveHandler);
        document.addEventListener('mouseenter', this.mouseEnterHandler);

        this.customCursor.classList.remove('hidden');
    }

    _changeCursorToDefault() {
        // 恢复单元格光标样式
        this.paibanTable.querySelectorAll('.clickable-paiban-cell').forEach(cell => {
            cell.style.cursor = 'pointer';
        });

        // 移除事件监听器
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler);
            this.mouseMoveHandler = null;
        }

        if (this.mouseLeaveHandler) {
            document.removeEventListener('mouseleave', this.mouseLeaveHandler);
            this.mouseLeaveHandler = null;
        }

        if (this.mouseEnterHandler) {
            document.removeEventListener('mouseenter', this.mouseEnterHandler);
            this.mouseEnterHandler = null;
        }

        // 隐藏自定义光标
        this.customCursor.classList.add('hidden');
    }

    lookElement() {
        this.paibanTable = document.querySelector('#paiban-content-all .paiban-table');
        this.dateLabel = document.querySelector('#paiban-content-all .mounianmouyue');
        this.clearAllSchedule = document.getElementById('clearAllSchedule');
        this.clearOneSchedule = document.getElementById('clearOneSchedule');
        this.showLastSchedule = document.getElementById('showLastSchedule');
        this.autoScheduleAll = document.getElementById('autoScheduleAll');
        this.checkAllSchedule = document.getElementById('checkAllSchedule');

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
        this.acceptPaiban = document.getElementById('acceptPaiban');
        this.existingPaiban = document.getElementById('existingPaiban');

        this.configureDateModal = document.getElementById('configureDateModal');
        this.switchCheckFirstDay = document.getElementById('switchCheckFirstDay');
        this.mustBans = document.getElementById('mustBans');
        this.mustBansCB = this.mustBans.querySelectorAll('input[type="checkbox"]');
        this.resetConfigureDate = document.getElementById('resetConfigureDate');
        this.confirmConfigureDate = document.getElementById('confirmConfigureDate');
        this.configureDateInfo = document.getElementById('configureDateInfo');

        this.clearAllScheduleModal = document.getElementById('clearAllScheduleModal');
        this.clearAllInfo = document.getElementById('clearAllInfo');
        this.confirmClearAll = document.getElementById('confirmClearAll');

        this.checkScheduleModal = document.getElementById('checkScheduleModal');
        this.checkScheduleLabel = document.getElementById('checkScheduleLabel');

        this.weekMap = getWeekMap();
        this.banTypeColor = getBanTypeColor();
        this.mustBansList = ["1A", "1B", "2A", "2B", "2C", "3A", "3B", "S1", "S2", "N1", "N2"];
        this.customCursor = document.getElementById('customCursor');
        this.tempEraseMode = false;
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
        this.picker.dates.setValue(new tempusDominus.DateTime(this.today));

        // 先把已有的日期选择控件删了
        if (tempusDominusWidget) {
            tempusDominusWidget.remove();
        }

        // 监听日期改变事件
        this.datetimepicker3.addEventListener('change.td', (event) => {
            this.today = dayjs(event.detail.date);
            this._updateDateLabel(this.today);
            this.init();
        });

        // 监听日期显示事件
        this.datetimepicker3.addEventListener('show.td', () => {
            adjustDatePickerPosition(this.autoScheduleAll);  // 这里不传this.dateLabel，在手机上会被挡住

            let datePicker = document.querySelector('.tempus-dominus-widget.show');
            datePicker.classList.remove('light');
            datePicker.classList.remove('dark');
            datePicker.classList.add(localStorage.getItem('theme'));

            // 取消预览上个月的排版状态
            this.showLastSchedule.classList.add('active');
            this.showLastSchedule.click();
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
            month_end: this.endDate.format('YYYY-MM-DD'),
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
                    this.generateThead();
                    this._autoFillConfigureDates();  // 自动填充配置日期, 并渲染样式
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

            div1.textContent = this.dayMaps[this.dateList[i].day()];
            div2.textContent = String(this.dateList[i].date());
            div3.innerHTML = '<i class="bi bi-gear"></i>'
            div3.classList.add('configure-days-cell');

            div3.dataset.date = this.dateList[i].format('YYYY-MM-DD');
            div3.addEventListener('click', (et) => {
                this.handleHeadClick(et);
            })

            th.appendChild(div1);
            th.appendChild(div2);
            th.appendChild(div3);

            // 新增特殊的休息日和节假日
            if (this.records['isHolidays'][div3.dataset.date]) {
                let div4 = document.createElement('div');  // 写特殊日
                div4.textContent = this.records['isHolidays'][div3.dataset.date];
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

        let daysNum = this.dateList.length;
        this.personnel_list = this.records['personnels']

        let currentPersonnelList = sessionStorage.getItem('currentPersonnelList');
        if (currentPersonnelList) {
            currentPersonnelList = JSON.parse(currentPersonnelList);

            // 如果当前人员列表小于等于原始人员列表，则使用原始人员列表
            if (this.personnel_list.length <= currentPersonnelList.length) {
                this.personnel_list = currentPersonnelList;
            }
        }

        for (let i = 0; i < this.personnel_list.length; i++) {
            let tr = document.createElement('tr');
            let td = document.createElement('td');
            let name = this.personnel_list[i];
            td.textContent = name;

            td.dataset.name = name;
            tr.appendChild(td);

            for (let j = 0; j < daysNum; j++) {
                td = document.createElement('td');
                let currDate = this.dateList[j]

                let _key = `${name}_${currDate.year()}_${currDate.month() + 1}_${currDate.date()}`
                let _value_list = this.records[_key]

                td.classList.add('clickable-paiban-cell');
                td.dataset.name = name;
                td.dataset.date = currDate.format('YYYY-MM-DD');
                if (!this.tempEraseMode) {
                    td.style.cursor = 'pointer';
                } else {
                    td.style.cursor = 'none';
                }

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
                        let div = document.createElement('div')
                        div.textContent = _value

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
        let srcCell = et.currentTarget;
        let name = srcCell.dataset.name;
        let date = srcCell.dataset.date;
        let dateObj = dayjs(date);

        // 判断下是不是擦除模式
        if (this.tempEraseMode) {
            for (let child of srcCell.children) {
                let ban = child.textContent;
                if (ban !== '' && !child.classList.contains('fake')) {
                    this._deleteOnePaiban(null, name, dateObj, ban);
                }
            }
            return;
        }

        this._resetAll();

        this.paibanSelectHD.dataset.name = name;
        this.paibanSelectHD.dataset.date = date;
        this.paibanPerson.textContent = name;
        this.paibanDate.textContent = `${dateObj.format('YYYY年M月D日')}（${this.weekMap[dateObj.day()]}）`;

        this.getExpectedRelax(name, dateObj.format('YYYY-MM-DD'));
        this.getSuggestedSchedule(name, dateObj);

        // 加载已有排班
        // <span class="badge bg-success" style="font-size: 0.9rem;">暂无</span>
        // <span class="badge bg-success" style="font-size: 0.9rem;">暂无<i class="bi bi-x" onclick="this.parentElement.remove()"></i></span>
        this.existingPaiban.innerHTML = '';
        let cellChildren = srcCell.children;
        let span = document.createElement('span');
        span.classList.add('badge', 'bg-success');
        span.style.fontSize = '0.9rem';
        span.textContent = '暂无';

        // 检测是否是上个月的排班 fake班
        if (cellChildren.length === 0) {
            this.existingPaiban.appendChild(span);
        } else {
            for (let child of srcCell.children) {
                if (child.classList.contains('fake')) {
                    this.existingPaiban.appendChild(span);
                    break;
                }

                if (!child.classList.contains('badge')) {
                    continue;
                }

                let span1 = span.cloneNode();
                let i = document.createElement('i');
                i.classList.add('bi', 'bi-x');
                i.style.marginLeft = '0.35rem';
                i.style.cursor = 'pointer';
                i.addEventListener('click', (event) => {
                    this._deleteOnePaiban(event, name, dateObj, child.textContent);
                });

                span1.textContent = child.textContent;
                span1.appendChild(i);

                this.existingPaiban.appendChild(span1);
            }
        }

        const modalInstance = new bootstrap.Modal(this.paibanModal);
        modalInstance.show();
    }

    bindHeadClick() {
        this.resetConfigureDate.addEventListener('click', () => {
            let date = this.configureDateInfo.value;
            this._resetConfigureDate();
            localStorage.removeItem(date);
            this._autoFillConfigureDates();
        });

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
                this._autoFillConfigureDates();
            }

            // 隐藏对话框
            const modalInstance = bootstrap.Modal.getInstance(this.configureDateModal);
            modalInstance.hide();
        });
    }

    bindCellClick() {
        // 绑定 下拉项 点击事件
        let dropDownItems = this.paibanSelectDropdown.querySelectorAll('.dropdown-item');
        dropDownItems.forEach((item) => {
            item.addEventListener('click', (event) => {
                let elementThis = event.currentTarget;

                let selectedText = elementThis.textContent;
                this.dropdownToggle.textContent = selectedText;
                this.paibanSelectHD.dataset.bantype = selectedText;
            });
        });

        // 绑定 重复5次 复选框事件
        this.repeatPaiban5.addEventListener('click', (event) => {
            let elementThis = event.currentTarget;

            if (elementThis.checked) {
                this.repeatPaiban2.checked = false;
            }
        });

        // 绑定 重复2次 复选框事件
        this.repeatPaiban2.addEventListener('click', (event) => {
            let elementThis = event.currentTarget;

            if (elementThis.checked) {
                this.repeatPaiban5.checked = false;
            }
        });

        // 绑定 接受建议 按钮事件
        this.acceptPaiban.addEventListener('click', () => {
            let suggestedPaiban = this.suggestedPaiban.querySelector('span[class="badge bg-primary"]');
            if (suggestedPaiban) {
                this.paibanSelectHD.dataset.bantype = suggestedPaiban.textContent;

                this.sendSchedules();

                // 隐藏对话框
                const modalInstance = bootstrap.Modal.getInstance(this.paibanModal);
                modalInstance.hide();
            } else {
                showAlert({
                    type: 'danger',
                    title: '暂无建议排班！',
                    message: '请手动进行排班！',
                    parentNode: this.paibanModal
                });
            }
        });

        // 绑定 确认排班 按钮事件
        this.confirmPaiban.addEventListener('click', () => {
            if (this.paibanSelectHD.dataset.bantype !== 'wu') {
                this.sendSchedules();

                // 隐藏对话框
                const modalInstance = bootstrap.Modal.getInstance(this.paibanModal);
                modalInstance.hide();
            } else {
                showAlert({
                    type: 'danger',
                    title: '当前未选择任何排班！',
                    message: '请手动进行排班！',
                    parentNode: this.paibanModal
                });
            }
        });

        // 绑定 删除排班 按钮事件
        this.deletePaiban.addEventListener('click', () => {

        });
    }

    bindToolsBtnClick() {
        this.clearAllSchedule.addEventListener('click', () => {
            let date1 = this.startDate.format('YYYY-MM-DD');
            let date2 = this.endDate.format('YYYY-MM-DD');

            this.clearAllInfo.textContent = `确定要删除 ${date1} 至 ${date2} 之间的所有排班吗？`;

            const modalInstance = new bootstrap.Modal(this.clearAllScheduleModal);
            modalInstance.show();
        });

        this.confirmClearAll.addEventListener('click', () => {
            let data = {
                start_date: this.startDate.format('YYYY-MM-DD'),
                end_date: this.endDate.format('YYYY-MM-DD')
            }
            // 获取token
            const token = getToken();
            if (!token) {
                return;
            }

            fetch('/delete_all_work_schedule', {
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
                        showAlert({
                            type: 'success',
                            title: '删除本月排班成功！',
                            message: `共删除 ${data.detail} 条排程记录`,
                        });

                        // 重新渲染表格
                        this.getRecordsFromServer();

                        // 隐藏对话框
                        const modalInstance = bootstrap.Modal.getInstance(this.clearAllScheduleModal);
                        modalInstance.hide();
                    } else {
                        showAlert({
                            type: 'danger',
                            title: '删除本月排班失败！',
                            message: data.detail,
                            parentNode: this.clearAllScheduleModal
                        });
                    }
                })
            }).catch(error => {
                debugger;
                console.error('error!!!', error);
            });
        });

        this.showLastSchedule.addEventListener('click', () => {
            if (this.showLastSchedule.classList.contains('active')) {
                // 证明已经是激活状态
                // 取消激活状态
                this.showLastSchedule.className = "btn btn-sm border border-warning";
                this.getRecordsFromServer();
            } else {
                // 证明是非激活状态
                // 激活状态
                this.showLastSchedule.className = "btn btn-sm btn-warning active";

                // 获取token
                const token = getToken();
                if (!token) {
                    return;
                }

                let last_month_start = this.startDate.subtract(1, 'month').startOf('month');
                let last_month_end = this.startDate.subtract(1, 'month').endOf('month');
                let data = {
                    month_start: last_month_start.format('YYYY-MM-DD'),
                    month_end: last_month_end.format('YYYY-MM-DD'),
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
                            this._show_last_month_schedule(data);
                        } else {
                            loginExpiredAlert();
                        }
                    })
                }).catch(error => {
                    debugger;
                    console.error(error);
                })
            }
        });

        this.autoScheduleAll.addEventListener('click', async () => {
            // 获取token
            const token = getToken();
            if (!token) {
                return;
            }

            const date1 = this.startDate;
            const date2 = this.endDate;
            let currentDate = dayjs(date1);
            let random_personnel_list = [...this.personnel_list];  // 拷贝一份

            while (currentDate <= date2) {
                for (let random_person of random_personnel_list) {
                    let res = this._prepareDataForSuggestedSchedule(random_person, currentDate);
                    if (!res) {
                        continue;  // 如果没有配置，则不进行后续操作
                    }

                    let td = this.paibanTable.querySelector(`td[data-date="${currentDate.format('YYYY-MM-DD')}"][data-name="${random_person}"]`);
                    if (!td) {
                        continue;
                    }

                    // 如果已经有排班了，也不要自动排了
                    let flag = false;
                    for (let child of td.children) {
                        if (!child.classList.contains('fake')) {
                            flag = true;
                            break;
                        }
                    }
                    if (flag) {
                        continue;
                    }

                    // 等待异步请求结果
                    try {
                        let response = await fetch('/get_suggested_schedule', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify(res)
                        })
                        let data = await response.json();

                        if (!response.ok) {
                            showAlert({
                                type: 'danger',
                                title: '数据获取失败！',
                                message: data.detail
                            });
                        } else {
                            if (Object.keys(data).length !== 0) {
                                let suggested_ban = data[Object.keys(data)[0]][0];
                                await this._renderTableCell(suggested_ban, random_person, currentDate, td, token);
                            }
                        }
                    } catch (error) {
                        debugger;
                        console.error('error!!!', error);
                    }
                }
                currentDate = currentDate.add(1, 'day');
            }
        });

        this.clearOneSchedule.addEventListener('click', (event) => {
            let elementThis = event.currentTarget;

            // 判断状态
            if (elementThis.classList.contains('btn-warning')) {
                // 禁用状态
                elementThis.className = 'btn btn-sm border border-warning';

                // 恢复光标
                this._changeCursorToDefault();
                this.tempEraseMode = false;
            } else {
                // 启用状态
                elementThis.className = "btn btn-warning btn-sm";

                // 将光标改为橡皮擦
                this._changeCursorToEraser();
                this.tempEraseMode = true;
            }
        });

        this.checkAllSchedule.addEventListener('click', () => {
            this.checkScheduleLabel.textContent = `核查 ${this.startDate.format('YYYY-MM-DD')}至${this.endDate.format('YYYY-MM-DD')} 的排班`
            this._renderCheckScheduleTable();

            const modalInstance = new bootstrap.Modal(this.checkScheduleModal);
            modalInstance.show();

            const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
            const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
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
                }
            })
        }).catch(error => {
            debugger;
            console.error('error!!!', error);
        });
    }

    getSuggestedSchedule(name, dateObj) {
        let res = this._prepareDataForSuggestedSchedule(name, dateObj);
        if (!res) {
            return;  // 如果没有配置，则不进行后续操作
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
            body: JSON.stringify(res)
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
            debugger;
            console.error('error!!!', error);
        });
    }

    sendSchedule(data) {
        let schedule_data = data;

        // 获取token
        const token = getToken();
        if (!token) {
            return;
        }

        fetch('/create-schedule', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(schedule_data)
        }).then(response => {
            response.json().then(data => {
                if (response.ok) {
                    showAlert({
                        type: 'success',
                        title: '排班成功！',
                        message: `已为 ${schedule_data.name} 在 ${schedule_data.work_date} 排班 ${schedule_data.ban}`
                    });

                    // 重新渲染表格
                    this.getRecordsFromServer();

                    // 如果之前展示了上个月的排班，也展示
                    if (this.showLastSchedule.classList.contains('active')) {
                        this.showLastSchedule.classList.remove('active');
                        this.showLastSchedule.click();
                    }
                } else {
                    showAlert({
                        type: 'danger',
                        title: '排班失败！',
                        message: data.detail,
                    });
                }
            })
        }).catch(error => {
            debugger;
            console.error('error!!!', error);
        });


    }

    sendSchedules() {
        let name = this.paibanSelectHD.dataset.name;
        let work_date = this.paibanSelectHD.dataset.date;
        let work_date_obj = dayjs(work_date);
        let ban = this.paibanSelectHD.dataset.bantype;
        let data = {name, ban, work_date};

        if (this.repeatPaiban5.checked) {
            for (let i = 0; i < 5; i++) {
                data['work_date'] = work_date_obj.add(i, 'day').format('YYYY-MM-DD');
                this.sendSchedule(data);
            }
        }

        if (this.repeatPaiban2.checked) {
            for (let i = 0; i < 2; i++) {
                data['work_date'] = work_date_obj.add(i, 'day').format('YYYY-MM-DD');
                this.sendSchedule(data);
            }
        }

        if (!this.repeatPaiban5.checked && !this.repeatPaiban2.checked) {
            this.sendSchedule(data);
        }

    }

    _renderCheckScheduleTable() {
        let thead = this.checkScheduleModal.querySelector('#checkScheduleContent thead');
        let tbody = this.checkScheduleModal.querySelector('#checkScheduleContent tbody');
        thead.innerHTML = '';
        tbody.innerHTML = '';

        let month_planed_schedule = {};
        let month_bantype = new Set();
        this.mustBansAllList = ["1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C", "S1", "S2", "N1", "N2", "休息"];

        // 获取当月所有排班数据
        for (let i = 0; i < this.dateList.length; i++) {
            let date = this.dateList[i].format('YYYY-MM-DD');
            let clickablePaibanCells = this.paibanTable.querySelectorAll(`.clickable-paiban-cell[data-date="${date}"]`);
            let today_planed_schedule = {};

            for (let clickablePaibanCell of clickablePaibanCells) {
                for (let divElement of clickablePaibanCell.children) {
                    // 如果是上个月的排班，则不计入今天的计划排班; 如果是占位的空div，也排除
                    if (!divElement.classList.contains('fake') && divElement.textContent !== '') {
                        if (!today_planed_schedule[clickablePaibanCell.dataset.name]) {
                            today_planed_schedule[clickablePaibanCell.dataset.name] = [divElement.textContent];
                            month_bantype.add(divElement.textContent);
                        } else {
                            today_planed_schedule[clickablePaibanCell.dataset.name].push(divElement.textContent);
                            month_bantype.add(divElement.textContent);
                        }
                    }
                }
            }

            month_planed_schedule[this.dateList[i].date()] = today_planed_schedule;
        }
        month_bantype = this._sortListByReference(Array.from(month_bantype));

        // 重构数据
        let thead_data = [];
        for (let i = -1; i < month_bantype.length; i++) {
            if (i === -1) {
                thead_data.push(`${this.startDate.year()}/${this.startDate.month() + 1}`)
            } else {
                thead_data.push(month_bantype[i]);
            }
        }

        let tbody_data = {};
        let date_keys = Object.keys(month_planed_schedule);
        for (let dateKey of date_keys) {
            tbody_data[dateKey] = [];

            for (let bantype of month_bantype) {
                let tbody_tr_data = [];

                for (let name in month_planed_schedule[dateKey]) {
                    let bans_list = month_planed_schedule[dateKey][name];

                    for (let ban of bans_list) {
                        if (bantype === ban) {
                            tbody_tr_data.push(name);
                        }
                    }
                }
                tbody_data[dateKey].push(tbody_tr_data);
            }
        }

        // 绘制表格
        let tr = document.createElement('tr');
        for (let content of thead_data) {
            let th = document.createElement('th');
            th.textContent = content;
            tr.appendChild(th);
        }
        thead.appendChild(tr);

        for (let dateKey in tbody_data) {
            let tr = document.createElement('tr');
            let td = document.createElement('td');

            let div1 = document.createElement('div');  // div1写日子
            let div2 = document.createElement('div');  // div2写星期
            let currDate = this.dateList[parseInt(dateKey) - 1]

            div1.textContent = dateKey;
            div2.textContent = `（${this.weekMap[currDate.day()]}）`;
            td.appendChild(div1);
            td.appendChild(div2);

            tr.appendChild(td);

            for (let i = 0; i < tbody_data[dateKey].length; i++) {
                let tbody_tr_data_list = tbody_data[dateKey][i];
                let td = document.createElement('td');
                let count = tbody_tr_data_list.length;

                if (count === 0) {
                    td.innerHTML = '<span class="badge bg-secondary">暂无排班</span>'
                } else {
                    // 只显示前3个人
                    let tbody_tr_data_list_trim = [];
                    let dayu3Flag = false;

                    if (count > 3) {
                        tbody_tr_data_list_trim = tbody_tr_data_list.slice(0, 3);
                        dayu3Flag = true;
                    } else {
                        tbody_tr_data_list_trim = tbody_tr_data_list;
                    }

                    // 不同颜色标识人数, 便于快速判断各班种安排的人
                    let count_color_dict = {
                        1: 'bg-primary',
                        2: 'bg-success',
                        3: 'bg-warning',
                        4: 'bg-danger',
                    }

                    td.innerHTML += `
                        <div class="d-flex flex-column justify-content-between align-items-center">
                            <div class="badge ${count_color_dict[count] ? count_color_dict[count] : 'bg-info'}">${count} 人</div>
                            
                            ${tbody_tr_data_list_trim.map(name => `
                                <div class="text-muted" style="font-size: 0.75em">${name}</div>
                            `).join('')}

                            ${dayu3Flag ?
                        `
                        <a tabindex="0"
                            class="badge bg-warning waitwaitBadge"
                            style="font-size: 0.75em; cursor: pointer; text-decoration: none;"
                            data-bs-toggle="popover"
                            data-bs-placement="left"
                            data-bs-custom-class="custom-popover"
                            data-bs-trigger="focus"
                            data-bs-title="${currDate.format('YY年M月D日')}${thead_data[i + 1]}班所有人员"
                            data-bs-content="${tbody_tr_data_list.join('、')}">
                            等等</a>
                        `
                        : ''}
                        </div>
                    `
                }

                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        }
    }

    _sortListByReference(A, B = this.mustBansAllList) {
        return A.slice().sort((a, b) => {
            // 定义排序规则
            const indexA = B.indexOf(a);
            const indexB = B.indexOf(b);

            const isAInB = indexA !== -1;
            const isBInB = indexB !== -1;

            const isABujia = a === '补假';
            const isBBujia = b === '补假';

            // '补假' 永远排最后
            if (isABujia && !isBBujia) return 1;
            if (!isABujia && isBBujia) return -1;
            if (isABujia && isBBujia) return 0;

            // 都在B中，按B的顺序排
            if (isAInB && isBInB) return indexA - indexB;

            // 只有a在B中
            if (isAInB && !isBInB) return -1;
            // 只有b在B中
            if (!isAInB && isBInB) return 1;

            // 都不在B中，保持原序（也可以按字母排，这里按原顺序）
            return 0;
        });
    }

}

let iPBTs = new InitPaiBanTables(dayjs());
iPBTs.init();
