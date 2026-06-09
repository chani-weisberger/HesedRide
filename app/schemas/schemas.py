from pydantic import BaseModel
from datetime import datetime
from typing import List

class LoginRequest(BaseModel):
    id_number: str
    password: str

class SignupRequest(BaseModel):
    id_number: str
    full_name: str
    password: str
    phone_number: str

class UserResponse(BaseModel):
    id:int
    full_name: str
    role: str

    class Config:
        from_attributes = True

class RideRequestCreate(BaseModel):
    origin: str
    destination: str
    ride_date: str
    ride_time: str
    passenger_count: int
    patient_name: str
    patient_phone: str

class RideRequestResponse(RideRequestCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class VolunteerRideCreate(BaseModel):
    source_location: str
    destination_location: str
    available_seats: int
    grace_minutes: int

class VolunteerRideResponse(VolunteerRideCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RideConfirmRequest(BaseModel):
    volunteer_ride_id: int
    ride_request_id: int