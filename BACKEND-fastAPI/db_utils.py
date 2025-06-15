from database import session_local, engine
from sqlalchemy.ext.asyncio import AsyncSession
from models import Users, HabitCompletions, Habits, JWTTable, Base
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from typing import Generator
from sqlalchemy import select, delete, or_, and_
from functools import wraps
from typing import Optional

async def get_db():
    db: AsyncSession = session_local()
    try:
        yield db
    except Exception:
        await db.rollback()
    finally:
        await db.commit()
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
            # try:
            result = await func(db, *args, **kwargs)
            await db.flush()
            return result
            # except SQLAlchemyError:
            #     raise HTTPException(status_code=500, detail=f"Error while working with database. Action - {action}")
            # except Exception:
            #   raise HTTPException(status_code=500, detail=f"Unkown error occured. Please, try again later. Action - {action}")         
        return wrapper
    return decorator


@database_error_handler(action="Merge user object")
async def get_merged_user(db: AsyncSession, user: Users, ) -> Users:
    return db.merge(user)


@database_error_handler(action="Merge habit object")
async def get_merged_habit( db: AsyncSession, habit: Habits):
        return db.merge(habit)


@database_error_handler(action="Get completed habits")
async def get_completed_habits(db: AsyncSession):
    result = await db.execute(
        select(Habits)
        .where(Habits.completed == True)
        )
    return result.scalars().all()


@database_error_handler(action="Get expired auth tokens")
async def get_expired_jwts(db: AsyncSession, UNIX_timestamp: int | float, ):  
    result = await db.execute(
        select(JWTTable)
        .where(JWTTable.expires_at < int(UNIX_timestamp))
    )   
    return result.scalars().all()


@database_error_handler(action="Delete expired jwts")
async def delete_expired_jwts(db: AsyncSession, UNIX_timestamp: int | float) -> None:
    return await db.execute(
        delete(JWTTable)
        .where(JWTTable.expires_at < int(UNIX_timestamp))
    ) 
    

@database_error_handler(action="Get latest habit completion")
async def get_latest_completion(db: AsyncSession, habit_id: str, UNIX_timestamp: int | float):
    result = await db.execute(
        select(HabitCompletions)
        .where(HabitCompletions.habit_id == habit_id)
        .order_by(HabitCompletions.completed_at.desc())
    )
    return result.scalars().first()


@database_error_handler(action="Getting user by username and email")
async def get_user_by_username_email_optional(db: AsyncSession, username: str, email: Optional[str]):
    if email:
        result = await db.execute(
            select(Users)
            .where(or_(Users.username == username, Users.email == email))
        )
        return result.scalars().first()
    else:
        result = await db.execute(
        select(Users)
        .where(or_(Users.username == username))
        )
        return result.scalars().first()

@database_error_handler(action="Delete existing token")
async def delete_existing_token(db: AsyncSession, jwt):
    return await db.execute(
        delete(JWTTable)
        .where(JWTTable.jwt_token == jwt)
    )

@database_error_handler(action="Adding new model to the database")
async def add_model_to_database(db: AsyncSession, Model: Base, **kwargs):
    model_to_add = Model(**kwargs)
    db.add(model_to_add)
