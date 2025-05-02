from models import Habits, JWTTable
from database import session_local
from sqlalchemy.orm import Session
import datetime

def reset_all_habits(db: Session) -> None:
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
    timestamp_date = datetime.datetime.combine(time=datetime.time(0, 0), date=datetime.datetime.today()).timestamp()
    return round(timestamp_now - timestamp_date)

def reset_potential_habit(db: Session) -> None:
    db: Session = session_local()
    try:
        habits = db.query(Habits).filter(Habits.completed == True)
        from_midnight_unix = get_seconds_from_midnight()
        
        for habit in habits:
            reset_at = habit.reset_at
            reset_at_sorted = dict(sorted(reset_at.items()))

            required_window = None
            for time, flag in reset_at_sorted.items():
                if from_midnight_unix > time and not flag:
                    reset_at_sorted[time] = True
                    required_window = time
            
            if not required_window:
                continue

            reset_at_sorted[required_window] = True
            habit.reset_at = reset_at_sorted
            habit.completed = False
        
        db.commit()
    finally:
        db.close()

def update_jwts():
    db = session_local()
    try:
        timestamp = datetime.datetime.now()
        timestamp_unix = round(timestamp.timestamp())
        jwts = db.query(JWTTable).filter(JWTTable.expires_at < timestamp_unix)
        jwts.delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()