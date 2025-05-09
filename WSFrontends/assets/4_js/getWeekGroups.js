// 初始化 dayjs
dayjs.extend(dayjs_plugin_isoWeek);
dayjs.extend(dayjs_plugin_localeData);
dayjs.locale('zh-cn');

function generateWeeklyGroups(startYear, startMonth, endYear, endMonth) {
    let result = {};
    let result_obj = {};

    const startDate = dayjs(`${startYear}-${startMonth}-01`).startOf('month');
    const endDate = dayjs(`${endYear}-${endMonth}-01`).endOf('month');

    let current = startDate.startOf('isoWeek');

    while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        const weekStart = current;
        const weekEnd = current.endOf('isoWeek');

        // 统计本周内不同月份的天数
        const monthCount = {};

        for (let i = 0; i < 7; i++) {
            const day = weekStart.add(i, 'day');
            const year = day.year();
            const month = (day.month() + 1) + '月';

            const key = `${year}-${month}`;

            if (!monthCount[key]) {
                monthCount[key] = 0;
            }
            monthCount[key]++;
        }

        // 找出天数最多的那个月
        const maxMonthKey = Object.keys(monthCount).sort((a, b) => monthCount[b] - monthCount[a])[0];
        const [year, month] = maxMonthKey.split('-');

        if (!result[year]) {
            result[year] = {};
            result_obj[year] = {};
        }
        if (!result[year][month]) {
            result[year][month] = [];
            result_obj[year][month] = [];
        }

        const startDay = weekStart.date();
        const endDay = weekEnd.date();

        result[year][month].push(`${startDay}-${endDay}`);
        result_obj[year][month].push([weekStart, weekEnd]);

        current = current.add(1, 'week');
    }

    // 排除非本年的数据
    result = {
        [startYear]: result[startYear]
    };
    result_obj = {
        [startYear]: result_obj[startYear]
    };

    return [result, result_obj];
}


// const groupedDates = generateWeeklyGroups(2025, 1, 2025, 6);
// console.log(JSON.stringify(groupedDates, null, 2));
// console.log(groupedDates)
