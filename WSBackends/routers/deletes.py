from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select

from ..database.models import Personnel, Bantype, ReserveVacation
from ..database.utils import Bans
from ..dependencies import SessionDep

router = APIRouter(tags=["deletes"])


class OneReserve(BaseModel):
    sequence: int
    name: str
    relax: Bans
    date: datetime


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
