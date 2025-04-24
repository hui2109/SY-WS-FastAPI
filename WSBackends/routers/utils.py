from datetime import datetime

from pytz import timezone
from sqlmodel import select, Session

from ..database.database import engine
from ..database.models import Personnel


def get_personnel_list():
    with Session(engine) as session:
        exist_personnel_list = []
        results = session.exec(select(Personnel))
        for personnel in results:
            exist_personnel_list.append(personnel.name)

        return exist_personnel_list


def convert_UTC_Chinese(utc_datetime: datetime) -> datetime:
    china_timezone = timezone('Asia/Shanghai')
    china_time = utc_datetime.astimezone(china_timezone)
    return china_time
