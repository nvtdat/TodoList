"""Endpoint tài khoản: đăng ký, xác minh email, gửi lại thư, đăng nhập, Google."""

from __future__ import annotations

import logging
import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import auth
import models
import schemas
from database import get_db
from dependencies import get_authenticated_user
from email_utils import send_verification_email
from google_auth import fetch_google_account

logger = logging.getLogger(__name__)

router = APIRouter(tags=["users"])

EMAIL_ALREADY_REGISTERED = "Email already registered"
EMAIL_NOT_VERIFIED = "Please verify your email"
INVALID_CREDENTIALS = "Invalid email or password"
INVALID_VERIFICATION_LINK = "This verification link is invalid or has expired"


class ResendVerificationRequest(BaseModel):
    email: str


@router.post("/users", response_model=schemas.UserRegistrationResponse)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Tạo tài khoản rồi gửi thư xác minh.

    Tài khoản được ghi vào cơ sở dữ liệu trước khi gửi thư. Việc gửi thư là
    bước phụ: nếu thất bại thì người dùng vẫn nhận được phản hồi thành công
    kèm cảnh báo, thay vì một lỗi 500 trong khi tài khoản đã tồn tại.
    """
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail=EMAIL_ALREADY_REGISTERED)

    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=auth.hash_password(user.password),
        is_verified=False,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    verification_token = auth.create_verification_token(db_user.email)
    result = await send_verification_email(db_user.email, verification_token)
    if not result.delivered:
        logger.error(
            "Tài khoản %s đã được tạo nhưng chưa gửi được thư xác minh (transport=%s): %s",
            db_user.email,
            result.transport,
            result.error,
        )

    return schemas.UserRegistrationResponse(
        id=db_user.id,
        name=db_user.name,
        email=db_user.email,
        created_at=db_user.created_at,
        verification_email_sent=result.delivered,
        verification_email_error=result.error,
    )


@router.get("/verify")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Xác minh email từ liên kết trong thư.

    Idempotent: bấm lại liên kết đã dùng vẫn trả về thành công, vì đó là hành
    vi bình thường khi người dùng mở lại thư cũ.
    """
    email = auth.decode_verification_token(token)
    if not email:
        raise HTTPException(status_code=400, detail=INVALID_VERIFICATION_LINK)

    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.is_verified:
        return {
            "message": "Your email was already verified. You can log in now.",
            "already_verified": True,
        }

    db_user.is_verified = True
    db.commit()
    db.refresh(db_user)
    return {"message": "Email verified successfully. You can log in now.", "already_verified": False}


@router.post("/resend-verification", response_model=schemas.EmailDispatchResponse)
async def resend_verification_email(
    data: ResendVerificationRequest,
    db: Session = Depends(get_db),
):
    """Gửi lại thư xác minh.

    Ở đây người dùng chủ động yêu cầu gửi thư, nên nếu việc gửi thất bại thì
    phải báo lỗi kèm nguyên nhân thay vì im lặng.
    """
    db_user = db.query(models.User).filter(models.User.email == data.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    verification_token = auth.create_verification_token(db_user.email)
    result = await send_verification_email(db_user.email, verification_token)
    if not result.delivered:
        raise HTTPException(
            status_code=503,
            detail=(
                "Could not send the verification email from the server. "
                f"Reason: {result.error}"
            ),
        )

    return schemas.EmailDispatchResponse(
        message="Verification email sent successfully",
        email_sent=True,
        transport=result.transport,
    )


@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail=INVALID_CREDENTIALS)
    if not db_user.is_verified:
        raise HTTPException(status_code=400, detail=EMAIL_NOT_VERIFIED)
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=schemas.UserResponse)
def get_current_user(current_user: models.User = Depends(get_authenticated_user)):
    return current_user


@router.post("/me/tasks", response_model=schemas.MessageResponse)
def authorize_task_creation(current_user: models.User = Depends(get_authenticated_user)):
    """Kiểm tra bearer token còn hiệu lực, không tạo dữ liệu gì."""
    return {"message": f"Hello {current_user.name}, you can create a task now!"}


@router.post("/google-login", response_model=schemas.Token)
def google_login(google_user: schemas.GoogleUser, db: Session = Depends(get_db)):
    account = fetch_google_account(google_user.token)

    db_user = db.query(models.User).filter(models.User.email == account.email).first()
    if not db_user:
        db_user = models.User(
            name=account.name,
            email=account.email,
            password_hash=auth.hash_password(os.urandom(16).hex()),
            is_verified=True,
            google_id=account.google_id,
        )
        db.add(db_user)
    else:
        # Google đã xác minh email này nên tài khoản cũ cũng được coi là hợp lệ.
        if not db_user.is_verified:
            db_user.is_verified = True
        if not db_user.google_id:
            db_user.google_id = account.google_id
    db.commit()
    db.refresh(db_user)

    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}
