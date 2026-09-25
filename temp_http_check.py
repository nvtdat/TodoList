"""Gọi thật server đang chạy ở cổng 8001 để xác nhận /google-login phản hồi đúng.

Trường hợp token sai sẽ đi thẳng tới Google tokeninfo qua mạng thật.
"""

import json
import sys

import requests

BASE_URL = "http://127.0.0.1:8001"

response = requests.post(
    f"{BASE_URL}/google-login",
    json={"token": "bad-token"},
    timeout=30,
)
print("POST /google-login (token sai) ->", response.status_code)
print("body:", json.dumps(response.json(), ensure_ascii=False))

if response.status_code != 401:
    sys.exit(f"FAILED: mong đợi 401, nhận {response.status_code}")

detail = response.json().get("detail")
if detail != "Unable to reach Google servers for token verification":
    sys.exit(f"FAILED: detail không đúng: {detail!r}")

missing = requests.post(f"{BASE_URL}/google-login", json={}, timeout=30)
print("POST /google-login (thiếu token) ->", missing.status_code)
if missing.status_code != 422:
    sys.exit(f"FAILED: mong đợi 422, nhận {missing.status_code}")

print("\nOK: server thật từ chối token sai bằng 401 và đã gọi được Google tokeninfo.")
