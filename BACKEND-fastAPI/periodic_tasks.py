from models import Habits, JWTTable, HabitCompletions, Users
from database import session_local
from sqlalchemy.ext.asyncio import AsyncSession
import datetime
from datetime import time
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from db_utils import get_completed_habits, get_expired_jwts, get_latest_completion, delete_expired_jwts

async def reset_all_habits() -> None:
    db: AsyncSession = session_local()
    try:
        habits = await get_completed_habits()
        for habit in habits:
            reset_at = habit.reset_at
            for time, value in reset_at.items():
                reset_at[time] = False
            habit.reset_at = reset_at
            habit.completed = False
        await db.commit()
    finally:
        await db.close()


def get_seconds_from_midnight() -> int:
    timestamp_now = datetime.datetime.now().timestamp()
    timestamp_date = datetime.datetime.combine(
        time=datetime.time(0, 0), date=datetime.datetime.today()
    ).timestamp()
    return round(timestamp_now - timestamp_date)


async def reset_potential_habit() -> None:
    db: AsyncSession = session_local()
    try:
        habits = await get_completed_habits(db=db)
        from_midnight_unix = get_seconds_from_midnight()
        if not habits:
            return

        for habit in habits:
            latest_completion_raw = await get_latest_completion(db=db, habit_id=habit.habit_id)
            latest_completion = latest_completion_raw.first()

            if not latest_completion:
                continue

            reset_at = habit.reset_at
            reset_at_sorted = dict(sorted(reset_at.items()))

            required_window = None
            for time, status in reset_at_sorted.items():
                if from_midnight_unix > int(time):
                    required_window = int(time)
                    reset_at_sorted[time] = True

            if not required_window:
                continue

            if to_seconds_from_midnight(latest_completion.completed_at) > required_window:
                continue
            habit.completed = False
    except SQLAlchemyError:
        raise SQLAlchemyError("Error while working with db")
    finally:
        await db.commit()
        await db.close()

def to_seconds_from_midnight(UNIX_time) -> int:
    today = datetime.datetime.today().date()
    today_UNIX_midnight = datetime.datetime.combine(today, time()).timestamp()

    return UNIX_time - int(today_UNIX_midnight)

async def update_jwts():
    db = session_local()
    try:
        timestamp = datetime.datetime.now()
        timestamp_unix = round(timestamp.timestamp())
        await delete_expired_jwts(db=db, UNIX_timestamp=timestamp_unix)
        await db.commit()
    finally:
        await db.close()
