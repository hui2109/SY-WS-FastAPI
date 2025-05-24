from datetime import datetime, time

from sqlmodel import SQLModel, Field, Relationship

from .utils import Bans, ScheduleStatus


class Account(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str
    password: str
    avatar: str | None = Field(default='/WSFrontends/assets/img/avatars/001-pirate.svg')

    # 一对一反向关系
    personnel: "Personnel" = Relationship(back_populates="account")


class Bantype(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    ban: Bans
    start_time: time
    end_time: time
    description: str | None

    workschedule: list["Workschedule"] = Relationship(back_populates="bantype")
    restinfos: list["RestInfo"] = Relationship(back_populates="bantype")
    reservevacation: list["ReserveVacation"] = Relationship(back_populates="bantype")

    # # 保证5个加起来的组合唯一
    # __table_args__ = (
    #     UniqueConstraint('machine_type', 'work_section_type', 'relax_type',
    #                      'auxiliary_type', 'overtime_type', name='uix_bantype_types'),


class WorkschedulePersonnelLink(SQLModel, table=True):
    workschedule_id: int = Field(foreign_key="workschedule.id", primary_key=True)
    personnel_id: int = Field(foreign_key="personnel.id", primary_key=True)

    personnel: "Personnel" = Relationship(back_populates="workschedule_links")
    workschedule: "Workschedule" = Relationship(back_populates="personnel_links")


# 人对账户: 一对一
# 人对休息日: 一对多
# 人对排班表: 多对多
class Personnel(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    weight: int = Field(default=1.0, index=True)
    hiredate: datetime
    worknumber: str
    phonenumber: str
    account_id: int | None = Field(default=None, foreign_key="account.id", unique=True)

    # Personnel持有Account的外键，定义明确的一对一关系
    account: Account = Relationship(back_populates="personnel")
    restinfos: list["RestInfo"] = Relationship(back_populates="personnel")
    reservevacation: list["ReserveVacation"] = Relationship(back_populates="personnel")
    workschedule_links: list[WorkschedulePersonnelLink] = Relationship(back_populates="personnel")
    # reservevacation_links: list["ReservePersonnelLink"] = Relationship(back_populates="personnel")


# 排班表对班种: 多对一
class Workschedule(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    work_date: datetime = Field(index=True)
    bantype_id: int | None = Field(default=None, foreign_key="bantype.id")
    status: ScheduleStatus = Field(default=ScheduleStatus.DRAFT, index=True)

    bantype: Bantype | None = Relationship(back_populates="workschedule")
    personnel_links: list[WorkschedulePersonnelLink] = Relationship(back_populates="workschedule")


# 休息日对班种: 多对一
# 休息日对人: 多对一
class RestInfo(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    start_date: datetime = Field(index=True)
    end_date: datetime = Field(index=True)
    available_days: int
    personnel_id: int | None = Field(default=None, foreign_key="personnel.id")
    bantype_id: int | None = Field(default=None, foreign_key="bantype.id")

    personnel: Personnel | None = Relationship(back_populates="restinfos")
    bantype: Bantype | None = Relationship(back_populates="restinfos")


# class ReservePersonnelLink(SQLModel, table=True):
#     reservevacation_id: int = Field(foreign_key="reservevacation.id", primary_key=True)
#     personnel_id: int = Field(foreign_key="personnel.id", primary_key=True)
#
#     personnel: Personnel = Relationship(back_populates="reservevacation_links")
#     reservevacation: "ReserveVacation" = Relationship(back_populates="personnel_links")


# 预约排班 与 人 : 多对一
# 预约排班 与 班 : 多对一
class ReserveVacation(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    sequence: int = Field(index=True)
    reserve_date: datetime = Field(index=True)
    bantype_id: int | None = Field(default=None, foreign_key="bantype.id")
    personnel_id: int | None = Field(default=None, foreign_key="personnel.id")

    bantype: Bantype | None = Relationship(back_populates="reservevacation")
    personnel: Personnel | None = Relationship(back_populates="reservevacation")
    # personnel_links: list[ReservePersonnelLink] = Relationship(back_populates="reservevacation")
