from database import session_local, engine
from sqlalchemy.ext.asyncio import AsyncSession
from models import Users, HabitCompletions, Habits, JWTTable
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from typing import Generator
from sqlalchemy import select, delete

async def get_db():
    db: AsyncSession = session_local()
    try:
        yield db
    finally:
        await db.close()

# DROPS TABLE! BE CAREFUL!
# def drop_habits() -> None: # NEED TO BE REFACTORED
#     try:
#         db: AsyncSession = session_local()
#         HabitCompletions.__table__.drop(engine)
#         Habits.__table__.drop(engine)
#     finally:
#         db.close()

def get_merged_user(user: Users, db: AsyncSession) -> Users:
    try:
        return db.merge(user)
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while working with database (merging user)")
    except Exception:
        raise HTTPException(status_code=500, detail="Uknown error occured. PLease, try again later (merging user)")

def get_merged_habit(habit: Habits, db: AsyncSession):
    try:
        habit = db.merge(habit)
        return habit
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while working with database (merging habit)")
    except Exception:
        raise HTTPException(status_code=500, detail="Uknown error occured. PLease, try again later (merging habit)")

async def get_completed_habits(db: AsyncSession):
    try:
        return await db.execute(
            select(Habits)
            .where(Habits.completed == True)
            )
    except SQLAlchemyError:
        raise Exception("Error while working with database (getting completed habits)")
    except Exception:
        raise Exception("Uknown error occured. PLease, try again later (getting completed habits)")

async def get_expired_jwts(UNIX_timestamp: int | float, db: AsyncSession):  
    try:
        return await db.execute(
            select(JWTTable)
            .where(JWTTable.expires_at < int(UNIX_timestamp))
        )
    except SQLAlchemyError:
        raise Exception("Error while working with database (getting expired jwts)")
    except Exception:
        raise Exception("Uknown error occured. PLease, try again later (getting expired jwts)")    

async def get_latest_completion(db: AsyncSession, habit_id: str, UNIX_timestamp: int | float):
    try:
        return await db.execute(
            select(HabitCompletions)
            .where(HabitCompletions.habit_id == habit_id)
            .order_by(HabitCompletions.completed_at.desc())
        )
    except SQLAlchemyError:
        raise Exception("Error while working with database (getting last completion)")
    except Exception:
        raise Exception("Uknown error occured. PLease, try again later (getting last completion)")   
    
async def delete_expired_jwts(db: AsyncSession, UNIX_timestamp: int | float) -> None:
    try:
        return await db.execute(
            delete(JWTTable)
            .where(JWTTable.expires_at < int(UNIX_timestamp))
        )
    except SQLAlchemyError:
        raise Exception("Error while working with database (deleting expired jwts)")
    except Exception:
        raise Exception("Uknown error occured. PLease, try again later (deliting expired jwts)")    
