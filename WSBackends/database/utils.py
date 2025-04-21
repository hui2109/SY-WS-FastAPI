from enum import Enum


class MachineType(Enum):
    AC1 = '1'
    AC2 = '2'
    AC3 = '3'
    CT1 = 'S1'
    CT2 = 'S2'
    NA = 'NA'


class WorkSectionType(Enum):
    A = 'A'
    B = 'B'
    C = 'C'
    NA = 'NA'


class RelaxType(Enum):
    NORMAL = '休息'
    RL = '放射假'  # Radiation Leave
    AL = '年假'  # Annual Leave

    SICK = '病假'
    EVENT = '事假'

    MARRY = '婚假'
    ML = '产假'  # maternity leave
    PL = '陪产假'  # paternity leave
    CL = '育儿假'  # childcare leave

    FL = '丧假'  # funeral leave
    OTHERS = '其他'

    NA = 'NA'


class AuxiliaryType(Enum):
    N1 = 'N1'
    N2 = 'N2'
    ENGAGE = '进修'
    NA = 'NA'


class OvertimeType(Enum):
    OE = 'E'
    OF = 'F'
    OPHY = 'Phy'
    NA = 'NA'
