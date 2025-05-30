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
    bantype_list = bantype.split('_')  # ['3A']  or  ['3A', 'F']  or ['休息']  or  ['3A', '补']
    pure_ban_list = []

    for ban in bantype_list:  # '3A' or 'F' or '补'
        if ban in Bans._value2member_map_:
            ban_template = {}
            ban_enum = Bans._value2member_map_[ban]
            name = ban_enum.name
            value = ban_enum.value

            if 'A' in name and '_' in name:
                start_time = time(hour=7, minute=0, second=0, microsecond=0)
                end_time = time(hour=12, minute=30, second=0, microsecond=0)

            elif 'B' in name and '_' in name:
                start_time = time(hour=13, minute=0, second=0, microsecond=0)
                end_time = time(hour=18, minute=30, second=0, microsecond=0)
            elif 'C' in name and '_' in name:
                start_time = time(hour=18, minute=30, second=0, microsecond=0)
                end_time = time(hour=23, minute=59, second=0, microsecond=0)
            elif 'S1' in name or 'S2' in name:
                start_time = time(hour=7, minute=30, second=0, microsecond=0)
                end_time = time(hour=13, minute=00, second=0, microsecond=0)
            elif 'N1' in name or 'N2' in name:
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=17, minute=30, second=0, microsecond=0)
            elif 'ENGAGE' in name:
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=18, minute=30, second=0, microsecond=0)
            elif 'TRAIN' in name:
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=18, minute=30, second=0, microsecond=0)
            elif 'JD' in name:
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=14, minute=00, second=0, microsecond=0)
            elif 'OPHY' in name:
                start_time = time(hour=14, minute=0, second=0, microsecond=0)
                end_time = time(hour=16, minute=30, second=0, microsecond=0)
            elif 'TR' in name or 'TB' in name or 'VB' in name:
                start_time = time(hour=8, minute=0, second=0, microsecond=0)
                end_time = time(hour=17, minute=30, second=0, microsecond=0)
            elif 'O' in name and 'A' in name:
                start_time = time(hour=13, minute=00, second=0, microsecond=0)
                end_time = time(hour=15, minute=00, second=0, microsecond=0)
            elif 'O' in name and 'B' in name:
                start_time = time(hour=10, minute=30, second=0, microsecond=0)
                end_time = time(hour=12, minute=30, second=0, microsecond=0)
            elif 'O' in name and 'C' in name:
                start_time = time(hour=16, minute=30, second=0, microsecond=0)
                end_time = time(hour=18, minute=30, second=0, microsecond=0)
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
            elif 'EA' in ban:
                ban = Bans.JD.value
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
            elif 'X' in ban:
                ban = Bans.RL.value
                pure_ban_list += generate_bantype(ban)
            elif 'TR' in ban:
                ban = Bans.OTR.value
                pure_ban_list += generate_bantype(ban)
            elif 'TB' in ban:
                ban = Bans.OTB.value
                pure_ban_list += generate_bantype(ban)
            elif 'VB' in ban:
                ban = Bans.OVB.value
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
    process_pkls()

    # with open('./XiaohuData/oldRecords/total_schedule_records.pkl', 'rb') as f:
    #     total_ban_records = pickle.load(f)
    #     pprint(total_ban_records)
