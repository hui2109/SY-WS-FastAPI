from collections import Counter, defaultdict
from datetime import datetime
from enum import Enum
import copy
from typing import Optional


class Probability(Enum):
    """Enum for probability values."""
    NEVER = 0.0
    VERY_RARE = 0.05
    FEW = 0.1
    LOW = 0.33
    HALF = 0.5
    POSSIBLE = 0.7
    HIGH = 0.95
    ALWAYS = 1.0


# 自动排班逻辑
class Worker:
    # 类变量，存储所有实例
    _instances: dict[str, "Worker"] = {}

    def __init__(self, name: str,
                 weight: float = 0, *,
                 accelerator_prob: Probability = Probability.NEVER,
                 positioning_prob: Probability = Probability.NEVER,
                 counter_prob: Probability = Probability.NEVER,
                 accelerator1_prob: Probability = Probability.NEVER,
                 accelerator2_prob: Probability = Probability.NEVER,
                 accelerator3_prob: Probability = Probability.NEVER,
                 positioning1_prob: Probability = Probability.NEVER,
                 positioning2_prob: Probability = Probability.NEVER,
                 counter1_prob: Probability = Probability.NEVER,
                 counter2_prob: Probability = Probability.NEVER,
                 counter3_prob: Probability = Probability.NEVER,
                 ):
        self.name = name
        self.weight = weight
        self.accelerator_prob = accelerator_prob.value
        self.positioning_prob = positioning_prob.value
        self.counter_prob = counter_prob.value

        max_accelerator_prob = max(accelerator1_prob.value, accelerator2_prob.value, accelerator3_prob.value)
        max_positioning_prob = max(positioning1_prob.value, positioning2_prob.value)
        max_counter_prob = max(counter1_prob.value, counter2_prob.value, counter3_prob.value)

        if self.accelerator_prob == 0:
            self.accelerator_prob = Probability.NEVER.value
            self.accelerator1_prob = Probability.NEVER.value
            self.accelerator2_prob = Probability.NEVER.value
            self.accelerator3_prob = Probability.NEVER.value
        else:
            self.accelerator_prob = accelerator_prob.value

            if max_accelerator_prob == 0:
                self.accelerator1_prob = Probability.LOW.value * self.accelerator_prob
                self.accelerator2_prob = Probability.LOW.value * self.accelerator_prob
                self.accelerator3_prob = Probability.LOW.value * self.accelerator_prob
            else:
                self.accelerator1_prob = accelerator1_prob.value * self.accelerator_prob
                self.accelerator2_prob = accelerator2_prob.value * self.accelerator_prob
                self.accelerator3_prob = accelerator3_prob.value * self.accelerator_prob

        if self.positioning_prob == 0:
            self.positioning_prob = Probability.NEVER.value
            self.positioning1_prob = Probability.NEVER.value
            self.positioning2_prob = Probability.NEVER.value
        else:
            self.positioning_prob = positioning_prob.value

            if max_positioning_prob == 0:
                self.positioning1_prob = Probability.HALF.value * self.positioning_prob
                self.positioning2_prob = Probability.HALF.value * self.positioning_prob
            else:
                self.positioning1_prob = positioning1_prob.value * self.positioning_prob
                self.positioning2_prob = positioning2_prob.value * self.positioning_prob

        if self.counter_prob == 0:
            self.counter_prob = Probability.NEVER.value
            self.counter1_prob = Probability.NEVER.value
            self.counter2_prob = Probability.NEVER.value
            self.counter3_prob = Probability.NEVER.value
        else:
            self.counter_prob = counter_prob.value

            if max_counter_prob == 0:
                self.counter1_prob = Probability.LOW.value * self.counter_prob
                self.counter2_prob = Probability.LOW.value * self.counter_prob
                self.counter3_prob = Probability.LOW.value * self.counter_prob
            else:
                self.counter1_prob = counter1_prob.value * self.counter_prob
                self.counter2_prob = counter2_prob.value * self.counter_prob
                self.counter3_prob = counter3_prob.value * self.counter_prob

        # 将实例保存到类变量中
        Worker._instances[name] = self

    @classmethod
    def get_by_name(cls, name: str) -> Optional["Worker"]:
        """根据名字获取Worker实例"""
        return cls._instances.get(name)

    @classmethod
    def get_all_workers(cls) -> dict[str, "Worker"]:
        """获取所有Worker实例"""
        return cls._instances.copy()

    @classmethod
    def remove_worker(cls, name: str) -> Optional["Worker"]:
        """删除指定名字的Worker"""
        return cls._instances.pop(name, None)


class InitWorkers:
    @classmethod
    def init_workers(cls):
        # 初始化所有员工
        # ['叶荣', '肖贵珍', '赵仲', '黄发生', '黄文军', '余翔', '余涛', '杨鹏', '闫昱萤', '谭林', '王吉锐', '唐晓燕', '付昱东', '徐博', '康正樾', '戴梦莹', '凌子涵', '曾小洲', '张旭辉', '廖中凡', '尹红科', '杨星', '郑霞',
        # '金小靖']
        worker1 = Worker("叶荣", 1.0, accelerator_prob=Probability.NEVER, positioning_prob=Probability.ALWAYS,
                         counter_prob=Probability.NEVER, positioning1_prob=Probability.ALWAYS)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("赵仲", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.FEW,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("黄发生", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.FEW, accelerator2_prob=Probability.HIGH,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("余翔", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.VERY_RARE, accelerator2_prob=Probability.FEW,
                         accelerator3_prob=Probability.HIGH)
        worker2 = Worker("余涛", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.LOW, accelerator2_prob=Probability.HIGH,
                         accelerator3_prob=Probability.FEW)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)
        worker2 = Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
                         accelerator3_prob=Probability.VERY_RARE)


class AutoOneSchedule:
    def __init__(self, worker: Worker, work_date: datetime, last_work_schedule: str, today_all_schedule: list[str]):
        self.worker = worker
        self.work_date = work_date
        self.last_work_schedule = last_work_schedule
        self.today_all_schedule = today_all_schedule
        self.possible_schedule = defaultdict(list)

    def __sorted_schedule(self):
        # 按概率排序
        sorted_schedule = dict(sorted(self.possible_schedule.items(), key=lambda x: x[0], reverse=True))
        self.possible_schedule = sorted_schedule

    def __exclude_schedule(self):
        # 排除已排班的班次
        count_dict = Counter(self.today_all_schedule)
        exclude_letter = self.last_work_schedule[-1]

        copy_possible_schedule = copy.deepcopy(self.possible_schedule)

        for possibility, possible_schedule in self.possible_schedule.items():
            for schedule in possible_schedule:
                if count_dict[schedule] >= 2 or schedule[-1] == exclude_letter:
                    copy_possible_schedule[possibility].remove(schedule)

        self.possible_schedule = copy_possible_schedule

    def get_possible_schedule(self):
        # 按概率计算当前日期的可能排班
        if self.worker.accelerator_prob != 0:
            if self.worker.accelerator1_prob != 0:
                self.possible_schedule[self.worker.accelerator1_prob].append("1A")
                self.possible_schedule[self.worker.accelerator1_prob].append("1B")
                self.possible_schedule[self.worker.accelerator1_prob].append("1C")
            if self.worker.accelerator2_prob != 0:
                self.possible_schedule[self.worker.accelerator2_prob].append("2A")
                self.possible_schedule[self.worker.accelerator2_prob].append("2B")
                self.possible_schedule[self.worker.accelerator2_prob].append("2C")
            if self.worker.accelerator3_prob != 0:
                self.possible_schedule[self.worker.accelerator3_prob].append("3A")
                self.possible_schedule[self.worker.accelerator3_prob].append("3B")
                self.possible_schedule[self.worker.accelerator3_prob].append("3C")

        if self.worker.positioning_prob != 0:
            if self.worker.positioning1_prob != 0:
                self.possible_schedule[self.worker.positioning1_prob].append("S1")
            if self.worker.positioning2_prob != 0:
                self.possible_schedule[self.worker.positioning2_prob].append("S2")

        if self.worker.counter_prob != 0:
            if self.worker.counter1_prob != 0:
                self.possible_schedule[self.worker.counter1_prob].append("N1")
            if self.worker.counter2_prob != 0:
                self.possible_schedule[self.worker.counter2_prob].append("N2")
            if self.worker.counter3_prob != 0:
                self.possible_schedule[self.worker.counter3_prob].append("N3")

        self.__sorted_schedule()
        self.__exclude_schedule()


if __name__ == '__main__':
    # 示例数据
    # worker1 = Worker("黄发生", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER,
    #                  counter_prob=Probability.NEVER, accelerator2_prob=Probability.HIGH, accelerator1_prob=Probability.FEW, accelerator3_prob=Probability.VERY_RARE)
    # worker2 = Worker("张旭辉", 1.0, accelerator_prob=Probability.POSSIBLE, positioning_prob=Probability.LOW,
    #                  counter_prob=Probability.NEVER)
    # work_date = datetime(2023, 10, 1)
    # last_work_schedule = "2A"
    # today_all_schedule = ["1A", "2B", "3C", "S1", "N1", "N2", "N3", "S2", "1A", "2A", "3A", "3B", "3C", "2B"]
    #
    # auto_schedule = AutoOneSchedule(worker1, work_date, last_work_schedule, today_all_schedule)
    # auto_schedule.get_possible_schedule()
    # print(auto_schedule.possible_schedule)

    # worker = Worker.get_by_name("黄发生")
    # print(worker.name, worker.weight)
    # worker = Worker.get_by_name("张旭辉")
    # print(worker.name, worker.weight)

    InitWorkers.init_workers()
    worker = Worker.get_by_name("黄发生")
    print(worker, type(worker))
