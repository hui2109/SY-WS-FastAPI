from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import select
from pypinyin import pinyin, load_phrases_dict, lazy_pinyin

from .utils import convert_UTC_Chinese
from ..database.models import Workschedule, Account, WorkschedulePersonnelLink, ReserveVacation
from ..dependencies import get_current_user, SessionDep

router = APIRouter(tags=["selects"], dependencies=[Depends(get_current_user)])


class QueryMonth(BaseModel):
    month_start: datetime
    month_end: datetime


# 查询单个月的排班情况
@router.post("/select-month-schedule")
async def select_month_schedule(queryMonth: QueryMonth, session: SessionDep):
    # UTC时区 转 中国时区
    queryMonth.month_start = convert_UTC_Chinese(queryMonth.month_start)
    queryMonth.month_end = convert_UTC_Chinese(queryMonth.month_end)

    queryMonthResponse = {}
    personnel_set = set()

    # 首先应该获取当前月的人员名单
    statement = select(Workschedule).where(
        Workschedule.work_date >= queryMonth.month_start,
        Workschedule.work_date <= queryMonth.month_end
    )
    results = session.exec(statement).all()
    result: Workschedule
    for result in results:
        work_date = result.work_date
        personnel_links = result.personnel_links
        ban = result.bantype.ban

        personnel_link: WorkschedulePersonnelLink
        for personnel_link in personnel_links:
            personnel_name = personnel_link.personnel.name

            _key = f'{personnel_name}_{work_date.year}_{work_date.month}_{work_date.day}'

            if queryMonthResponse.get(_key) is None:
                values = [f'{ban.value}']
                queryMonthResponse[_key] = values
            else:
                queryMonthResponse[_key].append(f'{ban.value}')

            personnel_set.add(personnel_name)
    queryMonthResponse['personnels'] = personnel_set

    return queryMonthResponse


@router.post("/select-my-month-schedule", dependencies=None)
async def select_my_month_schedule(queryMonth: QueryMonth, session: SessionDep, user: Account = Depends(get_current_user)):
    # UTC时区 转 中国时区
    queryMonth.month_start = convert_UTC_Chinese(queryMonth.month_start)
    queryMonth.month_end = convert_UTC_Chinese(queryMonth.month_end)

    name = user.personnel.name
    queryMyMonthResponse = {}

    statement = select(Workschedule).where(
        Workschedule.work_date >= queryMonth.month_start,
        Workschedule.work_date <= queryMonth.month_end
    )
    results = session.exec(statement).all()
    result: Workschedule
    for result in results:
        personnel_links = result.personnel_links
        personnel_link: WorkschedulePersonnelLink
        names_in_personnel_links = [personnel_link.personnel.name for personnel_link in personnel_links]
        if name in names_in_personnel_links:
            work_date = result.work_date
            ban = result.bantype.ban

            names_in_personnel_links.remove(name)
            coworker_names_list = names_in_personnel_links

            _key = f'{name}_{work_date.year}_{work_date.month}_{work_date.day}'
            _value = {
                'ban': f'{ban.value}',
                'coworkers': coworker_names_list
            }
            if queryMyMonthResponse.get(_key) is None:
                queryMyMonthResponse[_key] = [_value]
            else:
                queryMyMonthResponse[_key].append(_value)

    return queryMyMonthResponse


@router.post("/select_all-reservations", dependencies=None)
async def select_all_reservations(queryMonth: QueryMonth, session: SessionDep):
    # UTC时区 转 中国时区
    queryMonth.month_start = convert_UTC_Chinese(queryMonth.month_start)
    queryMonth.month_end = convert_UTC_Chinese(queryMonth.month_end)

    queryAllReservationsResponse = []

    statement = select(ReserveVacation).where(
        ReserveVacation.reserve_date >= queryMonth.month_start,
        ReserveVacation.reserve_date <= queryMonth.month_end
    )
    results = session.exec(statement).all()
    result: ReserveVacation
    for result in results:
        sequence = result.sequence
        reserve_date = result.reserve_date
        name = result.personnel.name
        bantype = result.bantype.ban.value

        queryAllReservationsResponse.append({
            'sequence': sequence,
            'reserve_date': reserve_date,
            'name': name,
            'bantype': bantype
        })

    return queryAllReservationsResponse
