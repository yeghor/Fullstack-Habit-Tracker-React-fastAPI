from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, JSON
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

    habits = relationship("Habits", back_populates="owner")
    completions = relationship("HabitCompletions", back_populates="owner")

class JWTTable(Base):
    __tablename__ = "jwttable"

    user_id = Column(String, ForeignKey("users.user_id"))
    jwt_token = Column(String, primary_key=True, index=True)
    expires_at = Column(Integer)

class Habits(Base):
    __tablename__ = "habits"

    habit_id = Column(String, primary_key=True, index=True)
    habit_name = Column(String)
    habit_desc = Column(String)
    user_id = Column(String, ForeignKey("users.user_id"))
    date_created = Column(Integer)
    completed = Column(Boolean, default=False)
    reset_at = Column(JSON)

    completions = relationship("HabitCompletions", back_populates="habit")
    owner = relationship("Users", back_populates="habits")

class HabitCompletions(Base):
    __tablename__ = "habitcompletions"
    
    completion_id = Column(String, primary_key=True)
    habit_id = Column(String,  ForeignKey("habits.habit_id"))
    habit_name = Column(String)
    user_id = Column(String, ForeignKey("users.user_id"))
    completed_at = Column(Integer)

    owner = relationship("Users", back_populates="completions")
    habit = relationship("Habits", back_populates="completions")