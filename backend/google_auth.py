"""Xác thực Google access token cho luồng đăng nhập bằng Google.

Frontend gọi useGoogleLogin() của @react-oauth/google; hook này dùng luồng
OAuth 2.0 Token nên trả về một *access token* dạng chuỗi opaque
(ví dụ "ya29.a0..."), không phải ID token dạng JWT. Vì vậy không thể xác thực
bằng google.oauth2.id_token.verify_oauth2_token() - hàm đó sẽ ném
ValueError "Wrong number of segments in token".

Thay vào đó module này hỏi thẳng Google:
  - tokeninfo: xác nhận token còn hạn và được cấp cho đúng client của mình (aud).
  - userinfo: lấy email, tên và mã định danh Google của người dùng.
"""

import os
from dataclasses import dataclass

import requests
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
GOOGLE_REQUEST_TIMEOUT_SECONDS = 10


@dataclass(frozen=True)
class GoogleAccount:
    """Tài khoản Google đã được xác thực."""

    email: str
    name: str
    google_id: str


def _expected_client_id() -> str:
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        raise HTTPException(
            status_code=500,
            detail="Máy chủ chưa cấu hình GOOGLE_CLIENT_ID",
        )
    return client_id


def _google_get(url: str, **kwargs) -> requests.Response:
    try:
        return requests.get(url, timeout=GOOGLE_REQUEST_TIMEOUT_SECONDS, **kwargs)
    except requests.RequestException:
        raise HTTPException(
            status_code=503,
            detail="Không kết nối được tới Google, vui lòng thử lại sau",
        )


def _ensure_token_belongs_to_app(access_token: str) -> None:
    """Token phải còn hạn và được cấp cho đúng client ID của ứng dụng.

    Đây là phần thay thế cho việc kiểm tra trường "aud" khi verify ID token:
    nếu thiếu bước này, một access token của ứng dụng khác vẫn có thể dùng để
    đăng nhập vào hệ thống.
    """
    response = _google_get(GOOGLE_TOKENINFO_URL, params={"access_token": access_token})
    if response.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail="Google token không hợp lệ hoặc đã hết hạn",
        )

    token_info = response.json()
    if token_info.get("aud") != _expected_client_id():
        raise HTTPException(
            status_code=401,
            detail="Google token không được cấp cho ứng dụng này",
        )
    if str(token_info.get("email_verified", "")).lower() != "true":
        raise HTTPException(
            status_code=401,
            detail="Email Google chưa được xác minh",
        )


def _fetch_profile(access_token: str) -> dict:
    response = _google_get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    if response.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail="Không lấy được thông tin tài khoản Google",
        )
    return response.json()


def fetch_google_account(access_token: str) -> GoogleAccount:
    """Xác thực access token và trả về hồ sơ người dùng Google."""
    if not access_token:
        raise HTTPException(status_code=400, detail="Thiếu Google token")

    _ensure_token_belongs_to_app(access_token)
    profile = _fetch_profile(access_token)

    email = profile.get("email")
    if not email:
        raise HTTPException(
            status_code=401,
            detail="Tài khoản Google không có email",
        )

    google_id = profile.get("sub")
    if not google_id:
        raise HTTPException(
            status_code=401,
            detail="Tài khoản Google không có mã định danh",
        )

    name = profile.get("name") or email.split("@")[0]

    return GoogleAccount(email=email, name=name, google_id=google_id)
