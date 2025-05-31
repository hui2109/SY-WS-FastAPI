class initUserInfo {
    constructor() {
        this.lookElement();
        this.initAvatarModal();
    }

    init() {
        this.loadUserInfo();
        this.bindClick();
    }

    _updateAvatar() {
        // 获取token
        const token = getToken();
        if (!token) {
            return;
        }

        const avatarFileName = this.selectedAvatarInputMobile.value;
        // 构建头像URL
        const avatarUrl = '/WSFrontends/assets/img/avatars/' + avatarFileName;

        // 发送请求更新头像
        fetch('/update-avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                avatar: avatarUrl
            })
        }).then(response => {
            response.json().then(data => {
                if (response.ok) {
                    showAlert({
                        type: 'success',
                        title: '更新头像成功',
                        message: '',
                    });
                } else {
                    showAlert({
                        type: 'danger',
                        title: '更新头像失败',
                        message: '更新头像失败，请稍后再试',
                    });
                }
            })
        }).catch(error => {
            debugger;
            console.error('error!!!', error);
        });
    }

    lookElement() {
        this.avatarModal = document.getElementById('avatarModal');
        let desktopUserDropdownToggle = document.getElementById('desktopUserDropdownToggle');
        let mobileUserDropdownToggle = document.getElementById('mobileUserDropdownToggle');
        this.userDropdownToggles = [desktopUserDropdownToggle, mobileUserDropdownToggle];

        this.selectedAvatarInputDesktop = desktopUserDropdownToggle.querySelector('input[type="hidden"]');
        this.selectedAvatarInputMobile = mobileUserDropdownToggle.querySelector('input[type="hidden"]');
        this.avatarPreviewDesktop = desktopUserDropdownToggle.querySelector('.avatarPreview');
        this.avatarPreviewMobile = mobileUserDropdownToggle.querySelector('.avatarPreview');

        this.tooltipTriggerList = document.querySelectorAll('#avatarModal [data-bs-toggle="tooltip"]');
        this.avatarGrid = document.querySelector('#avatarModal .avatar-grid')
        this.avatarOptions = document.querySelectorAll('#avatarModal .avatar-option');
    }

    initAvatarModal() {
        // 初始化所有工具提示
        this.tooltipList = [...this.tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
            placement: 'top',
            delay: {show: 500, hide: 50},
            container: '.avatar-grid'
        }));
    }

    // 获取并显示用户信息
    loadUserInfo() {
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
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(response => {
            response.json().then(data => {
                if (response.ok) {
                    this.userData = data;
                    this.displayUserInfo();
                } else {
                    loginExpiredAlert();
                    window.location.href = '/login';
                }
            })
        }).catch(error => {
            debugger;
            console.error(error);
        });
    }

    displayUserInfo() {
        // 同时设置移动端和桌面端的用户头像
        for (let userDropdownToggle of this.userDropdownToggles) {
            let avatarPreview = userDropdownToggle.querySelector('.avatarPreview');
            let selectedAvatar = userDropdownToggle.querySelector('input[type="hidden"]');
            let userName = userDropdownToggle.querySelector('.user-name');

            avatarPreview.src = this.userData[0];
            selectedAvatar.value = this.userData[0].split('/').at(-1);
            sessionStorage.setItem('user_avatar', selectedAvatar.value);

            // 设置用户名
            userName.textContent = this.userData[1];
            sessionStorage.setItem('user_name', this.userData[1]);
        }
    }

    bindClick() {
        for (let userDropdownToggle of this.userDropdownToggles) {
            let logoutBtn = userDropdownToggle.querySelector('.logoutBtn');
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();

                // 获取token
                const token = getToken();
                if (!token) {
                    return;
                }

                // 发送登出请求
                fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }).then(response => {
                    response.json().then(data => {
                        showAlert({
                            type: 'success',
                            title: '登出成功',
                            message: '请重新登录',
                        });

                        // 无论成功与否，都清除本地token并重定向
                        // 清除会话存储中的token
                        sessionStorage.removeItem('access_token');
                        // 重定向到登录页面
                        window.location.href = '/login';
                    })
                }).catch(error => {
                    debugger;
                    console.error('error!!!', error);

                    // 出错也清除token并重定向
                    sessionStorage.removeItem('access_token');
                    window.location.href = '/login';
                });
            })
        }

        // 监听头像网格滚动事件，滚动时隐藏所有tooltip
        this.avatarGrid.addEventListener('scroll', () => {
            this.tooltipList.forEach(tooltip => tooltip.hide());
        });

        // 头像模态框打开时，确保正确显示当前选中的头像
        this.avatarModal.addEventListener('show.bs.modal', () => {
            // 移除所有头像的选中状态
            this.avatarOptions.forEach(option => option.classList.remove('selected'));

            // 找到并选中当前已选择的头像
            const currentAvatarFile = this.selectedAvatarInputMobile.value;
            const currentAvatarOption = document.querySelector(`#avatarModal .avatar-option[data-avatar="${currentAvatarFile}"]`);
            if (currentAvatarOption) {
                currentAvatarOption.classList.add('selected');
            }
        });

        // 头像点击的选择逻辑
        this.avatarOptions.forEach(option => {
            option.addEventListener('click', (event) => {
                let elementThis = event.currentTarget;

                // 移除所有头像的选中状态
                this.avatarOptions.forEach(option => option.classList.remove('selected'));

                // 添加当前选中状态
                elementThis.classList.add('selected');

                // 更新预览图和隐藏输入值
                const avatarFile = elementThis.getAttribute('data-avatar');

                this.selectedAvatarInputDesktop.value = avatarFile;
                this.selectedAvatarInputMobile.value = avatarFile;

                this.avatarPreviewDesktop.src = `/WSFrontends/assets/img/avatars/${avatarFile}`;
                this.avatarPreviewMobile.src = `/WSFrontends/assets/img/avatars/${avatarFile}`;

                // 发送数据到服务器
                this._updateAvatar();
            });
        });
    }
}

let iUI = new initUserInfo();
iUI.init();
