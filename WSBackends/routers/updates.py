from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import select

from .login import get_password_hash
from ..database.models import Account, Personnel
from ..dependencies import get_current_user, SessionDep

router = APIRouter(tags=["updates"])


# 更新用户头像的请求模型
class AvatarUpdate(BaseModel):
    avatar: str | None = None


# 更新整个用户信息
class UserUpdate(AvatarUpdate):
    username: str | None = None
    name: str | None = None
    hiredate: date | None = None
    worknumber: str | None = None
    phonenumber: str | None = None
    password: str | None = None


# 更新头像API
@router.post("/update-avatar")
async def update_avatar(avatar_data: AvatarUpdate, session: SessionDep, user: Account = Depends(get_current_user)):
    # 更新用户头像
    data_dict = avatar_data.model_dump(exclude_unset=True)

    user.sqlmodel_update(data_dict)
    session.add(user)
    session.commit()
    session.refresh(user)

    return {"status": "success", "detail": "头像更新成功"}


@router.post("/update-user", response_model=AvatarUpdate)
async def update_user(user_data: UserUpdate, session: SessionDep):
    data_dict = user_data.model_dump(exclude_unset=True)
    data_dict['password'] = get_password_hash(data_dict['password'])
    data_dict['avatar'] = f'/WSFrontends/assets/img/avatars/{data_dict['avatar']}'

    personnel: Personnel = session.exec(select(Personnel).where(Personnel.name == user_data.name)).first()
    account: Account = personnel.account

    personnel.sqlmodel_update(data_dict)
    account.sqlmodel_update(data_dict)

    session.add(personnel)
    session.add(account)
    session.commit()
    session.refresh(personnel)
    session.refresh(account)

    return user_data
