import pickle
from datetime import datetime
from pathlib import Path
from pprint import pp

import pandas as pd


def convert_to_date(df_year: str, df_date: str):
    # df_date: 03-01\n六
    month = str(df_date).split('-')[0]
    day = str(df_date).split('-')[-1].split('\n')[0]

    date = datetime(
        year=int(df_year),
        month=int(month),
        day=int(day),
        hour=10,
        minute=0,
        second=0,
        microsecond=0,
    )

    return date


def pure_bantype(bantype: str):
    bantype_list = bantype.split('\n')

    if len(bantype_list) == 1:
        return bantype_list[0]
    else:
        true_bantype, appends = bantype_list[0], bantype_list[-1]
        if appends != '补':
            true_bantype = true_bantype + '_' + appends
            return true_bantype
        return bantype_list[0]


def convert_df_to_list(excel_file: Path):
    df = pd.read_excel(excel_file, header=None).iloc[:, :-2]
    year = str(df.iloc[0, 0]).split('（')[-1].split('-')[0]
    row_num = df.shape[0]
    col_num = df.shape[1]
    df_list = []

    for i in range(1, row_num):
        personnel_dict = {}
        if pd.isna(df.iloc[i, 1]) or df.iloc[i, 1] == '姓名':
            continue
        personnel_dict['name'] = df.iloc[i, 1]
        personnel_dict['schedule'] = []
        for j in range(9, col_num):
            bundles = []
            date_obj = convert_to_date(year, df.iloc[1, j])
            bantype = df.iloc[i, j]
            if pd.isna(bantype):
                continue
            bundles.append(date_obj)

            bantype = pure_bantype(bantype)
            bundles.append(bantype)

            personnel_dict['schedule'].append(bundles)
        df_list.append(personnel_dict)

    return df_list


def pure_data():
    root_path = Path('./XiaohuData')

    excel_files = list(root_path.glob('*.xlsx'))
    for excel_file in excel_files:
        df_list = convert_df_to_list(excel_file)
        with open(root_path / (excel_file.stem + '.pkl'), 'wb') as f:
            pickle.dump(df_list, f)


def read_data(path: Path):
    with open(path, 'rb') as f:
        df_list = pickle.load(f)

    return df_list


if __name__ == '__main__':
    pure_data()
    df_list = read_data(Path('./XiaohuData/放疗中心排班表（2024-10-01至2024-10-31）.pkl'))
    pp(df_list)
