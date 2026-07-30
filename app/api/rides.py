from datetime import datetime, timezone, timedelta
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
        new_ride = models.RideRequest(**ride_data.model_dump())
        db.add(new_ride)
        db.commit()
        db.refresh(new_ride)
        return new_ride
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/volunteer/create")
def create_volunteer_ride(volunteer_data: schemas.VolunteerRideCreate, db: Session = Depends(get_db)):
    try:
        user = db.query(models.User).filter(models.User.id == volunteer_data.volunteer_id).first()
        if not user:
            raise HTTPException(status_code=400,
                                detail=f"משתמש עם ID {volunteer_data.volunteer_id} לא נמצא במסד הנתונים")

        new_volunteer_ride = models.VolunteerRide(**volunteer_data.model_dump())
        db.add(new_volunteer_ride)
        db.commit()
        db.refresh(new_volunteer_ride)

        matched_passenger = find_best_match(new_volunteer_ride, db)

        if matched_passenger:
            matched_passenger.status = "proposed"
            new_volunteer_ride.status = "proposed"
            new_volunteer_ride.proposed_at = datetime.now(timezone.utc)  # <-- שמירת זמן ההצעה
            new_volunteer_ride.matched_request_id = matched_passenger.id

            db.commit()
            db.refresh(new_volunteer_ride)
            db.refresh(matched_passenger)

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
        print(f"DEBUG ERROR: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.api_route("/volunteer/cancel/{volunteer_ride_id}", methods=["PATCH", "POST"])
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
        volunteer_ride.matched_request_id = None
        volunteer_ride.proposed_at = None
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

        volunteer_ride.status = "confirmed"
        ride_request.status = "confirmed"
        db.commit()

        navigation_link = generate_google_maps_link(volunteer_ride, ride_request)

        return {
            "status": "success",
            "ride_status": "confirmed",
            "navigation_url": navigation_link,
            "patient_phone": ride_request.patient_phone
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{ride_id}/status")
def get_ride_status(ride_id: int, ride_type: str, db: Session = Depends(get_db)):
    try:
        # פונקציית עזר שמשחררת את הנוסע ומבטלת את המתנדב ברגע שפג תוקף או שהמתנדב נטש
        def force_expire_volunteer(v_ride):
            if v_ride.matched_request_id:
                passenger = db.query(models.RideRequest).filter_by(id=v_ride.matched_request_id).first()
                if passenger:
                    passenger.status = "pending"

            v_ride.status = "cancelled"
            v_ride.matched_request_id = None
            v_ride.proposed_at = None
            db.commit()

        if ride_type == "volunteer":
            ride = db.query(models.VolunteerRide).filter_by(id=ride_id).first()
            if not ride:
                raise HTTPException(status_code=404, detail="נסיעת המתנדב לא נמצאה")

            # בדיקה האם ההצעה בסטטוס proposed
            if ride.status == "proposed" and ride.proposed_at:
                proposed_time = ride.proposed_at
                if proposed_time.tzinfo is None:
                    proposed_time = proposed_time.replace(tzinfo=timezone.utc)

                now_utc = datetime.now(timezone.utc)

                # אם עברו יותר מ-3 דקות (או כל זמן בדיקה שתבחרי)
                if now_utc - proposed_time > timedelta(minutes = 3):
                    force_expire_volunteer(ride)
                    return {"status": "expired", "message": "פג תוקף ההצעה"}

            if ride.status == "pending":
                matched_passenger = find_best_match(ride, db)
                if matched_passenger:
                    matched_passenger.status = "proposed"
                    ride.status = "proposed"
                    ride.proposed_at = datetime.now(timezone.utc)
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

            # אם הנוסע ב-proposed אבל נסיעת המתנדב המשויכת אליו כבר לא ב-proposed (כלומר בוטלה או פג תוקפה)
            if ride.status == "proposed":
                volunteer_ride = db.query(models.VolunteerRide).filter_by(matched_request_id=ride.id).first()
                if not volunteer_ride or volunteer_ride.status in ["cancelled", "expired", "pending"]:
                    ride.status = "pending"
                    db.commit()

            if ride.status in ["proposed", "volunteer_approved", "rider_approved", "confirmed"]:
                volunteer_ride = db.query(models.VolunteerRide).filter_by(matched_request_id=ride.id).first()

                if not volunteer_ride or not volunteer_ride.volunteer_id:
                    raise HTTPException(status_code=404, detail="פרטי ההתנדבות חסרים")

                volunteer_user = db.query(models.User).filter_by(id=volunteer_ride.volunteer_id).first()

                if not volunteer_user:
                    raise HTTPException(status_code=404, detail="המתנדב לא נמצא במסד הנתונים")

                return {
                    "status": ride.status,
                    "volunteer_ride_id": volunteer_ride.id,
                    "volunteer_name": volunteer_user.full_name,
                    "volunteer_phone": volunteer_user.phone_number,
                }

            return {"status": ride.status}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))