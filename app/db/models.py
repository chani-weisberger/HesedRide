from sqlalchemy import Column, Integer, String, Enum,DateTime, func
from app.db.database import Base
class User(Base):
    __tablename__ = "users"

    # the Columns of our table
    id = Column(Integer, primary_key=True, index=True)
    id_number = Column(String, unique=True, index=True, nullable=False) # ID NUMBER
    full_name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    role = Column(String, default="volunteer")

class RideRequest(Base):
    __tablename__ = "ride_requests"

    # the Columns of our table
    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    ride_date = Column(String, nullable=False)
    ride_time = Column(String, nullable=False)
    passenger_count = Column(Integer, nullable=False)
    patient_name = Column(String, nullable=False)
    patient_phone = Column(String, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=func.now())