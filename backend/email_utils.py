import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

async def send_verification_email(email: str, token: str):
    frontend_url = os.getenv("FRONTEND_URL")
    verify_link = f"{frontend_url}/verify-email?token={token}"
    
    message = MessageSchema(
        subject="Verify email - TodoList App",
        recipients=[email],
        body=f"""
        <h2>Welcome to TodoList App!</h2>
        <p>Click on the link below to verify your email:</p>
        <a href="{verify_link}">Verify email</a>
        """,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)