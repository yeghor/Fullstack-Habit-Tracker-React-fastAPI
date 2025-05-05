from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

SQL_DB_URL = DATABASE_URL
engine = create_engine(SQL_DB_URL, connect_args={"check_same_thread": False})
session_local = sessionmaker(autoflush=False, autocommit=False, bind=engine)
Base = declarative_base()
