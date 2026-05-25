from pydantic import BaseModel

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