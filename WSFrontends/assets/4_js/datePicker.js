"use strict";
let dateLabel = document.querySelector('.mounianmouyue');
let preMonth = document.querySelector('.pre-month');
let nextMonth = document.querySelector('.next-month');
let currentDate;

preMonth.addEventListener('click', function () {
    // 获取当前月的第一天
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    updateDateLabel(currentDate);
    let uWT = new InitTables(currentDate);
    uWT.init();
});

nextMonth.addEventListener('click', function () {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    updateDateLabel(currentDate);
    let uWT = new InitTables(currentDate);
    uWT.init();
});

function updateDateLabel(date) {
    dateLabel.textContent = '';
    // 写入日期: XX年XX月
    dateLabel.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    currentDate = date;
}

// 根据dateLabel标签的位置, 改变日期选择器(.tempus-dominus-widget)弹出的位置
function adjustDatePickerPosition() {
    let datePicker = document.querySelector('.tempus-dominus-widget');
    const dateLabelRect = dateLabel.getBoundingClientRect();
    const datePickerRect = datePicker.getBoundingClientRect();
    let new_x = dateLabelRect.x + (dateLabelRect.width / 2) - (datePickerRect.width / 2);
    let new_y = dateLabelRect.y + dateLabelRect.height + 20;
    // 设置新的位置
    datePicker.style.setProperty('--td-left', `${new_x}px`);
    datePicker.style.setProperty('--td-top', `${new_y}px`);
}

document.addEventListener('DOMContentLoaded', function () {
    const element = document.getElementById('datetimepicker1');
    const datetimepicker = new tempusDominus.TempusDominus(element, {
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
    element.addEventListener('change.td', (event) => {
        updateDateLabel(event.detail.date);
        let uWT = new InitTables(currentDate);
        uWT.init();
    });
    // 文档首次加载时, 显示当前日期
    let date = new Date();
    updateDateLabel(date);
    // 监听日期显式事件
    // Emit when the date selection is changed.
    element.addEventListener('show.td', (event) => {
        adjustDatePickerPosition();
    });
});

class updateWholeTable {
    constructor(date) {
        this.date = date;
    }

    init() {
        this.getStartEndDate();
        this.lookElement();
        this.generateThead();
        this.generateTbody();
        this.checkForRestDays();
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 月份的索引从0开始
        const day = date.getDate();
        const options = {weekday: 'short'}; // 获取星期
        const weekDay = date.toLocaleDateString('zh-CN', options);
        return `${year}年-${month}月-${day}-${weekDay}`;
    }

    goThroughDate(startDate, endDate) {
        let dateList = [];
        while (startDate <= endDate) {
            let currentDate = new Date(startDate);
            dateList.push(`${formatDate(currentDate)}`);
            startDate = new Date(startDate.setDate(startDate.getDate() + 1));
        }
        return dateList;
    }

    getStartEndDate() {
        this.startDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
        this.endDate = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0);
        this.dateList = goThroughDate(this.startDate, this.endDate);
    }

    lookElement() {
        this.paibanTable = document.querySelector('.paiban-table');
    }

    generateThead() {
        this.thead_tr = this.paibanTable.querySelector('thead > tr');
        // 只保留tr下的第一个th
        while (this.thead_tr.children.length > 1) {
            this.thead_tr.removeChild(this.thead_tr.children[1]);
        }
        for (let i = 0; i < this.dateList.length; i++) {
            let th = document.createElement('th');
            let div1 = document.createElement('div'); // 写星期
            let div2 = document.createElement('div'); // 写日子
            // 2025年-2月-2-周日
            let allDateString = this.dateList[i];
            div1.textContent = allDateString.split('-')[3];
            div2.textContent = allDateString.split('-')[2];
            th.appendChild(div1);
            th.appendChild(div2);
            this.thead_tr.appendChild(th);
        }
    }

    generateTbody() {
        let daysNum = this.dateList.length;
        let tbody = this.paibanTable.querySelector('tbody');
        // 清除tbody下所有的tr
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        for (let i = 0; i < Personnel.length; i++) {
            let tr = document.createElement('tr');
            for (let j = 0; j < daysNum + 1; j++) {
                let td = document.createElement('td');
                if (j == 0) {
                    td.textContent = Personnel[i];
                } else {
                    td.textContent = '数据';
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }

    // 判断日期是否为休息日
    isRestDay(dateString) {
        // 解析日期字符串，例如："2025年-2月-2-周日"
        const date = new Date(parseInt(dateString.split('-')[0]), parseInt(dateString.split('-')[1]) - 1, // 月份的索引从0开始
            parseInt(dateString.split('-')[2]));
        // 获取星期几 (0是周日, 6是周六)
        const day = date.getDay();
        // 构造检测字符串 (没有星期)
        const dateWithoutWeek = `${date.getFullYear()}年-${date.getMonth() + 1}月-${date.getDate()}`;
        if (SpecialRestDays.includes(dateWithoutWeek)) {
            return true;
        } else if (SpecialWorkDays.includes(dateWithoutWeek)) {
            return false;
        } else {
            return day === 0 || day === 6;
        }
    }

    // 设置休息日样式
    setRestDayStyle(th, columnIndex) {
        if (this.isRestDay(this.dateList[columnIndex])) {
            // 设置表头样式
            th.style.backgroundColor = 'var(--bs-success-bg-subtle)'; // 使用Bootstrap的颜色变量
            th.style.color = 'var(--bs-success-text)';
            // 设置该列所有单元格的样式
            const tbody = this.paibanTable.querySelector('tbody');
            const rows = tbody.getElementsByTagName('tr');
            for (let i = 0; i < rows.length; i++) {
                const td = rows[i].children[columnIndex + 1]; // +1 是因为第一列是人员名字
                td.style.backgroundColor = 'var(--bs-success-bg-subtle)';
                td.style.color = 'var(--bs-success-text)';
            }
        }
    }

    // 检查并设置休息日样式
    checkForRestDays() {
        console.log(this.thead_tr.children);
        for (let i = 0; i < this.dateList.length; i++) {
            this.setRestDayStyle(this.thead_tr.children[i + 1], i);
        }
    }
}
