"""Endpoint chẩn đoán cấu hình gửi email.

Chỉ hoạt động khi biến môi trường ``DIAGNOSTICS_TOKEN`` được khai báo, và chỉ
chấp nhận đúng token đó. Nhờ vậy cấu hình không bị lộ trên Production nếu
người vận hành không chủ động bật.
"""

from __future__ import annotations

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from email_utils import send_test_email
from mail_settings import describe_configuration, read_env

DIAGNOSTICS_TOKEN_ENV = "DIAGNOSTICS_TOKEN"
TOKEN_HEADER_NAME = "x-diagnostics-token"

router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])


class TestEmailRequest(BaseModel):
    recipient: str


def _require_diagnostics_token(provided: str | None) -> None:
    expected = read_env(DIAGNOSTICS_TOKEN_ENV)
    if expected is None:
        # Không khai báo token thì endpoint coi như không tồn tại.
        raise HTTPException(status_code=404, detail="Not found")
    if provided != expected:
        raise HTTPException(status_code=401, detail="Invalid diagnostics token")


@router.get("/mail")
def read_mail_configuration(x_diagnostics_token: str | None = Header(default=None)):
    """Cho biết transport đang dùng và biến môi trường nào còn thiếu."""
    _require_diagnostics_token(x_diagnostics_token)
    return describe_configuration()


@router.post("/mail/test")
async def send_test_email_from_deployment(
    payload: TestEmailRequest,
    x_diagnostics_token: str | None = Header(default=None),
):
    """Gửi thử một email để xác nhận deployment hiện tại gửi được thư."""
    _require_diagnostics_token(x_diagnostics_token)
    result = await send_test_email(payload.recipient)
    return {
        "delivered": result.delivered,
        "transport": result.transport,
        "provider_message_id": result.provider_message_id,
        "error": result.error,
    }
