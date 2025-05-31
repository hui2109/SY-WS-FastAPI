class InitVacationSettingCards {
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
        //            //{type: "年假", startDate: "2024-01-01", endDate: "2024-12-31", days: 15},
        //            //{type: "婚假", startDate: "2024-06-01", endDate: "2024-06-10", days: 10}
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
        //            {type: "年假", startDate: "2024-01-01", endDate: "2024-12-31", days: 15}
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
        //            {type: "年假", startDate: "2024-01-01", endDate: "2024-12-31", days: 20},
        //            {type: "病假", startDate: "2024-03-01", endDate: "2024-03-05", days: 10}
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
                            <button class="btn btn-add-rule btn-sm mt-2" data-user-id="${user.id}">
                                <i class="bi bi-plus-circle me-1"></i>新增规则
                            </button>
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
                                <input type="month" class="form-control form-control-sm" value="${user.workSchedule.month}">
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
                <div class="holiday-rule">
                    <div class="row g-2 align-items-end">
                        <div class="col-md-3">
                            <label class="form-label small">假期类型</label>
                            <select class="form-select form-select-sm">
                                <option value="年假" ${rule.type === '年假' ? 'selected' : ''}>年假</option>
                                <option value="婚假" ${rule.type === '婚假' ? 'selected' : ''}>婚假</option>
                                <option value="病假" ${rule.type === '病假' ? 'selected' : ''}>病假</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label small">天数</label>
                            <input type="number" class="form-control form-control-sm" value="${rule.days || 0}" min="0" max="365" placeholder="天数">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small">开始日期</label>
                            <input type="date" class="form-control form-control-sm" value="${rule.startDate}">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small">结束日期</label>
                            <input type="date" class="form-control form-control-sm" value="${rule.endDate}">
                        </div>
                        <div class="col-md-1">
                            <button class="btn btn-outline-danger btn-sm w-100 btn-remove-rule" title="删除规则" data-user-id="${userId}" data-index="${index}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
    }

    // 创建假期统计
    _createHolidayStats(stat) {
        const total = stat.used + stat.remaining;
        const percentage = total > 0 ? (stat.used / total) * 100 : 0;

        return `
                <div class="holiday-stats">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge holiday-type-badge bg-primary">${stat.type}</span>
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

    // 渲染所有卡片
    renderCards() {
        const container = document.getElementById('cardsContainer');
        container.innerHTML = this.filteredUsers.map(user => this._createUserCard(user)).join('');
    }

    // 搜索功能
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
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
        document.addEventListener('click', (event) => {
            if (event.target.closest('.btn-remove-rule')) {
                const btn = event.target.closest('.btn-remove-rule');
                const userId = parseInt(btn.dataset.userId);
                const ruleIndex = parseInt(btn.dataset.index);
                this._removeHolidayRule(userId, ruleIndex);
            }

            if (event.target.closest('.btn-add-rule')) {
                const btn = event.target.closest('.btn-add-rule');
                const userId = parseInt(btn.dataset.userId);
                this._addHolidayRule(userId);
            }
        });
    }

    // 添加假期规则
    _addHolidayRule(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (user) {
            const newRule = {
                type: "年假",
                startDate: this._getCurrentDate(),
                endDate: this._getCurrentDate(),
                days: 0
            };
            user.holidayRules.push(newRule);
            this.renderCards();
        }
    }

    // 删除假期规则
    _removeHolidayRule(userId, ruleIndex) {
        const user = this.allUsers.find(u => u.id === userId);
        if (user && user.holidayRules.length > 1) {
            user.holidayRules.splice(ruleIndex, 1);
            this.renderCards();
        }
    }

    // 获取当前日期
    _getCurrentDate() {
        return new Date().toISOString().split('T')[0];
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

            debugger;

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
            console.error('error!!!', error);
        }
    }
}

// 初始化类并调用异步init方法
(async function () {
    try {
        const iVSCs = new InitVacationSettingCards();
        await iVSCs.init();
    } catch (error) {
        console.error('初始化失败:', error);
    }
})();
