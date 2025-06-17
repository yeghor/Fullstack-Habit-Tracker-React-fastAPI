from database import session_local
from models import JWTTable
from fastapi import HTTPException, Body, Header
import re
from dotenv import load_dotenv
import os
from models import Users, Habits
from sqlalchemy.orm import Session
from GeneratingAuthUtils.jwt_token_handling import extract_payload
from fastapi import Header
from sqlalchemy.exc import SQLAlchemyError
from jwt.exceptions import PyJWTError
from schemas import TokenProvidedSchema, HabitIdProvidedSchema
import datetime
from GeneratingAuthUtils.jwt_token_handling import extract_payload
from db_utils import (
    get_token_by_match,
    get_user_by_id,
    get_session,
    get_habit_by_id,
)
from sqlalchemy.ext.asyncio import AsyncSession

load_dotenv()


async def authorize_token(token: str, db: Session) -> None:
    try:
        db_token = await get_token_by_match(db=db, token=token)
        if not db_token:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while working with database (token authorization)")


def prepare_authorization_token(token: str) -> str:
    if not token.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid authorization header")

    token = token.replace("Bearer ", "")
    return token


def verify_credentials(username, email):
    if any(
        char in os.getenv("INVALID_USERNAME_CHARACTERS").split(",") for char in username
    ):
        raise HTTPException(
            status_code=400, detail="Username contains invalid characters"
        )
    if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email):
        raise HTTPException(status_code=400, detail="Invalid Email")


async def get_user_depends(token = Header(...)) -> Users:
    db = get_session()
    try:
        token = prepare_authorization_token(token=token)
        await authorize_token(token=token, db=db)
        try:
            payload = extract_payload(token)
        except PyJWTError:
            raise HTTPException(status_code=400, detail="Invalid token")


        user = await get_user_by_id(db=db, user_id=payload["user_id"])
        if not user:
            raise HTTPException(status_code=401, detail="User connected to this token does not exists. Please, try again later or contact us")
    
        return user
    finally:
        await db.close()

async def get_habit_depends(habit_id: HabitIdProvidedSchema =  Body(...)):
    db: AsyncSession = get_session()
    try:
        habit = await get_habit_by_id(db=db, habit_id=habit_id.habit_id)
        
        if not habit:
            raise HTTPException(status_code=400, detail="No habit with such ID")

        return habit
    finally:
        await db.close()

async def check_token_expiery_depends(token: TokenProvidedSchema = Header(...)) -> str:
    try:
        db: Session = session_local()
        token = prepare_authorization_token(token=token.token)
        await authorize_token(token=token, db=db)

        payload = extract_payload(token=token)
        
        return datetime.datetime.fromtimestamp(int(payload["expires"])).time()
    finally:
        await db.close()