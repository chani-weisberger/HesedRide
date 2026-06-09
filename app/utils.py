from sqlalchemy.orm import Session
from app.db.models import VolunteerRide, RideRequest

#def generate_waze_link(v_ride: VolunteerRide, r_request: RideRequest) -> str: !!!!!!!!!!!!!!!!!!!!!
#def get_travel_time_minutes(origin: str, destination: str) -> int !!!!!!!!!!!!!!!!!!!!!!!!!!!!!

def calculate_total_deviation(v_ride: VolunteerRide, r_request: RideRequest) -> int:

    # 1. The volunteer's original travel time (from their origin to their destination)
    original_time = get_travel_time_minutes(v_ride.source_location, v_ride.destination_location)

    # 2. The combined route time with the passenger's stops
    time_to_passenger = get_travel_time_minutes(v_ride.source_location, r_request.origin)
    passenger_ride_time = get_travel_time_minutes(r_request.origin, r_request.destination)
    time_to_final_destination = get_travel_time_minutes(r_request.destination, v_ride.destination_location)

    combined_time = time_to_passenger + passenger_ride_time + time_to_final_destination

    # 3. Calculation of net minutes of deviation
    return combined_time - original_time


def find_best_match(v_ride: VolunteerRide, db: Session):

    # Stage 1: Retrieving passengers with pending status - sorted by seniority and locked out from other volunteers!
    pending_requests = db.query(RideRequest). \
        filter(RideRequest.status == "pending"). \
        order_by(RideRequest.created_at.asc()). \
        with_for_update(skip_locked=True). \
        all()

    # Stage 2: The filtering and testing loop
    for request in pending_requests:

        # Condition 1: Checking for available spaces in the vehicle
        if request.passenger_count > v_ride.available_seats:
            continue  # There is not enough space, move to the next in line.

        # Condition 2: Calculating minutes of deviation against Google Maps
        deviation_minutes = calculate_total_deviation(v_ride, request)

        # Is the deviation less than or equal to the minutes of grace that the volunteer defined?
        if deviation_minutes <= v_ride.grace_minutes:
            
            return request  # Successfully returning the passenger you robbed

    return None  # If we've gone through everyone and no one fits within the grace period