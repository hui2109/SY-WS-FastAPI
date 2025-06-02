import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from WSBackends.database.database import create_db_and_tables
from WSBackends.routers.deletes import router as deletes_router
from WSBackends.routers.index import router as index_router
from WSBackends.routers.inserts import router as inserts_router
from WSBackends.routers.login import router as login_router
from WSBackends.routers.selects import router as selects_router
from WSBackends.routers.updates import router as updates_router
from WSBackends.routers.verify import router as verify_router
from WSBackends.utils import Statics

app = FastAPI()


def add_middleware():
    # 允许跨域请求
    origins = [
        "http://localhost",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def add_routers():
    app.include_router(login_router)
    app.include_router(verify_router)
    app.include_router(index_router)
    app.include_router(inserts_router)
    app.include_router(deletes_router)
    app.include_router(updates_router)
    app.include_router(selects_router)


def add_static_files():
    app.mount("/WSFrontends", StaticFiles(directory=Statics), name="WSFrontends")


def main():
    create_db_and_tables()
    add_middleware()
    add_routers()
    add_static_files()

    # uvicorn.run(app)
    uvicorn.run(
        app,
        host="::",  # 使用 :: 来监听所有 IPv6 和 IPv4 地址
        port=8000,
    )


if __name__ == '__main__':
    main()
