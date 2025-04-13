// 登录检测, 每个一段时间检测登录是否过期
secret_verify(); // 页面加载时立即检查一次登录状态
setInterval(secret_verify, 1000 * 60 * 10); // 每10分钟检查一次登录状态

function secret_verify() {
    // 检查是否有访问令牌
    const token = sessionStorage.getItem('access_token');

    if (!token) {
        // 如果没有令牌，重定向到登录页面
        window.location.href = '/login';
        return null;
    }

    // 使用XMLHttpRequest发送验证请求
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/secret_verify', true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.withCredentials = true;

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = JSON.parse(xhr.responseText);
                console.log(data);
            } catch (e) {
                // JSON解析错误
                console.error('JSON解析错误:', e);
            }
        } else {
            console.error('请求失败:', xhr.status, xhr.statusText);
            window.location.href = '/login';
        }
    };

    xhr.onerror = function () {
        // 显示错误信息
        console.error('网络错误:', xhr.status, xhr.statusText);
    };

    // 发送请求
    xhr.send();
}
