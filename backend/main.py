import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError
from pydantic import BaseModel
from sqlalchemy.orm import Session

import auth
import models
import schemas
from database import Base, engine, get_db
from email_utils import send_verification_email
from google_auth import fetch_google_account

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
                    "http://localhost:5173", 
                    "http://127.0.0.1:5173",
                    "https://todo-list-lkr9.vercel.app",
                    "https://todo-list-lkr9-33ieg8jk2-dats-projects-a51e6e38.vercel.app"
                    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_authenticated_user(token: str = Depends(auth.decode_access_token), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    email = token.get("sub")
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get('/')
def read_root():
    return {"message": "Hello World"}

#=====Task=====#

@app.get("/tasks")
def get_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    return tasks

@app.get("/task/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.post("/tasks", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        is_completed=task.is_completed,
        is_important=task.is_important,
        user_id=current_user.id
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task    

@app.put("/task/{task_id}")
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in task.dict(exclude_unset=True).items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/task/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()

    return {"message" : "Task deleted successfully !"}

@app.patch("/task/{task_id}/complete")
def complete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.is_completed = True
    db.commit()
    db.refresh(db_task)
    return db_task

@app.patch("/tasks/{task_id}/reschedule")
def reschedule_task(task_id: int, new_due_date: schemas.RescheduleRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task không tồn tại")
    db_task.due_date = new_due_date.due_date
    db.commit()
    db.refresh(db_task)
    return db_task

#=== Filter ===#
@app.get("/task/filter/important")
def get_important_task(db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_task_important = db.query(models.Task).filter(models.Task.is_important == True, models.Task.user_id == current_user.id).all()
    if not db_task_important:
        raise HTTPException(status_code=404, detail="No Important task found")
    return db_task_important

@app.get("/task/filter/planned")
def get_planned_task(db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_planned_task = db.query(models.Task).filter(models.Task.due_date.isnot(None), models.Task.user_id == current_user.id).all()
    return db_planned_task

@app.get("/task/filter/todo")
def get_todo_task(db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_todo_task = db.query(models.Task).filter(models.Task.is_completed == False, models.Task.user_id == current_user.id).all()
    if not db_todo_task:
        raise HTTPException(status_code=404, detail="No To-do Task found")
    return db_todo_task

#=== Space===#
@app.get("/spaces")
def get_spaces(db: Session= Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_spaces = db.query(models.Space).filter(models.Space.user_id == current_user.id).all()
    return db_spaces

@app.post("/spaces", response_model=schemas.SpaceResponse)
def create_space(space: schemas.SpaceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_space = models.Space(
        name=space.name,
        description=space.description,
        color_hex=space.color_hex,
        icon=space.icon,
        user_id=current_user.id
    )
    db.add(db_space)
    db.commit()
    db.refresh(db_space)
    return db_space

@app.delete("/spaces/{space_id}")
def delete_space(space_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_space = db.query(models.Space).filter(models.Space.id == space_id, models.Space.user_id == current_user.id).first()
    if not db_space:
        raise HTTPException(status_code=404, detail="Space not found")
    db.delete(db_space)
    db.commit()
    return {"message": "Space deleted successfully!"}

@app.get("/spaces/{space_id}")
def get_space(space_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_space = db.query(models.Space).filter(models.Space.id == space_id, models.Space.user_id == current_user.id).first()
    if not db_space:
        raise HTTPException(status_code=404, detail="Space not found")
    return db_space

@app.get("/spaces/{space_id}/tasks")
def get_tasks_in_space(space_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_space = db.query(models.Space).filter(models.Space.id == space_id, models.Space.user_id == current_user.id).first()
    if not db_space:
        raise HTTPException(status_code=404, detail="Space not found")
    db_tasks_in_space = db.query(models.Task).filter(models.Task.space_id == space_id, models.Task.user_id == current_user.id).all()
    return db_tasks_in_space


#Thêm task vào space
@app.post("/spaces/{space_id}/tasks", response_model=schemas.TaskResponse)
def create_task_in_space(space_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_authenticated_user)):
    db_space = db.query(models.Space).filter(models.Space.id == space_id, models.Space.user_id == current_user.id).first()
    if not db_space:
        raise HTTPException(status_code=404, detail="Space not found")
    db_task = models.Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        is_completed=task.is_completed,
        is_important=task.is_important,
        space_id=space_id,
        user_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


#===== User =====#
@app.post("/users", response_model=schemas.UserResponse)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=auth.hash_password(user.password),
        is_verified=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    verify_token = auth.create_access_token(data={"sub": db_user.email})
    await send_verification_email(db_user.email, verify_token)
    return db_user

@app.get("/verify")
async def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        payload = auth.decode_access_token(token)
        if not payload:  
            raise HTTPException(status_code=401, detail="Token không hợp lệ hoặc đã hết hạn")
        email = payload.get("sub")
        db_user = db.query(models.User).filter(models.User.email == email).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        if db_user.is_verified:
            raise HTTPException(status_code=400, detail="Email already verified")
        db_user.is_verified = True
        db.commit()
        db.refresh(db_user)
        return {"message": "Email verified successfully"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

class ResendVerificationRequest(BaseModel):
    email: str

@app.post("/resend-verification")
async def resend_verification_email(data: ResendVerificationRequest, db: Session = Depends(get_db)):
    email = data.email
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    verify_token = auth.create_access_token(data={"sub": db_user.email})
    await send_verification_email(db_user.email, verify_token)
    return {"message": "Verification email resent successfully"}

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    if not db_user.is_verified:
        raise HTTPException(status_code=400, detail="Please verify your email")
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

#Lấy user hiện tại
@app.get("/users/me", response_model=schemas.UserResponse)
def get_current_user(current_user: models.User = Depends(get_authenticated_user)):
    return current_user

#Phải đăng nhập mới có thể tạo task
@app.post("/me/tasks", response_model=schemas.TaskResponse)
def get_me(current_user: models.User = Depends(get_authenticated_user)):
    return {"message": f"Hello {current_user.name}, you can create a task now!"}


#===== Google OAuth2 =====#
@app.post("/google-login", response_model=schemas.Token)
def google_login(google_user: schemas.GoogleUser, db: Session = Depends(get_db)):
    account = fetch_google_account(google_user.token)

    db_user = db.query(models.User).filter(models.User.email == account.email).first()
    if not db_user:
        db_user = models.User(
            name=account.name,
            email=account.email,
            password_hash=auth.hash_password(os.urandom(16).hex()),
            is_verified=True,
            google_id=account.google_id
        )
        db.add(db_user)
    else:
        # Google đã xác minh email này nên tài khoản cũ cũng được coi là hợp lệ.
        if not db_user.is_verified:
            db_user.is_verified = True
        if not db_user.google_id:
            db_user.google_id = account.google_id
    db.commit()
    db.refresh(db_user)

    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}
