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
    let dateList = [];
    // 创建副本，不影响原始对象
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dateList.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateList;
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
    };
}
