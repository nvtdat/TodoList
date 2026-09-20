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
    color_hex: str | None = Field(default=None, example="#FF0000")
    icon: str | None = Field(default=None, example="folder")


class SpaceResponse(SpaceCreate):
    id: int
    user_id: int
    created_at: datetime
    color_hex: str | None
    icon: str | None

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

class UserRegistrationResponse(UserResponse):
    """Kèm trạng thái gửi thư xác minh để frontend báo đúng cho người dùng.

    Tài khoản được tạo trước khi thư được gửi. Nếu việc gửi thất bại thì đó là
    sự cố cấu hình chứ không phải lỗi đăng ký, nên phải trả về thông tin để
    frontend hiển thị nút gửi lại thay vì báo lỗi chung chung.
    """

    verification_email_sent: bool = Field(..., example=True)
    verification_email_error: str | None = Field(default=None, example=None)

class EmailDispatchResponse(BaseModel):
    message: str
    email_sent: bool
    transport: str
    error: str | None = Field(default=None)

class MessageResponse(BaseModel):
    message: str

class UserLogin(BaseModel):
    email: str = Field(..., example="Email")
    password: str = Field(..., example="Password")

class TokenData(BaseModel):
    user_id: int = Field(..., example=1)

class Token(BaseModel):
    access_token: str
    token_type: str


#==== GOOGLE OAUTH2 ====#
class GoogleUser(BaseModel):
    token: str = Field(..., example="Google OAuth2 token")
