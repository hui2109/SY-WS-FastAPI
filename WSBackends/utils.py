from pathlib import Path

from fastapi.templating import Jinja2Templates

# 设置模板目录
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
templates_path = parent_dir / "WSFrontends" / "templates"
Templates = Jinja2Templates(directory=templates_path)

# 设置静态文件目录
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
Statics = parent_dir / "WSFrontends"
