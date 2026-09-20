"""Đọc cấu hình gửi email từ biến môi trường.

Cấu hình được đọc muộn (lazy) thay vì ở thời điểm import module. Trước đây
``email_utils`` gọi ``int(os.getenv("MAIL_PORT"))`` ngay khi import, nên chỉ
cần thiếu một biến môi trường trên máy chủ là toàn bộ ứng dụng FastAPI sập,
chứ không chỉ riêng chức năng gửi email.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from urllib.parse import urlparse

RESEND_API_KEY = "RESEND_API_KEY"
MAIL_USERNAME = "MAIL_USERNAME"
MAIL_PASSWORD = "MAIL_PASSWORD"
MAIL_SERVER = "MAIL_SERVER"
MAIL_PORT = "MAIL_PORT"
MAIL_FROM = "MAIL_FROM"
MAIL_FROM_NAME = "MAIL_FROM_NAME"
FRONTEND_URL = "FRONTEND_URL"
VERCEL_FLAG = "VERCEL"

RESEND_ENV_KEYS: tuple[str, ...] = (RESEND_API_KEY, MAIL_FROM)
SMTP_ENV_KEYS: tuple[str, ...] = (MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM)

DEFAULT_SMTP_HOST = "smtp.gmail.com"
DEFAULT_SMTP_PORT = 587
DEFAULT_SENDER_NAME = "TodoList App"
LOCAL_FRONTEND_HOSTS = frozenset({"localhost", "127.0.0.1", "0.0.0.0", "::1"})

TRANSPORT_RESEND = "resend"
TRANSPORT_SMTP = "smtp"


class MailConfigurationError(RuntimeError):
    """Cấu hình gửi email thiếu hoặc không hợp lệ."""


@dataclass(frozen=True)
class MailSettings:
    """Cấu hình đã kiểm tra, đủ để dựng một transport."""

    transport: str
    sender_email: str
    sender_name: str
    frontend_url: str
    smtp_host: str
    smtp_port: int
    smtp_username: str | None = None
    smtp_password: str | None = None
    resend_api_key: str | None = None


def read_env(name: str) -> str | None:
    """Đọc biến môi trường; coi chuỗi rỗng như chưa được khai báo."""
    raw = os.getenv(name)
    if raw is None:
        return None
    value = raw.strip()
    return value or None


def is_running_on_vercel() -> bool:
    """Vercel đặt biến VERCEL=1 cho mọi deployment."""
    return read_env(VERCEL_FLAG) is not None


def _require(name: str) -> str:
    value = read_env(name)
    if value is None:
        raise MailConfigurationError(
            f"Thiếu biến môi trường {name}. Hãy khai báo nó cho môi trường "
            "Production (Vercel: Project Settings -> Environment Variables -> Production)."
        )
    return value


def _smtp_port() -> int:
    raw = read_env(MAIL_PORT)
    if raw is None:
        return DEFAULT_SMTP_PORT
    try:
        port = int(raw)
    except ValueError as exc:
        raise MailConfigurationError(
            f"{MAIL_PORT} phải là số nguyên, đang nhận {raw!r}."
        ) from exc
    if not 1 <= port <= 65535:
        raise MailConfigurationError(f"{MAIL_PORT} nằm ngoài khoảng hợp lệ: {port}.")
    return port


def resolve_frontend_url() -> str:
    """Địa chỉ frontend được nhúng vào liên kết xác minh trong email."""
    url = read_env(FRONTEND_URL)
    if url is None:
        raise MailConfigurationError(
            f"Thiếu biến môi trường {FRONTEND_URL}. Đây là địa chỉ frontend được "
            "nhúng vào liên kết xác minh, nếu trỏ về localhost thì người dùng "
            "không thể bấm vào liên kết sau khi triển khai."
        )
    return url.rstrip("/")


def frontend_url_is_local(url: str) -> bool:
    host = urlparse(url).hostname
    return host in LOCAL_FRONTEND_HOSTS if host else False


def missing_env_keys(keys: tuple[str, ...]) -> list[str]:
    return [key for key in keys if read_env(key) is None]


def _resend_settings() -> MailSettings:
    return MailSettings(
        transport=TRANSPORT_RESEND,
        sender_email=_require(MAIL_FROM),
        sender_name=read_env(MAIL_FROM_NAME) or DEFAULT_SENDER_NAME,
        frontend_url=resolve_frontend_url(),
        smtp_host=DEFAULT_SMTP_HOST,
        smtp_port=DEFAULT_SMTP_PORT,
        resend_api_key=_require(RESEND_API_KEY),
    )


def _smtp_settings() -> MailSettings:
    missing = missing_env_keys(SMTP_ENV_KEYS)
    if missing:
        raise MailConfigurationError(
            "Chưa cấu hình được transport gửi email. Khai báo RESEND_API_KEY "
            "(khuyến nghị trên Vercel), hoặc khai báo đầy đủ "
            f"{', '.join(SMTP_ENV_KEYS)} cho SMTP. Còn thiếu: {', '.join(missing)}."
        )
    return MailSettings(
        transport=TRANSPORT_SMTP,
        sender_email=_require(MAIL_FROM),
        sender_name=read_env(MAIL_FROM_NAME) or DEFAULT_SENDER_NAME,
        frontend_url=resolve_frontend_url(),
        smtp_host=read_env(MAIL_SERVER) or DEFAULT_SMTP_HOST,
        smtp_port=_smtp_port(),
        smtp_username=read_env(MAIL_USERNAME),
        smtp_password=read_env(MAIL_PASSWORD),
    )


def load_mail_settings() -> MailSettings:
    """Chọn transport phù hợp và trả về cấu hình đã kiểm tra.

    Ưu tiên Resend vì đó là một lời gọi HTTP, còn SMTP cần giữ một kết nối TCP
    sống suốt quá trình bắt tay TLS - điều mà Vercel Function không đảm bảo.
    """
    if read_env(RESEND_API_KEY):
        return _resend_settings()
    return _smtp_settings()


def describe_configuration() -> dict[str, object]:
    """Mô tả cấu hình hiện tại mà không để lộ giá trị bí mật."""
    frontend_url = read_env(FRONTEND_URL)
    return {
        "transport": TRANSPORT_RESEND if read_env(RESEND_API_KEY) else TRANSPORT_SMTP,
        "resend_api_key_present": read_env(RESEND_API_KEY) is not None,
        "smtp_username_present": read_env(MAIL_USERNAME) is not None,
        "smtp_password_present": read_env(MAIL_PASSWORD) is not None,
        "sender_email_present": read_env(MAIL_FROM) is not None,
        "frontend_url": frontend_url,
        "frontend_url_points_to_localhost": (
            frontend_url_is_local(frontend_url) if frontend_url else False
        ),
        "running_on_vercel": is_running_on_vercel(),
    }
