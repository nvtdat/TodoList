"""Dependency dùng chung giữa các router."""

from __future__ import annotations

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

import auth
import models
from database import get_db


def get_authenticated_user(
    token: dict | None = Depends(auth.decode_access_token),
    db: Session = Depends(get_db),
) -> models.User:
    """Người dùng đang đăng nhập, suy ra từ bearer token."""
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    email = token.get("sub")
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
