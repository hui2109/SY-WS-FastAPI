class InitVacationTable {
    constructor(year) {
        this.true_day_start = dayjs(`2099-01-01`);
        this.true_day_end = dayjs(`1900-01-01`);
        this.init_year = year;
    }

    init() {
        this.modifyHalfTableHead('firstHalfTableHead', this.init_year, 1, this.init_year, 6);
        this.generateTableRows('firstHalfTableBody', 10);

        this.modifyHalfTableHead('secondHalfTableHead', this.init_year, 7, this.init_year, 12, 6);
        this.generateTableRows('secondHalfTableBody', 10);

        this.lookForElement();
        this.bindClickEvent();

        this.getReserveData();

        console.log(this.true_day_start, this.true_day_end);
    }

    modifyHalfTableHead(_id, startYear, startMonth, endYear, endMonth, delta = null) {
        [this.GroupedDates, this.GroupedDatesObj] = generateWeeklyGroups(startYear, startMonth, endYear, endMonth);
        [this.day_start, this.day_end] = this.getStartEndDates();
        if (this.day_start <= this.true_day_start) {
            this.true_day_start = this.day_start;
        }
        if (this.day_end >= this.true_day_end) {
            this.true_day_end = this.day_end;
        }

        console.log(this.GroupedDates)
        console.log(this.GroupedDatesObj)

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
                cell.dataset.dateRange = this.getCellDateRange(j);
                cell.addEventListener('click', (et) => {
                    this.handleCellClick(et);
                });
                row.appendChild(cell);
            }
            tableBody.appendChild(row);
        }
    }

    getCellDateRange(colNum) {
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

    lookForElement() {
        this.bookingModal = document.getElementById('bookingModal');
        this.bookingModalLabel = document.getElementById('bookingModalLabel');
        this.bookingPerson = this.bookingModal.querySelectorAll('.modal-body .bookingPerson>li')
        this.bookingDate = this.bookingModal.querySelectorAll('.modal-body .bookingDate li')
        this.relaxType = this.bookingModal.querySelectorAll('.modal-body .relaxType>li')
        this.reserveMode = this.bookingModal.querySelectorAll('.modal-body .reserveMode input')
        this.resetBooking = document.getElementById('resetBooking');
        this.weekMap = {
            0: '周日',
            1: '周一',
            2: '周二',
            3: '周三',
            4: '周四',
            5: '周五',
            6: '周六',
        };

        this.bookingSequence = document.getElementById('bookingSequence');
        this.bookingPerson0 = document.getElementById('bookingPerson0');
        this.bookingPerson1 = document.getElementById('bookingPerson1');
        this.bookingPerson2 = document.getElementById('bookingPerson2');
        this.relaxType0 = document.getElementById('relaxType0');
        this.relaxType1 = document.getElementById('relaxType1');
        this.relaxType2 = document.getElementById('relaxType2');
        this.confirmBooking = document.getElementById('confirmBooking');
        this.inputHiddens = document.querySelectorAll('.modal-content input[type="hidden"]');
    }

    bindClickEvent() {
        // 处理 [独立预约方式] 点击事件
        this.reserveMode[0].addEventListener('click', () => {
            for (let i = 1; i < this.bookingPerson.length; i++) {
                this.bookingPerson[i].classList.add('d-none')
                this.relaxType[i].classList.add('d-none')
            }
            for (const bookingDateLi of this.bookingDate) {
                bookingDateLi.children[1].classList.add('d-none');
            }
            this.resetAll();
        })

        // 处理 [拼假预约方式] 点击事件
        this.reserveMode[1].addEventListener('click', () => {
            for (let i = 1; i < this.bookingPerson.length; i++) {
                this.bookingPerson[i].classList.remove('d-none')
                this.relaxType[i].classList.remove('d-none')
            }
            for (const bookingDateLi of this.bookingDate) {
                bookingDateLi.children[1].classList.remove('d-none');
            }
            this.resetAll();
        })

        // 处理 [重置按钮] 点击事件
        this.resetBooking.addEventListener('click', () => {
            this.resetAll();
        });

        // 处理 [确认预约] 点击事件
        this.confirmBooking.addEventListener('click', () => {
            this.uncheckData = {};
            this.inputHiddens.forEach(inputHidden => {
                this.uncheckData[inputHidden.id] = inputHidden.value
            })
            console.log(this.uncheckData);

            // 确认必填字段是否填了
            // 首先判断预约模式
            let result;
            const selectedReserveMode = document.querySelector('input[name="reserveModeRadio"]:checked'); // 获取选中的 radio
            if (selectedReserveMode.value === '0') {
                result = this.checkShareFormValidation(1)
                if (result.length === 0) return;
            } else {
                // 拼假预约方式
                // 首先判断想要预约几个人
                let index = 1;
                for (let j = 1; j < this.bookingPerson.length; j++) {
                    const hiddenInput = this.bookingPerson[j].querySelector('input[type="hidden"]');
                    if (hiddenInput.value !== 'wu') {
                        index += 1;
                    }
                }
                result = this.checkShareFormValidation(Math.max(index, 2))
                if (result.length === 0) return;
            }

            this.sendData(result);
        })

        // 处理  [预约人]  的点击事件
        for (let j = 1; j < this.bookingPerson.length; j++) {
            let dropdownButton = this.bookingPerson[j].querySelector('button');
            let dropdownItems = this.bookingPerson[j].querySelectorAll('.dropdown-item');
            const relaxDropdownButton = this.relaxType[j].querySelector('button');
            const hiddenInput = this.bookingPerson[j].querySelector('input[type="hidden"]');

            // 给每个下拉项绑定点击事件
            dropdownItems.forEach(item => {
                item.addEventListener('click', (event) => {
                    // 使用 event.currentTarget 代替事件元素的 this
                    const elementThis = event.currentTarget;

                    // 更新按钮文字
                    dropdownButton.textContent = elementThis.textContent;
                    hiddenInput.value = elementThis.textContent;

                    // 同步更新休假类型中的名字
                    relaxDropdownButton.textContent = elementThis.textContent;

                    // 同步更新日期中的 拼假人 名字
                    for (let k = 0; k < this.bookingDate.length; k++) {
                        const bookingDateLabel = this.bookingDate[k].querySelectorAll('label')[j];
                        bookingDateLabel.textContent = elementThis.textContent;
                    }
                });
            });
        }

        // 处理 [休假类型] 点击事件
        for (let j = 0; j < this.relaxType.length; j++) {
            const relaxDropdownButton = this.relaxType[j].querySelector('button');
            const relaxDropdownItems = this.relaxType[j].querySelectorAll('.dropdown-item');
            const hiddenInput = this.relaxType[j].querySelector('input[type="hidden"]');

            // 单独处理第一个休假类型的点击事件
            if (j === 0) {
                relaxDropdownItems.forEach(item => {
                    item.addEventListener('click', function () {
                        // 更新按钮文字
                        relaxDropdownButton.textContent = this.textContent;
                        hiddenInput.value = this.textContent;
                    })
                })
            } else {
                relaxDropdownItems.forEach(item => {
                    item.addEventListener('click', function () {
                        // 更新按钮文字
                        let personName = relaxDropdownButton.textContent.split(' - ')[0]
                        relaxDropdownButton.textContent = personName + ' - ' + this.textContent;
                        hiddenInput.value = this.textContent;
                    })
                })
            }
        }

        // 处理 [预约日期] 点击事件
        for (const bookingDateLi of this.bookingDate) {
            const checkboxes = bookingDateLi.querySelectorAll('input[type="checkbox"]');

            // 这3个checkbox为一组, 需要互斥
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function () {
                    const hiddenInput = checkbox.parentNode.querySelector('input[type="hidden"]');
                    if (this.checked) {
                        hiddenInput.value = this.value;
                        checkboxes.forEach(otherCheckbox => {
                            if (otherCheckbox !== this) {
                                otherCheckbox.checked = false;
                                otherCheckbox.parentNode.querySelector('input[type="hidden"]').value = 'wu';
                            }
                        });
                    } else {
                        hiddenInput.value = 'wu';
                    }
                });
            });
        }
    }

    resetAll() {
        const dropdownButtons = this.bookingModal.querySelectorAll('.dropdown-toggle');
        const bookingDateAllCB = document.querySelectorAll('.bookingDate input[type="checkbox"]');
        const bookingDateLabels = document.querySelectorAll('.bookingDate label[data-default]');

        dropdownButtons.forEach(button => {
            button.textContent = button.dataset.default;
        })

        bookingDateAllCB.forEach(checkbox => {
            checkbox.checked = false;
        })

        bookingDateLabels.forEach(bookingDateLabel => {
            bookingDateLabel.textContent = bookingDateLabel.dataset.default;
        })

        this.inputHiddens.forEach(input => {
            if (input.id !== 'bookingSequence' && input.id !== 'bookingPerson0') {
                input.value = 'wu';
            }
        })
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
            const bookingDateLabel = this.bookingDate[i].querySelectorAll('label')[0];
            const bookingDateCheckboxes = this.bookingDate[i].querySelectorAll('input[type="checkbox"]');

            bookingDateLabel.textContent = `${dateList[i].format('YYYY年M月D日')}（${this.weekMap[dateList[i].day()]}）`;
            for (const bookingDateCheckbox of bookingDateCheckboxes) {
                bookingDateCheckbox.value = dateList[i].format('YYYY-MM-DD');
            }
        }

        // 更新顺序位
        this.bookingSequence.value = serialNum;
        this.bookingModalLabel.textContent = '预约休假' + ' -- ' + `第 ${serialNum} 优先位`

        // 更新本人
        this.bookingPerson[0].querySelector('button').textContent = sessionStorage.getItem('user_name');
        this.bookingPerson0.value = sessionStorage.getItem('user_name');

        // 判断单元格上是否已有预约
        if (srcCell.children.length === 0) {
            // 模拟 [独立预约方式] 的点击事件
            this.reserveMode[0].click();
        } else {
            this.loadExistReserve(srcCell);
        }

        const modalInstance = new bootstrap.Modal(this.bookingModal);
        modalInstance.show();
    }

    checkSingleFormValidation(index) {
        let bookingSequence = this.uncheckData['bookingSequence'];
        let bookingPerson = this.uncheckData[`bookingPerson${index}`];
        let relaxType = this.uncheckData[`relaxType${index}`];
        let bookingDates = []
        for (let i = 0; i < 7; i++) {
            let bookingDate = this.uncheckData[`bookingDate${index}${i}`];
            if (bookingDate !== 'wu') {
                bookingDates.push(bookingDate);
            }
        }

        if (bookingPerson === 'wu') {
            showAlert({
                type: 'danger',
                title: '预约失败！',
                message: '拼假模式下，至少选择2名预约人！',
                parentNode: this.bookingModal,
            });
            return false;
        }
        if (bookingDates.length === 0 || relaxType === 'wu') {
            showAlert({
                type: 'danger',
                title: '预约失败！',
                message: '每个预约人至少选择一个预约日期和休假类型！',
                parentNode: this.bookingModal,
            });
            return false;
        }

        //return {bookingSequence, bookingPerson, relaxType, bookingDates};
        return {'sequence': bookingSequence, 'name': bookingPerson, 'ban': relaxType, 'reserve_dates': bookingDates};
    }

    checkShareFormValidation(maxIndex) {
        let pureData = []
        for (let i = 0; i < maxIndex; i++) {
            let res = this.checkSingleFormValidation(i);
            if (res) {
                pureData.push(res);
            } else {
                return []
            }
        }
        return pureData
    }

    sendData(result) {
        // 获取token
        const token = getToken();
        if (!token) {
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
                    const modalInstance = bootstrap.Modal.getInstance(this.bookingModal);
                    modalInstance.hide();
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

    getStartEndDates() {
        let year = Object.keys(this.GroupedDates)[0];
        let month_start = Object.keys(this.GroupedDates[year])[0];
        let month_end = Object.keys(this.GroupedDates[year])[Object.keys(this.GroupedDates[year]).length - 1];
        let day_start = this.GroupedDatesObj[year][month_start][0][0];
        let day_end = this.GroupedDatesObj[year][month_end][Object.keys(this.GroupedDates[year][month_end]).length - 1][1];

        return [day_start, day_end];
    }

    getReserveData() {
        let data = {
            month_start: this.true_day_start,
            month_end: this.true_day_end,
        }
        // 获取token
        const token = getToken();
        if (!token) {
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
                this.server_reserve_data = data;
                console.log(this.server_reserve_data);
                this.renderTableCells();
            })
        })

    }

    renderTableCells() {
        let tableCells = document.querySelectorAll('#reserve-content-all .clickable-cell');
        let tryCell = tableCells[0];
        //tryCell.innerHTML = `
        //<div class="container position-relative" style="height: 40%;">
        //    <div class="row h-100">
        //        <div class="col-3 bg-success p-0"></div>
        //        <div class="col-6 bg-warning p-0"></div>
        //        <div class="col-3 bg-primary p-0"></div>
        //    </div>
        //    <div class="position-absolute" style="top: 50%;left: 50%;transform: translate(-50%, -50%);font-size: 12px;color: #a52834">张旭辉</div>
        //</div>
        //`;

        tryCell.innerHTML += `
        <div class="container label-bar">
            <div class="row">
                <div class="col" style="background-color:transparent;"></div>
                <div class="col" style="background-color:transparent;"></div>
                <div class="col" style="background-color:transparent;"></div>
                <div class="col" style="background-color:transparent;"></div>
                <div class="col" style="background-color:transparent;"></div>
                <div class="col" style="background-color:transparent;"></div>
                <div class="col" style="background-color:transparent;"></div>
            </div>
            <div class="label-text">张旭辉</div>
        </div>
        `;

        tryCell.innerHTML += `
        <div class="container label-bar">
            <div class="row">
                <div class="col bg-success"></div>
                <div class="col bg-warning"></div>
                <div class="col bg-primary"></div>
                <div class="col bg-danger"></div>
                <div class="col bg-body"></div>
                <div class="col bg-info"></div>
                <div class="col bg-black"></div>
            </div>
            <div class="label-text">廖中凡</div>
        </div>
        `;

        tryCell.innerHTML += `
        <div class="container label-bar">
            <div class="row">
                <div class="col bg-success"></div>
                <div class="col bg-warning"></div>
                <div class="col bg-primary"></div>
                <div class="col bg-danger"></div>
                <div class="col bg-body"></div>
                <div class="col bg-info"></div>
                <div class="col bg-black"></div>
            </div>
            <div class="label-text">曾小洲</div>
        </div>
        `;
        // 以上都是无用的


        this.targetCells = {}
        if (this.server_reserve_data.length === 0) {
            return;
        }
        this.getBanTypeColor();

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
            if (xingQi !== 0) {
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
                    let bantype_days = this.targetCells[index]['bantype_days']
                    for (let bantypeDay of bantype_days) {
                        if (bantype === bantypeDay['bantype']) {
                            bantypeDay['days'].push(xingQi);
                        } else {
                            bantype_days.push({bantype: bantype, days: [xingQi]})
                        }
                    }
                }
            } else {
                console.error(`没有找到对应的单元格: ${dateRange}, ${sequence}`);
            }
        }

        console.log(this.targetCells)
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

    getBanTypeColor() {
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

    loadExistReserve(srcCell) {
        this.bookingModalLabel.textContent = '（审查）' + this.bookingModalLabel.textContent.split('）').at(-1);
        let srcCellChildren = srcCell.children;

        // 隐藏预约方式
        document.getElementById('bookingContent').children[0].classList.add('d-none');
        document.getElementById('bookingContent').children[1].classList.add('d-none');
        document.getElementById('bookingContent').children[2].classList.remove('mt-4');
        document.getElementById('bookingContent').children[2].classList.add('mt-0');

        if (srcCellChildren.length === 1) {
            this.reserveMode[0].click();

            let childLabelBar = srcCellChildren[0];
            let childCols = childLabelBar.querySelectorAll('.col[data-index]');
            for (let i = 0; i < childCols.length; i++) {
                let childCol = childCols[i];
                let index = childCol.dataset.index;
                let name = childCol.dataset.name;
                let bantype = childCol.dataset.bantype;

                this.bookingPerson0.value = name;
                this.bookingDate[index].querySelectorAll('input[type="checkbox"]')[0].checked = true;
                this.relaxType0.parentNode.querySelector('button').textContent = bantype;
            }
        } else {
            this.reserveMode[1].click();
        }

    }
}

let iVT = new InitVacationTable(2025);
iVT.init();
