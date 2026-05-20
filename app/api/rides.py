from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.schemas import schemas

# Initialize the router for ride-related endpoints
router = APIRouter()


@router.post("/api/rides/create")
def create_ride_request(ride_data: schemas.RideRequestCreate, db: Session = Depends(get_db)):
    # 1. Map the incoming JSON data to the Database Model
    new_ride = models.RideRequest(
        origin=ride_data.origin,
        destination=ride_data.destination,
        ride_date=ride_data.ride_date,
        ride_time=ride_data.ride_time,
        passenger_count=ride_data.passenger_count,
        patient_name=ride_data.patient_name,
        patient_phone=ride_data.patient_phone
    )

    # 2. Save the new ride request to Supabase cloud database
    db.add(new_ride)
    db.commit()
    db.refresh(new_ride)  # Fetch the automatically generated ride ID from the database

    # 3. Return a success response to the frontend (React) based on the contract
    return {
        "status": "success",
        "message": "Ride request created successfully",
        "ride_id": new_ride.id
    }