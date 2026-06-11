from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils import find_best_match

from app.db.database import get_db
from app.db import models
from app.schemas import schemas
from app.services.maps_service import generate_google_maps_link

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


@router.post("/volunteer/create")
def create_volunteer_ride(volunteer_data: schemas.VolunteerRideCreate, db: Session = Depends(get_db)):
    try:
        # 1. Mapping the data from the frontend and filling in the new volunteer table
        new_volunteer_ride = models.VolunteerRide(**volunteer_data.model_dump())

        db.add(new_volunteer_ride)
        db.commit()
        db.refresh(new_volunteer_ride)

        # 2. Running the matching algorithm
        matched_passenger = find_best_match(new_volunteer_ride, db)

        # 3. Returning a structured and clear answer to the frontend
        if matched_passenger:
            matched_passenger.status = "proposed"
            new_volunteer_ride.status = "proposed"

            new_volunteer_ride.matched_request_id = matched_passenger.id

            db.commit()

            navigation_link = generate_google_maps_link(new_volunteer_ride, matched_passenger)

            return {
                "status": "success",
                "message": "נסיעת המתנדב נרשמה ונמצאה הצעה להתאמה. ממתין לאישור הצדדים.",
                "volunteer_ride_id": new_volunteer_ride.id,
                "match_found": True,
                "match_details": {
                    "ride_request_id": matched_passenger.id,
                    "passenger_name": matched_passenger.patient_name,
                    "origin": matched_passenger.origin,
                    "destination": matched_passenger.destination,
                    "navigation_url": navigation_link
                }
            }

        return {
            "status": "success",
            "message": "נסיעת המתנדב נרשמה בהצלחה. לא נמצא נוסע מתאים כרגע.",
            "volunteer_ride_id": new_volunteer_ride.id,
            "match_found": False,
            "match_details": None
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/volunteer/cancel/{volunteer_ride_id}")
def cancel_volunteer_ride(volunteer_ride_id: int, db: Session = Depends(get_db)):
    try:
        volunteer_ride = db.query(models.VolunteerRide).filter_by(id=volunteer_ride_id).first()
        if not volunteer_ride:
            raise HTTPException(status_code=404, detail="נסיעת המתנדב לא נמצאה")

        if volunteer_ride.matched_request_id is not None:
            ride_request = db.query(models.RideRequest).filter_by(id=volunteer_ride.matched_request_id).first()
            if ride_request:
                ride_request.status = "pending"

        volunteer_ride.status = "cancelled"
        db.commit()

        return {"status": "success", "message": "נסיעת המתנדב בוטלה בהצלחה"}

    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/confirm")
def confirm_ride_match(confirm_data: schemas.RideConfirmRequest, user_type: str = None, db: Session = Depends(get_db)):
    try:
        volunteer_ride = db.query(models.VolunteerRide).filter_by(id=confirm_data.volunteer_ride_id).first()
        ride_request = db.query(models.RideRequest).filter_by(id=confirm_data.ride_request_id).first()

        if not volunteer_ride or not ride_request:
            raise HTTPException(status_code=404, detail="הנסיעה לא נמצאה")

        # 🔥 זרימה חד-כיוונית מושלמת: המתנדב מאשר = הנסיעה מאושרת סופית ויוצאת לדרך!
        volunteer_ride.status = "confirmed"
        ride_request.status = "confirmed"
        db.commit()

        waze_link = generate_google_maps_link(volunteer_ride, ride_request)

        return {
            "status": "success",
            "ride_status": "confirmed",
            "waze_route_url": waze_link,
            "patient_phone": ride_request.patient_phone
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{ride_id}/status")
def get_ride_status(ride_id: int, ride_type: str, db: Session = Depends(get_db)):
    try:
        if ride_type == "volunteer":
            ride = db.query(models.VolunteerRide).filter_by(id=ride_id).first()
            if not ride:
                raise HTTPException(status_code=404, detail="נסיעת המתנדב לא נמצאה")

            if ride.status == "pending":
                matched_passenger = find_best_match(ride, db)
                if matched_passenger:
                    matched_passenger.status = "proposed"
                    ride.status = "proposed"
                    ride.matched_request_id = matched_passenger.id
                    db.commit()

            if ride.status in ["proposed", "volunteer_approved", "rider_approved", "confirmed"]:
                passenger = db.query(models.RideRequest).filter_by(id=ride.matched_request_id).first()
                if passenger:
                    return {
                        "status": ride.status,
                        "ride_request_id": passenger.id,
                        "passenger_name": passenger.patient_name,
                        "origin": passenger.origin,
                        "destination": passenger.destination
                    }

            return {"status": ride.status}

        elif ride_type in ["passenger", "request"]:
            ride = db.query(models.RideRequest).filter_by(id=ride_id).first()
            if not ride:
                raise HTTPException(status_code=404, detail="בקשת הנוסע לא נמצאה")

            if ride.status in ["proposed", "volunteer_approved", "rider_approved", "confirmed"]:
                volunteer = db.query(models.VolunteerRide).filter_by(matched_request_id=ride.id).first()
                return {
                    "status": ride.status,
                    "volunteer_ride_id": volunteer.id if volunteer else None,
                    "volunteer_name": "ישראל ישראלי",
                    "volunteer_phone": "050-1234567",
                }

            return {"status": ride.status}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))