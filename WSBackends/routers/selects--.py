import random
from calendar import monthrange
from collections import Counter
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload

import chinese_calendar
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import select

from .utils import CURRENT_PERSONNEL
from ..autoSchedule import Worker, InitWorkers, AutoOneSchedule
from ..database.models import Workschedule, Account, WorkschedulePersonnelLink, ReserveVacation, Personnel, RestInfo
from ..dependencies import get_current_user, SessionDep

router = APIRouter(tags=["selects"], dependencies=[Depends(get_current_user)])
InitWorkers.init_workers()


class QueryMonth(BaseModel):
    month_start: datetime
    month_end: datetime


class QueryMyMonth(QueryMonth):
    name: str


class QuerySchedule(BaseModel):
    name: str
    schedule_date: datetime

    is_first_day: bool
    today_mandatory_schedule: list[str]
    today_planed_schedule: dict[str, str] = {}


class QuerySuggestedSchedule(QuerySchedule):
    last_week_work_schedule: str
    last_work_schedule: str


# 查询单个月的排班情况
@router.post("/select-month-schedule")
async def select_month_schedule(queryMonth: QueryMonth, session: SessionDep):
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

    # 增加内容：判断奇怪的休假日和休息日
    isHolidays = dict()
    current_date = queryMonth.month_start
    while current_date <= queryMonth.month_end:  # Monday == 0 ... Sunday == 6
        date_str = current_date.strftime('%Y-%m-%d')

        on_holiday, holiday_name = chinese_calendar.get_holiday_detail(current_date)
        if holiday_name is not None:  # 如果有节日名，说明是节假日
            if on_holiday:
                isHolidays[date_str] = '休'
            else:
                isHolidays[date_str] = '班'

        current_date += timedelta(days=1)

    queryMonthResponse['isHolidays'] = isHolidays

    return queryMonthResponse


@router.post("/select-my-month-schedule", dependencies=None)
async def select_my_month_schedule(queryMonth: QueryMonth, session: SessionDep, user: Account = Depends(get_current_user)):
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


@router.post("/select_all-reservations")
async def select_all_reservations(queryMonth: QueryMonth, session: SessionDep):
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


@router.post("/select_my-reservation")
async def select_my_reservation(queryMyMonth: QueryMyMonth, session: SessionDep):
    personnel = session.exec(select(Personnel).where(Personnel.name == queryMyMonth.name)).first()
    if not personnel:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f'没有这个人! {queryMyMonth.name}')

    queryMyReservationResponse = {}
    statement = select(ReserveVacation).where(
        ReserveVacation.reserve_date >= queryMyMonth.month_start,
        ReserveVacation.reserve_date <= queryMyMonth.month_end,
        ReserveVacation.personnel == personnel
    )
    result: ReserveVacation = session.exec(statement).first()

    if result:
        queryMyReservationResponse['sequence'] = result.sequence
        queryMyReservationResponse['bantype'] = result.bantype.ban.value
        queryMyReservationResponse['name'] = result.personnel.name

    return queryMyReservationResponse


@router.post("/get_current_personnel_list")
async def get_current_personnel_list():
    return CURRENT_PERSONNEL


@router.post("/get_suggested_schedule")
async def get_suggested_schedule(querySchedule: QuerySchedule, session: SessionDep):
    if len(Worker.instances) == 0:
        InitWorkers.init_workers()

    current_worker = Worker.get_by_name(querySchedule.name)
    last_week_work_schedule, last_work_schedule = get_last_week_work_schedule_and_last_work_schedule(session, querySchedule.name, querySchedule.schedule_date)

    querySuggestedSchedule = QuerySuggestedSchedule(last_week_work_schedule=last_week_work_schedule, last_work_schedule=last_work_schedule, **querySchedule.model_dump())

    querySuggestedScheduleResponse = {}

    aos = AutoOneSchedule(worker=current_worker, **querySuggestedSchedule.model_dump())
    aos.get_possible_schedule()
    possible_schedule_dict: dict[float, list[str]] = aos.possible_schedule

    if len(possible_schedule_dict) == 0:
        return querySuggestedScheduleResponse
    else:
        for possibility, possible_schedules in possible_schedule_dict.items():
            if len(possible_schedules) != 0:
                new_possibility = f'{possibility * 100:.2f}%'
                querySuggestedScheduleResponse[new_possibility] = possible_schedules

    # 打乱一下
    for key in querySuggestedScheduleResponse:
        random.shuffle(querySuggestedScheduleResponse[key])

    return querySuggestedScheduleResponse


@router.post("/get_vacation_setting_data")
async def get_vacation_setting_data(session: SessionDep):
    all_data = []

    for personnel in CURRENT_PERSONNEL:
        data = get_person_vacation_setting_data(session, personnel)
        all_data.append(data)

    return all_data


def get_last_week_work_schedule_and_last_work_schedule(session: SessionDep, name: str, schedule_date: datetime) -> [str, str]:
    last_week_work_schedule_list = []
    last_work_schedule_list = []
    last_week_work_schedule = ''
    last_work_schedule = ''

    weekday = schedule_date.weekday()
    this_monday = schedule_date - timedelta(days=weekday)
    this_sunday = this_monday + timedelta(days=6)
    last_monday = this_monday - timedelta(days=7)
    last_sunday = this_monday - timedelta(days=1)

    personnel = session.exec(select(Personnel).where(Personnel.name == name)).first()
    if not personnel:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f'没有这个人! {queryMyMonth.name}')

    # 查找上一周上的 频次最多的 班
    statement = select(Workschedule).where(
        Workschedule.work_date >= last_monday,
        Workschedule.work_date <= last_sunday,
    )
    results = session.exec(statement).all()
    result: Workschedule
    personnel_link: WorkschedulePersonnelLink

    if len(results) == 0:
        # 上一周没有任何班的数据
        last_week_work_schedule = 'ZZ'
    else:
        for result in results:
            for personnel_link in result.personnel_links:
                if personnel_link.personnel == personnel:
                    last_week_work_schedule_list.append(result.bantype.ban.value)

    # 查找本周上的 频次最多的 班
    statement = select(Workschedule).where(
        Workschedule.work_date >= this_monday,
        Workschedule.work_date <= this_sunday,
    )
    results = session.exec(statement).all()
    result: Workschedule
    personnel_link: WorkschedulePersonnelLink

    if len(results) == 0:
        # 本周没有任何班的数据
        last_work_schedule = 'ZZ'
    else:
        for result in results:
            for personnel_link in result.personnel_links:
                if personnel_link.personnel == personnel:
                    last_work_schedule_list.append(result.bantype.ban.value)

    # 处理last_week_work_schedule_list
    last_week_work_schedule_list = [i for i in last_week_work_schedule_list if i != "休息"]
    if len(last_week_work_schedule_list) != 0:
        c = Counter(last_week_work_schedule_list)
        max_nums = max(c.values())

        for schedule, nums in c.items():
            if nums == max_nums:
                last_week_work_schedule = schedule
                break
    else:
        last_week_work_schedule = 'ZZ'

    # 处理last_work_schedule_list
    last_work_schedule_list = [i for i in last_work_schedule_list if i != "休息"]
    if len(last_work_schedule_list) != 0:
        c = Counter(last_work_schedule_list)
        max_nums = max(c.values())
        for schedule, nums in c.items():
            if nums == max_nums:
                last_work_schedule = schedule
                break
    else:
        last_work_schedule = 'ZZ'

    return last_week_work_schedule, last_work_schedule


def get_person_vacation_setting_data(session: SessionDep, name: str) -> dict:
    data = {
        'id': 1,
        'name': "张三",
        'avatar': "https://i.pravatar.cc/150?img=1",
        'weight': "A级",
        'workYears': "5年",
        'employeeId': "EMP001",
        'phone': "138****1234",
        'holidayRules': [
            # {type: "年假", startDate: "2024-01-01", endDate: "2024-12-31", days: 15},
            # {type: "婚假", startDate: "2024-06-01", endDate: "2024-06-10", days: 10}
        ],
        'holidayStats': [
            # {type: "年假", used: 8, remaining: 7, expiry: "2024-12-31"},
            # {type: "病假", used: 2, remaining: 8, expiry: "2024-12-31"},
            # {type: "婚假", used: 0, remaining: 10, expiry: "2024-12-31"}
        ],
        'workSchedule': {
            'month': "2024-05",
            'schedules': [
                # {type: "2A", count: 15},
                # {type: "休息", count: 8},
                # {type: "加班", count: 3}
            ]
        }
    }

    personnel = session.exec(select(Personnel).where(Personnel.name == name)).first()
    if not personnel:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f'没有这个人! {name}')

    account = session.exec(select(Account).where(Account.personnel == personnel)).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f'没有这个账户! {name}')

    root_now = datetime.now()
    root_start_date = datetime(root_now.year, 1, 1, 0, 0, 0, 0)
    root_end_date = datetime(root_now.year, 12, 31, 23, 59, 0, 0)

    data['id'] = personnel.id
    data['name'] = personnel.name
    data['avatar'] = account.avatar
    data['weight'] = f'{personnel.weight:.1f}'
    data['workYears'] = f'{root_now.year - personnel.hiredate.year} 年'
    data['employeeId'] = personnel.worknumber
    data['phone'] = personnel.phonenumber

    statement = select(RestInfo).where(
        RestInfo.personnel == personnel,
        RestInfo.start_date >= root_start_date,
        RestInfo.end_date <= root_end_date
    )
    results = session.exec(statement).all()
    for result in results:
        result: RestInfo
        bantype = result.bantype.ban.value
        startDate = result.start_date.strftime("%Y-%m-%d")
        endDate = result.end_date.strftime("%Y-%m-%d")
        days = result.available_days
        data['holidayRules'].append({'type': bantype, 'startDate': startDate, 'endDate': endDate, 'days': days})

        statement = select(Workschedule).where(
            Workschedule.work_date >= result.start_date,
            Workschedule.work_date <= result.end_date,
            Workschedule.bantype == result.bantype
        )
        res = session.exec(statement).all()
        used_days = 0
        for r in res:
            r: Workschedule
            for personnel_link in r.personnel_links:
                personnel_link: WorkschedulePersonnelLink
                if personnel_link.personnel != personnel:
                    continue

                used_days += 1
        data['holidayStats'].append({'type': bantype, 'used': used_days, 'remaining': days - used_days, 'expiry': endDate})

    # 获取本月的最后一天
    last_day = monthrange(root_now.year, root_now.month)[1]
    data['workSchedule']['month'] = f'{root_now.year}-{root_now.month:02d}'

    # statement = select(Workschedule).where(
    #     Workschedule.work_date >= datetime(root_now.year, root_now.month, 1, 10, 0, 0, 0),
    #     Workschedule.work_date <= datetime(root_now.year, root_now.month, last_day, 10, 0, 0, 0)
    # )
    statement = select(Workschedule).where(
        Workschedule.work_date >= datetime(2025, 4, 1, 10, 0, 0, 0),
        Workschedule.work_date <= datetime(2025, 4, 30, 10, 0, 0, 0)
    )
    results = session.exec(statement).all()
    all_workschedule_records = []
    for result in results:
        result: Workschedule

        for personnel_link in result.personnel_links:
            personnel_link: WorkschedulePersonnelLink
            if personnel_link.personnel != personnel:
                continue

            all_workschedule_records.append(result.bantype.ban.value)

    c = Counter(all_workschedule_records)
    for value, count in c.items():
        data['workSchedule']['schedules'].append({'type': value, 'count': count})

    return data
