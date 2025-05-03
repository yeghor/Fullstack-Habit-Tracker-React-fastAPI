from database import session_local
from models import JWTTable
from fastapi import HTTPException
import re
from dotenv import load_dotenv
import os
from models import Users
from sqlalchemy.orm import Session
from GeneratingAuthUtils.jwt_token_handling import extract_payload
from fastapi import Header

load_dotenv()

def authorize_token(token: str) -> None:
    db = session_local()
    try:
        token = db.query(JWTTable).filter(JWTTable.jwt_token == token).first()
        if not token: 
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    finally:
        db.close()

def prepare_authorization_token(authorization: str) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")
    return token

def verify_credentials(username, email):
    if any(char in os.getenv("INVALID_USERNAME_CHARACTERS").split(",") for char in username):
        raise HTTPException(status_code=400, detail="Username contains invalid characters")
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        raise HTTPException(status_code=400, detail="Invalid Email")

def get_user_depends(token=Header(title="Authorization token")) -> Users:
    db = session_local()
    try:
        token = prepare_authorization_token(token)
        authorize_token(token)
        try:
            payload = extract_payload(token)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid token")
        try:
            user = db.query(Users).filter(Users.user_id == payload["user_id"]).first()
            return user
        except Exception:
            raise HTTPException(status_code=500, detail="Error while trying to find user")
    finally:
        db.close()