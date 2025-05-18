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


CURRENT_PERSONNEL = ['叶荣', '肖贵珍', '赵仲', '黄发生', '黄文军', '余翔', '余涛', '杨鹏', '闫昱萤', '谭林', '王吉锐', '唐晓燕', '付昱东', '徐博', '康正樾', '戴梦莹', '凌子涵', '曾小洲', '张旭辉', '廖中凡', '尹红科', '杨星', '郑霞',
                     '金小靖']
