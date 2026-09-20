"""Temporary end-to-end smoke test against a locally running server.

Run the server first, then run this script. It exercises the full account
lifecycle (signup -> verification email -> verify -> login) plus every other
endpoint, including the failure paths.
"""

import sys

import requests

import auth

BASE_URL = "http://127.0.0.1:8000"
TEST_EMAIL = "nvtdat30052006+signuptest@gmail.com"
TEST_PASSWORD = "SmokeTest123!"
TIMEOUT_SECONDS = 60

passed = 0
failed = 0


def check(label, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  PASS  {label}  {detail}")
    else:
        failed += 1
        print(f"  FAIL  {label}  {detail}")
    return condition


def section(title):
    print()
    print(title)
    print("-" * len(title))


def main():
    section("1. Health and configuration")
    response = requests.get(f"{BASE_URL}/", timeout=TIMEOUT_SECONDS)
    check("GET / returns Hello World", response.status_code == 200 and response.json()["message"] == "Hello World", f"-> {response.status_code}")

    response = requests.get(f"{BASE_URL}/diagnostics/mail", timeout=TIMEOUT_SECONDS)
    check("GET /diagnostics/mail is hidden when DIAGNOSTICS_TOKEN is unset", response.status_code == 404, f"-> {response.status_code}")

    section("2. Registration sends the verification email")
    response = requests.post(
        f"{BASE_URL}/users",
        json={"name": "Smoke Test", "email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=TIMEOUT_SECONDS,
    )
    check("POST /users returns 200", response.status_code == 200, f"-> {response.status_code} {response.text[:200]}")
    body = response.json() if response.status_code == 200 else {}
    check("response reports verification_email_sent", body.get("verification_email_sent") is True, f"-> {body.get('verification_email_sent')}")
    check("no verification_email_error", body.get("verification_email_error") is None, f"-> {body.get('verification_email_error')}")
    check("response exposes the new field", "verification_email_sent" in body, "")

    response = requests.post(
        f"{BASE_URL}/users",
        json={"name": "Smoke Test", "email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=TIMEOUT_SECONDS,
    )
    check("duplicate registration returns 400", response.status_code == 400, f"-> {response.status_code}")

    section("3. Login is blocked until the email is verified")
    response = requests.post(f"{BASE_URL}/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD}, timeout=TIMEOUT_SECONDS)
    check("login before verification returns 400", response.status_code == 400, f"-> {response.status_code}")
    check("detail keeps the string the frontend looks for", "Please verify your email" in response.text, f"-> {response.text[:120]}")

    response = requests.post(f"{BASE_URL}/login", json={"email": TEST_EMAIL, "password": "wrong-password"}, timeout=TIMEOUT_SECONDS)
    check("wrong password returns 400", response.status_code == 400, f"-> {response.status_code}")

    section("4. Resend verification")
    response = requests.post(f"{BASE_URL}/resend-verification", json={"email": TEST_EMAIL}, timeout=TIMEOUT_SECONDS)
    check("POST /resend-verification returns 200", response.status_code == 200, f"-> {response.status_code} {response.text[:200]}")
    if response.status_code == 200:
        check("resend reports email_sent", response.json().get("email_sent") is True, f"-> {response.json()}")

    response = requests.post(f"{BASE_URL}/resend-verification", json={"email": "nobody@example.com"}, timeout=TIMEOUT_SECONDS)
    check("resend for unknown email returns 404", response.status_code == 404, f"-> {response.status_code}")

    section("5. Verify the email")
    response = requests.get(f"{BASE_URL}/verify?token=not-a-real-token", timeout=TIMEOUT_SECONDS)
    check("invalid token returns 400", response.status_code == 400, f"-> {response.status_code}")

    token = auth.create_verification_token(TEST_EMAIL)
    response = requests.get(f"{BASE_URL}/verify", params={"token": token}, timeout=TIMEOUT_SECONDS)
    check("valid token returns 200", response.status_code == 200, f"-> {response.status_code} {response.text[:200]}")
    if response.status_code == 200:
        check("first verify is not already_verified", response.json().get("already_verified") is False, f"-> {response.json()}")

    response = requests.get(f"{BASE_URL}/verify", params={"token": token}, timeout=TIMEOUT_SECONDS)
    check("second verify is idempotent", response.status_code == 200 and response.json().get("already_verified") is True, f"-> {response.status_code}")

    login_response = requests.get(f"{BASE_URL}/login", timeout=TIMEOUT_SECONDS)
    check("GET /login is not allowed", login_response.status_code == 405, f"-> {login_response.status_code}")

    section("6. Login after verification")
    response = requests.post(f"{BASE_URL}/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD}, timeout=TIMEOUT_SECONDS)
    check("login returns 200", response.status_code == 200, f"-> {response.status_code} {response.text[:200]}")
    if response.status_code != 200:
        print()
        print("Cannot continue without an access token.")
        return 1
    access_token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(f"{BASE_URL}/users/me", headers=headers, timeout=TIMEOUT_SECONDS)
    check("GET /users/me returns 200", response.status_code == 200, f"-> {response.status_code}")
    if response.status_code == 200:
        check("GET /users/me returns the test account", response.json()["email"] == TEST_EMAIL, f"-> {response.json().get('email')}")

    response = requests.get(f"{BASE_URL}/users/me", timeout=TIMEOUT_SECONDS)
    check("GET /users/me without token returns 401", response.status_code == 401, f"-> {response.status_code}")

    response = requests.post(f"{BASE_URL}/me/tasks", headers=headers, timeout=TIMEOUT_SECONDS)
    check("POST /me/tasks returns 200 (was a 500 before)", response.status_code == 200, f"-> {response.status_code} {response.text[:200]}")

    section("7. Tasks")
    response = requests.get(f"{BASE_URL}/tasks", timeout=TIMEOUT_SECONDS)
    check("GET /tasks without token returns 401", response.status_code == 401, f"-> {response.status_code}")

    response = requests.post(f"{BASE_URL}/tasks", json={"title": "Smoke task", "description": "created by smoke test", "is_important": True}, headers=headers, timeout=TIMEOUT_SECONDS)
    check("POST /tasks returns 200", response.status_code == 200, f"-> {response.status_code} {response.text[:200]}")
    task_id = response.json()["id"] if response.status_code == 200 else None

    response = requests.post(f"{BASE_URL}/tasks", json={"description": "missing title"}, headers=headers, timeout=TIMEOUT_SECONDS)
    check("POST /tasks without title returns 422", response.status_code == 422, f"-> {response.status_code}")

    response = requests.get(f"{BASE_URL}/tasks", headers=headers, timeout=TIMEOUT_SECONDS)
    check("GET /tasks returns 200 with one task", response.status_code == 200 and len(response.json()) == 1, f"-> {response.status_code}")

    if task_id is not None:
        response = requests.get(f"{BASE_URL}/task/{task_id}", headers=headers, timeout=TIMEOUT_SECONDS)
        check("GET /task/{id} returns 200", response.status_code == 200, f"-> {response.status_code}")

        response = requests.put(f"{BASE_URL}/task/{task_id}", json={"title": "Smoke task renamed"}, headers=headers, timeout=TIMEOUT_SECONDS)
        check("PUT /task/{id} returns 200", response.status_code == 200 and response.json()["title"] == "Smoke task renamed", f"-> {response.status_code}")

        response = requests.patch(f"{BASE_URL}/task/{task_id}/complete", headers=headers, timeout=TIMEOUT_SECONDS)
        check("PATCH /task/{id}/complete returns 200", response.status_code == 200 and response.json()["is_completed"] is True, f"-> {response.status_code}")

        response = requests.get(f"{BASE_URL}/task/filter/important", headers=headers, timeout=TIMEOUT_SECONDS)
        check("GET /task/filter/important returns 200", response.status_code == 200 and len(response.json()) == 1, f"-> {response.status_code}")

        response = requests.get(f"{BASE_URL}/task/filter/planned", headers=headers, timeout=TIMEOUT_SECONDS)
        check("GET /task/filter/planned returns 200", response.status_code == 200, f"-> {response.status_code}")

    response = requests.get(f"{BASE_URL}/task/999999", headers=headers, timeout=TIMEOUT_SECONDS)
    check("GET /task/999999 returns 404", response.status_code == 404, f"-> {response.status_code}")

    section("8. Spaces")
    response = requests.post(f"{BASE_URL}/spaces", json={"name": "Smoke space", "description": "from smoke test"}, headers=headers, timeout=TIMEOUT_SECONDS)
    check("POST /spaces returns 200", response.status_code == 200, f"-> {response.status_code} {response.text[:200]}")
    space_id = response.json()["id"] if response.status_code == 200 else None

    response = requests.get(f"{BASE_URL}/spaces", headers=headers, timeout=TIMEOUT_SECONDS)
    check("GET /spaces returns 200", response.status_code == 200 and len(response.json()) == 1, f"-> {response.status_code}")

    if space_id is not None:
        response = requests.get(f"{BASE_URL}/spaces/{space_id}", headers=headers, timeout=TIMEOUT_SECONDS)
        check("GET /spaces/{id} returns 200", response.status_code == 200, f"-> {response.status_code}")

        response = requests.post(f"{BASE_URL}/spaces/{space_id}/tasks", json={"title": "Task in space", "description": "from smoke test"}, headers=headers, timeout=TIMEOUT_SECONDS)
        check("POST /spaces/{id}/tasks returns 200", response.status_code == 200, f"-> {response.status_code} {response.text[:200]}")

        response = requests.get(f"{BASE_URL}/spaces/{space_id}/tasks", headers=headers, timeout=TIMEOUT_SECONDS)
        check("GET /spaces/{id}/tasks returns 200 with one task", response.status_code == 200 and len(response.json()) == 1, f"-> {response.status_code}")

        response = requests.get(f"{BASE_URL}/spaces/999999", headers=headers, timeout=TIMEOUT_SECONDS)
        check("GET /spaces/999999 returns 404", response.status_code == 404, f"-> {response.status_code}")

    section("9. Cleanup")
    if task_id is not None:
        response = requests.delete(f"{BASE_URL}/task/{task_id}", headers=headers, timeout=TIMEOUT_SECONDS)
        check("DELETE /task/{id} returns 200", response.status_code == 200, f"-> {response.status_code}")

    if space_id is not None:
        response = requests.delete(f"{BASE_URL}/spaces/{space_id}", headers=headers, timeout=TIMEOUT_SECONDS)
        check("DELETE /spaces/{id} returns 200", response.status_code == 200, f"-> {response.status_code}")

    section("10. Resend after verification")
    response = requests.post(f"{BASE_URL}/resend-verification", json={"email": TEST_EMAIL}, timeout=TIMEOUT_SECONDS)
    check("resend for a verified account returns 400", response.status_code == 400, f"-> {response.status_code}")

    return 0


if __name__ == "__main__":
    exit_code = main()
    print()
    print(f"RESULT: {passed} passed, {failed} failed")
    sys.exit(exit_code if failed == 0 else 1)
