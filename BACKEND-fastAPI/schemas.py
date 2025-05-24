from pydantic import BaseModel, Field
from typing import List, Dict, Annotated
from fastapi import Body, Header
from uuid import UUID

class HabitSchema(BaseModel):
    habit_id: str
    habit_name: str
    habit_desc: str
    date_created: str
    completed: bool
    reset_at: Dict[int, bool]


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
    xp: int
    level: int
    next_level_xp_remaining: int
    xp_to_next_level: int
    user_xp_total: int

class TokenSchema(BaseModel):
    token: str
    expires_at: int


class GetUNIXFromMidnight(BaseModel):
    UNIX_time: int


class TokenProvidedSchema(BaseModel):
    token: Annotated[str, Field(..., title="Authorization token, starts with: Bearer", max_length=1000)]


class BaseAuthForm(BaseModel):
    username: Annotated[str, Field(..., min_length=3, max_length=50)]
    password: Annotated[str, Field(..., min_length=8, max_length=30)]    


class RegisterSchema(BaseAuthForm):
    email: Annotated[str, Field(..., min_length=1, max_length=254)]


class LoginSchema(BaseAuthForm):
    pass

class AddHabitSchema(BaseModel):
    habit_name: Annotated[str, Field(..., min_length=3, max_length=200)]
    habit_desc: Annotated[str, Field(..., min_length=3, max_length=500)]
    reset_at: Annotated[List[int], Field(...)]

class HabitIdProvidedSchema(BaseModel): 
    habit_id: Annotated[str, Field(...)]