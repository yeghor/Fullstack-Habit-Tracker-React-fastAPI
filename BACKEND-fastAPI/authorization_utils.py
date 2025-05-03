from database import session_local
from models import JWTTable
from fastapi import HTTPException
import re
from dotenv import load_dotenv
import os
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