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

    if None in (original_time, time_to_passenger, passenger_ride_time, time_to_final_destination):
        return None

    combined_time = time_to_passenger + passenger_ride_time + time_to_final_destination
    return combined_time - original_time

def find_best_match(v_ride: VolunteerRide, db: Session):
    # Stage 1: Retrieving pending requests
    pending_requests = db.query(RideRequest). \
        filter(RideRequest.status == "pending"). \
        order_by(RideRequest.created_at.asc()). \
        with_for_update(skip_locked=True). \
        all()

    # Stage 2: Loop through requests
    for request in pending_requests:
        if request.passenger_count > v_ride.available_seats:
            continue

        deviation_minutes = calculate_total_deviation(v_ride, request)

        if deviation_minutes is not None and deviation_minutes <= v_ride.grace_minutes:
            v_ride.matched_request_id = request.id
            return request

    return None