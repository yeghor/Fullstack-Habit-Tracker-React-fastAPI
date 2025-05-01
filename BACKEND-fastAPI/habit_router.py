from fastapi import HTTPException, Body, Header, Depends, APIRouter
from typing import Annotated
from schemas import TokenSchema
from uuid import uuid4
import datetime
from models import Users, JWTTable
from sqlalchemy.orm import Session
from authorization_utils import authorize_token
from db_utils import get_db

habit_router = APIRouter()

