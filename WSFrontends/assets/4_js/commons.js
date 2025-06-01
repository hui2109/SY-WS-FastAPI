function getToken() {
    // 获取token
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        // 如果没有令牌，重定向到登录页面
        loginExpiredAlert();
        window.location.href = '/login';
        return;
    }
    return token;
}

function goThroughDate(startDate, endDate) {
    const dates = [];
    let current = startDate.startOf('day');
    const final = endDate.startOf('day');

    while (current <= final) {
        dates.push(current);
        current = current.add(1, 'day');
    }

    return dates;
}

// 根据dateLabel标签的位置, 改变日期选择器(.tempus-dominus-widget)弹出的位置
function adjustDatePickerPosition(dateLabel) {
    let datePicker = document.querySelector('.tempus-dominus-widget.show');
    const datePickerRect = datePicker.getBoundingClientRect();
    const dateLabelRect = dateLabel.getBoundingClientRect();
    let new_x = dateLabelRect.x + (dateLabelRect.width / 2) - (datePickerRect.width / 2);
    let new_y = dateLabelRect.y + dateLabelRect.height + 20;

    // 设置新的位置
    datePicker.style.setProperty('--td-left', `${new_x}px`);
    datePicker.style.setProperty('--td-top', `${new_y}px`);
}

function getWeekMap() {
    return {
        0: '周日',
        1: '周一',
        2: '周二',
        3: '周三',
        4: '周四',
        5: '周五',
        6: '周六',
    };
}

function getBanTypeColor() {
    return {
        'NA': '#e9ecef',

        // 1系列班次（蓝色系 - 适中饱和度）
        '1A': '#5b9bd5',
        '1B': '#4472c4',
        '1C': '#2f5597',

        // 2系列班次（绿色系 - 适中饱和度）
        '2A': '#70ad47',
        '2B': '#548235',
        '2C': '#375623',

        // 3系列班次（粉色系 - 适中饱和度）
        '3A': '#b85798',
        '3B': '#9a4480',
        '3C': '#7c3168',

        // S系列班次（橙色系 - 适中饱和度）
        'S1': '#d97532',
        'S2': '#c65911',

        // N系列夜班（紫色系 - 适中饱和度）
        'N1': '#8e44ad',
        'N2': '#7d3c98',

        // 培训相关（棕色系 - 适中饱和度）
        '进修': '#bf9000',
        '培训': '#a67c00',
        '机动': '#8d6700',

        // 休息（淡灰色系）
        '休息': '#adb5bd',

        // 休假类（鲜艳突出色系）
        '放射假': '#0d6efd',
        '年假': '#198754',
        '病假': '#fd7e14',
        '事假': '#ffc107',
        '婚假': '#d63384',
        '产假': '#dc3545',
        '陪产假': '#6610f2',
        '育儿假': '#0dcaf0',
        '丧假': '#6c757d',
        '补假': '#20c997',
        '其他假': '#e83e8c',

        // 加班类（红色系 - 适中饱和度）
        'OAE': '#d63384',
        'OBE': '#c2185b',
        'OCE': '#ad1457',
        'OAF': '#e91e63',
        'OBF': '#f06292',
        'OCF': '#f8bbd9',
        'OTR': '#8e24aa',
        'OTB': '#7b1fa2',
        'OVB': '#6a1b9a',
        'Phy': '#ff5722'
    };
}
