from sqlalchemy import Column, Integer, String, Enum
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    # the Columns of our table
    id = Column(Integer, primary_key=True, index=True)
    id_number = Column(String, unique=True, index=True, nullable=False) # ID NUMBER
    full_name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="volunteer")