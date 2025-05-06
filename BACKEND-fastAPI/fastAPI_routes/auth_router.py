from fastapi import FastAPI, HTTPException, Body, Header, Query, Depends
from typing import List, Dict, Optional, Annotated
from schemas import HabitSchema, HabitCompletionSchema, TokenSchema, UserSchema
from AuthUtils import consts, jwt_token_handling, password_handling
from uuid import uuid4
import re
import datetime
from database import engine, session_local
from models import Base, Users, JWTTable
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler

def authorize_token(token: str):
    db = session_local()
    try:
        token = db.query(JWTTable).filter(JWTTable.jwt_token == token)
        if not token: 
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    finally:
        db.close()


def prepare_authorization(authorization: str) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")
    return token

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

def periodic_task():
    update_jwts()

scheduler = BackgroundScheduler()
scheduler.add_job(periodic_task, "interval", seconds=45)
scheduler.start()

app = FastAPI()
Base.metadata.create_all(bind=engine)

#temporary
def clear_tables():
    Users.__table__.drop(engine)
    JWTTable.__table__.drop(engine)

def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()

def verify_credentials(username, email):
    if any(char in consts.INVALID_USERNAME_CHARACTERS for char in username):
        raise HTTPException(status_code=400, detail="Username contains invalid characters")
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        raise HTTPException(status_code=400, detail="Invalid Email")

@app.get("/")
async def test() -> str:
    return "Hello World"


@app.post("/register")
async def register(
    username: Annotated[str, Body(title="Username", min_length=3, max_length=50)],
    password: Annotated[str, Body(title="Strong password", min_length=8, max_length=30)],
    email: Annotated[str, Body(title="Your E-mail")],
    db: Session = Depends(get_db)
    ) -> TokenSchema:

    verify_credentials(username=username, email=email)
    
    joined_at = datetime.datetime.now()
    joined_at_unix = round(joined_at.timestamp())
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


@app.post("/login")
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
    

@app.post("/logout")
async def loogut(
    authorzation: str = Annotated[str, Header(title="Temprorary authorization token")],
    db: Session = Depends(get_db)
) -> None:
    token = prepare_authorization(authorization=authorzation)

    jwt_entry: JWTTable = db.query(JWTTable).filter(JWTTable.jwt_token == token).first()

    if not jwt_entry:
        raise HTTPException(status_code=400, detail="Token doesn't exist")

    db.delete(jwt_entry)
    db.commit()

@app.get("/get_user_profile")
async def get_user_profile(
    authorization: str = Annotated[str, Header(title="Temprorary authorization token")],
    db: Session = Depends(get_db)
) -> UserSchema:
    token = prepare_authorization(authorization=authorization)
    authorize_token(token)

    payload = jwt_token_handling.extract_payload(token=token)
    
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
