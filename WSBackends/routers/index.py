from datetime import datetime

from fastapi import Depends, APIRouter, Request, HTTPException, status
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from sqlmodel import select

from ..database.models import Account, Personnel, Bantype, Workschedule, WorkschedulePersonnelLink
from ..database.utils import MachineType, WorkSectionType, RelaxType, AuxiliaryType, OvertimeType
from ..dependencies import get_current_user, SessionDep
from ..utils import Templates

router = APIRouter(tags=["index"])


class OneBanType(BaseModel):
    machine_type: MachineType
    work_section_type: WorkSectionType
    relax_type: RelaxType
    auxiliary_type: AuxiliaryType
    overtime_type: OvertimeType
    description: str | None = None


class OneSchedule(OneBanType):
    name: str
    work_start_date: datetime
    work_end_date: datetime


# 获取当前用户信息的路由
@router.get("/index", response_class=HTMLResponse)
async def index(request: Request):
    return Templates.TemplateResponse("index.html", {"request": request})


@router.post('/create-schedule', response_model=OneSchedule)
async def create_schedule(one_schedule: OneSchedule, session: SessionDep, user: Account = Depends(get_current_user)):
    schedule_exception = HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='没有这个人!')
    one_schedule_dict: dict = one_schedule.model_dump()

    personnel = session.exec(select(Personnel).where(Personnel.name == one_schedule.name)).first()
    if not personnel:
        raise schedule_exception

    bantype = session.exec(select(Bantype).where(
        one_schedule.machine_type == Bantype.machine_type,
        one_schedule.work_section_type == Bantype.work_section_type,
        one_schedule.relax_type == Bantype.relax_type,
        one_schedule.auxiliary_type == Bantype.auxiliary_type,
        one_schedule.overtime_type == Bantype.overtime_type,
    )).first()
    if not bantype:
        bantype = Bantype(**one_schedule_dict)

    workschedule = session.exec(select(Workschedule).where(
        one_schedule.work_start_date == Workschedule.work_start_date,
        one_schedule.work_end_date == Workschedule.work_end_date,
        Workschedule.bantype == bantype
    )).first()
    if not workschedule:
        workschedule = Workschedule(**one_schedule_dict, bantype=bantype)  # bantype: 注意大小写!

    wpLink = WorkschedulePersonnelLink(personnel=personnel, workschedule=workschedule)

    session.add(wpLink)
    session.commit()
    session.refresh(wpLink)

    return one_schedule
