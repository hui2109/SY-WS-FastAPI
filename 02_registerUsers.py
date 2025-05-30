import requests
from pypinyin import pinyin, Style
from Constant import InternalPersonnelList

url = 'http://127.0.0.1:8000/register'
prefix = '1e$_'
suffix = '_21094235'
data_template = {
    "username": "str",
    "name": "str",
    "hiredate": "2025-05-29",
    "avatar": '001-pirate.svg',
    "worknumber": "str",
    "phonenumber": "str",
    'password': 'str'
}

response = requests.post(url=url)

for personnel in InternalPersonnelList:
    name_pinyin_list = pinyin(personnel, style=Style.TONE3)
    flattened_pinyin = ''.join([item[0] for item in name_pinyin_list])

    data_template['username'] = prefix + flattened_pinyin + suffix
    data_template['name'] = personnel
    data_template['worknumber'] = '100'
    data_template['phonenumber'] = '01234567899'
    data_template['password'] = '123'

    response = requests.post(url=url, json=data_template)
