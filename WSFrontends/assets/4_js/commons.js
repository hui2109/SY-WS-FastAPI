function initAvatarModal() {
    // 初始化所有工具提示
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
        placement: 'top',
        delay: {show: 500, hide: 50},
        container: '.avatar-grid'
    }));

    // 监听头像网格滚动事件，滚动时隐藏所有tooltip
    document.querySelector('.avatar-grid').addEventListener('scroll', function () {
        tooltipList.forEach(tooltip => tooltip.hide());
    });

    // 头像选择逻辑
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const selectedAvatarInput = document.getElementById('selectedAvatar');
    const avatarPreview = document.getElementById('avatarPreview');

    // 头像模态框打开时，确保正确显示当前选中的头像
    const avatarModal = document.getElementById('avatarModal');
    avatarModal.addEventListener('show.bs.modal', function () {
        // 移除所有头像的选中状态
        avatarOptions.forEach(opt => opt.classList.remove('selected'));

        // 找到并选中当前已选择的头像
        const currentAvatarFile = selectedAvatarInput.value;
        const currentAvatarOption = document.querySelector(`.avatar-option[data-avatar="${currentAvatarFile}"]`);
        if (currentAvatarOption) {
            currentAvatarOption.classList.add('selected');
        }
    });

    // 头像点击 - 选择逻辑
    avatarOptions.forEach(option => {
        option.addEventListener('click', function () {
            // 移除其他选中状态
            avatarOptions.forEach(opt => opt.classList.remove('selected'));

            // 添加当前选中状态
            this.classList.add('selected');

            // 更新预览图和隐藏输入值
            const avatarFile = this.getAttribute('data-avatar');
            selectedAvatarInput.value = avatarFile;
            avatarPreview.src = `/WSFrontends/assets/img/avatars/${avatarFile}`;
        });
    });
}


function getToken() {
    // 获取token
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        // 如果没有令牌，重定向到登录页面
        loginExpiredAlert();
        window.location.href = '/login';
        return;
    }
    return token;
}

document.addEventListener('DOMContentLoaded', function () {
    initAvatarModal();
});