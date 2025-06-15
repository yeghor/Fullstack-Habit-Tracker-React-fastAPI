from database import session_local, engine
from sqlalchemy.ext.asyncio import AsyncSession
from models import Users, HabitCompletions, Habits, JWTTable
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from typing import Generator
from sqlalchemy import select, delete
from functools import wraps

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

def database_error_handler(action: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(db: AsyncSession, *args, **kwargs):
            try:
                return await func(db, *args, **kwargs)
            except SQLAlchemyError:
                raise HTTPException(status_code=500, detail=f"Error while working with database. Action - {action}")
            except Exception:
              raise HTTPException(status_code=500, detail=f"Unkown error occured. Please, try again later. Action - {action}")         
        return wrapper
    return decorator

@database_error_handler(action="Merge user object")
async def get_merged_user(db: AsyncSession, user: Users, ) -> Users:
    return db.merge(user)

@database_error_handler(action="Merge habit object")
async def get_merged_habit(habit: Habits, db: AsyncSession):
        return db.merge(habit)


@database_error_handler(action="Get completed habits")
async def get_completed_habits(db: AsyncSession):
    return await db.execute(
        select(Habits)
        .where(Habits.completed == True)
        )

@database_error_handler(action="Get expired auth tokens")
async def get_expired_jwts(UNIX_timestamp: int | float, db: AsyncSession):  
    return await db.execute(
        select(JWTTable)
        .where(JWTTable.expires_at < int(UNIX_timestamp))
    )   

@database_error_handler(action="Delete expired jwts")
async def delete_expired_jwts(db: AsyncSession, UNIX_timestamp: int | float) -> None:
    return await db.execute(
        delete(JWTTable)
        .where(JWTTable.expires_at < int(UNIX_timestamp))
    ) 


@database_error_handler(action="Get latest habit completion")
async def get_latest_completion(db: AsyncSession, habit_id: str, UNIX_timestamp: int | float):
    return await db.execute(
        select(HabitCompletions)
        .where(HabitCompletions.habit_id == habit_id)
        .order_by(HabitCompletions.completed_at.desc())
    )

