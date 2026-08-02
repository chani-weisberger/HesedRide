from sqlalchemy import Column, Integer, String,DateTime, func,ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    """Represents a volunteer user account."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    id_number = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    role = Column(String, default="volunteer")


class RideRequest(Base):
    """Represents a passenger ride request."""
    __tablename__ = "ride_requests"

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


class VolunteerRide(Base):
    """Represents a volunteer ride offer and its match state."""
    __tablename__ = "volunteer_rides"

    id = Column(Integer, primary_key=True, index=True)
    source_location = Column(String, nullable=False)
    destination_location = Column(String, nullable=False)
    available_seats = Column(Integer, nullable=False)
    grace_minutes = Column(Integer, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=func.now())
    proposed_at = Column(DateTime, nullable=True)
    matched_request_id = Column(Integer, ForeignKey("ride_requests.id"), nullable=True)
    matched_request = relationship("RideRequest", backref="matched_volunteer")
    volunteer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    volunteer = relationship("User", backref="volunteer_rides")