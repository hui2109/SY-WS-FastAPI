from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select

from ..database.models import Personnel, Bantype, ReserveVacation, Workschedule, WorkschedulePersonnelLink
from ..database.utils import Bans
from ..dependencies import SessionDep
from .inserts import OneSchedule, OneReserve
from .utils import convert_UTC_Chinese

router = APIRouter(tags=["deletes"])


class DateRange(BaseModel):
    start_date: datetime
    end_date: datetime


@router.post('/delete-reserve')
async def create_reserve(reserves: list[OneReserve], session: SessionDep):
    for one_reserve in reserves:
        personnel = session.exec(select(Personnel).where(Personnel.name == one_reserve.name)).first()
        if not personnel:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='没有这个人!')

        bantype = session.exec(select(Bantype).where(Bantype.ban == one_reserve.relax)).first()
        if not bantype:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='没有班种信息! 请先创建班种!')

        current_reserve_vacation = session.exec(select(ReserveVacation).where(
            ReserveVacation.sequence == one_reserve.sequence,
            ReserveVacation.reserve_date == one_reserve.date,
            ReserveVacation.bantype == bantype,
            ReserveVacation.personnel == personnel,
        )).first()
        if current_reserve_vacation:
            session.delete(current_reserve_vacation)

    session.commit()
    return {'detail': '删除休假成功!'}


@router.post('/delete_work_schedule')
async def delete_work_schedule(one_schedule: OneSchedule, session: SessionDep):
    # UTC时区 转 中国时区
    one_schedule.work_date = convert_UTC_Chinese(one_schedule.work_date)

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
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f'没有这个排班 {one_schedule.ban} 信息!')

    wpLink = session.exec(select(WorkschedulePersonnelLink).where(
        WorkschedulePersonnelLink.workschedule == workschedule,
        WorkschedulePersonnelLink.personnel == personnel
    )).first()

    if wpLink:
        session.delete(wpLink)
        # session.delete(workschedule)  不能删除workschedule，因为可能还有其他人关联到这个排班

    session.commit()

    return {'detail': '删除排程成功!'}


@router.post('/delete_all_work_schedule')
async def delete_all_work_schedule(date_range: DateRange, session: SessionDep):
    # UTC时区 转 中国时区
    date_range.start_date = convert_UTC_Chinese(date_range.start_date)
    date_range.end_date = convert_UTC_Chinese(date_range.end_date)
    count = 0

    results = session.exec(select(Workschedule).where(
        Workschedule.work_date >= date_range.start_date,
        Workschedule.work_date <= date_range.end_date
    )).all()
    result: Workschedule

    for result in results:
        wpLink: WorkschedulePersonnelLink
        for wpLink in result.personnel_links:
            session.delete(wpLink)
            count += 1
        session.delete(result)

    session.commit()

    return {'detail': f'{count}'}
