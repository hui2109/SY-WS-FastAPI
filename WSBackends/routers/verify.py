from fastapi import APIRouter, Depends

from ..database.models import Account
from ..dependencies import get_current_user

router = APIRouter(tags=["verify"])


# 获验证是否登录
@router.post("/secret_verify")
async def index(user: Account = Depends(get_current_user)):
    return [user.avatar, user.personnel.name]
