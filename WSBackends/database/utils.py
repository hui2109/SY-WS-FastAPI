from enum import Enum


class Bans(Enum):
    NA = 'NA'

    _1A = '1A'
    _2A = '2A'
    _3A = '3A'
    _1B = '1B'
    _2B = '2B'
    _3B = '3B'
    _1C = '1C'
    _2C = '2C'
    _3C = '3C'

    S1 = 'S1'
    S2 = 'S2'

    N1 = 'N1'
    N2 = 'N2'

    ENGAGE = '进修'
    TRAIN = '培训'
    JD = '机动'

    RELAX = '休息'
    RL = '放射假'  # Radiation Leave
    AL = '年假'  # Annual Leave
    SICK = '病假'
    EVENT = '事假'
    MARRY = '婚假'
    ML = '产假'  # maternity leave
    PL = '陪产假'  # paternity leave
    CL = '育儿假'  # childcare leave
    FL = '丧假'  # funeral leave
    OTHERS = '其他假'

    OAE = 'OAE'  # Overtime
    OBE = 'OBE'
    OCE = 'OCE'
    OAF = 'OAF'
    OBF = 'OBF'
    OCF = 'OCF'

    OTR = 'OTR'
    OTB = 'OTB'
    OVB = 'OVB'

    OPHY = 'Phy'


class ScheduleStatus(Enum):
    PUBLISHED = '已发布'
    PendingReview = '待审核'
    DRAFT = '草稿'
