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


@router.post("/confirm")
def confirm_ride_match(confirm_data: schemas.RideConfirmRequest, db: Session = Depends(get_db)):
    try:
        # 1. Retrieving the volunteer record and travel request based on the IDs sent by the front desk
        volunteer_ride = db.query(models.VolunteerRide).filter_by(id=confirm_data.volunteer_ride_id).first()
        ride_request = db.query(models.RideRequest).filter_by(id=confirm_data.ride_request_id).first()

        if not volunteer_ride or not ride_request:
            raise HTTPException(status_code=404, detail="נסיעת המתנדב או בקשת הנסיעה לא נמצאו")

        # 2. Updating the statuses to the final status - approved!
        volunteer_ride.status = "confirmed"
        ride_request.status = "confirmed"
        db.commit()

        # 3. Calling the helper function that creates the link to Waze
        waze_link = generate_google_maps_link(volunteer_ride, ride_request)

        # 4. Returning a reply to the front
        return {
            "status": "success",
            "message": "הנסיעה אושרה סופית על ידי שני הצדדים!",
            "waze_route_url": waze_link,
            "patient_phone": ride_request.patient_phone
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))