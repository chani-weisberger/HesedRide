import os
from datetime import datetime, timedelta

import jwt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models

from app.schemas.schemas import LoginRequest, SignupRequest, UserResponse

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

router = APIRouter(prefix="/api", tags=["Authentication"])


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a signed access token."""
    user = db.query(models.User).filter_by(id_number=request.id_number).first()

    if not user:
        raise HTTPException(status_code=404, detail="USER_NOT_FOUND")

    if user.password != request.password:
        raise HTTPException(status_code=401, detail="סיסמה שגויה. נסה שוב.")

    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.post("/signup", response_model=UserResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """Register a new volunteer account."""
    existing_user = db.query(models.User).filter_by(id_number=request.id_number).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="משתמש עם תעודת זהות זו כבר קיים במערכת")

    new_user = models.User(
        id_number=request.id_number,
        full_name=request.full_name,
        password=request.password
        phone_number=request.phone_number,
        role="volunteer"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
