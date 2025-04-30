from fastapi import FastAPI, HTTPException, Body, Header, Query, Depends
from typing import List, Dict, Optional, Annotated
from schemas import HabitSchema, HabitCompletionSchema, TokenSchema
from AuthUtils import consts, jwt_token_handling, password_handling
from uuid import uuid4
import re
import datetime
from database import engine, session_local
from models import Base, Users, JWTTable
from sqlalchemy.orm import Session
import time
from apscheduler.schedulers.background import BackgroundScheduler

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

app = FastAPI()
Base.metadata.create_all(bind=engine)

def periodic_task():
    print("Periodic task called")
    update_jwts()

scheduler = BackgroundScheduler()
scheduler.add_job(periodic_task, "interval", seconds=120)
scheduler.start()

def clear_tables():
    Users.__table__.drop(engine)
    JWTTable.__table__.drop(engine)

def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()

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

    if any(char in consts.INVALID_USERNAME_CHARACTERS for char in username):
        raise HTTPException(status_code=400, detail="Username contains invalid characers")
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        raise HTTPException(status_code=400, detail="Invalid Email")
    
    joined_at = datetime.datetime.now()
    joined_at_unix = joined_at.timestamp()
    user_id = uuid4()
    user_id = str(user_id)

    #HASHING PASSWORD
    try:
        password_hash_bytes = password_handling.hash_password(password)
        password_hash_str = password_hash_bytes.decode("utf-8")
    except Exception:
        raise HTTPException(status_code=500, detail=f"Error while working hashing password")
    
    #GENERATING JWT TOKEN
    try:
        jwt_token, expires_at = jwt_token_handling.generate_jwt(user_id)
    except Exception:
        raise HTTPException(status_code=500, detail=f"Error while generating JWT token")
    
    #USERS TABLE LOGIC
    user = db.query(Users).filter(Users.username == username).first()
    if user:
            raise HTTPException(status_code=401, detail="User with this username is already exists.")
        
    user = db.query(Users).filter(Users.email == email).first()
    if user:
            raise HTTPException(status_code=401, detail="User with this E-mail is already exists.") 

    try:
        user = Users(user_id=user_id, username=username, hashed_password=password_hash_str, joined_at=joined_at_unix,
                     email=email)
        db.add(user)
        db.commit()
    except Exception:
        raise HTTPException(status_code=500, detail="Error while work with db")
    
    try:
        jwt_table = JWTTable(jwt_token=jwt_token, expires_at=int(expires_at), user_id=user_id)
        db.add(jwt_table)
        db.commit()
    except Exception:
        raise HTTPException(status_code=500, detail="Error while work with token db")

    return TokenSchema(token=jwt_token, expires_at=str(expires_at))

@app.post("/login")
async def login(
    username: Annotated[str, Body(title="Username", min_length=3, max_length=50)],
    password: Annotated[str, Body(title="Strong password", min_length=8, max_length=30)],
    email: Annotated[str, Body(title="Your E-mail")],
    db: Session = Depends(get_db)
    ) -> TokenSchema:

    timestamp = datetime.datetime.now()
    timestamp_unix = timestamp.timestamp()

    if any(char in consts.INVALID_USERNAME_CHARACTERS for char in username):
        raise HTTPException(status_code=400, detail="Username contains invalid characters")
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        raise HTTPException(status_code=400, detail="Invalid Email")
    
    try:
        potential_user = db.query(Users).filter(Users.username == username, Users.email == email).first()
    except Exception:
        raise HTTPException(status_code=500, detail="Error while working with db")
    
    if not potential_user:
        raise HTTPException(status_code=401, detail="This user doesn't exist")
    
    if not password_handling.check_password(password, potential_user.hashed_password.encode("utf-8")):
        raise HTTPException(status_code=409, detail="Invalid credentials")

    try:
        potential_jwt: JWTTable = db.query(JWTTable).filter(JWTTable.user_id == potential_user.user_id).first()
        if potential_jwt and potential_jwt.expires_at > timestamp_unix:
            return TokenSchema(token=potential_jwt.jwt_token, expires_at=str(potential_jwt.expires_at))
        
        jwt_token, expires_at = jwt_token_handling.generate_jwt(user_ID=potential_user.user_id)

        jwt_to_table = JWTTable(user_id=potential_user.user_id, jwt_token=jwt_token, expires_at=expires_at)
        db.add(jwt_to_table)
        db.commit()

        return TokenSchema(token=jwt_token, expires_at=str(expires_at))
    except Exception:
        raise HTTPException(status_code=500, detail="Error while generating jwt token")