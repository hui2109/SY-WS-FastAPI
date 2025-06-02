import pickle
from datetime import time
from pathlib import Path
from pprint import pprint

from WSBackends.database.utils import Bans

root_path = Path('./XiaohuData')
pkl_files = list(root_path.glob('*.pkl'))

ban_template = {
    "ban": "3A",
    "start_time": "07:00:00",
    "end_time": "12:30:00",
    "description": ""
}

schedule_template = {
    "name": "张旭辉",
    "ban": "3A",
    "work_date": "2025-04-21"
}


def remove_duplicates(dict_list):
    return [dict(t) for t in {tuple(sorted(d.items())) for d in dict_list}]


def generate_bantype(bantype: str):
    bantype_list = bantype.split('_')  # ['3A']  or  ['3A', 'F']  or ['休息']  or  ['3A', '补']  or  ['S1', 'F']
    pure_ban_list = []

    for ban in bantype_list:  # '3A' or 'F' or '补' or 'OTB'
        if ban in Bans._value2member_map_:
            ban_template = {}
            ban_enum = Bans._value2member_map_[ban]
            name = ban_enum.name
            value = ban_enum.value

            # 重构下，明确一点
            if name == '_1A':
                start_time = time(hour=7, minute=0, second=0, microsecond=0)
                end_time = time(hour=12, minute=30, second=0, microsecond=0)
            elif name == '_2A':
                start_time = time(hour=7, minute=0, second=0, microsecond=0)
                end_time = time(hour=12, minute=30, second=0, microsecond=0)
            elif name == '_3A':
                start_time = time(hour=7, minute=0, second=0, microsecond=0)
                end_time = time(hour=12, minute=30, second=0, microsecond=0)
            elif name == '_1B':
                start_time = time(hour=13, minute=0, second=0, microsecond=0)
                end_time = time(hour=18, minute=30, second=0, microsecond=0)
            elif name == '_2B':
                start_time = time(hour=13, minute=0, second=0, microsecond=0)
                end_time = time(hour=18, minute=30, second=0, microsecond=0)
            elif name == '_3B':
                start_time = time(hour=13, minute=0, second=0, microsecond=0)
                end_time = time(hour=18, minute=30, second=0, microsecond=0)
            elif name == '_1C':
                start_time = time(hour=18, minute=30, second=0, microsecond=0)
                end_time = time(hour=23, minute=59, second=0, microsecond=0)
            elif name == '_2C':
                start_time = time(hour=18, minute=30, second=0, microsecond=0)
                end_time = time(hour=23, minute=59, second=0, microsecond=0)
            elif name == '_3C':
                start_time = time(hour=18, minute=30, second=0, microsecond=0)
                end_time = time(hour=23, minute=59, second=0, microsecond=0)
            elif name == 'S1':
                start_time = time(hour=7, minute=30, second=0, microsecond=0)
                end_time = time(hour=13, minute=00, second=0, microsecond=0)
            elif name == 'S2':
                start_time = time(hour=7, minute=30, second=0, microsecond=0)
                end_time = time(hour=13, minute=00, second=0, microsecond=0)
            elif name == 'N1':
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=17, minute=30, second=0, microsecond=0)
            elif name == 'N2':
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=17, minute=30, second=0, microsecond=0)
            elif name == 'ENGAGE':
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=18, minute=30, second=0, microsecond=0)
            elif name == 'TRAIN':
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=18, minute=30, second=0, microsecond=0)
            elif name == 'JD':
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=14, minute=00, second=0, microsecond=0)
            elif name == 'OAE':
                start_time = time(hour=13, minute=00, second=0, microsecond=0)
                end_time = time(hour=15, minute=00, second=0, microsecond=0)
            elif name == 'OBE':
                start_time = time(hour=10, minute=30, second=0, microsecond=0)
                end_time = time(hour=12, minute=30, second=0, microsecond=0)
            elif name == 'OCE':
                start_time = time(hour=16, minute=30, second=0, microsecond=0)
                end_time = time(hour=18, minute=30, second=0, microsecond=0)
            elif name == 'OAF':
                start_time = time(hour=13, minute=00, second=0, microsecond=0)
                end_time = time(hour=15, minute=00, second=0, microsecond=0)
            elif name == 'OBF':
                start_time = time(hour=10, minute=30, second=0, microsecond=0)
                end_time = time(hour=12, minute=30, second=0, microsecond=0)
            elif name == 'OCF':
                start_time = time(hour=16, minute=30, second=0, microsecond=0)
                end_time = time(hour=18, minute=30, second=0, microsecond=0)
            elif name == 'T1A':
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=12, minute=0, second=0, microsecond=0)
            elif name == 'T1B':
                start_time = time(hour=14, minute=0, second=0, microsecond=0)
                end_time = time(hour=17, minute=30, second=0, microsecond=0)
            elif name == 'T2A':
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=12, minute=0, second=0, microsecond=0)
            elif name == 'T2B':
                start_time = time(hour=14, minute=0, second=0, microsecond=0)
                end_time = time(hour=17, minute=30, second=0, microsecond=0)
            elif name == 'T3A':
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=12, minute=0, second=0, microsecond=0)
            elif name == 'T3B':
                start_time = time(hour=14, minute=0, second=0, microsecond=0)
                end_time = time(hour=17, minute=30, second=0, microsecond=0)
            elif name == 'TS1':
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=12, minute=0, second=0, microsecond=0)
            elif name == 'TS2':
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=12, minute=0, second=0, microsecond=0)
            elif name == 'PHY':
                start_time = time(hour=14, minute=0, second=0, microsecond=0)
                end_time = time(hour=16, minute=30, second=0, microsecond=0)
            elif '假' in value or '休息' in value:
                start_time = time(hour=0, minute=0, second=0, microsecond=0)
                end_time = time(hour=23, minute=59, second=0, microsecond=0)
            else:
                raise ValueError(f"Unknown ban type: {ban}  {bantype}")

            ban_template["ban"] = value
            ban_template["start_time"] = start_time.isoformat()
            ban_template["end_time"] = end_time.isoformat()
            ban_template["description"] = value
            pure_ban_list.append(ban_template)
        else:
            if '补' in ban:
                ban = Bans.DL.value
                pure_ban_list += generate_bantype(ban)
            elif 'F' in ban and ('A' in bantype or 'S1' in bantype or 'S2' in bantype or 'TR' in bantype):
                ban = Bans.OAF.value
                pure_ban_list += generate_bantype(ban)
            elif 'F' in ban and 'B' in bantype:
                ban = Bans.OBF.value
                pure_ban_list += generate_bantype(ban)
            elif 'F' in ban and 'C' in bantype:
                ban = Bans.OCF.value
                pure_ban_list += generate_bantype(ban)
            elif 'E' in ban and ('A' in bantype or 'S1' in bantype or 'S2' in bantype):
                ban = Bans.OAE.value
                pure_ban_list += generate_bantype(ban)
            elif 'E' in ban and 'B' in bantype:
                ban = Bans.OBE.value
                pure_ban_list += generate_bantype(ban)
            elif 'E' in ban and 'C' in bantype:
                ban = Bans.OCE.value
                pure_ban_list += generate_bantype(ban)
            elif 'EA' in ban:
                ban = Bans.JD.value
                pure_ban_list += generate_bantype(ban)
            elif 'X' in ban:
                ban = Bans.RL.value
                pure_ban_list += generate_bantype(ban)
            elif 'TR' in ban:  # 拆成2个班
                ban = Bans.T1A.value
                pure_ban_list += generate_bantype(ban)
                ban = Bans.T1B.value
                pure_ban_list += generate_bantype(ban)
            elif 'TB' in ban:  # 拆成2个班
                ban = Bans.T2A.value
                pure_ban_list += generate_bantype(ban)
                ban = Bans.T2B.value
                pure_ban_list += generate_bantype(ban)
            elif 'VB' in ban:  # 拆成2个班
                ban = Bans.T3A.value
                pure_ban_list += generate_bantype(ban)
                ban = Bans.T3B.value
                pure_ban_list += generate_bantype(ban)
            elif 'J' in ban:
                ban = Bans.RELAX.value
                pure_ban_list += generate_bantype(ban)
            else:
                raise ValueError(f"Unknown ban type: {ban}  {bantype}")

    return pure_ban_list


def generate_schedule(data_list: list):
    # data_list里面装字典, 每个字典代表一个人的班次
    schedule_records = []
    ban_records = []

    for person_dict in data_list:
        name = person_dict['name']
        # schedule是一个列表, 列表的第一项是工作日期, 第二项是班种
        schedule = person_dict['schedule']
        if len(schedule) == 0:
            continue
        for work_date, bantype in schedule:
            pure_ban_list = generate_bantype(bantype)
            for pure_ban in pure_ban_list:
                # 创建班次数据
                schedule_template = {"name": name, "ban": pure_ban["ban"], "work_date": work_date.isoformat()}
                schedule_records.append(schedule_template)
            ban_records += pure_ban_list

    return ban_records, schedule_records


def process_pkls():
    total_ban_records = []
    total_schedule_records = []

    for pkl_file in pkl_files:
        with open(pkl_file, 'rb') as f:
            data_list = pickle.load(f)
            ban_records, schedule_records = generate_schedule(data_list)

            total_ban_records += ban_records
            total_schedule_records += schedule_records

    total_ban_records = remove_duplicates(total_ban_records)

    with open(root_path / 'oldRecords' / 'total_ban_records.pkl', 'wb') as f:
        pickle.dump(total_ban_records, f)

    with open(root_path / 'oldRecords' / 'total_schedule_records.pkl', 'wb') as f:
        pickle.dump(total_schedule_records, f)


if __name__ == '__main__':
    # process_pkls()

    with open('./XiaohuData/oldRecords/total_ban_records.pkl', 'rb') as f:
        total_ban_records = pickle.load(f)
        pprint(total_ban_records)
