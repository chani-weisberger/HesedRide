from sqlalchemy.orm import Session
from app.db.models import VolunteerRide, RideRequest
from app.services.maps_service import get_travel_time_minutes

def calculate_total_deviation(v_ride: VolunteerRide, r_request: RideRequest) -> int | None:
    # 1. Original travel time
    original_time = get_travel_time_minutes(v_ride.source_location, v_ride.destination_location)

    # 2. Combined route time
    time_to_passenger = get_travel_time_minutes(v_ride.source_location, r_request.origin)
    passenger_ride_time = get_travel_time_minutes(r_request.origin, r_request.destination)
    time_to_final_destination = get_travel_time_minutes(r_request.destination, v_ride.destination_location)

    print(f"DEBUG MAPS - original_time: {original_time}, to_passenger: {time_to_passenger}, ride_time: {passenger_ride_time}, to_final: {time_to_final_destination}")

    if None in (original_time, time_to_passenger, passenger_ride_time, time_to_final_destination):
        return None

    combined_time = time_to_passenger + passenger_ride_time + time_to_final_destination
    return combined_time - original_time

def find_best_match(v_ride: VolunteerRide, db: Session):
    # Stage 1: Retrieving only pending request IDs without global locking
    pending_ids = db.query(RideRequest.id). \
        filter(RideRequest.status == "pending"). \
        order_by(RideRequest.created_at.asc()). \
        all()

    print(f"DEBUG FIND_MATCH - Found {len(pending_ids)} pending request IDs to check against volunteer {v_ride.id}")

    # Stage 2: Loop through request IDs and lock them one by one safely
    for (req_id,) in pending_ids:
        # נעילה נקודתית ושקטה אך ורק לבקשה הנוכחית
        request = db.query(RideRequest). \
            filter(RideRequest.id == req_id, RideRequest.status == "pending"). \
            with_for_update(skip_locked=True). \
            first()

        if not request:
            # אם מישהו אחר תפס את הבקשה הזו ממש עכשיו, מדלגים לבקשה הבאה
            continue

        if request.passenger_count > v_ride.available_seats:
            print(f"DEBUG FIND_MATCH - Request {request.id} skipped: too many passengers ({request.passenger_count} > {v_ride.available_seats})")
            continue

        deviation_minutes = calculate_total_deviation(v_ride, request)
        print(f"DEBUG FIND_MATCH - Request {request.id} deviation calculated: {deviation_minutes} mins (Grace allowed: {v_ride.grace_minutes})")

        if deviation_minutes is not None and deviation_minutes <= v_ride.grace_minutes:
            request.status = "proposed"
            v_ride.status = "proposed"
            db.commit()
            print(f"DEBUG FIND_MATCH - MATCH FOUND! Request {request.id} matched with Volunteer {v_ride.id}")
            return request

    print(f"DEBUG FIND_MATCH - No matching request found for volunteer {v_ride.id}")
    return None