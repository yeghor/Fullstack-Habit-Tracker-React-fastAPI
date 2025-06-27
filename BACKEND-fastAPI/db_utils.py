from database import session_local, engine
from sqlalchemy.ext.asyncio import AsyncSession
from models import Users, HabitCompletions, Habits, JWTTable, Base
from sqlalchemy.exc import SQLAlchemyError, MultipleResultsFound
from fastapi import HTTPException
from typing import Generator
from sqlalchemy import select, delete, or_, and_
from functools import wraps
from typing import Optional
from sqlalchemy.orm import DeclarativeBase


def get_session() -> AsyncSession:
    try:
        return session_local()
    except SQLAlchemyError:

        raise HTTPException(
            status_code=500, detail="Error with session creation")


async def get_db():
    db: AsyncSession = get_session()
    try:
        yield db
    finally:
        await db.close()


async def commit(db: AsyncSession) -> None:
    try:
        await db.commit()
    except Exception as e:
        if isinstance(e, SQLAlchemyError):
            raise HTTPException(
                status_code=500, detail=f"DB Error while trying to commit changed to the database. Exception - {e}")
        else:
            raise HTTPException(
                status_code=500, detail=f"Uknown error occured. (Commit to the database). Exception - {e}")


def database_error_handler(action: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(db: AsyncSession, *args, **kwargs):
            try:
                result = await func(db, *args, **kwargs)
                await db.flush()
                return result
            except Exception as e:
                await db.rollback()
                if isinstance(e, MultipleResultsFound):
                    raise HTTPException(
                        status_code=500, detail=f"Multiply results found where it's not expected. Please contact us and try again later. Action - {action}")
                elif isinstance(e, SQLAlchemyError):
                    raise HTTPException(
                        status_code=500, detail=f"Error while working with database. Action - {action}")
                else:
                    raise HTTPException(
                        status_code=500, detail=f"Unkown error occured. Please, try again later. Action - {action}")
        return wrapper
    return decorator


@database_error_handler(action="Merge user object")
async def get_merged_user(db: AsyncSession, user: Users, ) -> Users:
    return await db.merge(user)


@database_error_handler(action="Merge habit object")
async def get_merged_habit(db: AsyncSession, habit: Habits):
    return await db.merge(habit)


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


@database_error_handler(action="Get authorization token by user ID")
async def get_token_by_user_id(db: AsyncSession, user_id: str) -> Optional[JWTTable]:
    result = await db.execute(
        select(JWTTable)
        .where(JWTTable.user_id == user_id)
    )
    return result.scalars().one_or_none()


@database_error_handler(action="Get authorization token by user ID")
async def get_token_by_match(db: AsyncSession, token: str) -> Optional[JWTTable]:
    result = await db.execute(
        select(JWTTable)
        .where(JWTTable.jwt_token == token)
    )
    return result.scalars().one_or_none()


@database_error_handler(action="Get latest habit completion")
async def get_latest_completion(db: AsyncSession, habit_id: str):
    result = await db.execute(
        select(HabitCompletions)
        .where(HabitCompletions.habit_id == habit_id)
        .order_by(HabitCompletions.completed_at.desc())
    )
    return result.scalars().first()


@database_error_handler(action="Get user by username and email")
async def get_user_by_username_email_optional(db: AsyncSession, username: str, email: Optional[str] = None) -> Optional[Users]:
    if email:
        result = await db.execute(
            select(Users)
            .where(or_(Users.username == username, Users.email == email))
        )
        return result.scalars().first()
    else:
        result = await db.execute(
            select(Users)
            .where(Users.username == username)
        )
        return result.scalars().first()


@database_error_handler(action="Get user by id")
async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[Users]:
    result = await db.execute(
        select(Users)
        .where(Users.user_id == user_id)
    )
    return result.scalars().first()


@database_error_handler(action="Delete existing token")
async def delete_existing_token(db: AsyncSession, jwt: str):
    return await db.execute(
        delete(JWTTable)
        .where(JWTTable.jwt_token == jwt)
    )

# Don't use async error handler decorator. Decause AsyncSession.add() is synс method ( Requires commit() )
def construct_and_add_model_to_database(db: AsyncSession, Model: DeclarativeBase, **kwargs) -> DeclarativeBase:
    model_to_add = Model(**kwargs)
    db.add(model_to_add)
    return model_to_add


@database_error_handler(action="Get habit by it's id")
async def get_habit_by_id(db: AsyncSession, habit_id: str):
    result = await db.execute(
        select(Habits)
        .where(Habits.habit_id == habit_id)
    )
    return result.scalars().one_or_none()


@database_error_handler(action="Delete habit completion by it's id")
async def delete_completion_by_id(db: AsyncSession, completion_id: str):
    await db.execute(
        delete(HabitCompletions)
        .where(HabitCompletions.completion_id == completion_id)
    )


@database_error_handler(action="Delete habit by it's id")
async def delete_habit_by_id(db: AsyncSession, habit_id: str):
    await db.execute(
        delete(Habits)
        .where(Habits.habit_id == habit_id)
    )
