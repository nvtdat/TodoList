"""Điểm vào của ứng dụng FastAPI.

Module này chỉ lắp ghép ứng dụng: cấu hình CORS, đăng ký các router và tạo
bảng dữ liệu. Toàn bộ nghiệp vụ nằm trong những module riêng để mỗi file giữ
một trách nhiệm.
"""

from __future__ import annotations

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import diagnostics
import space_routes
import task_routes
import user_routes
from database import Base, engine
from mail_settings import MailConfigurationError, read_env, resolve_frontend_url

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://todo-list-lkr9.vercel.app",
    "https://todo-list-lkr9-33ieg8jk2-dats-projects-a51e6e38.vercel.app",
]
VERCEL_PREVIEW_ORIGIN_REGEX = r"https://.*\.vercel\.app"
CORS_ALLOWED_ORIGINS_ENV = "CORS_ALLOWED_ORIGINS"

app = FastAPI(title="TodoList API")

logger = logging.getLogger(__name__)


def _ensure_database_schema() -> None:
    """Tạo bảng nếu chưa tồn tại.

    Không được để lỗi ở bước này làm sập cả ứng dụng. Nếu cơ sở dữ liệu tạm
    thời không truy cập được thì API vẫn phải khởi động và trả về lỗi rõ ràng
    cho từng request, thay vì lỗi khởi tạo cho mọi request.
    """
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        logger.exception(
            "Không tạo được bảng dữ liệu. Hãy kiểm tra DATABASE_URL và kết nối mạng."
        )


_ensure_database_schema()


def _configured_cors_origins() -> list[str]:
    """Danh sách origin được phép gọi API.

    Ngoài danh sách mặc định, địa chỉ frontend dùng cho liên kết xác minh cũng
    được thêm vào. Nếu API từ chối chính frontend của mình thì thao tác đăng ký
    và xác minh đều hỏng, trong khi nguyên nhân nằm ở CORS chứ không phải email.
    """
    origins = list(DEFAULT_CORS_ORIGINS)

    configured = read_env(CORS_ALLOWED_ORIGINS_ENV)
    if configured:
        origins.extend(
            origin.strip() for origin in configured.split(",") if origin.strip()
        )

    try:
        frontend_url = resolve_frontend_url()
    except MailConfigurationError:
        frontend_url = None
    if frontend_url and frontend_url not in origins:
        origins.append(frontend_url)

    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=_configured_cors_origins(),
    allow_origin_regex=VERCEL_PREVIEW_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routes.router)
app.include_router(task_routes.router)
app.include_router(space_routes.router)
app.include_router(diagnostics.router)


@app.get("/")
def read_root():
    return {"message": "Hello World"}
