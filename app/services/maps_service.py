import requests
import urllib.parse
import os
from app.db.models import VolunteerRide, RideRequest
from functools import lru_cache


@lru_cache(maxsize=100)
def get_travel_time_minutes(origin: str, destination: str) -> int | None:
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        return None

    encoded_origin = urllib.parse.quote(origin)
    encoded_destination = urllib.parse.quote(destination)

    # שימוש ב-Directions API - קריאה נקודתית
    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={encoded_origin}&destination={encoded_destination}&key={api_key}"

    try:
        response = requests.get(url, timeout=5)
        data = response.json()

        if data.get('routes') and len(data['routes']) > 0:
            # חילוץ זמן הנסיעה
            leg = data['routes'][0]['legs'][0]
            return leg['duration']['value'] // 60
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def generate_google_maps_link(v_ride: VolunteerRide, r_request: RideRequest) -> str:
    base_url = "https://www.google.com/maps/dir/"

    # רשימת הכתובות המקורית
    addresses = [
        v_ride.source_location,
        r_request.origin,
        r_request.destination,
        v_ride.destination_location
    ]

    # צמצום כפילויות תוך שמירה על סדר (dict.fromkeys עושה בדיוק את זה)
    unique_addresses = list(dict.fromkeys(addresses))

    # קידוד הכתובות הייחודיות בלבד
    encoded_addresses = [urllib.parse.quote(addr) for addr in unique_addresses]

    # בניית הקישור הסופי
    final_url = base_url + "/".join(encoded_addresses)

    return final_url