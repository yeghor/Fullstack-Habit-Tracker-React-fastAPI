from models import Habits, JWTTable, HabitCompletions
from database import session_local
from sqlalchemy.orm import Session
import datetime
from datetime import time
from sqlalchemy.exc import SQLAlchemyError

def reset_all_habits() -> None:
    db: Session = session_local()
    try:
        habits = db.query(Habits).filter(Habits.completed == True)
        for habit in habits:
            reset_at = habit.reset_at
            for time, value in reset_at.items():
                reset_at[time] = False
            habit.reset_at = reset_at
            habit.completed = False
        db.commit()
    finally:
        db.close()


def get_seconds_from_midnight() -> int:
    timestamp_now = datetime.datetime.now().timestamp()
    timestamp_date = datetime.datetime.combine(
        time=datetime.time(0, 0), date=datetime.datetime.today()
    ).timestamp()
    return round(timestamp_now - timestamp_date)


def reset_potential_habit() -> None:
    print("Periodic reset_potential habit called")
    db: Session = session_local()
    try:
        habits = db.query(Habits).filter(Habits.completed == True)
        from_midnight_unix = get_seconds_from_midnight()

        if not habits:
            return

        for habit in habits:
            print(habit.habit_name)
            latest_completion: HabitCompletions = db.query(HabitCompletions).filter(
                HabitCompletions.habit_id == habit.habit_id,
            ).order_by(HabitCompletions.completed_at.desc()).first()

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
        raise SQLAlchemyError("Error while working with db in periodic task")
    finally:
        db.commit()
        db.close()

def to_seconds_from_midnight(UNIX_time) -> int:
    today = datetime.datetime.today().date()
    today_UNIX_midnight = datetime.datetime.combine(today, time()).timestamp()

    return UNIX_time - int(today_UNIX_midnight)

def update_jwts():
    print("Periodic update_jwts habit called")
    db = session_local()
    try:
        timestamp = datetime.datetime.now()
        timestamp_unix = round(timestamp.timestamp())
        jwts = db.query(JWTTable).filter(JWTTable.expires_at < timestamp_unix)
        jwts.delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()
