// 创建提示框容器（如果不存在）
function getAlertContainer(parentNode) {
    let container = document.getElementById('alertContainer');

    if (!container) {
        container = document.createElement('div');
        container.id = 'alertContainer';
        container.className = 'alert-container';
        parentNode.appendChild(container);
    }
    return container;
}

// 显示提示框
/**
 * @param {'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'light'|'dark'} type
 * @param {string} title
 * @param {string} message
 * @param {number} [duration]
 * @param {HTMLElement} [parentNode]
 */
function showAlert({
                       type,
                       title,
                       message,
                       duration = 5000,
                       parentNode = document.body
                   }) {
    // 获取提示框容器
    const container = getAlertContainer(parentNode);

    // 创建alert元素
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} custom-alert d-flex align-items-center`;
    alertElement.setAttribute('role', 'alert');

    // 创建alert内容
    const alertContent = `
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <div>
                        <strong>${title}</strong>
                        <div class="mt-1">${message}</div>
                    </div>
                    <button type="button" class="btn-close ms-3" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;

    alertElement.innerHTML = alertContent;

    // 添加到容器
    container.appendChild(alertElement);

    // 设置动画效果
    setTimeout(() => {
        alertElement.classList.add('show');
    }, 10);

    // 点击关闭按钮事件
    const closeButton = alertElement.querySelector('.btn-close');
    closeButton.addEventListener('click', () => {
        closeAlert(alertElement);
    });

    // 设置自动消失
    if (duration > 0) {
        setTimeout(() => {
            closeAlert(alertElement);
        }, duration);
    }

    // 返回alert元素，方便后续操作
    return alertElement;
}

// 关闭提示框
function closeAlert(alertElement) {
    // 添加关闭动画
    alertElement.classList.remove('show');

    // 动画结束后移除元素
    setTimeout(() => {
        if (alertElement && alertElement.parentNode) {
            alertElement.parentNode.removeChild(alertElement);
        }
    }, 300);
}

// 示例：触发多个提示
function showMultipleAlerts() {
    showAlert('primary', '多个提示示例', '这是第一个提示', 5000);
    setTimeout(() => {
        showAlert('secondary', '多个提示示例', '这是第二个提示', 5000);
    }, 1000);
    setTimeout(() => {
        showAlert('dark', '多个提示示例', '这是第三个提示', 5000);
    }, 2000);
}


function loginExpiredAlert() {
    showAlert({
        type: 'danger',
        title: '登录过期',
        message: '登录已过期，请重新登录',
    });
}
