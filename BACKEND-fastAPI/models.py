from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Users(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    username = Column(String)
    hashed_password = Column(String)
    joined_at = Column(Integer)
    email = Column(String)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=0)

class JWTTable(Base):
    __tablename__ = "jwttable"

    jwt_token = Column(String, primary_key=True, index=True)
    expires_at = Column(Integer)