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

app = FastAPI()
Base.metadata.create_all(bind=engine)

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
    username: Annotated[str, Header(title="Username", min_length=3, max_length=50)],
    password: Annotated[str, Header(title="Strong password", min_length=8, max_length=30)],
    email: Annotated[str, Header(title="Your E-mail")],
    db: Session = Depends(get_db)
    ) -> TokenSchema:

    if any(char in consts.INVALID_USERNAME_CHARACTERS for char in username):
        raise HTTPException(status_code=400, detail="Username contains invalid characers")
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        raise HTTPException(status_code=400, detail="Invalid Email")
    
    joined_at = datetime.datetime.now()
    joined_at_unix = joined_at.timestamp()
    user_id = uuid4()

    try:
        password_hash_bytes = password_handling.hash_password(password)
        password_hash_str = password_hash_bytes.decode("utf-8")
    except Exception:
        raise HTTPException(status_code=500, detail=f"Error while hashing password")
    
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
        user = Users(user_id=str(user_id), username=username, hashed_password=password_hash_str, joined_at=joined_at_unix,
                     email=email)
        db.add(user)
        db.commit()
    except Exception:
        raise HTTPException(status_code=500, detail="Eror while work with db")
    
    #JWT TOKEN TABLE LOGIC
    

    return TokenSchema(token=jwt_token, expires_at=str(expires_at))

