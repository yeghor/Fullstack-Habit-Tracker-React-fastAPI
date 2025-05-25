from fastapi import APIRouter, Depends, Request
from depends_utils import get_user_depends
from models import Users
from periodic_tasks import get_seconds_from_midnight
from sqlalchemy.orm import Session
from db_utils import get_db
from schemas import GetUNIXFromMidnight
from rate_limiter import limiter

utils_router = APIRouter()

@utils_router.get("/get_UNIX_from_midnight")
@limiter.limit("200/minute")
async def get_UNIX_from_midnight(
    request: Request,
    user: Users = Depends(get_user_depends),
):
    return GetUNIXFromMidnight(UNIX_time=get_seconds_from_midnight())
