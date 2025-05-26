from WSBackends.autoSchedule import Worker, AutoOneSchedule, InitWorkers

if __name__ == '__main__':
    InitWorkers.init_workers()

    print(len(Worker.instances))

    today_mandatory_schedule = ["1A", "1B", "2A", "2B", "2C", "3A", "3B", "S1", "S2", "N1", "N2"]

    # 待排班的人
    # names = ['叶荣', '肖贵珍', '赵仲', '黄发生', '黄文军', '余翔', '余涛', '杨鹏', '闫昱萤', '谭林', '王吉锐', '唐晓燕', '付昱东', '徐博', '康正樾', '戴梦莹', '凌子涵', '曾小洲', '张旭辉', '廖中凡', '尹红科', '杨星', '郑霞', '金小靖']

    worker = Worker.get_by_name('张旭辉')
    aos = AutoOneSchedule(worker, '放射假', 'last_work_schedule', True, today_mandatory_schedule, {}, name='sss')
    aos.get_possible_schedule()
    print(aos.possible_schedule)
