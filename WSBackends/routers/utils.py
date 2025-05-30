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


CURRENT_PERSONNEL = ['叶荣',
                     '闫昱萤',
                     '戴梦莹',
                     '曾小洲',
                     '杨星',
                     '郑霞',
                     '金小靖',
                     '肖贵珍',
                     '赵仲',
                     '付昱东',
                     '黄文军',
                     '黄发生',
                     '杨鹏',
                     '余涛',
                     '王吉锐',
                     '唐晓燕',
                     '余翔',
                     '谭林',
                     '徐博',
                     '康正樾',
                     '凌子涵',
                     '张旭辉',
                     '廖中凡',
                     '尹红科',
                     ]

MANDATORY_SCHEDULE = [
    "1A",
    "1B",
    "1C",
    "2A",
    "2B",
    "2C",
    "3A",
    "3B",
    "3C",
    "S1",
    "S2",
    "N1",
    "N2"
]
