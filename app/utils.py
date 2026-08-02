from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.models import VolunteerRide, RideRequest
from app.services.maps_service import get_travel_time_minutes


def calculate_total_deviation(v_ride: VolunteerRide, r_request: RideRequest) -> int | None:
    """Calculate deviation minutes when adding a passenger to a volunteer route."""
    original_time = get_travel_time_minutes(v_ride.source_location, v_ride.destination_location)

    time_to_passenger = get_travel_time_minutes(v_ride.source_location, r_request.origin)
    passenger_ride_time = get_travel_time_minutes(r_request.origin, r_request.destination)
    time_to_final_destination = get_travel_time_minutes(r_request.destination, v_ride.destination_location)

    if None in (original_time, time_to_passenger, passenger_ride_time, time_to_final_destination):
        return None

    combined_time = time_to_passenger + passenger_ride_time + time_to_final_destination
    return combined_time - original_time


def find_best_match(v_ride: VolunteerRide, db: Session):
    """Find the earliest pending ride request that fits seat and deviation constraints."""
    pending_ids = db.query(RideRequest.id). \
        filter(RideRequest.status == "pending"). \
        order_by(RideRequest.created_at.asc()). \
        all()

    for (req_id,) in pending_ids:
        request = db.query(RideRequest). \
            filter(RideRequest.id == req_id, RideRequest.status == "pending"). \
            with_for_update(skip_locked=True). \
            first()

        if not request:
            continue

        if request.passenger_count > v_ride.available_seats:
            continue

        deviation_minutes = calculate_total_deviation(v_ride, request)

        if deviation_minutes is not None and deviation_minutes <= v_ride.grace_minutes:
            request.status = "proposed"
            v_ride.status = "proposed"
            v_ride.matched_request_id = request.id
            v_ride.proposed_at = datetime.now(timezone.utc)
            db.commit()

            return request

    return None