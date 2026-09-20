"""Kết nối cơ sở dữ liệu."""

from __future__ import annotations

import os
import ssl

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables.")

CA_FILE_PATH = os.path.join(os.path.dirname(__file__), "ca.pem")

MYSQL_URL_PREFIX = "mysql"
MYSQL_POOL_OPTIONS = {
    "pool_size": 5,
    "max_overflow": 10,
    "pool_recycle": 3600,
    "pool_timeout": 30,
}


def _connect_args(url: str) -> dict:
    """Tham số kết nối riêng cho từng loại cơ sở dữ liệu.

    Chỉ MySQL cần SSL qua ``ca.pem``. Trước đây tham số này được áp cho mọi
    loại cơ sở dữ liệu nên không thể chạy thử cục bộ bằng SQLite.
    """
    if not url.startswith(MYSQL_URL_PREFIX) or not os.path.exists(CA_FILE_PATH):
        return {}

    context = ssl.create_default_context(cafile=CA_FILE_PATH)
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    return {"ssl": context}


def _build_engine(url: str):
    options: dict = {"pool_pre_ping": True}
    if url.startswith(MYSQL_URL_PREFIX):
        options.update(MYSQL_POOL_OPTIONS)
    return create_engine(url, connect_args=_connect_args(url), **options)


engine = _build_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
