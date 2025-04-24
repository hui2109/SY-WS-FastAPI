import pickle
import requests

from pathlib import Path
from pprint import pprint

ban_list_path = Path('./XiaohuData/oldRecords/total_ban_records.pkl')
schedule_path = Path('./XiaohuData/oldRecords/total_schedule_records.pkl')


def read_ban_list():
    with open(ban_list_path, 'rb') as f:
        total_ban_records = pickle.load(f)
    return total_ban_records


def read_schedule():
    with open(schedule_path, 'rb') as f:
        total_schedule_records = pickle.load(f)
    return total_schedule_records


create_ban_url = 'http://127.0.0.1:8000/create-ban'
create_schedule_url = 'http://127.0.0.1:8000/create-schedule'


def get_header():
    url = 'http://127.0.0.1:8000/token'
    data = {
        'grant_type': 'password',
        'username': '1e$_ye4rong2_21094235',
        'password': '123',
        'scope': '',
        'client_id': '',
        'client_secret': ''
    }
    response = requests.post(url=url, data=data)
    access_token = response.json()['access_token']
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    return headers


def create_ban():
    headers = get_header()
    total_ban_records = read_ban_list()
    for ban_dict in total_ban_records:
        print(ban_dict)
        response = requests.post(url=create_ban_url, headers=headers, json=ban_dict)
        pprint(response.json())
        # break


def create_schedule():
    headers = get_header()
    total_schedule_records = read_schedule()
    print(len(total_schedule_records))  # 5570
    for schedule_dict in total_schedule_records:
        response = requests.post(url=create_schedule_url, headers=headers, json=schedule_dict)


if __name__ == '__main__':
    create_ban()
    create_schedule()
