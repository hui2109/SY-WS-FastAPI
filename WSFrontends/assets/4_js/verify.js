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

    // 使用fetch发送验证请求
    fetch('/secret_verify', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        console.error('请求失败:', response.status, response.statusText);
        window.location.href = '/login';
        throw new Error('请求失败');
    }).then(data => {
        console.log(data);
    }).catch(error => {
        console.error('网络错误:', error);
    });
}
