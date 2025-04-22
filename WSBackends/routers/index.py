from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from ..utils import Templates

router = APIRouter(tags=["index"])


# 获取当前用户信息的路由
@router.get("/index", response_class=HTMLResponse)
async def index(request: Request):
    return Templates.TemplateResponse("index.html", {"request": request})
