from pydantic import BaseModel, Field
from datetime import datetime


class TaskCreate(BaseModel):
    title: str = Field(..., example="Buy groceries")
    description: str = Field(default="", example="Milk, Bread, Eggs")
    due_date: datetime | None = Field(default=None, example="2023-12-31T23:59:59Z")
    is_completed: bool = False
    is_important: bool = False

class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, example="Buy groceries")
    description: str | None = Field(default=None, example="Milk, Bread, Eggs")
    due_date: datetime | None = Field(default=None, example="2023-12-31T23:59:59Z")
    is_completed: bool | None = None
    is_important: bool | None = None

class TaskResponse(TaskCreate):
    id: int = Field(..., example=1)
    created_at: datetime = Field(..., example="2023-01-01T12:00:00Z")
    is_completed: bool = False
    is_important: bool = False
    class Config:
        from_attributes = True

class RescheduleRequest(BaseModel):
    due_date: datetime = Field(..., example="2023-12-31T23:59:59Z")

class SpaceCreate(BaseModel):
    name: str = Field(..., example="Work")
    description: str = Field(..., example="Tasks related to work")


class SpaceResponse(SpaceCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


#===== USER =====#
class UserCreate(BaseModel):
    name: str = Field(..., example="John Doe")
    email: str = Field(..., example="Email")
    password: str = Field(..., example="Password")

class UserResponse(BaseModel):
    id: int = Field(..., example=1)
    name: str = Field(..., example="John Doe")
    email: str = Field(..., example="Email")
    created_at: datetime = Field(..., example="2023-01-01T12:00:00Z")

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str = Field(..., example="Email")
    password: str = Field(..., example="Password")

class TokenData(BaseModel):
    user_id: int = Field(..., example=1)

class Token(BaseModel):
    access_token: str
    token_type: str


