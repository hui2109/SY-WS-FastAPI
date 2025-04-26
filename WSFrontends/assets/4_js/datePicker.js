"use strict";
let dateLabel = document.querySelector('#work-content-all .mounianmouyue');
let preMonth = document.querySelector('#work-content-all .pre-month');
let nextMonth = document.querySelector('#work-content-all .next-month');
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
