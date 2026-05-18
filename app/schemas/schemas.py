from pydantic import BaseModel

class LoginRequest(BaseModel):
    id_number: str
    password: str

class SignupRequest(BaseModel):
    id_number: str
    full_name: str
    password: str

class UserResponse(BaseModel):
    id:int
    full_name: str
    role: str

    class Config:
        from_attributes = True