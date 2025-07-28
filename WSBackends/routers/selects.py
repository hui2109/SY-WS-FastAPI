import random
from calendar import monthrange
from collections import Counter
from datetime import date, timedelta, datetime

import chinese_calendar
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import joinedload
from sqlmodel import select

from .utils import CURRENT_PERSONNEL, MANDATORY_SCHEDULE
from ..autoSchedule import Worker, InitWorkers, AutoOneSchedule
from ..database.models import Workschedule, Account, WorkschedulePersonnelLink, ReserveVacation, Personnel, RestInfo, Bantype
from ..database.utils import Bans
from ..dependencies import get_current_user, SessionDep

router = APIRouter(tags=["selects"], dependencies=[Depends(get_current_user)])


class QueryMonth(BaseModel):
    month_start: date
    month_end: date


class QueryMyMonth(QueryMonth):
    name: str


class QuerySchedule(BaseModel):
    name: str
    schedule_date: date

    is_first_day: bool
    today_mandatory_schedule: list[str]
    today_planed_schedule: dict[str, str] = {}


class QuerySuggestedSchedule(QuerySchedule):
    last_week_work_schedule: str
    last_work_schedule: str


class QueryMonthlyWorkScheduleStatistics(BaseModel):
    month: date
    personnel_id: int


# 查询单个月的排班情况
@router.post("/select-month-schedule", dependencies=None)
async def select_month_schedule(queryMonth: QueryMonth, session: SessionDep, user: Account = Depends(get_current_user)):
    priority_name = user.personnel.name
    queryMonthResponse = {}
    personnel_set = set()
    status_set = set()

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
        status_set.add(result.status)

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
    personnel_list = list(personnel_set)

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

    # 更改班名的顺序
    for _key, _value in queryMonthResponse.items():
        if _key == 'isHolidays' or _key == 'personnels':
            continue

        if len(_value) > 1:
            new_value_list = []
            for _value_item in _value:
                if _value_item in MANDATORY_SCHEDULE:
                    new_value_list.insert(0, _value_item)
                else:
                    new_value_list.append(_value_item)
            queryMonthResponse[_key] = new_value_list

    # 更改personnels的顺序, 按照CURRENT_PERSONNEL的顺序, 如果元素不在CURRENT_PERSONNEL里, 移至最后; 如果name是 priority_name，则将它移至最前面
    # 创建优先级字典
    priority = {name: i for i, name in enumerate(CURRENT_PERSONNEL)}

    # 排序函数
    def sort_key(name):
        if name == priority_name:
            return -1, 0  # 自己的名字放最前面，最高优先
        return 0, priority.get(name, float('inf'))  # 其次按 CURRENT_PERSONNEL 顺序，其他放最后

    # 排序
    personnel_list = sorted(personnel_list, key=sort_key)
    queryMonthResponse['personnels'] = personnel_list

    # 新增: 排班状态判断
    queryMonthResponse['status'] = list(status_set)

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
            status = result.status

            names_in_personnel_links.remove(name)
            coworker_names_list = names_in_personnel_links

            _key = f'{name}_{work_date.year}_{work_date.month}_{work_date.day}'
            _value = {
                'ban': f'{ban.value}',
                'coworkers': coworker_names_list,
                'status': status
            }
            if queryMyMonthResponse.get(_key) is None:
                queryMyMonthResponse[_key] = [_value]
            else:
                queryMyMonthResponse[_key].append(_value)

    # 更改班名的顺序
    for _key, _value in queryMyMonthResponse.items():
        if len(_value) > 1:
            new_value_list = []
            for _value_item in _value:
                if _value_item['ban'] in MANDATORY_SCHEDULE:
                    new_value_list.insert(0, _value_item)
                else:
                    new_value_list.append(_value_item)
            queryMyMonthResponse[_key] = new_value_list

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
        InitWorkers.init_workers(session)

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


@router.post("/get_vacation_setting_data", dependencies=None)
async def get_vacation_setting_data(session: SessionDep, onePerson_name: str = None, user: Account = Depends(get_current_user)):
    all_data = []

    if onePerson_name:
        data = get_person_vacation_setting_data(session, onePerson_name)
        all_data.append(data)
    else:
        # 优化: 将本人的休假信息卡片放在第一位
        my_name = user.personnel.name
        better_personnel_list = CURRENT_PERSONNEL.copy()
        better_personnel_list.remove(my_name)
        better_personnel_list.insert(0, my_name)

        for personnel in better_personnel_list:
            data = get_person_vacation_setting_data(session, personnel)
            all_data.append(data)

    return all_data


def get_last_week_work_schedule_and_last_work_schedule(session: SessionDep, name: str, schedule_date: date) -> [str, str]:
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
            # {type: "年假", startDate: "2024-01-01", endDate: "2024-12-31", days: 15, rule_id: 1},
            # {type: "婚假", startDate: "2024-06-01", endDate: "2024-06-10", days: 10, rule_id: 2}
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

    # 1. 优化：一次性预加载所有相关数据
    personnel_statement = (
        select(Personnel)
        .options(
            joinedload(Personnel.account),
            joinedload(Personnel.restinfos).joinedload(RestInfo.bantype)
        )
        .where(Personnel.name == name)
    )
    personnel = session.exec(personnel_statement).first()

    if not personnel:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f'没有这个人! {name}')

    if not personnel.account:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f'没有这个账户! {name}')

    # 2. 设置基本信息
    root_now = date(datetime.now().year, datetime.now().month, datetime.now().day)
    root_start_date = date(root_now.year, 1, 1)
    root_end_date = date(root_now.year, 12, 31)

    data['id'] = personnel.id
    data['name'] = personnel.name
    data['avatar'] = personnel.account.avatar
    data['weight'] = f'{personnel.weight:.1f}'
    data['workYears'] = f'{root_now.year - personnel.hiredate.year} 年'
    data['employeeId'] = personnel.worknumber
    data['phone'] = personnel.phonenumber

    # 3. 优化：批量处理休假规则，避免循环中的数据库查询
    # 首先过滤出当年的休假信息
    current_year_restinfos = [
        restinfo for restinfo in personnel.restinfos
        if (restinfo.start_date >= root_start_date and
            restinfo.end_date <= root_end_date)
    ]

    # 4. 如果有休假信息，批量查询所有相关的工作计划
    if current_year_restinfos:
        # 收集所有需要查询的日期范围和班型
        date_ranges = []
        bantype_ids = []

        for restinfo in current_year_restinfos:
            date_ranges.append((restinfo.start_date, restinfo.end_date))
            bantype_ids.append(restinfo.bantype_id)

        # 批量查询所有相关的工作计划
        workschedule_statement = (
            select(Workschedule)
            .options(
                joinedload(Workschedule.personnel_links).joinedload(WorkschedulePersonnelLink.personnel),
                joinedload(Workschedule.bantype)
            )
            .where(
                Workschedule.bantype_id.in_(bantype_ids)
            )
        )

        # 添加日期范围条件
        date_conditions = []
        for start_date, end_date in date_ranges:
            date_conditions.append(
                (Workschedule.work_date >= start_date) &
                (Workschedule.work_date <= end_date)
            )

        if date_conditions:
            from sqlalchemy import or_
            workschedule_statement = workschedule_statement.where(or_(*date_conditions))

        # all_workschedules = session.exec(workschedule_statement).all()
        all_workschedules = session.exec(workschedule_statement).unique().all()

        # 按班型和日期范围组织数据，便于快速查找
        workschedule_map = {}
        for ws in all_workschedules:
            key = (ws.bantype_id, ws.work_date)
            if key not in workschedule_map:
                workschedule_map[key] = []
            workschedule_map[key].append(ws)

        # 5. 处理每个休假规则
        for restinfo in current_year_restinfos:
            bantype = restinfo.bantype.ban.value
            startDate = restinfo.start_date.strftime("%Y-%m-%d")
            endDate = restinfo.end_date.strftime("%Y-%m-%d")
            days = restinfo.available_days
            rule_id = restinfo.id

            data['holidayRules'].append({
                'type': bantype,
                'startDate': startDate,
                'endDate': endDate,
                'days': days,
                'rule_id': rule_id
            })

            # 计算已使用的天数
            used_days = 0
            current_date = restinfo.start_date
            while current_date <= restinfo.end_date:
                key = (restinfo.bantype_id, current_date)
                if key in workschedule_map:
                    for ws in workschedule_map[key]:
                        for personnel_link in ws.personnel_links:
                            if personnel_link.personnel.id == personnel.id:
                                used_days += 1
                                break
                current_date += timedelta(days=1)

            data['holidayStats'].append({
                'type': bantype,
                'used': used_days,
                'remaining': days - used_days,
                'expiry': endDate
            })

    # 6. 优化：获取本月工作计划 - 使用直接的JOIN查询
    data['workSchedule']['month'] = f'{root_now.year}-{root_now.month:02d}'
    all_workschedule_records = get_work_schedule_statistic(root_now, personnel.id, session)

    # 7. 统计并填充工作计划数据
    c = Counter(all_workschedule_records)
    for value, count in c.items():
        data['workSchedule']['schedules'].append({'type': value, 'count': count})

    # 8. 新增: 补假 + 调休假 统计
    lieu_data = get_lieu_vacation_data(root_now, personnel.id, session)
    data['holidayStats'].append({
        'type': lieu_data['data']['type'],
        'used': lieu_data['data']['used'],
        'remaining': lieu_data['data']['remaining'],
        'expiry': lieu_data['data']['endDate']
    })

    return data


def get_work_schedule_statistic(root_now: date, personnel_id: int, session: SessionDep):
    last_day = monthrange(root_now.year, root_now.month)[1]

    # 使用你提到的优化方法2 - 直接JOIN查询
    monthly_schedule_statement = (
        select(Bantype.ban)
        .select_from(Workschedule)
        .join(WorkschedulePersonnelLink, Workschedule.id == WorkschedulePersonnelLink.workschedule_id)
        .join(Bantype, Workschedule.bantype_id == Bantype.id)
        .where(
            Workschedule.work_date >= date(root_now.year, root_now.month, 1),
            Workschedule.work_date <= date(root_now.year, root_now.month, last_day),
            WorkschedulePersonnelLink.personnel_id == personnel_id
        )
    )

    monthly_results = session.exec(monthly_schedule_statement).all()
    all_workschedule_records = [ban.value for ban in monthly_results]

    return all_workschedule_records


def get_lieu_vacation_data(root_now: date, personnel_id: int, session: SessionDep):
    year_start = date(root_now.year, 1, 1)
    year_end = date(root_now.year, 12, 31)

    dl_bantype = session.exec(select(Bantype).where(Bantype.ban == Bans.DL)).first()  # 补假
    ll_bantype = session.exec(select(Bantype).where(Bantype.ban == Bans.LL)).first()  # 调休假
    total_lieu = 0
    used_lieu = 0

    # 联合查询 更快
    results_1 = session.exec(select(Workschedule)
                             .join(WorkschedulePersonnelLink, Workschedule.id == WorkschedulePersonnelLink.workschedule_id)
                             .where(WorkschedulePersonnelLink.personnel_id == personnel_id,
                                    Workschedule.work_date >= year_start,
                                    Workschedule.work_date <= year_end,
                                    Workschedule.bantype == dl_bantype
                                    )).all()

    results_2 = session.exec(select(Workschedule)
                             .join(WorkschedulePersonnelLink, Workschedule.id == WorkschedulePersonnelLink.workschedule_id)
                             .where(WorkschedulePersonnelLink.personnel_id == personnel_id,
                                    Workschedule.work_date >= year_start,
                                    Workschedule.work_date <= year_end,
                                    Workschedule.bantype == ll_bantype
                                    )).all()

    total_lieu = len(results_1)
    used_lieu = len(results_2)
    rest_lieu = total_lieu - used_lieu

    return {"personnel_id": personnel_id, "data": {
        'type': ll_bantype.ban.value,
        'used': used_lieu,
        'remaining': rest_lieu,
        'startDate': year_start.strftime("%Y-%m-%d"),
        'endDate': year_end.strftime("%Y-%m-%d"),
        'days': total_lieu,
    }}


@router.post('/get_work_schedule_statistics')
async def get_work_schedule_statistics(monthlyWorkScheduleStatistics: QueryMonthlyWorkScheduleStatistics, session: SessionDep):
    data = {
        'id': monthlyWorkScheduleStatistics.personnel_id,
        'workSchedule': {
            'month': "2024-05",
            'schedules': [
                # {type: "2A", count: 15},
                # {type: "休息", count: 8},
                # {type: "加班", count: 3}
            ]
        }
    }

    data['workSchedule']['month'] = f'{monthlyWorkScheduleStatistics.month.year}-{monthlyWorkScheduleStatistics.month.month:02d}'
    all_workschedule_records = get_work_schedule_statistic(monthlyWorkScheduleStatistics.month, monthlyWorkScheduleStatistics.personnel_id, session)

    # 统计并填充工作计划数据
    c = Counter(all_workschedule_records)
    for value, count in c.items():
        data['workSchedule']['schedules'].append({'type': value, 'count': count})

    return data


@router.post('/get_bantype_info')
async def get_bantype_info(session: SessionDep):
    bantype_info_dict = dict()
    bantypes = session.query(Bantype).all()

    for bantype in bantypes:
        bantype: Bantype
        ban_name = bantype.ban.value
        ban_start_time = bantype.start_time.strftime('%H:%M')
        ban_end_time = bantype.end_time.strftime('%H:%M')
        ban_description = bantype.description

        bantype_info_dict[ban_name] = {
            'start_time': ban_start_time,
            'end_time': ban_end_time,
            'description': ban_description
        }

    return bantype_info_dict
