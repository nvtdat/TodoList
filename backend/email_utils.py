"""Gửi email xác minh qua API HTTP (Resend) hoặc qua SMTP.

Vì sao có hai transport: một Vercel Function chỉ sống trong lúc xử lý request.
Gửi SMTP cần mở kết nối TCP, bắt tay TLS, xác thực rồi truyền dữ liệu trên
cùng một socket, nên rất dễ đứt khi hàm kết thúc. Một lời gọi HTTP chỉ là một
vòng request/response nên ổn định hơn hẳn. SMTP được giữ lại cho môi trường
phát triển ở máy cục bộ.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import requests
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

import auth
from email_content import EmailContent, build_verification_email
from mail_settings import (
    TRANSPORT_RESEND,
    MailConfigurationError,
    MailSettings,
    load_mail_settings,
)

logger = logging.getLogger(__name__)

RESEND_ENDPOINT = "https://api.resend.com/emails"
RESEND_TIMEOUT_SECONDS = 15
SMTP_TIMEOUT_SECONDS = 20
UNCONFIGURED_TRANSPORT = "unconfigured"


class EmailDeliveryError(RuntimeError):
    """Nhà cung cấp email không nhận được thư."""


@dataclass(frozen=True)
class SendResult:
    """Kết quả một lần gửi email, đủ để ghi log và trả về cho chẩn đoán."""

    delivered: bool
    transport: str
    provider_message_id: str | None = None
    error: str | None = None


def _resend_request_body(settings: MailSettings, recipient: str, content: EmailContent) -> dict:
    return {
        "from": f"{settings.sender_name} <{settings.sender_email}>",
        "to": [recipient],
        "subject": content.subject,
        "html": content.html,
        "text": content.text,
    }


def _send_via_resend(settings: MailSettings, recipient: str, content: EmailContent) -> str:
    try:
        response = requests.post(
            RESEND_ENDPOINT,
            headers={
                "Authorization": f"Bearer {settings.resend_api_key}",
                "Content-Type": "application/json",
            },
            json=_resend_request_body(settings, recipient, content),
            timeout=RESEND_TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        raise EmailDeliveryError(f"Không gọi được API Resend: {exc}") from exc

    if response.status_code >= 400:
        raise EmailDeliveryError(
            f"Resend từ chối gửi thư (HTTP {response.status_code}): {response.text[:400]}"
        )
    return str(response.json().get("id") or "")


def _smtp_configuration(settings: MailSettings) -> ConnectionConfig:
    return ConnectionConfig(
        MAIL_USERNAME=settings.smtp_username,
        MAIL_PASSWORD=settings.smtp_password,
        MAIL_FROM=settings.sender_email,
        MAIL_FROM_NAME=settings.sender_name,
        MAIL_PORT=settings.smtp_port,
        MAIL_SERVER=settings.smtp_host,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
        TIMEOUT=SMTP_TIMEOUT_SECONDS,
    )


async def _send_via_smtp(settings: MailSettings, recipient: str, content: EmailContent) -> str:
    message = MessageSchema(
        subject=content.subject,
        recipients=[recipient],
        body=content.html,
        alternative_body=content.text,
        subtype=MessageType.html,
    )
    await FastMail(_smtp_configuration(settings)).send_message(message)
    return ""


async def _deliver(settings: MailSettings, recipient: str, content: EmailContent) -> SendResult:
    """Gửi thư và luôn trả về kết quả thay vì ném lỗi ra tầng API.

    Việc gửi thư là tác dụng phụ của thao tác đăng ký. Nếu nó thất bại thì
    tài khoản vẫn phải được tạo và người dùng vẫn phải thấy phản hồi hợp lệ,
    nên lỗi chỉ được ghi log và báo lại qua :class:`SendResult`.
    """
    try:
        if settings.transport == TRANSPORT_RESEND:
            message_id = _send_via_resend(settings, recipient, content)
        else:
            message_id = await _send_via_smtp(settings, recipient, content)
    except Exception as exc:
        logger.exception("Gửi email tới %s qua %s thất bại", recipient, settings.transport)
        return SendResult(delivered=False, transport=settings.transport, error=str(exc))

    logger.info("Đã gửi email tới %s qua %s", recipient, settings.transport)
    return SendResult(
        delivered=True,
        transport=settings.transport,
        provider_message_id=message_id or None,
    )


def _unconfigured_result(recipient: str, exc: MailConfigurationError) -> SendResult:
    logger.error("Không gửi được email tới %s: %s", recipient, exc)
    return SendResult(delivered=False, transport=UNCONFIGURED_TRANSPORT, error=str(exc))


async def send_verification_email(recipient: str, verification_token: str) -> SendResult:
    """Gửi email chứa liên kết xác minh tài khoản."""
    try:
        settings = load_mail_settings()
    except MailConfigurationError as exc:
        return _unconfigured_result(recipient, exc)

    content = build_verification_email(
        settings.frontend_url,
        verification_token,
        auth.VERIFICATION_TOKEN_TTL_HOURS,
    )
    return await _deliver(settings, recipient, content)


async def send_test_email(recipient: str) -> SendResult:
    """Gửi một thư kiểm tra cấu hình tới địa chỉ chỉ định."""
    try:
        settings = load_mail_settings()
    except MailConfigurationError as exc:
        return _unconfigured_result(recipient, exc)

    content = EmailContent(
        subject="TodoList App mail configuration test",
        html=(
            "<p>This message confirms that TodoList App can send email from this "
            f"deployment using the <strong>{settings.transport}</strong> transport.</p>"
        ),
        text=(
            "This message confirms that TodoList App can send email from this "
            f"deployment using the {settings.transport} transport."
        ),
    )
    return await _deliver(settings, recipient, content)
