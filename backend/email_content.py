"""Dựng nội dung email xác minh tài khoản.

Tách khỏi phần vận chuyển (``email_utils``) để có thể kiểm thử phần nội dung
mà không cần kết nối tới nhà cung cấp email.
"""

from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import quote

VERIFY_PATH = "/verify-email"
TOKEN_QUERY_PARAM = "token"
VERIFICATION_SUBJECT = "Verify your email - TodoList App"

BRAND_COLOR = "#2563EB"
TEXT_COLOR = "#0F172A"
MUTED_TEXT_COLOR = "#475569"


@dataclass(frozen=True)
class EmailContent:
    """Nội dung hoàn chỉnh của một email, đã sẵn sàng để gửi."""

    subject: str
    html: str
    text: str


def build_verification_link(frontend_url: str, token: str) -> str:
    """Liên kết người dùng bấm trong email để xác minh tài khoản.

    Phải dùng địa chỉ frontend công khai. Nếu trỏ về localhost thì liên kết
    trong email sẽ không mở được với bất kỳ ai ngoài máy phát triển.
    """
    base_url = frontend_url.rstrip("/")
    return f"{base_url}{VERIFY_PATH}?{TOKEN_QUERY_PARAM}={quote(token, safe='')}"


def _render_html_body(link: str, expires_in_hours: int) -> str:
    return f"""<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;color:{TEXT_COLOR};">
    <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:20px;">Confirm your email address</h1>
      <p style="margin:0 0 16px;line-height:1.6;">
        Thanks for signing up for TodoList App. Click the button below to verify
        your email address and activate your account.
      </p>
      <p style="margin:0 0 24px;">
        <a href="{link}" style="display:inline-block;background:{BRAND_COLOR};color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;">Verify email</a>
      </p>
      <p style="margin:0 0 12px;color:{MUTED_TEXT_COLOR};font-size:13px;line-height:1.6;">
        This link expires in {expires_in_hours} hours. If you did not create this
        account, you can ignore this message.
      </p>
      <p style="margin:0;color:{MUTED_TEXT_COLOR};font-size:13px;line-height:1.6;word-break:break-all;">
        If the button does not work, copy this address into your browser:<br />
        {link}
      </p>
    </div>
  </body>
</html>"""


def _render_text_body(link: str, expires_in_hours: int) -> str:
    return (
        "Confirm your email address\n\n"
        "Thanks for signing up for TodoList App. Open the link below to verify "
        "your email address and activate your account:\n\n"
        f"{link}\n\n"
        f"This link expires in {expires_in_hours} hours. If you did not create "
        "this account, you can ignore this message.\n"
    )


def build_verification_email(
    frontend_url: str,
    token: str,
    expires_in_hours: int,
) -> EmailContent:
    """Nội dung email xác minh, kèm cả bản HTML và bản văn bản thuần."""
    link = build_verification_link(frontend_url, token)
    return EmailContent(
        subject=VERIFICATION_SUBJECT,
        html=_render_html_body(link, expires_in_hours),
        text=_render_text_body(link, expires_in_hours),
    )
