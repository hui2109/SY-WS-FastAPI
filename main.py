import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from WSBackends.database.database import create_db_and_tables
from WSBackends.routers.login import router as login_router

# 允许跨域请求
origins = [
    "http://localhost",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
]


def main():
    app = FastAPI()

    create_db_and_tables()
    app.include_router(login_router)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    uvicorn.run(app)


if __name__ == '__main__':
    main()
