class InitVacationTable {
    constructor(year) {
        this.init_year = year;
        this.lookForElement();
        this.bindClickEvent();  // 事件绑定只能调用一次
    }

    init() {
        this.true_day_start = dayjs(`2099-01-01`);
        this.true_day_end = dayjs(`1900-01-01`);
        this.getData();
    }

    _renderWholeTable() {
        this.modifyHalfTableHead('firstHalfTableHead', this.init_year, 1, this.init_year, 6);
        this.generateTableRows('firstHalfTableBody', 10);

        this.modifyHalfTableHead('secondHalfTableHead', this.init_year, 7, this.init_year, 12, 6);
        this.generateTableRows('secondHalfTableBody', 10);
    }

    _getStartEndDates() {
        let year = Object.keys(this.GroupedDates)[0];
        let month_start = Object.keys(this.GroupedDates[year])[0];
        let month_end = Object.keys(this.GroupedDates[year])[Object.keys(this.GroupedDates[year]).length - 1];
        let day_start = this.GroupedDatesObj[year][month_start][0][0];
        let day_end = this.GroupedDatesObj[year][month_end][Object.keys(this.GroupedDates[year][month_end]).length - 1][1];

        return [day_start, day_end];
    }

    _getCellDateRange(colNum) {
        let index = 0;
        for (const year in this.GroupedDates) {
            for (const month in this.GroupedDates[year]) {
                let daysRange_length = this.GroupedDates[year][month].length
                if (colNum < daysRange_length) {
                    let startDate = this.GroupedDatesObj[year][month][colNum][0].format('YYYY-MM-DD')
                    let endDate = this.GroupedDatesObj[year][month][colNum][1].format('YYYY-MM-DD')
                    return [startDate, endDate]
                } else {
                    colNum -= daysRange_length;
                }
            }
        }
    }

    _resetAll() {
        const dropdownButtons = this.bookingModal.querySelectorAll('.dropdown-toggle[data-default]');
        const bookingDateAllCB = this.bookingModal.querySelectorAll('input[type="checkbox"]');
        const pinjiaBTN = this.bookingModal.querySelectorAll('.better-pinjia-btn');

        dropdownButtons.forEach(button => {
            button.textContent = button.dataset.default;
        })

        bookingDateAllCB.forEach(checkbox => {
            checkbox.checked = false;
        })

        pinjiaBTN.forEach(button => {
            button.textContent = button.dataset.default;
        })

        this.inputHiddens.forEach(inputHidden => {
            inputHidden.dataset.date = 'wu';
            inputHidden.dataset.name = 'wu';
            inputHidden.dataset.relax = 'wu';
        })

        // 激活按钮0 禁用按钮1和2
        this.bookingPerson0.click();

        // 禁用 拼假人1和拼假人2 按钮
        this.bookingPerson1.disabled = true;
        this.bookingPerson2.disabled = true;
        this.bookingPerson[1].style.cursor = 'not-allowed';
        this.bookingPerson[2].style.cursor = 'not-allowed';
    }

    _setBookingPersonBtnProperties() {
        this.bookingPerson0.active = function () {
            this.classList.remove('btn-outline-success');
            this.classList.add('btn-success');
        }
        this.bookingPerson0.inactive = function () {
            this.classList.add('btn-outline-success');
            this.classList.remove('btn-success');
        }
        this.bookingPerson1.active = function () {
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary');
        }
        this.bookingPerson1.inactive = function () {
            this.classList.add('btn-outline-primary');
            this.classList.remove('btn-primary');
        }
        this.bookingPerson2.active = function () {
            this.classList.remove('btn-outline-warning');
            this.classList.add('btn-warning');
        }
        this.bookingPerson2.inactive = function () {
            this.classList.add('btn-outline-warning');
            this.classList.remove('btn-warning');
        }
    }

    _detectInputHDStatus(color) {
        this.inputHiddens.forEach(inputHidden => {
            let bigLi = inputHidden.parentNode;
            let inputEl = bigLi.querySelector('input');
            let labelEl = bigLi.querySelector('label');
            let btnEl = bigLi.querySelector('button');

            if (inputHidden.dataset.name === 'wu' || inputHidden.dataset.name === this.currentPerson) {
                inputEl.className = inputEl.className.replace(/border-\S+/, `border-${color}`);
                labelEl.className = labelEl.className.replace(/text-\S+/, `text-${color}`);
                btnEl.className = btnEl.className.replace(/btn-\S+/, `btn-${color}`);

                inputEl.disabled = false;
                btnEl.disabled = false;
                bigLi.style.cursor = 'auto';
            } else {
                // 证明这个选项是其他人选过的
                inputEl.disabled = true;
                btnEl.disabled = true;
                bigLi.style.cursor = 'not-allowed';
            }
        })
    }

    _collectInputHD() {
        let checkedData = [];
        let hasError = false;
        this.inputHiddens.forEach(inputHidden => {
            let oneData = {};
            oneData['sequence'] = this.bookingSequence.value;
            oneData['date'] = inputHidden.dataset.date;
            oneData['name'] = inputHidden.dataset.name;
            oneData['relax'] = inputHidden.dataset.relax;

            // 判断是否预约失败
            if (this._checkFormData(oneData) === 23) {
                hasError = true;
            }

            if (this._checkFormData(oneData)) {
                checkedData.push(oneData);
            }
        })

        return [checkedData, hasError]
    }

    _checkFormData(oneData) {
        // 填了名字， 其他选项必须填
        if (oneData['name'] !== 'wu') {
            if (oneData['date'] === 'wu' || oneData['relax'] === 'wu') {
                showAlert({
                    type: 'danger',
                    title: '预约失败！',
                    message: '务必选择预约日期和对应的休假类型！',
                    parentNode: this.bookingModal,
                })
                return 23;
            } else {
                return true;
            }
        } else {
            return false;
        }


    }

    modifyHalfTableHead(_id, startYear, startMonth, endYear, endMonth, delta = null) {
        [this.GroupedDates, this.GroupedDatesObj] = generateWeeklyGroups(startYear, startMonth, endYear, endMonth);
        [this.day_start, this.day_end] = this._getStartEndDates();
        if (this.day_start <= this.true_day_start) {
            this.true_day_start = this.day_start;
        }
        if (this.day_end >= this.true_day_end) {
            this.true_day_end = this.day_end;
        }

        let thead = document.getElementById(_id);
        let tr1 = thead.querySelectorAll('tr')[0];
        let tr1_ths = tr1.querySelectorAll('th');
        let tr2 = thead.querySelectorAll('tr')[1];
        tr2.innerHTML = ''

        // 更改月份的跨列数
        for (let i = 1; i < 7; i++) {
            let groups_list;
            if (delta) {
                groups_list = this.GroupedDates[startYear][`${i + delta}月`];
            } else {
                groups_list = this.GroupedDates[startYear][`${i}月`];
            }

            tr1_ths[i].colSpan = groups_list.length;

            // 更改具体月份的日期
            for (let j of groups_list) {
                let th = document.createElement('th');
                th.textContent = j;
                tr2.appendChild(th);
            }
        }
        this.col_nums = tr2.querySelectorAll('th').length;
    }

    generateTableRows(tableBodyId, rows) {
        const tableBody = document.getElementById(tableBodyId);
        tableBody.innerHTML = '';

        for (let i = 1; i <= rows; i++) {
            const row = document.createElement('tr');
            // 序号列
            const numCell = document.createElement('td');
            numCell.className = 'sequence-col';
            numCell.textContent = i;
            row.appendChild(numCell);

            // 日期组列
            for (let j = 0; j < this.col_nums; j++) {
                const cell = document.createElement('td');
                cell.classList.add('clickable-cell');
                //cell.classList.add('position-relative');
                cell.dataset.serialNum = i;
                cell.dataset.colNum = j;
                cell.dataset.dateRange = this._getCellDateRange(j);
                cell.addEventListener('click', (et) => {
                    this.handleCellClick(et);
                });
                row.appendChild(cell);
            }
            tableBody.appendChild(row);
        }


    }

    lookForElement() {
        this.bookingModal = document.getElementById('bookingModal');
        this.bookingModalLabel = document.getElementById('bookingModalLabel');
        this.bookingSequence = document.getElementById('bookingSequence');
        this.bookingDate = this.bookingModal.querySelectorAll('.modal-body .bookingDate>li')
        this.relaxType = this.bookingModal.querySelectorAll('.modal-body .bookingDate>li>div:nth-of-type(2)')
        this.inputHiddens = this.bookingModal.querySelectorAll('.modal-body .bookingDate>li>input')
        this.bookingDateAllCB = this.bookingModal.querySelectorAll('.modal-body .bookingDate>li input[type="checkbox"]')
        this.reserveMode = this.bookingModal.querySelectorAll('.modal-body .reserveMode>li')
        this.reserveMode0 = this.reserveMode[0].querySelector('input')
        this.reserveMode1 = this.reserveMode[1].querySelector('input')
        this.bookingPerson = this.bookingModal.querySelectorAll('.modal-body .bookingPerson>div')
        this.bookingPerson0 = this.bookingPerson[0].querySelector('button');
        this.bookingPerson1 = this.bookingPerson[1].querySelector('.better-pinjia-btn');
        this.bookingPerson2 = this.bookingPerson[2].querySelector('.better-pinjia-btn');
        this.footer = this.bookingModal.querySelector('.modal-footer')

        this.resetBooking = document.getElementById('resetBooking');
        this.confirmBooking = document.getElementById('confirmBooking');
        this.deleteReserve = document.getElementById('deleteReserve');
        this.weekMap = {
            0: '周日',
            1: '周一',
            2: '周二',
            3: '周三',
            4: '周四',
            5: '周五',
            6: '周六',
        };
        this.currentPerson = null;
        this.banTypeColor = {
            '放射假': '#0d6efd',
            '年假': '#198754',
            '病假': '#fd7e14',
            '事假': '#ffc107',
            '婚假': '#d63384',
            '产假': '#dc3545',
            '陪产假': '#6610f2',
            '育儿假': '#0dcaf0',
            '丧假': '#adb5bd',
            '其他假': '#ca766f',
        }
    }

    handleCellClick(et) {
        let srcCell = et.currentTarget;
        let [startDay, endDay] = srcCell.dataset.dateRange.split(',');
        let serialNum = srcCell.dataset.serialNum;

        // 更新表单日期
        startDay = dayjs(startDay);
        endDay = dayjs(endDay);
        let currentDay = startDay;
        let dateList = [];
        while (currentDay <= endDay) {
            dateList.push(currentDay);
            currentDay = currentDay.add(1, 'day');
        }
        for (let i = 0; i < dateList.length; i++) {
            const bookingDateLabel = this.bookingDate[i].querySelector('label');
            const bookingDateCheckbox = this.bookingDate[i].querySelector('input[type="checkbox"]');

            bookingDateLabel.textContent = `${dateList[i].format('YYYY年M月D日')}（${this.weekMap[dateList[i].day()]}）`;
            bookingDateCheckbox.value = dateList[i].format('YYYY-MM-DD');
        }

        // 更新顺序位
        this.bookingSequence.value = serialNum;
        this.bookingModalLabel.textContent = '预约休假' + ' -- ' + `第 ${serialNum} 优先位`

        // 更新本人
        this.bookingPerson0.textContent = sessionStorage.getItem('user_name');
        this.currentPerson = sessionStorage.getItem('user_name');

        // 判断单元格上是否已有预约
        if (srcCell.children.length === 0) {
            // 模拟 [独立预约方式] 的点击事件
            this.reserveMode0.click();

            // 显示脚
            let footerChildren = this.footer.children
            for (let footerChild of footerChildren) {
                footerChild.classList.remove('d-none');
            }
            this.deleteReserve.classList.add('d-none');
            // 启用交互
            let overlay = this.bookingModal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.remove();
            }
        } else {
            this.recoverModal(srcCell);

            // 隐藏脚
            let footerChildren = this.footer.children
            for (let footerChild of footerChildren) {
                footerChild.classList.add('d-none');
            }
            this.deleteReserve.classList.remove('d-none');
            // 禁止交互
            let overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            this.bookingModal.querySelector('.modal-body').appendChild(overlay);
        }

        const modalInstance = new bootstrap.Modal(this.bookingModal);
        modalInstance.show();
    }

    bindClickEvent() {
        // 先绑定 激活/失活 属性
        this._setBookingPersonBtnProperties();

        // 处理 [重置按钮] 点击事件
        this.resetBooking.addEventListener('click', () => {
            this._resetAll();
        })

        // 处理 [独立预约方式] 点击事件
        this.reserveMode0.addEventListener('click', () => {
            this.bookingPerson[0].style.cursor = 'not-allowed';
            this.bookingPerson[1].classList.add('d-none');
            this.bookingPerson[2].classList.add('d-none');
            this._resetAll();
            this.bookingPerson0.disabled = true;
        })

        // 处理 [拼假预约方式] 点击事件
        this.reserveMode1.addEventListener('click', () => {
            this.bookingPerson[0].style.cursor = 'pointer';
            this.bookingPerson[1].classList.remove('d-none');
            this.bookingPerson[2].classList.remove('d-none');
            this._resetAll();
            this.bookingPerson0.disabled = false;
        })

        // 处理 [休假类型] 点击事件
        for (let i = 0; i < this.relaxType.length; i++) {
            const relaxDropdownButton = this.relaxType[i].querySelector('button');
            const relaxDropdownItems = this.relaxType[i].querySelectorAll('.dropdown-item');
            const inputHidden = relaxDropdownButton.parentNode.parentNode.querySelector('input[type="hidden"]');

            relaxDropdownItems.forEach(item => {
                item.addEventListener('click', (event) => {
                    const elementThis = event.currentTarget;

                    // 更新按钮文字
                    relaxDropdownButton.textContent = elementThis.textContent;
                    inputHidden.dataset.relax = elementThis.textContent;
                    inputHidden.dataset.name = this.currentPerson;
                })
            })
        }

        // 处理 [预约日期] 点击事件
        this.bookingDateAllCB.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const elementThis = event.currentTarget;
                const inputHidden = elementThis.parentNode.parentNode.querySelector('input[type="hidden"]');
                if (elementThis.checked) {
                    inputHidden.dataset.date = elementThis.value;
                    inputHidden.dataset.name = this.currentPerson;
                } else {
                    inputHidden.dataset.date = 'wu';
                    inputHidden.dataset.name = 'wu';
                }
            });
        });

        // 处理 [预约人] 的点击事件
        this.bookingPerson0.addEventListener('click', (event) => {
            const elementThis = event.currentTarget;
            elementThis.active();
            this.bookingPerson1.inactive();
            this.bookingPerson2.inactive();
            this.currentPerson = elementThis.textContent;
            this._detectInputHDStatus('success');
        })
        this.bookingPerson1.addEventListener('click', (event) => {
            const elementThis = event.currentTarget;
            elementThis.active();
            this.bookingPerson0.inactive();
            this.bookingPerson2.inactive();
            this.currentPerson = elementThis.textContent;
            this._detectInputHDStatus('primary');
        })
        this.bookingPerson2.addEventListener('click', (event) => {
            const elementThis = event.currentTarget;
            elementThis.active();
            this.bookingPerson0.inactive();
            this.bookingPerson1.inactive();
            this.currentPerson = elementThis.textContent;
            this._detectInputHDStatus('warning');
        })

        // 处理 [预约人 下拉框] 的点击事件
        let dropDownItems1 = this.bookingPerson[1].querySelectorAll('.dropdown-item')
        dropDownItems1.forEach(item => {
            item.addEventListener('click', (event) => {
                const elementThis = event.currentTarget;
                this.bookingPerson1.textContent = elementThis.textContent;
                if (this.bookingPerson1.disabled) {
                    this.bookingPerson1.disabled = false;
                    this.bookingPerson[1].style.cursor = 'pointer';
                }
            })
        })
        let dropDownItems2 = this.bookingPerson[2].querySelectorAll('.dropdown-item')
        dropDownItems2.forEach(item => {
            item.addEventListener('click', (event) => {
                const elementThis = event.currentTarget;
                this.bookingPerson2.textContent = elementThis.textContent;
                if (this.bookingPerson2.disabled) {
                    this.bookingPerson2.disabled = false;
                    this.bookingPerson[2].style.cursor = 'pointer';
                }
            })
        })

        // 处理 [确认预约] 点击事件
        this.confirmBooking.addEventListener('click', () => {
            let [checkedData, hasError] = this._collectInputHD();

            if (checkedData.length === 0 || hasError) {
                return;
            }
            this.sendData(checkedData);
        })

        // 处理 [删除预约] 点击事件
        this.deleteReserve.addEventListener('click', () => {
            let [checkedData, hasError] = this._collectInputHD();

            if (checkedData.length === 0 || hasError) {
                return;
            }
            console.log(checkedData)
            this.deleteData(checkedData);
        })
    }

    sendData(result) {
        // 获取token
        const token = getToken();
        if (!token) {
            loginExpiredAlert()
            return;
        }

        // 向服务器发请求
        fetch('/create-reserve', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result)
        }).then(response =>
            response.json().then(data => {
                if (response.ok) {
                    showAlert({
                        type: 'success',
                        title: '预约成功！',
                        message: data.detail,
                    });

                    // 隐藏对话框
                    const modalInstance = bootstrap.Modal.getInstance(this.bookingModal);
                    modalInstance.hide();

                    // 获取数据
                    this.getData();
                } else {
                    showAlert({
                        type: 'danger',
                        title: '预约失败！',
                        message: data.detail,
                    });
                }
            })
        ).catch(error => {
            alert('预约失败！未知错误！');
            console.error(error);
        })
    }

    getData() {
        this._renderWholeTable();  // 先清空整个表格
        let data = {
            month_start: this.true_day_start,
            month_end: this.true_day_end,
        }
        // 获取token
        const token = getToken();
        if (!token) {
            loginExpiredAlert()
            return;
        }

        fetch('/select_all-reservations', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        }).then(response => {
            response.json().then(data => {
                if (response.ok) {
                    this.server_reserve_data = data;
                    this.renderTableCells();
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

    renderTableCells() {
        this.targetCells = {}
        if (this.server_reserve_data.length === 0) {
            return;
        }

        for (let server_data of this.server_reserve_data) {
            let targetCell = {
                tableCell: null,
                name: null,
                bantype_days: [
                    // {bantype: null, days: []},
                    // {bantype: null, days: []}
                ]
            }

            let sequence = server_data['sequence'];
            let name = server_data['name'];
            let bantype = server_data['bantype'];
            let reserve_date = dayjs(server_data['reserve_date']);

            const startDate = reserve_date.startOf('isoWeek');
            const endDate = reserve_date.endOf('isoWeek');
            let xingQi;  // 星期一到星期天  对应 0-6
            if (reserve_date.day() !== 0) {
                xingQi = reserve_date.day() - 1
            } else {
                xingQi = 6
            }

            let dateRange = `${startDate.format('YYYY-MM-DD')},${endDate.format('YYYY-MM-DD')}`;
            let tableCell = document.querySelector(`#reserve-content-all .clickable-cell[data-date-range="${dateRange}"][data-serial-num="${sequence}"]`);
            if (tableCell) {
                // 使用行 + 列 + 日期 + 名字 标识每个单元格
                let index = `${tableCell.dataset.serialNum}_${tableCell.dataset.colNum}_${tableCell.dataset.dateRange}_${name}`

                if (!this.targetCells[index]) {
                    targetCell['tableCell'] = tableCell;
                    targetCell['name'] = name;
                    targetCell['bantype_days'].push({bantype: bantype, days: [xingQi]})
                    this.targetCells[index] = targetCell
                } else {
                    // 构建索引， 方便查找
                    let bantype_days = this.targetCells[index]['bantype_days']
                    let allBantypes = {};
                    for (let i = 0; i < bantype_days.length; i++) {
                        let bantypeDay = bantype_days[i]
                        allBantypes[bantypeDay['bantype']] = i;
                    }

                    if (allBantypes[bantype]) {
                        bantype_days[allBantypes[bantype]]['days'].push(xingQi);
                    } else {
                        bantype_days.push({bantype: bantype, days: [xingQi]})
                    }
                }
            } else {
                console.error(`没有找到对应的单元格: ${dateRange}, ${sequence}`);
            }
        }

        this.renderTableCell();
    }

    renderTableCell() {
        for (let targetCellsKey in this.targetCells) {
            let targetCell = this.targetCells[targetCellsKey];
            let name = targetCell['name'];
            let tableCell = targetCell['tableCell'];
            let bantype_days = targetCell['bantype_days'];

            this.getLabelBar(name, bantype_days, tableCell);
        }
    }

    getLabelBar(name, bantype_days, tableCell) {
        let divLabelBar = document.createElement('div');
        divLabelBar.classList.add('container');
        divLabelBar.classList.add('label-bar');

        let divLabelText = document.createElement('div');
        divLabelText.classList.add('label-text');
        divLabelText.textContent = `${name}`;

        let divRow = document.createElement('div');
        divRow.classList.add('row');

        for (let i = 0; i < 7; i++) {
            let divCol = document.createElement('div');
            divCol.classList.add('col')

            for (let bantypeDay of bantype_days) {
                let bantype = bantypeDay['bantype'];
                let days_list = bantypeDay['days'];

                if (days_list.includes(i)) {
                    divCol.style.backgroundColor = this.banTypeColor[bantype];
                    divCol.style.borderColor = '#dee2e6';

                    // 加点数据
                    divCol.dataset.index = i;
                    divCol.dataset.name = name;
                    divCol.dataset.bantype = bantype;

                    break;
                }
            }
            divRow.appendChild(divCol);
        }

        divLabelBar.appendChild(divRow);
        divLabelBar.appendChild(divLabelText);
        tableCell.appendChild(divLabelBar);

        //let templateLabelBar = `<div class="container label-bar">
        //    <div class="row">
        //        <div class="col"></div>
        //        <div class="col"></div>
        //        <div class="col"></div>
        //        <div class="col"></div>
        //        <div class="col"></div>
        //        <div class="col"></div>
        //        <div class="col"></div>
        //    </div>
        //    <div class="label-text">${name}</div>
        //</div>`
    }

    recoverModal(srcCell) {
        this.bookingModalLabel.textContent = '（审查）' + this.bookingModalLabel.textContent.split('）').at(-1);
        let srcCellChildren = srcCell.children;

        // 接下来模拟点击事件
        if (srcCellChildren.length === 1) {
            this.reserveMode0.click();
            let srcCellChild = srcCellChildren[0];

            let colEls = srcCellChild.querySelectorAll('.col[data-index]')
            for (let colEl of colEls) {
                let index = colEl.dataset.index;
                let name = colEl.dataset.name;
                let bantype = colEl.dataset.bantype;

                this.currentPerson = name
                this.bookingPerson0.textContent = name;
                this.bookingDateAllCB[index].checked = true;
                this.bookingDateAllCB[index].dispatchEvent(new Event('change', {bubbles: true}));  // 手动触发 change 事件
                this.relaxType[index].querySelectorAll('.dropdown-item').forEach(item => {
                    if (item.textContent === bantype) {
                        item.click();
                    }
                })

            }
        } else {
            this.reserveMode1.click();
            for (let i = 0; i < srcCellChildren.length; i++) {
                let srcCellChild = srcCellChildren[i];
                let colEls = srcCellChild.querySelectorAll('.col[data-index]')

                for (let colEl of colEls) {
                    let index = colEl.dataset.index;
                    let name = colEl.dataset.name;
                    let bantype = colEl.dataset.bantype;

                    this[`bookingPerson${i}`].textContent = name;
                    this[`bookingPerson${i}`].disabled = false;
                    this[`bookingPerson${i}`].parentNode.style.cursor = 'pointer';
                    this[`bookingPerson${i}`].click();
                    this.bookingDateAllCB[index].checked = true;
                    this.bookingDateAllCB[index].dispatchEvent(new Event('change', {bubbles: true}));
                    this.relaxType[index].querySelectorAll('.dropdown-item').forEach(item => {
                        if (item.textContent === bantype) {
                            item.click();
                        }
                    })
                }
            }
        }
    }

    deleteData(result) {
        // 获取token
        const token = getToken();
        if (!token) {
            loginExpiredAlert()
            return;
        }

        // 向服务器发请求
        fetch('/delete-reserve', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result)
        }).then(response =>
            response.json().then(data => {
                if (response.ok) {
                    showAlert({
                        type: 'success',
                        title: '删除成功！',
                        message: data.detail,
                    });

                    // 隐藏对话框
                    const modalInstance = bootstrap.Modal.getInstance(this.bookingModal);
                    modalInstance.hide();

                    // 获取数据
                    this.getData();
                } else {
                    showAlert({
                        type: 'danger',
                        title: '删除失败！',
                        message: data.detail,
                    });
                }
            })
        ).catch(error => {
            alert('删除失败！未知错误！');
            console.error(error);
        })
    }
}

let iVT;

function setAllDropdownToggleYear(year) {
    let dropdownToggles = document.querySelectorAll('#reserve-content-all .dropdown-toggle');
    for (let dropdownToggle of dropdownToggles) {
        dropdownToggle.textContent = year;
    }
}

function chooseVacationTableYear() {
    let dropdownItems = document.querySelectorAll('#reserve-content-all .dropdown-item.custom-select-item');

    dropdownItems.forEach(item => {
        item.addEventListener('click', (event) => {
            const elementThis = event.currentTarget;
            let year = elementThis.textContent;
            setAllDropdownToggleYear(year)

            iVT.init_year = year;
            iVT.init();
        });
    })
}

document.addEventListener('DOMContentLoaded', () => {
    let today = new Date();
    let year = today.getFullYear();

    setAllDropdownToggleYear(year)
    iVT = new InitVacationTable(year);
    iVT.init();

    chooseVacationTableYear()
})


