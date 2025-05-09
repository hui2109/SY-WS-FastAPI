from datetime import datetime, time

from fastapi import Depends, APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select

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
    ban: Bans
    reserve_dates: list[datetime]


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
    personnel = session.exec(select(Personnel).where(Personnel.name == one_schedule.name)).first()
    if not personnel:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='没有这个人!')

    bantype = session.exec(select(Bantype).where(Bantype.ban == one_schedule.ban)).first()
    if not bantype:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='没有班种信息! 请先创建班种!')

    workschedule = session.exec(select(Workschedule).where(
        Workschedule.work_date == one_schedule.work_date,
        Workschedule.bantype == bantype
    )).first()
    if not workschedule:
        workschedule = Workschedule(**one_schedule.model_dump(), bantype=bantype)  # bantype: 注意大小写!

    wpLink = WorkschedulePersonnelLink(personnel=personnel, workschedule=workschedule)

    session.add(wpLink)
    session.commit()
    session.refresh(wpLink)

    return wpLink


@router.post('/create-reserve')
async def create_reserve(reserves: list[OneReserve], session: SessionDep):
    for one_reserve in reserves:
        personnel = session.exec(select(Personnel).where(Personnel.name == one_reserve.name)).first()
        if not personnel:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='没有这个人!')

        bantype = session.exec(select(Bantype).where(Bantype.ban == one_reserve.ban)).first()
        if not bantype:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='没有班种信息! 请先创建班种!')

        for reserve_date in one_reserve.reserve_dates:
            current_reserve_vacation = session.exec(select(ReserveVacation).where(
                ReserveVacation.sequence == one_reserve.sequence,
                ReserveVacation.reserve_date == reserve_date,
                ReserveVacation.sequence == one_reserve.sequence,
                ReserveVacation.personnel == personnel
            )).first()
            if not current_reserve_vacation:
                current_reserve_vacation = ReserveVacation(**one_reserve.model_dump(), reserve_date=reserve_date, bantype=bantype, personnel=personnel)
                session.add(current_reserve_vacation)
            else:
                current_reserve_vacation.bantype = bantype
        session.commit()
    return {'detail': '预约休假成功!'}
