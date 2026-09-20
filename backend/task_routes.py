"""Endpoint công việc và các bộ lọc."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from dependencies import get_authenticated_user

router = APIRouter(tags=["tasks"])


def _find_owned_task(db: Session, task_id: int, user_id: int) -> models.Task:
    db_task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.user_id == user_id)
        .first()
    )
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task


# Các route lọc phải khai báo trước route có tham số đường dẫn để không bị
# nuốt mất khi đường dẫn có cùng số đoạn.
@router.get("/task/filter/important")
def get_important_task(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    db_task_important = (
        db.query(models.Task)
        .filter(models.Task.is_important == True, models.Task.user_id == current_user.id)
        .all()
    )
    if not db_task_important:
        raise HTTPException(status_code=404, detail="No Important task found")
    return db_task_important


@router.get("/task/filter/planned")
def get_planned_task(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    return (
        db.query(models.Task)
        .filter(models.Task.due_date.isnot(None), models.Task.user_id == current_user.id)
        .all()
    )


@router.get("/task/filter/todo")
def get_todo_task(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    db_todo_task = (
        db.query(models.Task)
        .filter(models.Task.is_completed == False, models.Task.user_id == current_user.id)
        .all()
    )
    if not db_todo_task:
        raise HTTPException(status_code=404, detail="No To-do Task found")
    return db_todo_task


@router.get("/tasks")
def get_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    return db.query(models.Task).filter(models.Task.user_id == current_user.id).all()


@router.post("/tasks", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        is_completed=task.is_completed,
        is_important=task.is_important,
        user_id=current_user.id,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/task/{task_id}")
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    return _find_owned_task(db, task_id, current_user.id)


@router.put("/task/{task_id}")
def update_task(
    task_id: int,
    task: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    db_task = _find_owned_task(db, task_id, current_user.id)
    for key, value in task.dict(exclude_unset=True).items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.delete("/task/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    db_task = _find_owned_task(db, task_id, current_user.id)
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully !"}


@router.patch("/task/{task_id}/complete")
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    db_task = _find_owned_task(db, task_id, current_user.id)
    db_task.is_completed = True
    db.commit()
    db.refresh(db_task)
    return db_task


@router.patch("/tasks/{task_id}/reschedule")
def reschedule_task(
    task_id: int,
    new_due_date: schemas.RescheduleRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    db_task = _find_owned_task(db, task_id, current_user.id)
    db_task.due_date = new_due_date.due_date
    db.commit()
    db.refresh(db_task)
    return db_task
