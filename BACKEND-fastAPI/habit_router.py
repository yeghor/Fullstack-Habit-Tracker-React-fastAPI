from fastapi import HTTPException, Body, Header, Depends, APIRouter, Request
from typing import Annotated, Dict, List
from schemas import TokenSchema, AddHabitSchema, HabitIdProvidedSchema
from uuid import uuid4
import datetime
from models import Users, JWTTable, Habits, HabitCompletions
from sqlalchemy.orm import Session
from depends_utils import (
    get_user_depends,
    get_habit_depends,
)
from db_utils import (
    commit,
    get_db,
    get_merged_user,
    get_merged_habit,
    delete_completion_by_id,
    get_latest_completion,
    delete_habit_by_id,
    construct_and_add_model_to_database
)
from GeneratingAuthUtils.jwt_token_handling import extract_payload
from ValidationUtils.validate_entries import validate_string, validate_reset_time
import datetime
import os
from dotenv import load_dotenv
import random
from schemas import HabitSchema, HabitCompletionSchema
from sqlalchemy.exc import SQLAlchemyError
import asyncio
from periodic_tasks import get_seconds_from_midnight
from user_xp_level_util import get_level_by_xp
from rate_limiter import limiter

habit_router = APIRouter()
load_dotenv()


XP_AFTER_COMPLETION = int(os.getenv("XP_AFTER_COMPLETION"))
XP_RANDOM_FACTOR = int(os.getenv("XP_RANDOM_FACTOR"))

MAX_HABITS = int(os.getenv("MAX_HABITS"))

# Manualy call await AsyncSession.commit()!
# Providing Request object to every root because slowAPI requires it.


@habit_router.post("/add_habit")
@limiter.limit("20/minute")
async def add_habit(
    request: Request,
    habit: AddHabitSchema = Body(...),
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
):
    user = await get_merged_user(user=user, db=db)

    if len(user.habits) + 1 > MAX_HABITS:
        raise HTTPException(
            status_code=400, detail="You can't add more habits. Each user can have up to 10 habits.")

    if not validate_string(habit.habit_name) or not validate_string(habit.habit_desc):
        raise HTTPException(
            status_code=400, detail="Invalid habit name or description")
    if not validate_reset_time(habit.reset_at):
        raise HTTPException(status_code=400, detail="Invalid resetting time")

    reset_at_final = {}
    for reset_time in habit.reset_at:
        reset_at_final[reset_time] = False

    habit_id = str(uuid4())

    construct_and_add_model_to_database(
        db=db, Model=Habits,
        habit_id=habit_id,
        habit_name=habit.habit_name,
        habit_desc=habit.habit_desc,
        user_id=user.user_id,
        date_created=datetime.datetime.today(),
        reset_at=reset_at_final,
        owner=user,
    )

    await commit(db)


@habit_router.get("/get_habits")
# @limiter.limit("20/minute")
async def get_habits(
    request: Request,
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db)
) -> List[HabitSchema]:
    user = await get_merged_user(user=user, db=db)
    return user.habits


@habit_router.post("/habit_completion")
@limiter.limit("20/minute")
async def habit_completion(
    request: Request,
    habit: Habits = Depends(get_habit_depends),
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
) -> None:
    user = await get_merged_user(user=user, db=db)
    habit = await get_merged_habit(habit=habit, db=db)

    if user.user_id != habit.user_id:
        raise HTTPException(
            status_code=401, detail="Unauthorized. You're not owner of this habit")

    if habit.completed:
        raise HTTPException(
            status_code=409, detail="This habit is already completed. Wait until it's resetting time",)

    xp_for_completion = int(XP_AFTER_COMPLETION *
                            random.randrange(1, XP_RANDOM_FACTOR + 1))

    construct_and_add_model_to_database(db=db, Model=HabitCompletions,
        completion_id=str(uuid4()),
        habit_id=habit.habit_id,
        habit_name=habit.habit_name,
        user_id=user.user_id,
        completed_at=int(
            datetime.datetime.today().timestamp()),
        xp_given=xp_for_completion,
        owner=user,
        habit=habit,
    )

    from_midnight_unix = get_seconds_from_midnight()
    reset_at = habit.reset_at
    reset_at_sorted = dict(sorted(reset_at.items()))
    for time, flag in reset_at_sorted.items():
        if from_midnight_unix > int(time) and not flag:
            reset_at_sorted[time] = True

    user.xp += xp_for_completion

    habit.completed = True

    await commit(db)


@habit_router.post("/uncomplete_habit")
@limiter.limit("20/minute")
async def uncomplete_habit(
    request: Request,
    habit: Habits = Depends(get_habit_depends),
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
):
    user = await get_merged_user(user=user, db=db)
    habit = await get_merged_habit(habit=habit, db=db)

    if user.user_id != habit.user_id:
        raise HTTPException(
            status_code=401, detail="Unauthorized. You're not owner of this habit")

    habit_completion = await get_latest_completion(db=db, habit_id=habit.habit_id)

    if not habit_completion:
        raise HTTPException(
            status_code=400, detail="No habit completion entries were made")

    if not habit.completed:
        raise HTTPException(
            status_code=400, detail="This habit is not completed, make a completion to be able to uncomplete habit")

    await delete_completion_by_id(db=db, completion_id=habit_completion.completion_id)

    habit.completed = False

    user.xp -= int(habit_completion.xp_given)
    level, xp_needed = get_level_by_xp(user.xp)
    user.level = level

    await commit(db)


@habit_router.post("/delete_habit")
@limiter.limit("20/minute")
async def delete_habit(
    request: Request,
    habit=Depends(get_habit_depends),
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
) -> None:
    user = await get_merged_user(user=user, db=db)
    habit = await get_merged_habit(habit=habit, db=db)

    if habit.user_id != user.user_id:
        raise HTTPException(
            status_code=401, detail="Unauthorized. You're not owner of this habit")

    await delete_habit_by_id(db=db, habit_id=habit.habit_id)

    await commit(db)


@habit_router.post("/get_habit_completions")
@limiter.limit("20/minute")
async def get_completions(
    request: Request,
    habit=Depends(get_habit_depends),
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
) -> List[HabitCompletionSchema]:
    user = await get_merged_user(user=user, db=db)
    habit = await get_merged_habit(habit=habit, db=db)

    if habit.user_id != user.user_id:
        raise HTTPException(
            status_code=401, detail="Unauthorized. You're not owner of this habit")
    return habit.completions


@habit_router.get("/get_all_completions")
@limiter.limit("20/minute")
async def get_all_completions(
    request: Request,
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db)
) -> List[HabitCompletionSchema]:
    user = await get_merged_user(db=db, user=user)

    return reversed(user.completions)
