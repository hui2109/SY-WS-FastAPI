function handleCellClick(et) {
    const bookingModal = document.getElementById('bookingModal');
    const bookingModalLabel = document.getElementById('bookingModalLabel');
    const bookingPerson = bookingModal.querySelectorAll('.modal-body .bookingPerson>li')
    const bookingDate = bookingModal.querySelectorAll('.modal-body .bookingDate li')
    const relaxType = bookingModal.querySelectorAll('.modal-body .relaxType>li')

    const reserveMode = bookingModal.querySelectorAll('.modal-body .reserveMode input')

    let srcCell = et.target;
    let [startDay, endDay] = srcCell.dataset.dateRange.split(',');
    let serialNum = srcCell.dataset.serialNum;

    startDay = dayjs(startDay);
    endDay = dayjs(endDay);
    let currentDay = startDay;
    let dateList = [];
    while (currentDay <= endDay) {
        dateList.push(currentDay);
        currentDay = currentDay.add(1, 'day');
    }
    for (let i = 0; i < dateList.length; i++) {
        const bookingDateLabel = bookingDate[i].querySelectorAll('label')[0];
        bookingDateLabel.textContent = dateList[i].format('YYYY年M月D日')
    }

    bookingModalLabel.textContent = '预约休假' + ' -- ' + `第 ${serialNum} 优先位`
    bookingPerson[0].querySelector('button').textContent = sessionStorage.getItem('user_name');

    // 处理  [预约人]  的点击事件
    for (let j = 1; j < bookingPerson.length; j++) {
        let dropdownButton = bookingPerson[j].querySelector('button');
        let dropdownItems = bookingPerson[j].querySelectorAll('.dropdown-item');
        const relaxDropdownButton = relaxType[j].querySelector('button');

        // 给每个下拉项绑定点击事件
        dropdownItems.forEach(item => {
            item.addEventListener('click', function () {
                // 更新按钮文字
                dropdownButton.textContent = this.textContent;

                // 同步更新休假类型中的名字
                relaxDropdownButton.textContent = this.textContent;

                // 同步更新日期中的 拼假人 名字
                for (let k = 0; k < bookingDate.length; k++) {
                    const bookingDateLabel = bookingDate[k].querySelectorAll('label')[j];
                    bookingDateLabel.textContent = this.textContent;
                }
            });
        });
    }

    // 处理 [休假类型] 点击事件
    for (let j = 1; j < relaxType.length; j++) {
        const relaxDropdownButton = relaxType[j].querySelector('button');
        const relaxDropdownItems = relaxType[j].querySelectorAll('.dropdown-item');

        relaxDropdownItems.forEach(item => {
            item.addEventListener('click', function () {
                // 更新按钮文字
                let personName = relaxDropdownButton.textContent.split(' - ')[0]

                relaxDropdownButton.textContent = personName + ' - ' + this.textContent;
            })
        })

        const modalInstance = new bootstrap.Modal(bookingModal);
        modalInstance.show();
    }

    // 处理 [独立预约方式] 点击事件
    reserveMode[0].addEventListener('click', function () {
        for (let i = 1; i < bookingPerson.length; i++) {
            bookingPerson[i].classList.add('d-none')
            relaxType[i].classList.add('d-none')
        }

        for (const bookingDateLi of bookingDate) {
            bookingDateLi.children[1].classList.add('d-none');
        }
    })

}

class InitVacationTable {
    init() {
        this.modifyHalfTableHead('firstHalfTableHead', 2025, 1, 2025, 6);
        this.generateTableRows('firstHalfTableBody', 10);

        this.modifyHalfTableHead('secondHalfTableHead', 2025, 7, 2025, 12, 6);
        this.generateTableRows('secondHalfTableBody', 10);

        // for (let i = 0; i < 26; i++) {
        //     // this.getCellDateRange(i);
        //     console.log(i, this.getCellDateRange(i));
        // }
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
                th.textContent = j
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
                cell.addEventListener('click', handleCellClick);
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
}


let iVT = new InitVacationTable();
iVT.init();
