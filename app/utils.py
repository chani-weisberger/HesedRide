from sqlalchemy.orm import Session
from app.db.models import VolunteerRide, RideRequest
from app.services.maps_service import build_travel_time_matrix


def calculate_total_deviation_from_matrix(v_ride: VolunteerRide, r_request: RideRequest, time_matrix: dict) -> int | None:
    # שליפת הזמנים ישירות מתוך המילון ששמור בזיכרון ב-O(1), במקום קריאות רשת!
    try:
        original_time = time_matrix[(v_ride.source_location, v_ride.destination_location)]
        time_to_passenger = time_matrix[(v_ride.source_location, r_request.origin)]
        passenger_ride_time = time_matrix[(r_request.origin, r_request.destination)]
        time_to_final_destination = time_matrix[(r_request.destination, v_ride.destination_location)]

        combined_time = time_to_passenger + passenger_ride_time + time_to_final_destination

        # חישוב נטו של דקות הסטייה
        return combined_time - original_time
    except KeyError:
        # אם משום מה אחת הכתובות לא חזרה תקינה מגוגל
        return None


def find_best_match(v_ride: VolunteerRide, db: Session):
    # שלב 1: שליפת כל הנוסעים הממתינים
    pending_requests = db.query(RideRequest). \
        filter(RideRequest.status == "pending"). \
        order_by(RideRequest.created_at.asc()). \
        with_for_update(skip_locked=True). \
        all()

    if not pending_requests:
        return None

    # שלב 2: יצירת מטריצת הזמנים מול גוגל בקריאת רשת אחת ויחידה!
    time_matrix = build_travel_time_matrix(v_ride, pending_requests)

    # שלב 3: לולאת הסינון (עכשיו היא תרוץ באפס זמן)
    for request in pending_requests:

        if request.passenger_count > v_ride.available_seats:
            continue

        # שימוש בפונקציה החדשה שמקבלת את המטריצה
        deviation_minutes = calculate_total_deviation_from_matrix(v_ride, request, time_matrix)

        if deviation_minutes is not None and deviation_minutes <= v_ride.grace_minutes:
            v_ride.matched_request_id = request.id
            return request

    return None