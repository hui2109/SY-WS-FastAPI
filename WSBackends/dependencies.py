from typing import Annotated
from datetime import datetime, tzinfo, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from sqlmodel import Session, select

from .database.database import engine
from .database.models import Account
from .routers.secret import SECRET_KEY, ALGORITHM


async def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


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
        expire = payload.get("exp")

        if username is None:
            raise credentials_exception

        if expire is None:
            raise credentials_exception

        if datetime.now(timezone.utc) > datetime.fromtimestamp(expire, tz=timezone.utc):
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception

    user = session.exec(select(Account).where(Account.username == username)).first()

    if user is None:
        raise credentials_exception

    return user
