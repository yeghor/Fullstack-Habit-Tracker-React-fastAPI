from fastapi import HTTPException, Body, Header, Depends, APIRouter
from typing import Annotated, Dict, List
from schemas import TokenSchema
from uuid import uuid4
import datetime
from models import Users, JWTTable, Habits, HabitCompletions
from sqlalchemy.orm import Session
from authorization_utils import (
    get_user_depends,
)
from db_utils import get_db, get_merged_user
from GeneratingAuthUtils.jwt_token_handling import extract_payload
from ValidationUtils.validate_entries import validate_string, validate_reset_time
import datetime
import os
from dotenv import load_dotenv
import random
from schemas import HabitSchema, HabitCompletionSchema
from sqlalchemy.exc import SQLAlchemyError

habit_router = APIRouter()
load_dotenv()


XP_AFTER_COMPLETION = os.getenv("XP_AFTER_COMPLETION")
XP_RANDOM_FACTOR = os.getenv("XP_RANDOM_FACTOR")

@habit_router.post("/add_habit")
async def add_habit(
    habit_name: Annotated[str, Body(title="Habit name", min_length=3)],
    habit_desc: Annotated[str, Body(title="Habit decs", min_length=3)],
    reset_at: Annotated[
        List[int],
        Body(title="Resetting time in unix after midnight. SEPARATED BY SPACES"),
    ],
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
) -> HabitSchema:
    user = get_merged_user(user=user, db=db)

    if not validate_string(habit_name) or not validate_string(habit_desc):
        raise HTTPException(status_code=400, detail="Invalid habit name or description")
    if not validate_reset_time(reset_at):
        raise HTTPException(status_code=400, detail="Invalid resetting time")

    reset_at_final = {}
    for reset_time in reset_at:
        reset_at_final[reset_time] = False

    habit_id = str(uuid4())

    try:
        new_habit = Habits(
            habit_id=habit_id,
            habit_name=habit_name,
            habit_desc=habit_desc,
            user_id=user.user_id,
            date_created=datetime.datetime.today(),
            reset_at=reset_at_final,
            owner=user,
        )

        user.habits.append(new_habit)

        db.commit()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erorr while working with database")

    return new_habit


@habit_router.get("/get_habits")
async def get_habits(
    user: Users = Depends(get_user_depends), db: Session = Depends(get_db)
) -> List[HabitSchema]:
    user = get_merged_user(user=user, db=db)
    return user.habits


@habit_router.post("/habit_completion")
async def habit_completion(
    habit_id: Annotated[
        str, Header(title="Id of habit that need to be marked as completed")
    ],
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
) -> None:
    user = get_merged_user(user=user, db=db)

    try:
        habit: Habits = db.query(Habits).filter(Habits.habit_id == habit_id).first()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erorr while working with database")

    if not habit:
        raise HTTPException(status_code=400, detail="No habit with such id")

    if habit.completed:
        raise HTTPException(
            status_code=409,
            detail="This habit is already completed. Wait until it's resetting time",
        )

    HabitCompletion = HabitCompletions(
        completion_id=str(uuid4()),
        habit_id=habit.habit_id,
        habit_name=habit.habit_name,
        user_id=user.user_id,
        completed_at=datetime.datetime.today(),
        owner=user,
        habit=habit,
    )

    try:
        user.completions.append(HabitCompletion)
        habit.completions.append(HabitCompletion)

        user.xp += int(XP_AFTER_COMPLETION)

        habit.completed = True
        db.commit()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erorr while working with database")

@habit_router.post("/uncomplete_habit")
async def uncomplete_habit(
    habit_id = Annotated[str, Header(title="Id of habit to delete")],
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
):
    try:
        habit: Habits = db.query(Habits).filter(Habits.habit_id == habit_id).first()
        habit.completed = False

        user.xp -= int(XP_AFTER_COMPLETION)

        db.commit()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while worrking with database")

@habit_router.post("/delete_habit")
async def delete_habit(
    habit_id: Annotated[str, Header(title="Id of habit to delete")],
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
) -> None:
    user = get_merged_user(user=user, db=db)
    try:
        habit_to_delete = db.query(Habits).filter(Habits.habit_id == habit_id).first()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erorr while working with database")

    if not habit_to_delete:
        raise HTTPException(status_code=400, detail="Habit with this id doesn't exist")

    if habit_to_delete.user_id != user.user_id:
        raise HTTPException(status_code=401, detail="Unauthorized. User id in habit owner doesn't match.")

    db.delete(habit_to_delete)
    db.commit()


@habit_router.get("/get_completions")
async def get_completions(
    habit_id: Annotated[str, Header(title="Id of habit to delete")],
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
) -> List[HabitCompletionSchema]:
    user = get_merged_user(user=user, db=db)
    try:
        habit = db.query(Habits).filter(Habits.habit_id == habit_id).first()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erorr while working with database")

    if not habit:
        raise HTTPException(status_code=400, detail="No habit with such id")

    return habit.completions
