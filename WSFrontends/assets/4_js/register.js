const themeToggleBtn = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const themeIcon = themeToggleBtn.querySelector('i');
const pageTransition = document.getElementById('pageTransition');

const form = document.querySelector('form');
const password = document.getElementById('floatingPassword');
const confirmPassword = document.getElementById('floatingConfirmPassword');
const username = document.getElementById('floatingUsername');
const fullname = document.getElementById('floatingFullname');
const enrollDate = document.getElementById('floatingEnrollDate');
const workNumber = document.getElementById('floatingWorkNumber');
const phoneNumber = document.getElementById('floatingPhoneNumber');

const tooltipTriggerList = document.querySelectorAll('#avatarModal [data-bs-toggle="tooltip"]');
const avatarGrid = document.querySelector('#avatarModal .avatar-grid');
const avatarModal = document.getElementById('avatarModal');
const avatarOptions = document.querySelectorAll('#avatarModal .avatar-option');
const selectedAvatar = document.getElementById('selectedAvatar');
const avatarPreview = document.getElementById('avatarPreview');

function _updateIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('bi-moon-stars-fill');
        themeIcon.classList.add('bi-sun-fill');
    } else {
        themeIcon.classList.remove('bi-sun-fill');
        themeIcon.classList.add('bi-moon-stars-fill');
    }
}

function _updateDatePickerTheme(theme) {
    // 根据主题更新日期选择器的图标过滤器
    htmlElement.style.setProperty(
        '--bs-theme-icon-filter',
        theme === 'dark' ? 'invert(1)' : 'none'
    );
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

function setToday() {
    // 设置日期选择器默认值为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('floatingEnrollDate').value = today;
}

function restoreTheme() {
    // 检查本地存储中的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-bs-theme', savedTheme);
        _updateIcon(savedTheme);
        _updateDatePickerTheme(savedTheme);
    }
}

function switchTheme() {
    themeToggleBtn.addEventListener('click', function () {
        const currentTheme = htmlElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        _updateIcon(newTheme);
        _updateDatePickerTheme(newTheme);
    });
}

function formValidation() {
    // 简单的重复密码验证
    confirmPassword.addEventListener('input', function () {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('密码不匹配');
        } else {
            confirmPassword.setCustomValidity('');
        }
    });

    // 表单验证 - 确保密码匹配
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // 阻止表单默认提交行为

        // 验证密码匹配
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('密码不匹配');
            return;
        } else {
            confirmPassword.setCustomValidity('');
        }

        // 收集表单数据并转换格式
        const formData = {
            username: username.value.trim(),
            name: fullname.value.trim(),
            // 转换日期格式为ISO字符串
            hiredate: enrollDate.value,
            password: password.value,
            // 添加头像数据
            avatar: selectedAvatar.value,
            // 添加工号和电话号码
            worknumber: workNumber.value.trim(),
            phonenumber: phoneNumber.value.trim()
        };

        // 显示loading状态
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 处理中...';

        // 使用fetch发送请求
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        }).then(response => {
            if (response.ok) {
                // 注册成功，显示成功消息并重定向到登录页面
                alert('注册成功！');

                // 显示过渡遮罩然后跳转到登录页面
                pageTransition.style.opacity = '1';
                setTimeout(() => {
                    window.location.href = 'login';
                }, 300);
            } else {
                // 显示错误消息
                return response.json().then(err => {
                    showAlert({
                        type: "danger",
                        title: '注册失败！',
                        message: err.detail
                    })
                });
            }
        }).catch(error => {
            // 显示错误消息
            console.error('Error:', error);
        }).finally(() => {
            // 如果在非成功情况下需要恢复按钮状态
            if (submitBtn.disabled) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    });
}

function initAvatarModal() {
    // 初始化所有工具提示
    let tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
        placement: 'top',
        delay: {show: 500, hide: 50},
        container: '.avatar-grid'
    }));

    // 监听头像网格滚动事件，滚动时隐藏所有tooltip
    avatarGrid.addEventListener('scroll', () => {
        tooltipList.forEach(tooltip => tooltip.hide());
    });

    // 头像模态框打开时，确保正确显示当前选中的头像
    avatarModal.addEventListener('show.bs.modal', () => {
        // 移除所有头像的选中状态
        avatarOptions.forEach(option => option.classList.remove('selected'));

        // 找到并选中当前已选择的头像
        const currentAvatarFile = selectedAvatar.value;
        const currentAvatarOption = document.querySelector(`#avatarModal .avatar-option[data-avatar="${currentAvatarFile}"]`);
        if (currentAvatarOption) {
            currentAvatarOption.classList.add('selected');
        }
    });

    // 头像点击的选择逻辑
    avatarOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            let elementThis = event.currentTarget;

            // 移除所有头像的选中状态
            avatarOptions.forEach(option => option.classList.remove('selected'));

            // 添加当前选中状态
            elementThis.classList.add('selected');

            // 更新预览图和隐藏输入值
            const avatarFile = elementThis.getAttribute('data-avatar');

            selectedAvatar.value = avatarFile;
            avatarPreview.src = `/WSFrontends/assets/img/avatars/${avatarFile}`;
        });
    });
}


document.addEventListener('DOMContentLoaded', function () {
    smoothTransition()
    setToday()
    restoreTheme()
    switchTheme()
    formValidation()
    initAvatarModal()
});