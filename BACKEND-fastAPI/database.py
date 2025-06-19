from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, connect_args={
                             "check_same_thread": False})
session_local = async_sessionmaker(
    autoflush=False, autocommit=False, bind=engine)
