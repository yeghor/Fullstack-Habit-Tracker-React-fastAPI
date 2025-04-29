from fastapi import FastAPI, HTTPException, Body, Header, Query
from typing import List, Dict, Optional, Annotated
from schemas import HabitSchema, HabitCompletionSchema, TokenSchema
from AuthUtils import consts, jwt_token_handling, password_handling
from uuid import uuid4
app = FastAPI()

@app.get("/")
async def test() -> str:
    return "Hello World"


@app.post("/register")
async def register(
    username: Annotated[str, Header(title="Username", min_length=3, max_length=50)],
    password: Annotated[str, Header(title="Strong password", min_length=8, max_length=30)],
    email: Annotated[str, Header(title="Your E-mail")]
    ) -> TokenSchema:

    if any(char in consts.INVALID_USERNAME_CHARACTERS for char in username):
        raise HTTPException(status_code=400, detail="Username contains invalid characers")
    if not any(char in ["@", "."] for char in email):
        raise HTTPException(status_code=400, detail="Invalid Email")
    
    try:
        password_hash_bytes = password_handling.hash_password(password)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while hashing password: {e}")
    #LOGIC WITH DATABASE IN PROGRESS
    try:
        user_id = uuid4()
        jwt_token, expiers_at = jwt_token_handling.generate_jwt(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errot while generating JWT token: {e}")
    #LOGIC WITH JWT DATABASE IN PROGRESS

    return TokenSchema(token=jwt_token, expires_at=str(expiers_at))

