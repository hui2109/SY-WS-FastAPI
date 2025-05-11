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

        //this.getReserveData();

        console.log(this.true_day_start, this.true_day_end);
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
        this.bookingPerson = this.bookingModal.querySelectorAll('.modal-body .bookingPerson>div')
        this.bookingDate = this.bookingModal.querySelectorAll('.modal-body .bookingDate>li')
        this.relaxType = this.bookingModal.querySelectorAll('.modal-body .bookingDate>li>div:nth-of-type(2)')
        this.inputHiddens = this.bookingModal.querySelectorAll('.modal-body .bookingDate>li>input')
        this.bookingDateAllCB = this.bookingModal.querySelectorAll('.modal-body .bookingDate>li input[type="checkbox"]')
        this.reserveMode = this.bookingModal.querySelectorAll('.modal-body .reserveMode>li')

        this.resetBooking = document.getElementById('resetBooking');
        this.bookingPersonHD0 = document.getElementById('bookingPersonHD0')
        this.weekMap = {
            0: '周日',
            1: '周一',
            2: '周二',
            3: '周三',
            4: '周四',
            5: '周五',
            6: '周六',
        };
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
        this.bookingPerson[0].querySelector('button').textContent = sessionStorage.getItem('user_name');

        // 判断单元格上是否已有预约
        if (srcCell.children.length === 0) {
            // 模拟 [独立预约方式] 的点击事件
            this.reserveMode[0].click();
        } else {
            //this.loadExistReserve(srcCell);
        }

        const modalInstance = new bootstrap.Modal(this.bookingModal);
        modalInstance.show();
    }

    bindClickEvent() {
        // 处理 [重置按钮] 点击事件
        this.resetBooking.addEventListener('click', () => {
            this._resetAll();
        })

        // 处理 [独立预约方式] 点击事件
        this.reserveMode[0].addEventListener('click', () => {
            this.bookingPerson[0].querySelector('button').classList.add('btn-success');
            this.bookingPerson[0].querySelector('button').classList.remove('btn-outline-success');
            this.bookingPerson[0].querySelector('button').disabled = true;

            this.bookingPerson[1].classList.add('d-none');
            this.bookingPerson[2].classList.add('d-none');
            this._resetAll();
        })

        // 处理 [拼假预约方式] 点击事件
        this.reserveMode[1].addEventListener('click', () => {
            this.bookingPerson[0].querySelector('button').classList.remove('btn-success');
            this.bookingPerson[0].querySelector('button').classList.add('btn-outline-success');
            this.bookingPerson[0].querySelector('button').disabled = false;

            this.bookingPerson[1].classList.remove('d-none');
            this.bookingPerson[2].classList.remove('d-none');
            this._resetAll();
        })

        // 处理 [休假类型] 点击事件
        for (let i = 0; i < this.relaxType.length; i++) {
            const relaxDropdownButton = this.relaxType[i].querySelector('button');
            const relaxDropdownItems = this.relaxType[i].querySelectorAll('.dropdown-item');
            const inputHidden = relaxDropdownButton.parentNode.parentNode.querySelector('input[type="hidden"]');

            relaxDropdownItems.forEach(item => {
                item.addEventListener('click', function () {
                    // 更新按钮文字
                    relaxDropdownButton.textContent = this.textContent;
                    inputHidden.dataset.relax = this.textContent;
                })
            })
        }

        // 处理 [预约日期] 点击事件
        this.bookingDateAllCB.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const inputHidden = this.parentNode.parentNode.querySelector('input[type="hidden"]');
                if (this.checked) {
                    inputHidden.dataset.date = this.value;
                } else {
                    inputHidden.dataset.date = 'wu';
                }
            });
        });

        // 处理  [预约人0]  的点击事件
        this.bookingPerson[0].active = function () {
            console.log(this.classList);
            debugger
        }

        this.bookingPerson[0].addEventListener('click', function () {
            this.active();
        })

    }
}

let iVT = new InitVacationTable(2025);
iVT.init();
