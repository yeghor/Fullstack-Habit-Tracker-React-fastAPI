from pydantic import BaseModel

class HabitSchema(BaseModel):
    habit_name: str
    habit_desc: str
    habit_id: str
    reset_at: str
    date_created: str

class HabitCompletionSchema(BaseModel):
    habit_name: str
    completion_date: str

class UserSchema(BaseModel):
    user_id: str
    username: str
    joined_at: str
    email: str



class TokenSchema(BaseModel):
    token: str
    expires_at: int