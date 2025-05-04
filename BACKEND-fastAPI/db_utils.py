from database import session_local
from sqlalchemy.orm import Session
from models import Users
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException


def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()


def get_merged_user(user: Users, db: Session):
    try:
        return db.merge(user)
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Database error occured")
