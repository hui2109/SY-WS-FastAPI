const themeToggleBtn = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const themeIcon = themeToggleBtn.querySelector('i');
const pageTransition = document.getElementById('pageTransition');

const loginForm = document.querySelector('form');
const usernameInput = document.getElementById('floatingInput');
const passwordInput = document.getElementById('floatingPassword');
const loginError = document.getElementById('loginError');

function _updateIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('bi-moon-stars-fill');
        themeIcon.classList.add('bi-sun-fill');
    } else {
        themeIcon.classList.remove('bi-sun-fill');
        themeIcon.classList.add('bi-moon-stars-fill');
    }
}

function smoothTransition() {
    // 处理所有页面链接点击事件以实现平滑过渡
    document.querySelectorAll('a[href]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // 只处理内部链接
            const href = this.getAttribute('href');
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript')) {
                return; // 不阻止外部链接、锚链接或JavaScript链接
            }

            e.preventDefault(); // 阻止默认跳转

            // 显示过渡遮罩
            pageTransition.style.opacity = '1';

            // 延迟跳转以显示过渡动画
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
}

function restoreTheme() {
    // 检查本地存储中的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-bs-theme', savedTheme);
        _updateIcon(savedTheme);
    }
}

function switchTheme() {
    themeToggleBtn.addEventListener('click', function () {
        const currentTheme = htmlElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        _updateIcon(newTheme);
    });
}

function formValidation() {
    // 处理登录表单提交
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // 准备表单数据 (x-www-form-urlencoded格式)
        const formData = new URLSearchParams();
        formData.append('grant_type', 'password');
        formData.append('username', usernameInput.value);
        formData.append('password', passwordInput.value);
        formData.append('scope', '');
        formData.append('client_id', '');
        formData.append('client_secret', '');

        // 显示loading状态
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 登录中...';

        // 隐藏之前可能的错误信息
        loginError.style.display = 'none';

        // 使用fetch发送请求
        fetch('/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: formData.toString()
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('登录失败');
        }).then(data => {
            // 登录成功，保存令牌到 sessionStorage
            sessionStorage.setItem('access_token', data.access_token);

            // 显示过渡遮罩然后跳转到主页
            pageTransition.style.opacity = '1';
            setTimeout(() => {
                window.location.href = '/index';
            }, 300);
        }).catch(error => {
            // 显示错误信息
            loginError.textContent = error.message === '登录失败'
                ? '用户名或密码不正确'
                : '网络错误，请检查您的连接';
            loginError.style.display = 'block';
            console.error('Error:', error);
        }).finally(() => {
            // 恢复按钮状态
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
    })
}

document.addEventListener('DOMContentLoaded', function () {
    smoothTransition()
    restoreTheme()
    switchTheme()
    formValidation()
});