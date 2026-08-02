import requests
import urllib.parse
import os
from app.db.models import VolunteerRide, RideRequest
from functools import lru_cache


@lru_cache(maxsize=100)
def get_travel_time_minutes(origin: str, destination: str) -> int | None:
    """Return travel time in minutes between two addresses using Google Directions."""
    api_key = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY")
    if not api_key:
        return None

    def clean_address(addr: str) -> str:
        """Ensure addresses include one of the supported core cities."""
        if not addr:
            return ""
        main_cities = ["ירושלים", "בית שמש", "תל אביב", "חיפה", "בני ברק", "מודיעין"]
        if not any(city in addr for city in main_cities):
            return f"{addr}, ירושלים"
        return addr

    fixed_origin = clean_address(origin)
    fixed_destination = clean_address(destination)

    encoded_origin = urllib.parse.quote(fixed_origin)
    encoded_destination = urllib.parse.quote(fixed_destination)

    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={encoded_origin}&destination={encoded_destination}&key={api_key}"

    try:
        response = requests.get(url, timeout=5)
        data = response.json()

        if data.get('routes') and len(data['routes']) > 0:
            leg = data['routes'][0]['legs'][0]
            return leg['duration']['value'] // 60
        return None
    except Exception:
        return None

def generate_google_maps_link(v_ride: VolunteerRide, r_request: RideRequest) -> str:
    """Build a Google Maps directions link for volunteer pickup and dropoff flow."""
    base_url = "https://www.google.com/maps/dir/"

    addresses = [
        v_ride.source_location,
        r_request.origin,
        r_request.destination,
        v_ride.destination_location
    ]

    unique_addresses = list(dict.fromkeys(addresses))

    encoded_addresses = [urllib.parse.quote(addr) for addr in unique_addresses]

    final_url = base_url + "/".join(encoded_addresses)

    return final_url