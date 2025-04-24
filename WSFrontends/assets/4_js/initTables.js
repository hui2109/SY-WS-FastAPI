"use strict";

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

class InitTables {
    constructor(today) {
        this.today = today
    }

    init() {
        this.getStartEndDate();
        this.getRecordsFromServer();
    }

    getStartEndDate() {
        this.startDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1, 10, 0, 0, 0);
        this.endDate = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0, 10, 0, 0, 0);

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
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            // 如果没有令牌，重定向到登录页面
            window.location.href = '/login';
            return null;
        }
        let data = {
            month_start: this.startDate,
            month_end: this.endDate
        }
        console.log(JSON.stringify(data))
        fetch('/select-month-schedule', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                console.error('请求失败:', response.status, response.statusText);
                window.location.href = '/login';
                throw new Error('请求失败');
            }
        ).then(data => {
            this.records = data;
            this.lookElement();
            this.generateThead();
            this.generateTbody();
            // this.checkForRestDays();
        })
    }

    lookElement() {
        this.paibanTable = document.querySelector('.paiban-table');
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
                    th.textContent = '无数据'
                    th.style.backgroundColor = 'var(--bs-danger)';
                } else {
                    th.textContent = '已发布'
                }
                tr.appendChild(th);
                continue;
            }

            let div1 = document.createElement('div'); // 写星期
            let div2 = document.createElement('div'); // 写日子
            div1.textContent = this.dayMaps[this.dateList[i].getDay()];
            div2.textContent = String(this.dateList[i].getDate());
            th.appendChild(div1);
            th.appendChild(div2);
            tr.appendChild(th);
        }
        thead.appendChild(tr);
    }

    generateTbody() {
        let tbody = this.paibanTable.querySelector('tbody');
        tbody.innerHTML = '';

        let daysNum = this.dateList.length;
        let personnel_list = this.records['personnels']

        for (let i = 0; i < personnel_list.length; i++) {
            let tr = document.createElement('tr');
            let td = document.createElement('td');
            let name = personnel_list[i];
            console.log(name)

            td.textContent = name;
            tr.appendChild(td);

            for (let j = 0; j < daysNum; j++) {
                td = document.createElement('td');
                let currDate = this.dateList[j]
                let _key = `${name}_${currDate.getFullYear()}_${currDate.getMonth() + 1}_${currDate.getDate()}`
                let _value_list = this.records[_key]

                if (_value_list === undefined) {
                    td.textContent = 'null'
                } else {
                    for (let _value of _value_list) {
                        let div = document.createElement('div')
                        div.textContent = _value
                        td.appendChild(div)
                    }
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

let iTs = new InitTables(new Date());
iTs.init();
