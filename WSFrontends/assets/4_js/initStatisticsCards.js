class initStatisticsCards {
    constructor() {
        // 模拟用户数据
        //this.userData = [
        //    {
        //        id: 1,
        //        name: "张三",
        //        avatar: "https://i.pravatar.cc/150?img=1",
        //        weight: "A级",
        //        workYears: "5年",
        //        employeeId: "EMP001",
        //        phone: "138****1234",
        //        holidayRules: [
        //            //{type: "年假", startDate: "2024-01-01", endDate: "2024-12-31", days: 15, rule_id: 1},
        //            //{type: "婚假", startDate: "2024-06-01", endDate: "2024-06-10", days: 10, rule_id: 2}
        //        ],
        //        holidayStats: [
        //            //{type: "年假", used: 8, remaining: 7, expiry: "2024-12-31"},
        //            //{type: "病假", used: 2, remaining: 8, expiry: "2024-12-31"},
        //            //{type: "婚假", used: 0, remaining: 10, expiry: "2024-12-31"}
        //        ],
        //        workSchedule: {
        //            month: "2024-05",
        //            schedules: [
        //                //{type: "2A", count: 15},
        //                //{type: "休息", count: 8},
        //                //{type: "加班", count: 3}
        //            ]
        //        }
        //    },
        //    {
        //        id: 2,
        //        name: "李四",
        //        avatar: "https://i.pravatar.cc/150?img=2",
        //        weight: "B级",
        //        workYears: "3年",
        //        employeeId: "EMP002",
        //        phone: "139****5678",
        //        holidayRules: [
        //            {type: "年假", startDate: "2024-01-01", endDate: "2024-12-31", days: 15, , rule_id: 3}
        //        ],
        //        holidayStats: [
        //            {type: "年假", used: 5, remaining: 10, expiry: "2024-12-31"},
        //            {type: "病假", used: 1, remaining: 9, expiry: "2024-12-31"}
        //        ],
        //        workSchedule: {
        //            month: "2024-05",
        //            schedules: [
        //                {type: "2A", count: 18},
        //                {type: "休息", count: 6},
        //                {type: "夜班", count: 2}
        //            ]
        //        }
        //    },
        //    {
        //        id: 3,
        //        name: "王五",
        //        avatar: "https://i.pravatar.cc/150?img=3",
        //        weight: "A级",
        //        workYears: "7年",
        //        employeeId: "EMP003",
        //        phone: "137****9012",
        //        holidayRules: [
        //            {type: "年假", startDate: "2024-01-01", endDate: "2024-12-31", days: 20, rule_id: 4},
        //            {type: "病假", startDate: "2024-03-01", endDate: "2024-03-05", days: 10, rule_id: 5}
        //        ],
        //        holidayStats: [
        //            {type: "年假", used: 12, remaining: 8, expiry: "2024-12-31"},
        //            {type: "病假", used: 3, remaining: 7, expiry: "2024-12-31"}
        //        ],
        //        workSchedule: {
        //            month: "2024-05",
        //            schedules: [
        //                {type: "2A", count: 20},
        //                {type: "休息", count: 4},
        //                {type: "培训", count: 2}
        //            ]
        //        }
        //    }
        //];
        //this.allUsers = [...this.userData];
        //this.filteredUsers = [...this.userData];
        this.userData = [];
        this.allUsers = [];
        this.filteredUsers = [];
        this.banTypeColor = getBanTypeColor();
    }

    async init() {
        await this.getDataFromServer();
        this.renderCards();
        this.setupSearch();
        this.setupEventListeners();
    }

    // 创建单个卡片
    _createUserCard(user) {
        return `
                <div class="col-12 col-xl-6 mb-4 user-card-wrapper" data-user-name="${user.name}">
                    <div class="user-card p-4">
                        <!-- 用户基本信息 -->
                        <div class="d-flex mb-4">
                            <img src="${user.avatar}" alt="${user.name}" class="user-avatar me-3">
                            <div class="flex-grow-1">
                                <h5 class="mb-1 fw-bold">${user.name}</h5>
                                <div class="small text-muted">
                                    <div class="mb-1"><strong>权重:</strong> ${user.weight}</div>
                                    <div class="mb-1"><strong>工龄:</strong> ${user.workYears}</div>
                                    <div class="mb-1"><strong>工号:</strong> ${user.employeeId}</div>
                                    <div><strong>电话:</strong> ${user.phone}</div>
                                </div>
                            </div>
                        </div>

                        <!-- 假期规则设置 -->
                        <div class="mb-4">
                            <h6 class="fw-bold mb-3">
                                <i class="bi bi-calendar-plus me-2"></i>假期规则设置
                            </h6>
                            <div id="holidayRules-${user.id}">
                                ${user.holidayRules.map((rule, index) => this._createHolidayRule(user.id, rule, index)).join('')}
                            </div>
                        </div>

                        <!-- 假期统计 -->
                        <div class="mb-4">
                            <h6 class="fw-bold mb-3">
                                <i class="bi bi-bar-chart me-2"></i>假期统计
                            </h6>
                            ${user.holidayStats.map(stat => this._createHolidayStats(stat)).join('')}
                        </div>
                        
                        <!-- 工作班次统计 -->
                        <div class="work-schedule">
                            <h6 class="fw-bold mb-3">
                                <i class="bi bi-clock me-2"></i>班次统计
                            </h6>
                            <div class="mb-3">
                                <label class="form-label small">统计月份:</label>
                                <input type="month" class="form-control form-control-sm statistics-month-picker" value="${user.workSchedule.month}" data-user-id="${user.id}">
                            </div>
                            ${user.workSchedule.schedules.map(schedule => this._createScheduleItem(schedule)).join('')}
                        </div>
                    </div>
                </div>
            `;
    }

    // 创建假期规则
    _createHolidayRule(userId, rule, index) {
        return `
                <div class="holiday-rule" data-user-id="${userId}" data-index="${index}">
                    <div class="row g-2 align-items-end">
                        <div class="col-md-3">
                            <label class="form-label small">假期类型</label>
                            <select class="form-select form-select-sm" data-field="type" disabled>
                                <option value="放射假" ${rule.type === '放射假' ? 'selected' : ''}>放射假</option>
                                <option value="年假" ${rule.type === '年假' ? 'selected' : ''}>年假</option>
                                <option value="病假" ${rule.type === '病假' ? 'selected' : ''}>病假</option>
                                <option value="事假" ${rule.type === '事假' ? 'selected' : ''}>事假</option>
                                <option value="婚假" ${rule.type === '婚假' ? 'selected' : ''}>婚假</option>
                                <option value="产假" ${rule.type === '产假' ? 'selected' : ''}>产假</option>
                                <option value="陪产假" ${rule.type === '陪产假' ? 'selected' : ''}>陪产假</option>
                                <option value="育儿假" ${rule.type === '育儿假' ? 'selected' : ''}>育儿假</option>
                                <option value="丧假" ${rule.type === '丧假' ? 'selected' : ''}>丧假</option>
                                <option value="其他假" ${rule.type === '其他假' ? 'selected' : ''}>其他假</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label small">天数</label>
                            <input type="number" class="form-control form-control-sm" value="${rule.days || 0}" min="0" max="365" placeholder="天数" data-field="days" disabled>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small">开始日期</label>
                            <input type="date" class="form-control form-control-sm" value="${rule.startDate}" data-field="startDate" disabled>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small">结束日期</label>
                            <input type="date" class="form-control form-control-sm" value="${rule.endDate}" data-field="endDate" disabled>
                        </div>
                    </div>
                </div>
            `;
    }

    // 创建假期统计
    _createHolidayStats(stat) {
        const total = stat.used + stat.remaining;
        const percentage = total > 0 ? (stat.used / total) * 100 : 0;
        let color = this.banTypeColor[stat.type]
        if (!color) {
            color = '#dc3545'
        }

        return `
                <div class="holiday-stats">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge holiday-type-badge" style="background-color: ${color}">${stat.type}</span>
                        <small class="text-muted">过期时间: ${stat.expiry}</small>
                    </div>
                    <div class="row text-center">
                        <div class="col-4">
                            <div class="fw-bold text-danger">${stat.used}</div>
                            <small class="text-muted">已休</small>
                        </div>
                        <div class="col-4">
                            <div class="fw-bold text-success">${stat.remaining}</div>
                            <small class="text-muted">剩余</small>
                        </div>
                        <div class="col-4">
                            <div class="fw-bold text-info">${stat.used + stat.remaining}</div>
                            <small class="text-muted">总计</small>
                        </div>
                    </div>
                    <div class="progress stats-progress mt-2">
                        <div class="progress-bar bg-danger" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
    }

    // 创建班次统计项
    _createScheduleItem(schedule) {
        return `
                <div class="schedule-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold">${schedule.type}</span>
                        <span class="badge bg-secondary">${schedule.count} 次</span>
                    </div>
                </div>
            `;
    }

    async getDataFromServer() {
        // 获取token
        const token = getToken();
        if (!token) {
            return;
        }

        try {
            let response = await fetch('/get_vacation_setting_data', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            let data = await response.json();

            if (!response.ok) {
                showAlert({
                    type: 'danger',
                    title: '排班失败！',
                    message: data.detail,
                });
            } else {
                this.userData = data;
                this.allUsers = [...this.userData];
                this.filteredUsers = [...this.userData];
            }
        } catch (error) {
            debugger;
            alert('未知错误！');
            console.error('error!!!', error);
        }
    }

    // 渲染所有卡片
    renderCards() {
        const container = document.getElementById('cardsContainer2');
        container.innerHTML = this.filteredUsers.map(user => this._createUserCard(user)).join('');
    }

    // 搜索功能
    setupSearch() {
        const searchInput = document.getElementById('searchInput2');
        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase().trim();

            if (searchTerm === '') {
                this.filteredUsers = [...this.allUsers];
            } else {
                this.filteredUsers = this.allUsers.filter(user =>
                    user.name.toLowerCase().includes(searchTerm)
                );
            }

            this.renderCards();
        });
    }

    // 绑定点击事件
    setupEventListeners() {
        document.addEventListener('change', (e) => {
            const monthPicker = e.target.closest('.statistics-month-picker');

            if (monthPicker) {
                let month = monthPicker.value + "-01";
                let userId = monthPicker.dataset.userId;
                let data = {
                    personnel_id: userId,
                    month: month
                }

                // 获取token
                const token = getToken();
                if (!token) {
                    return;
                }

                fetch('/get_work_schedule_statistics', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                }).then(response => {
                    response.json().then(data => {
                        if (response.ok) {
                            const user = this.allUsers.find(u => u.id === parseInt(data.id));
                            user.workSchedule = data.workSchedule;

                            this.renderCards();
                        } else {
                            showAlert({
                                type: 'danger',
                                title: '数据获取失败！',
                                message: data.detail,
                            });
                        }
                    })
                }).catch(error => {
                    debugger;
                    alert('未知错误！');
                    console.error('error!!!', error);
                });
            }
        });
    }
}

// 初始化类并调用异步init方法
(async function () {
    try {
        const iSC = new initStatisticsCards();
        await iSC.init();

        // 页面加载外部添加一个滚动控制
        window.addEventListener('load', function () {
            setTimeout(function () {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'auto'
                });
            }, 10);
        });
    } catch (error) {
        debugger;
        console.error('初始化失败:', error);
    }
})();

