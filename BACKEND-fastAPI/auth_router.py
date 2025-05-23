from fastapi import HTTPException, Body, Header, Depends, APIRouter
from typing import Annotated
from schemas import TokenSchema, UserSchema, RegisterSchema, LoginSchema, TokenProvidedSchema
from GeneratingAuthUtils import jwt_token_handling, password_handling
from uuid import uuid4
import datetime
from models import Users, JWTTable
from sqlalchemy.orm import Session
from jwt.exceptions import PyJWTError, InvalidTokenError, DecodeError
from authorization_utils import (
    prepare_authorization_token,
    authorize_token,
    verify_credentials,
)
from db_utils import get_db, get_merged_user
from authorization_utils import get_user_depends
from sqlalchemy.exc import SQLAlchemyError
import random
from user_xp_level_util import get_level_by_xp

auth_router = APIRouter()


@auth_router.get("/")
async def test() -> str:
    return "Hello World: " + str(random.randint(1, 100)) 


@auth_router.post("/register")
async def register(
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
    existing_user: Users = db.query(Users).filter(Users.username == username).first()
    if existing_user:
        raise HTTPException(
            status_code=409, detail="User with this username is already exists"
        )

    existing_user: Users = db.query(Users).filter(Users.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=409, detail="User with this E-mail is already exists"
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
        db.commit()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erorr while working with database")

    try:
        jwt_to_table = JWTTable(
            jwt_token=jwt_token, expires_at=expires_at, user_id=user_id_str
        )
        db.add(jwt_to_table)
        db.commit()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erorr while working with database")

    return TokenSchema(token=jwt_token, expires_at=expires_at)


@auth_router.post("/login")
async def login(
    user_data: LoginSchema = Body(...),
    db: Session = Depends(get_db),
) -> TokenSchema:
    timestamp = datetime.datetime.now()
    timestamp_unix = round(timestamp.timestamp())


    try:
        potential_user: Users = (
            db.query(Users)
            .filter(Users.username == user_data.username)
            .first()
        )
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while working with database")

    if not potential_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not password_handling.check_password(
        user_data.password, potential_user.hashed_password.encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    try:
        potential_jwt: JWTTable = (
            db.query(JWTTable)
            .filter(JWTTable.user_id == potential_user.user_id)
            .first()
        )
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
        db.commit()

        return TokenSchema(token=jwt_token, expires_at=expires_at)
    except InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid token")
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error while working with database")
    except Exception:
        raise HTTPException(status_code=500, detail="Error while generating/extracting jwt token")


@auth_router.post("/logout")
async def loogut(
    token_dict: TokenProvidedSchema = Body(..., example={"token": "Bearer ..."}),
    db: Session = Depends(get_db),
) -> None:
    token = prepare_authorization_token(authorization=token_dict.token)

    try:
        jwt_entry: JWTTable = db.query(JWTTable).filter(JWTTable.jwt_token == token).first()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erorr while working with database")

    if not jwt_entry:
        raise HTTPException(status_code=400, detail="Token doesn't exist")

    db.delete(jwt_entry)
    db.commit()


@auth_router.get("/get_user_profile")
async def get_user_profile(
    user: Users = Depends(get_user_depends),
) -> UserSchema:

    level, next_level_xp = get_level_by_xp(user.xp)

    user_mapping = {
        "user_id": user.user_id,
        "username": user.username,
        "joined_at": user.joined_at,
        "email": user.email,
        "xp": user.xp,
        "level": level,
        "next_level_xp": next_level_xp
    }

    return UserSchema(**user_mapping)

@auth_router.post("/change_username")
async def change_username(
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
async def change_password(
    new_password: Annotated[str, Body(title="New secure password", min_length=8, max_length=30)],
    user: Users = Depends(get_user_depends),
    db: Session = Depends(get_db),
):  
    user = get_merged_user(user=user, db=db)
    
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