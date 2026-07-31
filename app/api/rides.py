from datetime import datetime, timezone, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils import find_best_match

from app.db.database import get_db
from app.db import models
from app.schemas import schemas
from app.services.maps_service import generate_google_maps_link

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
            raise HTTPException(status_code=400, detail="משתמש לא נמצא")

        new_volunteer_ride = models.VolunteerRide(**volunteer_data.model_dump())
        db.add(new_volunteer_ride)
        db.commit()
        db.refresh(new_volunteer_ride)

        matched_passenger = find_best_match(new_volunteer_ride, db)

        if matched_passenger:
            db.refresh(new_volunteer_ride)
            db.refresh(matched_passenger)

            navigation_link = generate_google_maps_link(new_volunteer_ride, matched_passenger)

            return {
                "status": "success",
                "message": "נמצאה הצעה להתאמה",
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

        # לא נמצאה התאמה
        new_volunteer_ride.status = "pending"
        db.commit()

        return {
            "status": "success",
            "message": "ממתין לנוסע מתאים.",
            "volunteer_ride_id": new_volunteer_ride.id,
            "match_found": False,
            "match_details": None
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.api_route("/volunteer/cancel/{volunteer_ride_id}", methods=["PATCH", "POST"])
def cancel_volunteer_ride(volunteer_ride_id: int, db: Session = Depends(get_db)):
    try:
        volunteer_ride = db.query(models.VolunteerRide).filter_by(id=volunteer_ride_id).first()
        if not volunteer_ride:
            raise HTTPException(status_code=404, detail="נסיעת המתנדב לא נמצאה")

        # אם המתנדב מבטל, משחררים את הנוסע שלו חזרה לחיפוש
        if volunteer_ride.matched_request_id is not None:
            ride_request = db.query(models.RideRequest).filter_by(id=volunteer_ride.matched_request_id).first()
            if ride_request and ride_request.status == "proposed":
                ride_request.status = "pending"

        volunteer_ride.status = "cancelled"
        volunteer_ride.matched_request_id = None
        volunteer_ride.proposed_at = None
        db.commit()

        return {"status": "success", "message": "נסיעת המתנדב בוטלה בהצלחה"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.api_route("/volunteer/resume/{volunteer_ride_id}", methods=["PATCH", "POST"])
def resume_volunteer_ride(volunteer_ride_id: int, db: Session = Depends(get_db)):
    try:
        volunteer_ride = db.query(models.VolunteerRide).filter_by(id=volunteer_ride_id).first()
        if not volunteer_ride:
            raise HTTPException(status_code=404, detail="נסיעת המתנדב לא נמצאה")

        # שחרור נוסע קודם שעדיין תקוע ב-proposed (אם קיים)
        if volunteer_ride.matched_request_id is not None:
            old_request = db.query(models.RideRequest).filter_by(id=volunteer_ride.matched_request_id).first()
            if old_request and old_request.status == "proposed":
                old_request.status = "pending"

        volunteer_ride.status = "pending"
        volunteer_ride.matched_request_id = None
        volunteer_ride.proposed_at = None
        db.commit()

        # חיפוש מיידי של נוסע חדש
        matched_passenger = find_best_match(volunteer_ride, db)

        if matched_passenger:
            db.refresh(volunteer_ride)
            db.refresh(matched_passenger)

            navigation_link = generate_google_maps_link(volunteer_ride, matched_passenger)

            return {
                "status": "success",
                "message": "נמצאה הצעה להתאמה",
                "volunteer_ride_id": volunteer_ride.id,
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
            "message": "הוחזר למצב חיפוש",
            "volunteer_ride_id": volunteer_ride.id,
            "match_found": False,
            "match_details": None
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.api_route("/request/cancel/{request_id}", methods=["PATCH", "POST"])
def cancel_ride_request(request_id: int, db: Session = Depends(get_db)):
    try:
        ride_request = db.query(models.RideRequest).filter_by(id=request_id).first()
        if not ride_request:
            raise HTTPException(status_code=404, detail="בקשת הנוסע לא נמצאה")

        # משחררים את המתנדב שהיה תפוס על הנוסע הזה
        volunteer_ride = db.query(models.VolunteerRide).filter_by(matched_request_id=ride_request.id).order_by(models.VolunteerRide.id.desc()).first()
        if volunteer_ride:
            volunteer_ride.status = "pending"
            volunteer_ride.matched_request_id = None
            volunteer_ride.proposed_at = None

        ride_request.status = "cancelled"
        db.commit()
        return {"status": "success", "message": "בקשת הנסיעה בוטלה בהצלחה"}
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

        # אם הנוסע ביטל, זורקים שגיאה כדי שהאפליקציה תדע להקפיץ מודאל "חזרה לחיפוש"
        if ride_request.status == "cancelled":
            raise HTTPException(status_code=400, detail="הנוסע ביטל את הבקשה")

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
    except HTTPException as he:
        raise he
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

            # פג תוקף הצעה אחרי 3 דקות בלי אישור
            if ride.status == "proposed" and ride.proposed_at is not None:
                proposed_at = ride.proposed_at
                if proposed_at.tzinfo is None:
                    proposed_at = proposed_at.replace(tzinfo=timezone.utc)

                if datetime.now(timezone.utc) - proposed_at > timedelta(minutes=3):
                    if ride.matched_request_id is not None:
                        passenger = db.query(models.RideRequest).filter_by(
                            id=ride.matched_request_id
                        ).first()
                        if passenger and passenger.status == "proposed":
                            passenger.status = "pending"

                    ride.status = "cancelled"
                    ride.matched_request_id = None
                    ride.proposed_at = None
                    db.commit()
                    return {"status": "expired"}

            if ride.status == "pending":
                matched_passenger = find_best_match(ride, db)
                if matched_passenger:
                    db.refresh(ride)

            if ride.status in ["proposed", "confirmed"]:
                passenger = db.query(models.RideRequest).filter_by(
                    id=ride.matched_request_id
                ).first()
                if passenger:
                    return {
                        "status": ride.status,
                        "ride_request_id": passenger.id,
                        "passenger_name": passenger.patient_name,
                        "origin": passenger.origin,
                        "destination": passenger.destination,
                    }

            return {"status": ride.status}

        elif ride_type in ["passenger", "request"]:
            ride = db.query(models.RideRequest).filter_by(id=ride_id).first()
            if not ride:
                raise HTTPException(status_code=404, detail="בקשת הנוסע לא נמצאה")

            if ride.status == "proposed":
                volunteer_ride = (
                    db.query(models.VolunteerRide)
                    .filter_by(matched_request_id=ride.id)
                    .order_by(models.VolunteerRide.id.desc())
                    .first()
                )

                if volunteer_ride and volunteer_ride.status in ["cancelled", "expired"]:
                    ride.status = "pending"
                    db.commit()

            if ride.status in ["proposed", "volunteer_approved", "rider_approved", "confirmed"]:
                volunteer_ride = (
                    db.query(models.VolunteerRide)
                    .filter_by(matched_request_id=ride.id)
                    .order_by(models.VolunteerRide.id.desc())
                    .first()
                )

                if not volunteer_ride or not volunteer_ride.volunteer_id:
                    raise HTTPException(status_code=404, detail="פרטי ההתנדבות חסרים")

                volunteer_user = db.query(models.User).filter_by(
                    id=volunteer_ride.volunteer_id
                ).first()

                if not volunteer_user:
                    raise HTTPException(
                        status_code=404, detail="המתנדב לא נמצא במסד הנתונים"
                    )

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