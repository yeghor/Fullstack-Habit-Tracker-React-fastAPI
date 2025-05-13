from fastapi import APIRouter, Depends
from authorization_utils import get_user_depends
from models import Users
from periodic_tasks import get_seconds_from_midnight
from sqlalchemy.orm import Session
from db_utils import get_db
from schemas import GetUNIXFromMidnight

utils_router = APIRouter()

@utils_router.get("/get_UNIX_from_midnight")
async def get_UNIX_from_midnight(
    user: Users = Depends(get_user_depends),
):
    return GetUNIXFromMidnight(UNIX_time=get_seconds_from_midnight())
