"""Temporary diagnostic: verify each layer of the verification-email path."""
import asyncio
import os
import socket
import smtplib
import ssl
import traceback

from dotenv import load_dotenv

load_dotenv()

KEYS = ["MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_FROM", "MAIL_PORT", "MAIL_SERVER", "FRONTEND_URL"]

print("=" * 60)
print("1. ENVIRONMENT")
print("=" * 60)
for key in KEYS:
    value = os.getenv(key)
    if value is None:
        print(f"  {key:16} = <MISSING>")
    elif key == "MAIL_PASSWORD":
        print(f"  {key:16} = {'*' * len(value)} (len={len(value)})")
    else:
        print(f"  {key:16} = {value}")

print()
print("=" * 60)
print("2. DNS RESOLUTION")
print("=" * 60)
server = os.getenv("MAIL_SERVER")
try:
    infos = socket.getaddrinfo(server, None)
    ips = sorted({info[4][0] for info in infos})
    print(f"  {server} -> {ips}")
except Exception as exc:
    print(f"  FAILED: {type(exc).__name__}: {exc}")

print()
print("=" * 60)
print("3. RAW TCP + STARTTLS HANDSHAKE")
print("=" * 60)
port = int(os.getenv("MAIL_PORT"))
try:
    ctx = ssl.create_default_context()
    with smtplib.SMTP(server, port, timeout=20) as smtp:
        smtp.set_debuglevel(0)
        code, banner = smtp.ehlo()
        print(f"  EHLO -> {code} {banner.decode(errors='replace').strip()}")
        print(f"  STARTTLS supported: {smtp.has_extn('starttls')}")
        smtp.starttls(context=ctx)
        smtp.ehlo()
        username = os.getenv("MAIL_USERNAME")
        password = os.getenv("MAIL_PASSWORD")
        smtp.login(username, password)
        print("  LOGIN -> OK (credentials valid)")
except Exception as exc:
    print(f"  FAILED: {type(exc).__name__}: {exc}")
    traceback.print_exc()

print()
print("=" * 60)
print("4. fastapi-mail SEND (exact app code path)")
print("=" * 60)


async def send_test():
    from email_utils import send_verification_email

    target = os.getenv("MAIL_FROM")
    print(f"  Sending test verification email to {target} ...")
    await send_verification_email(target, "diagnostic-token-123")
    print("  SEND -> OK")


try:
    asyncio.run(send_test())
except Exception as exc:
    print(f"  FAILED: {type(exc).__name__}: {exc}")
    traceback.print_exc()

print()
print("=" * 60)
print("5. LINK THAT WOULD BE GENERATED")
print("=" * 60)
print(f"  {os.getenv('FRONTEND_URL')}/verify-email?token=...")
