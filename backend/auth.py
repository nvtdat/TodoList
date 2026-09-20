"""Mật khẩu, token đăng nhập và token xác minh email."""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import bcrypt
from dotenv import load_dotenv
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Token xác minh phải sống lâu hơn token đăng nhập, vì người dùng có thể mở
# hộp thư sau vài giờ. Trước đây token này dùng chung hạn 30 phút của token
# đăng nhập nên liên kết trong email hết hiệu lực rất nhanh.
VERIFICATION_TOKEN_EXPIRE_MINUTES = int(os.getenv("VERIFICATION_TOKEN_EXPIRE_MINUTES", "1440"))
VERIFICATION_TOKEN_TTL_HOURS = max(1, round(VERIFICATION_TOKEN_EXPIRE_MINUTES / 60))

VERIFICATION_PURPOSE = "email_verification"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def _secret_key() -> str:
    if not SECRET_KEY:
        raise RuntimeError(
            "SECRET_KEY chưa được cấu hình cho môi trường này. Hãy khai báo nó "
            "trong biến môi trường của Production."
        )
    return SECRET_KEY


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def _encode(claims: dict, expires_in: timedelta) -> str:
    to_encode = claims.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + expires_in
    return jwt.encode(to_encode, _secret_key(), algorithm=ALGORITHM)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    delta = expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return _encode(data, delta)


def decode_access_token(token: str = Depends(oauth2_scheme)) -> dict | None:
    try:
        return jwt.decode(token, _secret_key(), algorithms=[ALGORITHM])
    except JWTError:
        return None


def create_verification_token(email: str) -> str:
    """Token riêng cho việc xác minh email, không dùng chung với token đăng nhập."""
    return _encode(
        {"sub": email, "purpose": VERIFICATION_PURPOSE},
        timedelta(minutes=VERIFICATION_TOKEN_EXPIRE_MINUTES),
    )


def decode_verification_token(token: str) -> str | None:
    """Trả về email nếu token hợp lệ và đúng mục đích, ngược lại trả về None.

    Nhờ kiểm tra trường ``purpose``, một token đăng nhập bị lộ cũng không thể
    dùng để xác minh email của người khác.
    """
    try:
        payload = jwt.decode(token, _secret_key(), algorithms=[ALGORITHM])
    except JWTError:
        return None
    if payload.get("purpose") != VERIFICATION_PURPOSE:
        return None
    email = payload.get("sub")
    return email if isinstance(email, str) and email else None
