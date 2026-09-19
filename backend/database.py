import os
import ssl
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
load_dotenv()

DB_SSL_CA = os.path.join(os.path.dirname(__file__), "ca.pem")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables.")

DB_SSL_CA = os.getenv("DB_SSL_CA")
ctx = ssl.create_default_context(cafile=DB_SSL_CA) if DB_SSL_CA else None
ctx.check_hostname = False if ctx else None
ctx.verify_mode = ssl.CERT_NONE if ctx else None


engine = create_engine(
    DATABASE_URL,
    connect_args={"ssl": ctx} if ctx else {},
    pool_pre_ping=True,
    max_overflow=10,
    pool_size=5,
    pool_recycle=3600,
    pool_timeout=30,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()