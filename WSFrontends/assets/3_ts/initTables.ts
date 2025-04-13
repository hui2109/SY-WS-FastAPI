console.log(Personnel);

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;  // 月份的索引从0开始
    const day = date.getDate();
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' }; // 获取星期
    const weekDay = date.toLocaleDateString('zh-CN', options);

    return `${year}年-${month}月-${day}-${weekDay}`;
}

function goThroughDate(startDate: Date, endDate: Date) {
    let dateList: string[] = [];
    while (startDate <= endDate) {
        let currentDate = new Date(startDate);

        dateList.push(`${formatDate(currentDate)}`);
        startDate = new Date(startDate.setDate(startDate.getDate() + 1));
    }
    return dateList;
}

class InitTables {
    private paibanTable!: HTMLElement;
    private startDate!: Date;
    private endDate!: Date;
    private dateList!: string[];
    private thead_tr!: HTMLElement;

    constructor() {
        // this.init();  
    }

    init() {
        this.getStartEndDate();
        this.lookElement();
        this.generateThead();
        this.generateTbody();
        this.checkForRestDays();
    }

    getStartEndDate() {
        let today = new Date();
        this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.dateList = goThroughDate(this.startDate, this.endDate);
    }

    lookElement() {
        this.paibanTable = document.querySelector('.paiban-table') as HTMLElement;
    }

    generateThead() {
        this.thead_tr = this.paibanTable.querySelector('thead > tr') as HTMLElement;

        for (let i = 0; i < this.dateList.length; i++) {
            let th = document.createElement('th');

            let div1 = document.createElement('div');  // 写星期
            let div2 = document.createElement('div');  // 写日子

            // 2025年-2月-2-周日
            let allDateString = this.dateList[i];
            div1.textContent = allDateString.split('-')[3]
            div2.textContent = allDateString.split('-')[2]

            th.appendChild(div1);
            th.appendChild(div2);
            this.thead_tr.appendChild(th);
        }
    }

    generateTbody() {
        let daysNum = this.dateList.length;
        let tbody = this.paibanTable.querySelector('tbody') as HTMLElement;

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
    isRestDay(dateString: string): boolean {
        // 解析日期字符串，例如："2025年-2月-2-周日"
        const date = new Date(
            parseInt(dateString.split('-')[0]),
            parseInt(dateString.split('-')[1]) - 1,  // 月份的索引从0开始
            parseInt(dateString.split('-')[2])
        );

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
    setRestDayStyle(th: HTMLElement, columnIndex: number) {
        if (this.isRestDay(this.dateList[columnIndex])) {
            // 设置表头样式
            th.style.backgroundColor = 'var(--bs-success-bg-subtle)';  // 使用Bootstrap的颜色变量
            th.style.color = 'var(--bs-success-text)';

            // 设置该列所有单元格的样式
            const tbody = this.paibanTable.querySelector('tbody');
            const rows = tbody!.getElementsByTagName('tr');
            for (let i = 0; i < rows.length; i++) {
                const td = rows[i].children[columnIndex + 1] as HTMLElement; // +1 是因为第一列是人员名字
                td.style.backgroundColor = 'var(--bs-success-bg-subtle)';
                td.style.color = 'var(--bs-success-text)';
            }
        }
    }

    // 检查并设置休息日样式
    checkForRestDays() {
        console.log(this.thead_tr.children);
        for (let i = 0; i < this.dateList.length; i++) {
            this.setRestDayStyle(this.thead_tr.children[i + 1] as HTMLElement, i)
        }
    }
}

let iTs = new InitTables();
iTs.init();