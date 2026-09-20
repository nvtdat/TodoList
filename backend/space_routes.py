"""Endpoint không gian làm việc (spaces)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from dependencies import get_authenticated_user

router = APIRouter(tags=["spaces"])

SPACE_NOT_FOUND = "Space not found"


def _find_owned_space(db: Session, space_id: int, user_id: int) -> models.Space:
    db_space = (
        db.query(models.Space)
        .filter(models.Space.id == space_id, models.Space.user_id == user_id)
        .first()
    )
    if not db_space:
        raise HTTPException(status_code=404, detail=SPACE_NOT_FOUND)
    return db_space


@router.get("/spaces")
def get_spaces(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    return db.query(models.Space).filter(models.Space.user_id == current_user.id).all()


@router.post("/spaces", response_model=schemas.SpaceResponse)
def create_space(
    space: schemas.SpaceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    db_space = models.Space(
        name=space.name,
        description=space.description,
        color_hex=space.color_hex,
        icon=space.icon,
        user_id=current_user.id,
    )
    db.add(db_space)
    db.commit()
    db.refresh(db_space)
    return db_space


@router.delete("/spaces/{space_id}")
def delete_space(
    space_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    db_space = _find_owned_space(db, space_id, current_user.id)
    db.delete(db_space)
    db.commit()
    return {"message": "Space deleted successfully!"}


@router.get("/spaces/{space_id}")
def get_space(
    space_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    return _find_owned_space(db, space_id, current_user.id)


@router.get("/spaces/{space_id}/tasks")
def get_tasks_in_space(
    space_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    _find_owned_space(db, space_id, current_user.id)
    return (
        db.query(models.Task)
        .filter(models.Task.space_id == space_id, models.Task.user_id == current_user.id)
        .all()
    )


@router.post("/spaces/{space_id}/tasks", response_model=schemas.TaskResponse)
def create_task_in_space(
    space_id: int,
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    _find_owned_space(db, space_id, current_user.id)
    db_task = models.Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        is_completed=task.is_completed,
        is_important=task.is_important,
        space_id=space_id,
        user_id=current_user.id,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task
