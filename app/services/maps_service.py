import requests
import urllib.parse
import os
from app.db.models import VolunteerRide, RideRequest
from functools import lru_cache


@lru_cache(maxsize=100)
def get_travel_time_minutes(origin: str, destination: str) -> int | None:
    api_key = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY")
    if not api_key:
        print("ERROR: Google Maps API Key is missing!")
        return None

    # פונקציה פנימית שמבטיחה שכתובת תמיד תכיל עיר (אם אין בה עיר, מוסיפים אוטומטית את ירושלים או בית שמש)
    def clean_address(addr: str) -> str:
        if not addr:
            return ""
        # אם הכתובת לא מכילה לפחות אחת מהערים המרכזיות בהן אתם פועלים, נצמיד לה אוטומטית את ירושלים
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

        print(f"MAPS API RESPONSE status for ({fixed_origin} -> {fixed_destination}): {data.get('status')}")

        if data.get('routes') and len(data['routes']) > 0:
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