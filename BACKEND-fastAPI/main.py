from fastapi import FastAPI
import datetime
from database import engine, session_local
from models import Base, Users, JWTTable
from apscheduler.schedulers.background import BackgroundScheduler
from auth_router import auth_router
from dotenv import load_dotenv
import os
from habit_router import habit_router

load_dotenv()

def update_jwts():
    db = session_local()
    try:
        timestamp = datetime.datetime.now()
        timestamp_unix = round(timestamp.timestamp())
        jwts = db.query(JWTTable).filter(JWTTable.expires_at < timestamp_unix)
        jwts.delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()

def periodic_task():
    update_jwts()

scheduler = BackgroundScheduler()
scheduler.add_job(periodic_task, "interval", seconds=int(os.getenv("PERIODIC_TASK_INTERVAL_SECONDS")))
scheduler.start()

app = FastAPI()
app.include_router(auth_router)
app.include_router(habit_router)

Base.metadata.create_all(bind=engine)

#temporary
def clear_tables():
    Users.__table__.drop(engine)
    JWTTable.__table__.drop(engine)
