from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models

from app.schemas.schemas import LoginRequest, SignupRequest, UserResponse


router = APIRouter(prefix="/api", tags=["Authentication"])

@router.post("/login", response_model=UserResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(id_number=request.id_number).first()
    if not user or user.password != request.password:
        raise HTTPException(status_code=401, detail="תעודת זהות או סיסמה שגויים")
    return user

@router.post("/signup", response_model=UserResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter_by(id_number=request.id_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="משתמש עם תעודת זהות זו כבר קיים במערכת")

    new_user = models.User(
        id_number=request.id_number,
        full_name=request.full_name,
        password=request.password,
        phone_number=request.phone_number,
        role="volunteer"  # default
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user