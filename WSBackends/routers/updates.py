from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..database.models import Account
from ..dependencies import get_current_user, SessionDep

router = APIRouter(tags=["updates"])


# 更新用户头像的请求模型
class AvatarUpdate(BaseModel):
    avatar: str | None


# 更新头像API
@router.post("/update-avatar")
async def update_avatar(
        avatar_data: AvatarUpdate,
        session: SessionDep,
        user: Account = Depends(get_current_user)):
    # 更新用户头像
    data_dict = avatar_data.model_dump(exclude_unset=True)

    user.sqlmodel_update(data_dict)
    session.add(user)
    session.commit()
    session.refresh(user)

    return {"status": "success", "message": "头像更新成功"}
