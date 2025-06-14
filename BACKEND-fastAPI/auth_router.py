from fastapi import HTTPException, Body, Depends, APIRouter, Request
from typing import Annotated
from schemas import TokenSchema, UserSchema, RegisterSchema, LoginSchema, TokenProvidedSchema
from GeneratingAuthUtils import jwt_token_handling, password_handling
from uuid import uuid4
import datetime
from models import Users, JWTTable
from sqlalchemy import select
from sqlalchemy.orm import Session
from jwt.exceptions import PyJWTError, InvalidTokenError
from depends_utils import (
    prepare_authorization_token,
    verify_credentials,
    get_user_depends,
    check_token_expiery_depends,
)
from db_utils import get_db, get_merged_user
from sqlalchemy.exc import SQLAlchemyError
import random
from user_xp_level_util import get_level_by_xp, get_xp_nedeed_by_level
from rate_limiter import limiter
from sqlalchemy import select, or_

auth_router = APIRouter()
    
@auth_router.get("/")
@limiter.limit("20/minute")
async def test(request: Request) -> str:
    return "Hello World: " + str(random.randint(1, 100)) 


@auth_router.post("/register")
@limiter.limit("20/minute")
async def register(
    request: Request,
    user_data: RegisterSchema = Body(...),
    db: Session = Depends(get_db),
) -> TokenSchema:
    username, password, email = user_data.username, user_data.password, user_data.email

    verify_credentials(username=username, email=email)

    joined_at = datetime.datetime.now()
    user_id = uuid4()
    user_id_str = str(user_id)

    # HASHING PASSWORD
    try:
        password_hash_bytes = password_handling.hash_password(password)
        password_hash_str = password_hash_bytes.decode("utf-8")
    except Exception:
        raise HTTPException(
            status_code=500, detail=f"Error while working hashing password"
        )

    # GENERATING JWT TOKEN
    try:
        jwt_token, expires_at = jwt_token_handling.generate_jwt(user_id_str)
    except PyJWTError:
        raise HTTPException(status_code=500, detail=f"Error while generating JWT token")

    # USERS TABLE LOGIC
    potential_existing_user: Users = await db.execute(
        select(Users)
        .where(or_(Users.username == username, Users.email == email))
    )
    if potential_existing_user.all():
        raise HTTPException(
            status_code=409, detail="User with this username is already exists"
        )


    try:
        user = Users(
            user_id=user_id_str,
            username=username,
            hashed_password=password_hash_str,
            joined_at=str(joined_at),
            email=email,
        )
        db.add(user)
        await db.commit()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erorr while working with database")

    try:
        jwt_to_table = JWTTable(
            jwt_token=jwt_token, expires_at=expires_at, user_id=user_id_str
        )
        db.add(jwt_to_table)
        await db.commit()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erorr while working with database")

    return TokenSchema(token=jwt_token, expires_at=expires_at)


@auth_router.post("/login")
@limiter.limit("20/minute")
async def login(
    request: Request,
    user_data: LoginSchema = Body(...),
    db: Session = Depends(get_db),
) -> TokenSchema:
    timestamp = datetime.datetime.now()
    timestamp_unix = round(timestamp.timestamp())


    try:
        potential_user = await (
            db.execute(select(Users).where(Users.username == user_data.username))
        )
        potential_user: Users = potential_user.scalars().first()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while working with database")

    if not potential_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    print(potential_user)
    print(potential_user.hashed_password)

    if not password_handling.check_password(
        user_data.password, potential_user.hashed_password.encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    try:
        potential_jwt = await (
            db.execute(select(JWTTable).where(JWTTable.user_id == potential_user.user_id)))
        potential_jwt: JWTTable = potential_jwt.scalars().first()
        print(timestamp_unix)
        if potential_jwt and potential_jwt.expires_at > timestamp_unix:
            return TokenSchema(
                token=potential_jwt.jwt_token, expires_at=potential_jwt.expires_at
            )

        jwt_token, expires_at = jwt_token_handling.generate_jwt(
            user_id=potential_user.user_id
        )

        jwt_entry = JWTTable(
            user_id=potential_user.user_id, jwt_token=jwt_token, expires_at=expires_at
        )
        db.add(jwt_entry)
        await db.commit()

        return TokenSchema(token=jwt_token, expires_at=expires_at)
    except InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid token")
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while working with database")
    except Exception:
        raise HTTPException(status_code=500, detail="Error while generating/extracting jwt token")


@auth_router.post("/logout")
@limiter.limit("20/minute")
async def loogut(
    request: Request,
    token_dict: TokenProvidedSchema = Body(..., example={"token": "Bearer ..."}),
    db: Session = Depends(get_db),
) -> None:
    token = prepare_authorization_token(token=token_dict.token)

    try:
        jwt_entry: JWTTable = db.query(JWTTable).filter(JWTTable.jwt_token == token).first()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erorr while working with database")

    if not jwt_entry:
        raise HTTPException(status_code=400, detail="Token doesn't exist")

    db.delete(jwt_entry)
    db.commit()


@auth_router.get("/get_user_profile")
@limiter.limit("20/minute")
async def get_user_profile(
    request: Request,
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db)
) -> UserSchema:
    user = get_merged_user(user=user, db=db)

    level, next_level_xp_remaining = get_level_by_xp(user.xp)
    user.level = level

    current_level_xp = get_xp_nedeed_by_level(user.level - 1)

    user_xp_total = user.xp - current_level_xp

    xp_to_next_level = get_xp_nedeed_by_level(user.level)

    user_xp_current = xp_to_next_level - next_level_xp_remaining

    user_mapping = {
        "user_id": user.user_id,
        "username": user.username,
        "joined_at": user.joined_at,
        "email": user.email,
        "xp": user_xp_current,
        "level": user.level,
        "next_level_xp_remaining": next_level_xp_remaining,
        "xp_to_next_level": xp_to_next_level,
        "user_xp_total": user_xp_total,
    }

    return UserSchema(**user_mapping)

@auth_router.post("/change_username")
@limiter.limit("20/minute")
async def change_username(
    request: Request,
    new_username: Annotated[str, Body(title="New usernaname", min_length=3, max_length=50)],
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db)
):
    user = get_merged_user(user=user, db=db)

    if user.username == new_username:
        raise HTTPException(status_code=400, detail="New username can't be same as old")
    
    try:
        user.username = new_username
        db.commit()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while working with database")

@auth_router.post("/change_password")
@limiter.limit("20/minute")
async def change_password(
    request: Request,
    old_password: Annotated[str, Body(title="Old password", min_length=8, max_length=30)],
    new_password: Annotated[str, Body(title="New secure password", min_length=8, max_length=30)],
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
):  
    user = get_merged_user(user=user, db=db)
    
    if not password_handling.check_password(old_password, user.hashed_password.encode("utf-8")):
        raise HTTPException(status_code=400, detail="Old password didn't match")

    if password_handling.check_password(new_password, user.hashed_password.encode("utf-8")):
        raise HTTPException(status_code=400, detail="New password can't be same as current!")

    try:
        hashed_new_password: bytes = password_handling.hash_password(raw_password=new_password)
    except Exception:
        raise HTTPException(status_code=500, detail="Error while hashing password")

    try:
        user.hashed_password = hashed_new_password.decode("utf-8")
        db.commit()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while working with database")
    
@auth_router.get("/check_token")
@limiter.limit("20/minute")
async def check_token(
    request: Request,
    expires_at = Depends(check_token_expiery_depends)
):
    return expires_at