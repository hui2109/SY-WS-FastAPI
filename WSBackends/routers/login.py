from datetime import datetime, timedelta
from typing import Annotated

# 处理特殊报错
import bcrypt
import jwt
from fastapi import Depends, HTTPException, APIRouter, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlmodel import Session, select

from .secret import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from ..database.database import engine
from ..database.models import Account, Personnel

bcrypt.__about__ = bcrypt

# 密码处理工具
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login/token")

router = APIRouter(prefix="/login", tags=["login"])


# 定义请求和响应模型
class UserBase(BaseModel):
    username: str
    fullname: str
    enroll_date: datetime


class UserCreate(UserBase):
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


# 密码工具函数
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


# 令牌创建函数
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# 用户验证函数
async def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")

        if username is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception

    user = session.exec(select(Account).where(Account.username == username)).first()

    if user is None:
        raise credentials_exception

    return user


# 注册路由
@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserBase)
async def register_user(user_data: UserCreate, session: SessionDep):
    # 检查用户是否已存在
    existing_user = session.exec(
        select(Account).where(Account.username == user_data.username)
    ).first()
    # 如果已存在，抛出异常
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered!",
        )

    # 加密密码
    hashed_password = get_password_hash(user_data.password)

    # 先创建账户
    new_account = Account(
        username=user_data.username,
        password=hashed_password,
    )

    # 然后创建人员信息并关联账户
    new_personnel = Personnel(
        name=user_data.fullname,
        hiredate=user_data.enroll_date,
        account=new_account,  # 设置外键关系
    )

    session.add(new_personnel)
    session.commit()
    session.refresh(new_personnel)

    return user_data


# 登录路由
@router.post("/token", response_model=Token)
async def login_for_access_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep
):
    # 查找用户
    user = session.exec(
        select(Account).where(Account.username == form_data.username)
    ).first()

    # 验证用户和密码
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 创建访问令牌
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")


# 获取当前用户信息的路由
@router.get("/me", response_model=Personnel)
async def read_users_me(current_user: Annotated[Account, Depends(get_current_user)]):
    # 获取关联的人员信息
    personnel = current_user.personnel

    return personnel
