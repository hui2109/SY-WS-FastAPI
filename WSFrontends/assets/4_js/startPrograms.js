// 用于启动程序及设置用户权限

function index_start() {
    let iI = new initIndex();
    iI.init();
}

function userInfo_start() {
    let iUI = new initUserInfo();
    iUI.init();
}

function workAllTables_start() {
    let iTs = new InitTables(dayjs());
    iTs.init();

    return iTs;
}

function workMineCards_start() {
    let iMCs = new InitMineCards(dayjs());
    iMCs.init();

    return iMCs;
}

function vacationTable_start() {
    let iVT = new InitVacationTable(dayjs().year());
    iVT.init();

    return iVT;
}

function statisticsCards_start() {
    let iSC = new initStatisticsCards();
    // 初始化类并调用异步init方法
    (async function () {
        try {
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

    return iSC;
}

function paiBanTables_start() {
    let iPBTs = new InitPaiBanTables(dayjs());
    iPBTs.init();
}

function vacationSettingCards_start() {
    // 初始化类并调用异步init方法
    (async function () {
        try {
            const iVSCs = new InitVacationSettingCards();
            await iVSCs.init();

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
}

// 自运行函数
!(function () {
    let administers = ['黄发生', '唐晓燕'];

    index_start();
    userInfo_start();
    let iTs = workAllTables_start();
    let iMCs = workMineCards_start();
    let iVT = vacationTable_start();
    let iSC = statisticsCards_start();

    // 我的排班区域 点击后强制获取一下数据
    document.getElementById('desktopWorkMineLink').addEventListener('click', () => {
        iMCs.init();
    });
    document.getElementById('mobileWorkMineLink').addEventListener('click', () => {
        iMCs.init();
    });

    // 全科排班区域 点击后强制获取一下数据
    document.getElementById('desktopWorkAllLink').addEventListener('click', () => {
        iTs.init();
    });
    document.getElementById('mobileWorkAllLink').addEventListener('click', () => {
        iTs.init();
    });

    // 预约休假区域 点击后强制获取一下数据
    document.getElementById('desktopReserveLink').addEventListener('click', () => {
        iVT.init();
    });
    document.getElementById('mobileReserveLink').addEventListener('click', () => {
        iVT.init();
    });

    // 统计区域 点击后强制获取一下数据
    document.getElementById('desktopStatisticsLink').addEventListener('click', () => {
        (async function () {
            try {
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
    });
    document.getElementById('mobileStatisticsLink').addEventListener('click', () => {
        (async function () {
            try {
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
    });
    document.getElementById('checkAllScheduleFan').classList.add('d-none');

    setTimeout(() => {
        if (administers.includes(sessionStorage.getItem('user_name'))) {
            paiBanTables_start();
            vacationSettingCards_start();
        }
    }, 2000);

    // 凡哥定制选项
    setTimeout(() => {
        if (sessionStorage.getItem('user_name') === '廖中凡') {
            paiBanTables_start();
            document.getElementById('checkAllScheduleFan').classList.remove('d-none');
        }
    }, 2000);
})();