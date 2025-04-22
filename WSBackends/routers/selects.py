from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import select

from ..database.models import Workschedule
from ..database.utils import Bans
from ..dependencies import get_current_user, SessionDep

router = APIRouter(tags=["selects"], dependencies=[Depends(get_current_user)])


class QueryMonth(BaseModel):
    month_start: datetime
    month_end: datetime


class QueryMonthResponse(BaseModel):
    name: str
    work_date: datetime
    ban: Bans


# 查询单个月的排班情况
@router.post("/select-month-schedule")
async def select_month_schedule(queryMonth: QueryMonth, session: SessionDep):
    queryMonthResponses = []
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
        for personnel_link in personnel_links:
            personnel_name = personnel_link.personnel.name
            ban = result.bantype.ban

            queryMonthResponse = QueryMonthResponse(name=personnel_name, work_date=work_date, ban=ban)
            queryMonthResponses.append(queryMonthResponse)
            personnel_set.add(personnel_name)
    queryMonthResponses.append({'personnels': personnel_set})
    return queryMonthResponses
