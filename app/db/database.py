import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# load env
load_dotenv()

#Retrieving the Supabase address
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Creating the login engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Creating a session factory (communication pipes)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# The base class from which we will create our tables
Base = declarative_base()

# A function that gives an open pipe to each request and closes it when finished.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
