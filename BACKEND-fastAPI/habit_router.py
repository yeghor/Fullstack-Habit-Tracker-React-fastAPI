from fastapi import HTTPException, Body, Header, Depends, APIRouter
from typing import Annotated, Dict, List
from schemas import TokenSchema
from uuid import uuid4
import datetime
from models import Users, JWTTable, Habits
from sqlalchemy.orm import Session
from authorization_utils import authorize_token, prepare_authorization_token
from db_utils import get_db
from GeneratingAuthUtils.jwt_token_handling import extract_payload

habit_router = APIRouter()

@habit_router.post("/add_habit")
async def add_habit(
    token: Annotated[str, Body(title="Authorization token")],
    habit_name: Annotated[str, Body(title="Habit name", min_length=3)],
    habit_desc: Annotated[str, Body(title="Habit decs", min_length=3)],
    reset_at: Annotated[List[int], Body(title="Resetting time in unix after midnight. SEPARATED BY SPACES")],
    db: Session = Depends(get_db),
):
    token = prepare_authorization_token(token)
    authorize_token(token)

    try:
        payload = extract_payload(token)
    except Exception:
        raise HTTPException(status_code=500, detail="Error ocured while extracting payload from token.")
    
    
    reset_at_final = {}
    for reset_time in reset_at:
        reset_at_final[reset_time] = False

    user_id = payload["user_id"]
    habit_id = str(uuid4())

    try:
        owner: Users = db.query(Users).filter(Users.user_id == user_id).first()    
    
        new_habit = Habits(
            habit_id=habit_id,
            habit_name=habit_name,
            habit_desc=habit_desc,
            user_id=user_id,
            date_created=datetime.datetime.today(),
            reset_at=reset_at_final,
            owner=owner)

        owner.habits.append(new_habit)
        db.commit()
    except Exception:
        raise HTTPException(status_code=500, detail="Error while working with db")
