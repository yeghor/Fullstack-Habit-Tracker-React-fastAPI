from pydantic import BaseModel
from typing import List


class HabitSchema(BaseModel):
    habit_id: str
    habit_name: str
    habit_desc: str
    date_created: str


class HabitCompletionSchema(BaseModel):
    completion_id: str
    habit_id: str
    habit_name: str
    completed_at: str


class UserSchema(BaseModel):
    user_id: str
    username: str
    joined_at: str
    email: str


class TokenSchema(BaseModel):
    token: str
    expires_at: int
