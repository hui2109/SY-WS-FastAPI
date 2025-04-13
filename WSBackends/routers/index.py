from fastapi import Depends, APIRouter, Request
from fastapi.responses import HTMLResponse

from ..dependencies import get_current_user
from ..utils import Templates

router = APIRouter(
    tags=["index"],
    dependencies=[Depends(get_current_user)]
)


# 获取当前用户信息的路由
@router.get("/index", response_class=HTMLResponse)
async def index(request: Request):
    return Templates.TemplateResponse("index.html", {"request": request})
