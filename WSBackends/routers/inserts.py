from datetime import datetime, time

from fastapi import Depends, APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select

from .utils import convert_UTC_Chinese, CURRENT_PERSONNEL
from ..database.models import Account, Personnel, Bantype, Workschedule, WorkschedulePersonnelLink, ReserveVacation
from ..database.utils import Bans
from ..dependencies import get_current_user, SessionDep

router = APIRouter(tags=["inserts"], dependencies=[Depends(get_current_user)])


class OneBan(BaseModel):
    ban: Bans
    start_time: time
    end_time: time

    description: str | None = None


class OneSchedule(BaseModel):
    name: str
    ban: Bans
    work_date: datetime


class OneReserve(BaseModel):
    sequence: int
    name: str
    relax: Bans
    date: datetime


@router.post('/create-ban')
async def create_ban(one_ban: OneBan, session: SessionDep):
    exist_ban = session.exec(select(Bantype).where(Bantype.ban == one_ban.ban)).first()
    if exist_ban:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='该班种已存在!')

    bantype = Bantype(**one_ban.model_dump())
    session.add(bantype)
    session.commit()
    session.refresh(bantype)

    return bantype


@router.post('/create-schedule')
async def create_schedule(one_schedule: OneSchedule, session: SessionDep):
    # UTC时区 转 中国时区, 固定到早上10点
    one_schedule.work_date = convert_UTC_Chinese(one_schedule.work_date).replace(hour=10)

    personnel = session.exec(select(Personnel).where(Personnel.name == one_schedule.name)).first()
    if not personnel:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f'没有这个人! {one_schedule.name}')

    bantype = session.exec(select(Bantype).where(Bantype.ban == one_schedule.ban)).first()
    if not bantype:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='没有班种信息! 请先创建班种!')

    workschedule = session.exec(select(Workschedule).where(
        Workschedule.work_date == one_schedule.work_date,
        Workschedule.bantype == bantype
    )).first()
    if not workschedule:
        workschedule = Workschedule(**one_schedule.model_dump(), bantype=bantype)  # bantype: 注意大小写!

    wpLink = session.exec(select(WorkschedulePersonnelLink).where(
        WorkschedulePersonnelLink.workschedule == workschedule,
        WorkschedulePersonnelLink.personnel == personnel
    )).first()
    if not wpLink:
        wpLink = WorkschedulePersonnelLink(personnel=personnel, workschedule=workschedule)

    session.add(wpLink)
    session.commit()
    session.refresh(wpLink)

    return wpLink


@router.post('/create-reserve')
async def create_reserve(reserves: list[OneReserve], session: SessionDep):
    current_reserve_vacation_list = []

    for one_reserve in reserves:
        personnel = session.exec(select(Personnel).where(Personnel.name == one_reserve.name)).first()
        if not personnel:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='没有这个人! {one_reserve.name}')

        bantype = session.exec(select(Bantype).where(Bantype.ban == one_reserve.relax)).first()
        if not bantype:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='没有班种信息! 请先创建班种!')

        exclude_same_date_seq = session.exec(select(ReserveVacation).where(
            ReserveVacation.sequence == one_reserve.sequence,
            ReserveVacation.reserve_date == one_reserve.date,
        )).first()
        exclude_same_date_personnel = session.exec(select(ReserveVacation).where(
            ReserveVacation.personnel == personnel,
            ReserveVacation.reserve_date == one_reserve.date,
        )).first()

        if (not exclude_same_date_seq) and (not exclude_same_date_personnel):
            current_reserve_vacation = ReserveVacation(sequence=one_reserve.sequence, reserve_date=one_reserve.date, bantype=bantype, personnel=personnel)
            current_reserve_vacation_list.append(current_reserve_vacation)
        else:
            if exclude_same_date_seq:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='该日期已存在预约!')

            if exclude_same_date_personnel:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'{one_reserve.name} 已存在预约!')

    # 全部没问题，才提交
    for current_reserve_vacation in current_reserve_vacation_list:
        session.add(current_reserve_vacation)

    session.commit()
    return {'detail': '预约休假成功!'}
