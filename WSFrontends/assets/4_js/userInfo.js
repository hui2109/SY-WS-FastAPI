const userNameElement = document.getElementById('user-name');
const userAvatarElement = document.getElementById('avatarPreview');
const selectedAvatarInput = document.getElementById('selectedAvatar');
const avatarOptions = document.querySelectorAll('.avatar-option');
const logoutBtn = document.getElementById('logoutBtn');

// 获取并显示用户信息
function loadUserInfo() {
    // 获取token
    const token = getToken();
    if (!token) {
        return;
    }

    // 发送请求获取用户信息
    fetch('/secret_verify', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('获取用户信息失败');
    }).then(data => {
        displayUserInfo(data);
    }).catch(error => {
        console.error('获取用户信息错误:', error);
        // 如果获取信息失败，可能是token无效，重定向到登录页面
        // window.location.href = '/login';
    });
}

// 在页面上显示用户信息
function displayUserInfo(userData) {
    // 设置用户头像
    userAvatarElement.src = userData[0];
    selectedAvatarInput.value = userData[0].split('/').pop();
    sessionStorage.setItem('user_avatar', userData[0].split('/').pop());

    // 设置用户名
    userNameElement.textContent = userData[1];
    sessionStorage.setItem('user_name', userData[1]);
}

// 更新头像
function updateAvatar() {
    // 获取token
    const token = sessionStorage.getItem('access_token');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    const avatarFileName = selectedAvatarInput.value;
    // 构建头像URL
    const avatarUrl = '/WSFrontends/assets/img/avatars/' + avatarFileName;

    // 发送请求更新头像
    fetch('/update-avatar', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            avatar: avatarUrl
        })
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('更新头像失败');
    }).then(data => {
        // 显示成功消息
        // alert('头像更新成功');
        console.log('头像更新成功');
    }).catch(error => {
        console.error('更新头像错误:', error);
        alert('更新头像失败，请稍后再试');
    });
}

// 初始化退出登录功能
function initLogout() {
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();

        // 获取token
        const token = sessionStorage.getItem('access_token');

        // 发送登出请求
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            // 无论成功与否，都清除本地token并重定向
            // 清除会话存储中的token
            sessionStorage.removeItem('access_token');
            // 重定向到登录页面
            window.location.href = '/login';
        }).catch(error => {
            console.error('登出错误:', error);
            // 出错也清除token并重定向
            sessionStorage.removeItem('access_token');
            window.location.href = '/login';
        });
    });
}


// 加载用户信息并显示在导航栏
document.addEventListener('DOMContentLoaded', function () {
    loadUserInfo();
    initLogout();

    avatarOptions.forEach(option => {
        option.addEventListener('click', updateAvatar);
    });
});