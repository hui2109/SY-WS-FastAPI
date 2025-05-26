import copy
from collections import Counter, defaultdict
from enum import Enum
from typing import Optional

from .database.utils import Bans


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


class Worker:
    # 类变量，存储所有实例
    instances: dict[str, "Worker"] = {}

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
                 ):
        self.name = name
        self.weight = weight
        self.accelerator_prob = accelerator_prob.value
        self.positioning_prob = positioning_prob.value
        self.counter_prob = counter_prob.value

        max_accelerator_prob = max(accelerator1_prob.value, accelerator2_prob.value, accelerator3_prob.value)
        max_positioning_prob = max(positioning1_prob.value, positioning2_prob.value)
        max_counter_prob = max(counter1_prob.value, counter2_prob.value)

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
        else:
            self.counter_prob = counter_prob.value

            if max_counter_prob == 0:
                self.counter1_prob = Probability.HALF.value * self.counter_prob
                self.counter2_prob = Probability.HALF.value * self.counter_prob
            else:
                self.counter1_prob = counter1_prob.value * self.counter_prob
                self.counter2_prob = counter2_prob.value * self.counter_prob

        # 将实例保存到类变量中
        Worker.instances[name] = self

    @classmethod
    def get_by_name(cls, name: str) -> Optional["Worker"]:
        """根据名字获取Worker实例"""
        return cls.instances.get(name)

    @classmethod
    def get_all_workers(cls) -> dict[str, "Worker"]:
        """获取所有Worker实例"""
        return cls.instances.copy()

    @classmethod
    def remove_worker(cls, name: str) -> Optional["Worker"]:
        """删除指定名字的Worker"""
        return cls.instances.pop(name, None)


class InitWorkers:
    @classmethod
    def init_workers(cls):
        # 初始化所有员工
        # ['叶荣', '肖贵珍', '赵仲', '黄发生', '黄文军', '余翔', '余涛', '杨鹏', '闫昱萤', '谭林', '王吉锐', '唐晓燕', '付昱东', '徐博', '康正樾', '戴梦莹', '凌子涵', '曾小洲', '张旭辉', '廖中凡', '尹红科', '杨星', '郑霞', '金小靖']
        Worker("叶荣", 1.0, accelerator_prob=Probability.NEVER, positioning_prob=Probability.ALWAYS, counter_prob=Probability.NEVER, positioning1_prob=Probability.ALWAYS)
        Worker("肖贵珍", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.VERY_RARE,
               accelerator3_prob=Probability.VERY_RARE)
        Worker("赵仲", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.FEW,
               accelerator3_prob=Probability.VERY_RARE)
        Worker("黄发生", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.FEW, accelerator2_prob=Probability.HIGH,
               accelerator3_prob=Probability.VERY_RARE)
        Worker("黄文军", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.FEW,
               accelerator3_prob=Probability.VERY_RARE)
        Worker("余翔", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.VERY_RARE, accelerator2_prob=Probability.FEW,
               accelerator3_prob=Probability.HIGH)
        Worker("余涛", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.LOW, accelerator2_prob=Probability.HIGH, accelerator3_prob=Probability.FEW)
        Worker("杨鹏", 1.0, accelerator_prob=Probability.HIGH, positioning_prob=Probability.FEW, counter_prob=Probability.NEVER, accelerator1_prob=Probability.FEW, accelerator2_prob=Probability.HIGH, accelerator3_prob=Probability.VERY_RARE,
               positioning1_prob=Probability.ALWAYS)
        Worker("闫昱萤", 1.0, accelerator_prob=Probability.NEVER, positioning_prob=Probability.ALWAYS, counter_prob=Probability.NEVER, positioning1_prob=Probability.ALWAYS)
        Worker("谭林", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.FEW, accelerator2_prob=Probability.FEW,
               accelerator3_prob=Probability.HIGH)
        Worker("王吉锐", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.LOW, accelerator2_prob=Probability.POSSIBLE,
               accelerator3_prob=Probability.LOW)
        Worker("唐晓燕", 1.0, accelerator_prob=Probability.HALF, positioning_prob=Probability.HALF, counter_prob=Probability.NEVER, accelerator1_prob=Probability.FEW, accelerator2_prob=Probability.FEW, accelerator3_prob=Probability.HIGH,
               positioning2_prob=Probability.ALWAYS)
        Worker("付昱东", 1.0, accelerator_prob=Probability.ALWAYS, positioning_prob=Probability.NEVER, counter_prob=Probability.NEVER, accelerator1_prob=Probability.HIGH, accelerator2_prob=Probability.LOW,
               accelerator3_prob=Probability.LOW)
        Worker("徐博", 1.0, accelerator_prob=Probability.HALF, positioning_prob=Probability.HALF, counter_prob=Probability.NEVER, accelerator1_prob=Probability.LOW, accelerator2_prob=Probability.LOW,
               accelerator3_prob=Probability.HIGH, positioning2_prob=Probability.ALWAYS)
        Worker("康正樾", 1.0, accelerator_prob=Probability.POSSIBLE, positioning_prob=Probability.LOW, counter_prob=Probability.NEVER, positioning1_prob=Probability.HIGH, positioning2_prob=Probability.VERY_RARE)
        Worker("戴梦莹", 1.0, accelerator_prob=Probability.FEW, positioning_prob=Probability.HIGH, counter_prob=Probability.NEVER, positioning1_prob=Probability.FEW, positioning2_prob=Probability.HIGH)
        Worker("凌子涵", 0.8, accelerator_prob=Probability.POSSIBLE, positioning_prob=Probability.LOW, counter_prob=Probability.NEVER)
        Worker("曾小洲", 0.8, accelerator_prob=Probability.HALF, positioning_prob=Probability.HALF, counter_prob=Probability.NEVER)
        Worker("张旭辉", 0.5, accelerator_prob=Probability.POSSIBLE, positioning_prob=Probability.LOW, counter_prob=Probability.NEVER)
        Worker("廖中凡", 0.5, accelerator_prob=Probability.POSSIBLE, positioning_prob=Probability.LOW, counter_prob=Probability.NEVER)
        Worker("尹红科", 0.5, accelerator_prob=Probability.POSSIBLE, positioning_prob=Probability.LOW, counter_prob=Probability.NEVER)
        Worker("杨星", 1.5, accelerator_prob=Probability.NEVER, positioning_prob=Probability.NEVER, counter_prob=Probability.ALWAYS, counter1_prob=Probability.ALWAYS)
        Worker("郑霞", 1.5, accelerator_prob=Probability.NEVER, positioning_prob=Probability.NEVER, counter_prob=Probability.ALWAYS, counter2_prob=Probability.ALWAYS)
        Worker("金小靖", 1.5, accelerator_prob=Probability.NEVER, positioning_prob=Probability.NEVER, counter_prob=Probability.ALWAYS, counter1_prob=Probability.HALF, counter2_prob=Probability.HALF)


class AutoOneSchedule:
    def __init__(self, worker: Worker, last_week_work_schedule: str, last_work_schedule: str, is_first_day: bool, today_mandatory_schedule: list[str], today_planed_schedule: dict[str, str], **kwargs):
        self.worker = worker
        self.last_week_work_schedule = last_week_work_schedule
        self.last_work_schedule = last_work_schedule
        self.is_first_day = is_first_day
        self.today_planed_schedule = today_planed_schedule
        self.today_mandatory_schedule = today_mandatory_schedule
        self.possible_schedule = defaultdict(list)

        # 按这个顺序迭代排班
        self.turn_shift = {"B": "A", "A": "C", "C": "B"}

        # 这些排班最少只需要1个人
        self.one_person_schedule_list = [Bans.S2.value, Bans.N1.value]

        # 这些班没有参考意义, 不能作为连上的根据, 例如: 一个人上周上了OTB, 那么这一周任何班都可以排; 或者一个人上一周上了2B, 这一周OTB也可以排
        self.nonsense_schedule_list = [Bans.ENGAGE.value, Bans.TRAIN.value, Bans.JD.value, Bans.OAE.value, Bans.OBE.value, Bans.OCE.value,
                                       Bans.OAF.value, Bans.OBF.value, Bans.OCF.value, Bans.OTR.value, Bans.OTB.value, Bans.OVB.value,
                                       Bans.OPHY.value]

    def __sorted_schedule(self):
        # 按概率排序
        sorted_schedule = dict(sorted(self.possible_schedule.items(), key=lambda x: x[0], reverse=True))

        self.possible_schedule = sorted_schedule

    def __exclude_schedule(self):
        self.count_dict = Counter(self.today_planed_schedule.values())
        copy_possible_schedule = copy.deepcopy(self.possible_schedule)

        for possibility, possible_schedules in self.possible_schedule.items():
            for schedule in possible_schedules:
                # 判断上一周或上一次的排班是否相同，如果上一周上B班，则按照BAC的顺序；如果今天不是第一天，则 优先推荐第一天的排班，即 self.last_work_schedule
                result = self.__judge_last_week_and_last_work_schedule(schedule)
                if type(result) is str:
                    if result.startswith('!'):
                        res = result[1:]
                        if res not in copy_possible_schedule[1.1]:
                            copy_possible_schedule[1.1].append(res)  # 重点班 概率设为 1.1

                        if res in copy_possible_schedule[possibility]:
                            copy_possible_schedule[possibility].remove(res)
                    else:
                        if result in copy_possible_schedule[possibility]:
                            copy_possible_schedule[possibility].remove(result)

                            if not copy_possible_schedule.get(possibility + 0.01):
                                copy_possible_schedule[possibility + 0.01] = []
                            copy_possible_schedule[possibility + 0.01].append(result)  # 将该排班增加1%的概率
                else:
                    if not result:
                        copy_possible_schedule[possibility].remove(schedule)
        self.possible_schedule = copy.deepcopy(copy_possible_schedule)

        # 由于copy_possible_schedule里面加了点东西, 所以必须重新开始循环
        for possibility, possible_schedules in self.possible_schedule.items():
            for schedule in possible_schedules:
                # 判断排班是否在 必须要排的 排班里
                if not self.__judge_schedule_in_mandatory(schedule):
                    copy_possible_schedule[possibility].remove(schedule)

                # 判断 已有排班 是否已超过2个人，或者本来只需排1个人的班，已超过了1个人，或者 两个人一起搭班，权重和是否大于1.5
                if not self.__judge_planed_schedule_number(schedule):
                    copy_possible_schedule[possibility].remove(schedule)
        self.possible_schedule = copy_possible_schedule

    def __judge_last_week_and_last_work_schedule(self, schedule):
        # 单独排除OTB/OVB等情况
        if schedule in self.nonsense_schedule_list:
            return True

        if self.last_week_work_schedule in self.nonsense_schedule_list:
            return True

        if self.is_first_day:
            exclude_letter = self.last_week_work_schedule[-1]

            if exclude_letter in self.turn_shift.keys():
                if exclude_letter == schedule[-1]:
                    return False
                else:
                    next_turn = self.turn_shift.get(exclude_letter)
                    if next_turn == schedule[-1]:
                        return schedule  # 这个是重点排的班
                    else:
                        return True
            else:
                return True
        else:
            return '!' + self.last_work_schedule  # 这个是超级重点排的班, 保证一个人每一周上一样的班

    def __judge_schedule_in_mandatory(self, schedule):
        if schedule not in self.today_mandatory_schedule:
            return False
        return True

    def __judge_planed_schedule_number(self, schedule):
        if schedule in self.one_person_schedule_list:
            if self.count_dict[schedule] >= 1:
                return False
            else:
                return True
        else:
            if self.count_dict[schedule] >= 2:
                return False
            else:
                # 这个班还没有人排过
                if self.count_dict[schedule] == 0:
                    return True
                else:
                    # 这个班有1个人排过
                    keys_with_schedule = [k for k, v in self.today_planed_schedule.items() if v == f'{schedule}']
                    if len(keys_with_schedule) != 1:
                        raise ValueError('出错了！找不到只排了一个人的排班！')
                    else:
                        return self.__judge_person_schedule_weight(keys_with_schedule[0])

    def __judge_person_schedule_weight(self, name):
        worker = Worker.get_by_name(name)
        if worker is None:
            raise ValueError('出错了！没有这个人！')

        if worker.weight + self.worker.weight >= 1.5:
            return True
        else:
            return False

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

        self.possible_schedule[1.1] = []  # 单独设置一个重点班种
        self.__sorted_schedule()
        self.__exclude_schedule()
        self.__sorted_schedule()
