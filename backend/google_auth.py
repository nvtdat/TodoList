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
    #Tài khoản Google xác thực thành công, dùng để đăng nhập hoặc đăng ký người dùng.

    email: str
    name: str
    google_id: str


def _expected_client_id() -> str:
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        raise HTTPException(
            status_code=500,
            detail=" GOOGLE_CLIENT_ID",
        )
    return client_id


def _google_get(url: str, **kwargs) -> requests.Response:
    try:
        return requests.get(url, timeout=GOOGLE_REQUEST_TIMEOUT_SECONDS, **kwargs)
    except requests.RequestException:
        raise HTTPException(
            status_code=503,
            detail="Unable to reach Google servers for token verification",
        )


def _ensure_token_belongs_to_app(access_token: str) -> None:
   # Xác thực access token với Google tokeninfo và đảm bảo nó thuộc về ứng dụng của chúng ta.
    response = _google_get(GOOGLE_TOKENINFO_URL, params={"access_token": access_token})
    if response.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Google token",
        )

    token_info = response.json()
    if token_info.get("aud") != _expected_client_id():
        raise HTTPException(
            status_code=401,
            detail="Google token is not issued for this app",
        )
    if str(token_info.get("email_verified", "")).lower() != "true":
        raise HTTPException(
            status_code=401,
            detail="Unverified Google account (email not verified)",
        )


def _fetch_profile(access_token: str) -> dict:
    response = _google_get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    if response.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail="Unable to fetch Google account information",
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
            detail="Google account does not have an email address",
        )

    google_id = profile.get("sub")
    if not google_id:
        raise HTTPException(
            status_code=401,
            detail="Google account does not have a unique identifier",
        )

    name = profile.get("name") or email.split("@")[0]

    return GoogleAccount(email=email, name=name, google_id=google_id)
