from fastapi import HTTPException, Body, Header, Depends, APIRouter
from typing import Annotated
from schemas import TokenSchema, UserSchema
from GeneratingAuthUtils import consts, jwt_token_handling, password_handling
from uuid import uuid4
import datetime
from models import Users, JWTTable
from sqlalchemy.orm import Session
from authorization_utils import prepare_authorization_token, authorize_token, verify_credentials
from db_utils import get_db

auth_router = APIRouter()

@auth_router.get("/")
async def test() -> str:
    return "Hello World"


@auth_router.post("/register")
async def register(
    username: Annotated[str, Body(title="Username", min_length=3, max_length=50)],
    password: Annotated[str, Body(title="Strong password", min_length=8, max_length=30)],
    email: Annotated[str, Body(title="Your E-mail")],
    db: Session = Depends(get_db)
    ) -> TokenSchema:

    verify_credentials(username=username, email=email)
    
    joined_at = datetime.datetime.now()
    user_id = uuid4()
    user_id_str = str(user_id)

    #HASHING PASSWORD
    try:
        password_hash_bytes = password_handling.hash_password(password)
        password_hash_str = password_hash_bytes.decode("utf-8")
    except Exception:
        raise HTTPException(status_code=500, detail=f"Error while working hashing password")
    
    #GENERATING JWT TOKEN
    try:
        jwt_token, expires_at = jwt_token_handling.generate_jwt(user_id_str)
    except Exception:
        raise HTTPException(status_code=500, detail=f"Error while generating JWT token")
    
    #USERS TABLE LOGIC
    existing_user: Users = db.query(Users).filter(Users.username == username).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="User with this username is already exists.")
        
    existing_user: Users = db.query(Users).filter(Users.email == email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="User with this E-mail is already exists.") 

    try:
        user = Users(user_id=user_id_str,
                     username=username,
                     hashed_password=password_hash_str,
                     joined_at=str(joined_at),
                     email=email)
        db.add(user)
        db.commit()
    except Exception:
        raise HTTPException(status_code=500, detail="Error while work with db")
    
    try:
        jwt_to_table = JWTTable(jwt_token=jwt_token, expires_at=expires_at, user_id=user_id_str)
        db.add(jwt_to_table)
        db.commit()
    except Exception:
        raise HTTPException(status_code=500, detail="Error while work with token db")

    return TokenSchema(token=jwt_token, expires_at=expires_at)


@auth_router.post("/login")
async def login(
    username: Annotated[str, Body(title="Username", min_length=3, max_length=50)],
    password: Annotated[str, Body(title="Strong password", min_length=8, max_length=30)],
    email: Annotated[str, Body(title="Your E-mail")],
    db: Session = Depends(get_db)
    ) -> TokenSchema:

    timestamp = datetime.datetime.now()
    timestamp_unix = round(timestamp.timestamp())

    verify_credentials(username=username, email=email)
    
    try:
        potential_user: Users = db.query(Users).filter(Users.username == username, Users.email == email).first()
    except Exception:
        raise HTTPException(status_code=500, detail="Error while working with db")
    
    if not potential_user:
        raise HTTPException(status_code=401, detail="This user doesn't exist")
    
    if not password_handling.check_password(password, potential_user.hashed_password.encode("utf-8")):
        raise HTTPException(status_code=409, detail="Invalid credentials")

    try:
        potential_jwt: JWTTable = db.query(JWTTable).filter(JWTTable.user_id == potential_user.user_id).first()
        if potential_jwt and potential_jwt.expires_at > timestamp_unix:
            return TokenSchema(token=potential_jwt.jwt_token, expires_at=potential_jwt.expires_at)
        
        jwt_token, expires_at = jwt_token_handling.generate_jwt(user_id=potential_user.user_id)

        jwt_entry = JWTTable(user_id=potential_user.user_id, jwt_token=jwt_token, expires_at=expires_at)
        db.add(jwt_entry)
        db.commit()

        return TokenSchema(token=jwt_token, expires_at=expires_at)
    except Exception:
        raise HTTPException(status_code=500, detail="Error while generating jwt token")
    

@auth_router.post("/logout")
async def loogut(
    authorzation: str = Annotated[str, Header(title="Temprorary authorization token")],
    db: Session = Depends(get_db)
) -> None:
    token = prepare_authorization_token(authorization=authorzation)

    jwt_entry: JWTTable = db.query(JWTTable).filter(JWTTable.jwt_token == token).first()

    if not jwt_entry:
        raise HTTPException(status_code=400, detail="Token doesn't exist")

    db.delete(jwt_entry)
    db.commit()

@auth_router.get("/get_user_profile")
async def get_user_profile(
    authorization: str = Annotated[str, Header(title="Temprorary authorization token")],
    db: Session = Depends(get_db)
) -> UserSchema:
    token = prepare_authorization_token(authorization=authorization)
    authorize_token(token)

    try:
        payload = jwt_token_handling.extract_payload(token=token)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    user = db.query(Users).filter(Users.user_id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=500, detail="No user found by given token. Please, contact application support")
    
    user_mapping = {
        "user_id": user.user_id,
        "username": user.username,
        "joined_at": user.joined_at,
        "email": user.email 
    }

    return UserSchema(**user_mapping)