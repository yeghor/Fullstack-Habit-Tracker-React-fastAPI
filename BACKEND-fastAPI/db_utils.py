from database import session_local, engine
from sqlalchemy.orm import Session
from models import Users, HabitCompletions, Habits
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from typing import Generator

async def get_db():
    db: Session = session_local()
    try:
        yield db
    finally:
        await db.close()

# DROPS TABLE! BE CAREFUL!
def drop_habits() -> None:
    try:
        db: Session = session_local()
        HabitCompletions.__table__.drop(engine)
        Habits.__table__.drop(engine)
    finally:
        db.close()

def get_merged_user(user: Users, db: Session) -> Users:
    try:
        return db.merge(user)
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while working with database (merging user)")
    except Exception:
        raise HTTPException(status_code=500, detail="Uknown error occured. PLease, try again later (merging user)")

def get_merged_habit(habit: Habits, db: Session):
    try:
        habit = db.merge(habit)
        return habit
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while working with database (merging habit)")
    except Exception:
        raise HTTPException(status_code=500, detail="Uknown error occured. PLease, try again later (merging habit)")
