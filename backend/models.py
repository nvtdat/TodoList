from sqlalchemy import Column, DateTime, Integer, String
from database import Base
from datetime import datetime
from sqlalchemy import Boolean

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_verified = Column(Boolean, default=False)
    google_id = Column(String(255), unique=True, index=True)


class Task(Base):
    __tablename__="tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), index=True)
    description = Column(String(500), index=True)
    due_date = Column(DateTime)
    is_important = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    space_id = Column(Integer, index=True)
    user_id = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Space(Base):
    __tablename__ = "spaces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    description = Column(String(500), index=True)
    color_hex = Column(String(20), index=True)
    icon = Column(String(50))
    user_id = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
