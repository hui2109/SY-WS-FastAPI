"use strict";

class InitMineCards {
    constructor(today) {
        this.today = today
    }

    init() {
        this.getStartEndDate();
        // this.getRecordsFromServer();
        this.generateCardDates();
    }

    getStartEndDate() {
        const firstDay = new Date(this.today.getFullYear(), this.today.getMonth(), 1, 10, 0, 0, 0);
        const firstDayOfWeek = firstDay.getDay();
        const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        this.startDate = new Date(firstDay);
        this.startDate.setDate(firstDay.getDate() - daysToSubtract);

        const lastDay = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0, 10, 0, 0, 0);
        const lastDayOfWeek = lastDay.getDay();
        const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
        this.endDate = new Date(lastDay);
        this.endDate.setDate(lastDay.getDate() + daysToAdd);

        this.dateList = goThroughDate(this.startDate, this.endDate);
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
        fetch('/select-my-month-schedule', {
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
            console.log(this.records);
        })
    }

    generateCardDates() {
        let swiper_wrapper = document.querySelector('.swiper-wrapper');
        for (let i = 0; i < this.dateList.length; i = i + 7) {
            let div_slide = document.createElement('div');
            div_slide.classList.add('swiper-slide');

            let div_card = document.createElement('div');
            div_card.classList.add('card');

            let div_date_row = document.createElement('div');
            div_date_row.classList.add('date-row');

            let div_info_row = document.createElement('div');
            div_info_row.classList.add('info-row');

            for (let j = 0; j < 7; j++) {
                let div_date_item = document.createElement('div');
                div_date_item.classList.add('date-item');
                div_date_item.textContent = this.dateList[i + j].getDate();

                let div_info_item = document.createElement('div');
                div_info_item.classList.add('info-item');

                div_date_row.appendChild(div_date_item)
            }

            div_card.appendChild(div_date_row);
            div_slide.appendChild(div_card);
            swiper_wrapper.appendChild(div_slide)
        }
    }

    getInfoItem(date) {
        // 如果根本没有记录, 证明这个人完全没有排班
        if (Object.keys(this.records).length === 0) {
            return null;
        }

        let name = Object.keys(this.records)[0].split('_')[0]
        let _key = `${name}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`
        let info_list = this.records[_key];

        let div_info_row = document.createElement('div');
        div_info_row.classList.add('info-row');

        for (let info_dict of info_list) {
            let coworkers = info_dict['coworkers']
            let div_info_item = document.createElement('div');
            div_info_item.classList.add('info-item');

            for (let i = -1; i < coworkers.length; i++) {
                let div_info = document.createElement('div');
                if (i === -1) {
                    div_info.textContent = info_dict['ban']
                } else {
                    div_info.textContent = coworkers[i]
                }
                div_info_item.appendChild(div_info)
            }
            div_info_row.appendChild(div_info_item);
        }
    }

}


let iMCs = new InitMineCards(new Date());
iMCs.init();