from pydantic import BaseModel
from datetime import datetime
from typing import List
from typing import Optional, Dict, Any

class LoginRequest(BaseModel):
    """Payload for volunteer login."""
    id_number: str
    password: str

class SignupRequest(BaseModel):
    """Payload for volunteer signup."""
    id_number: str
    full_name: str
    password: str
    phone_number: str

class UserResponse(BaseModel):
    """Public user response model."""
    id:int
    full_name: str
    role: str

    class Config:
        """Enable model creation from ORM objects."""
        from_attributes = True

class RideRequestCreate(BaseModel):
    """Payload for creating a passenger ride request."""
    origin: str
    destination: str
    ride_date: str
    ride_time: str
    passenger_count: int
    patient_name: str
    patient_phone: str

class RideRequestResponse(RideRequestCreate):
    """Ride request response including persisted metadata."""
    id: int
    status: str
    created_at: datetime

    class Config:
        """Enable model creation from ORM objects."""
        from_attributes = True


class VolunteerRideCreate(BaseModel):
    """Payload for creating a volunteer ride offer."""
    source_location: str
    destination_location: str
    available_seats: int
    grace_minutes: int
    volunteer_id: int

class VolunteerRideResponse(VolunteerRideCreate):
    """Volunteer ride response with optional match details."""
    id: int
    status: str
    created_at: datetime
    match_found: Optional[bool] = None
    match_details: Optional[Dict[str, Any]] = None

    class Config:
        """Enable model creation from ORM objects."""
        from_attributes = True

class RideConfirmRequest(BaseModel):
    """Payload for confirming a volunteer-passenger match."""
    volunteer_ride_id: int
    ride_request_id: int