from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session

from app import db
from app.db.database import get_db
from app.db import models
from app.schemas import schemas

# Initialize the router for ride-related endpoints
router = APIRouter(prefix="/api/rides", tags=["Rides"])

@router.post("/create", response_model=schemas.RideRequestResponse)
def create_ride_request(ride_data: schemas.RideRequestCreate, db: Session = Depends(get_db)):
    try:
        # 1. Map the incoming JSON data to the Database Model
        new_ride = models.RideRequest(**ride_data.model_dump())

        # 2. Save the new ride request to Supabase cloud database
        db.add(new_ride)
        db.commit()
        db.refresh(new_ride)  # Fetch the automatically generated ride ID from the database

        return new_ride

    # 3. Return a success response to the frontend (React) based on the contract
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))





