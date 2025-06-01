class GenerateCheckScheduleTable {
    constructor() {
        this.btn = document.getElementById('checkSchedule');
        this.checkScheduleModal = document.getElementById('checkScheduleModal');
    }

    init() {
        this.btn.addEventListener('click', (event) => {
            let elementThis = event.currentTarget;
            this._renderCheckScheduleTable();

            const modalInstance = new bootstrap.Modal(this.checkScheduleModal);
            modalInstance.show();
        });
    }

    _renderCheckScheduleTable() {
        // 生成表头
        
    }
}

let gCST = new GenerateCheckScheduleTable();
gCST.init();
