class InitVacationTable {
    init() {
        this.modifyHalfTableHead('firstHalfTableHead', 2025, 1, 2025, 6);
        this.generateTableRows('firstHalfTableBody', 10);

        this.modifyHalfTableHead('secondHalfTableHead', 2025, 7, 2025, 12, 6);
        this.generateTableRows('secondHalfTableBody', 10);

        this.lookForElement();
        this.bindClickEvent();
    }

    modifyHalfTableHead(_id, startYear, startMonth, endYear, endMonth, delta = null) {
        [this.GroupedDates, this.GroupedDatesObj] = generateWeeklyGroups(startYear, startMonth, endYear, endMonth);

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
                cell.className = 'clickable-cell';
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
            console.log('哈哈哈', result);
            return result;

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

        dropdownButtons.forEach(button => {
            button.textContent = button.dataset.default;
        })

        bookingDateAllCB.forEach(checkbox => {
            checkbox.checked = false;
        })

        this.inputHiddens.forEach(input => {
            if (input.id !== 'bookingSequence' && input.id !== 'bookingPerson0') {
                input.value = 'wu';
            }
        })
    }

    handleCellClick(et) {
        let srcCell = et.target;
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

        // 模拟 [独立预约方式] 的点击事件
        this.reserveMode[0].click();

        const modalInstance = new bootstrap.Modal(bookingModal);
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

        return {bookingSequence, bookingPerson, relaxType, bookingDates};
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
}

let iVT = new InitVacationTable();
iVT.init();
