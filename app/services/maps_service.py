from typing import Any

import requests
import urllib.parse
import os
from app.db.models import VolunteerRide, RideRequest

def get_travel_time_minutes(origin: str, destination: str) -> int | None :

    api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    if not api_key:
        print("CRITICAL: Missing Google Maps API Key.")
        return None

    encoded_origin = urllib.parse.quote(origin)
    encoded_destination = urllib.parse.quote(destination)

    url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={encoded_origin}&destinations={encoded_destination}&key={api_key}"

    try:
        response = requests.get(url)
        data = response.json()

        if data['rows'][0]['elements'][0]['status'] != 'OK':
            print(f"Warning: Google Maps could not calculate route from {origin} to {destination}")
            return None

        duration_in_seconds = data['rows'][0]['elements'][0]['duration']['value']
        return duration_in_seconds // 60

    except Exception as e:
        print(f"Error fetching travel time: {e}")
        return None

def generate_google_maps_link(v_ride: VolunteerRide, r_request: RideRequest) -> str:
    base_url = "https://www.google.com/maps/dir/"

    addresses = [
        v_ride.source_location,
        r_request.origin,
        r_request.destination,
        v_ride.destination_location
    ]

    encoded_addresses = [urllib.parse.quote(addr) for addr in addresses]

    final_url = base_url + "/".join(encoded_addresses)

    return final_url


def build_travel_time_matrix(v_ride: VolunteerRide, pending_requests: list[RideRequest]) -> dict:
    """
    אוספת את כל הכתובות (מקור ויעד של המתנדב + מקור ויעד של כל הנוסעים),
    שולחת קריאה אחת בלבד לגוגל, ומחזירה מילון עם כל הזמנים.
    מבנה המילון: {(origin, destination): minutes}
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        print("CRITICAL: Missing Google Maps API Key.")
        return {}

    # 1. איסוף כל הכתובות הייחודיות באמצעות Set כדי למנוע כפילויות
    addresses = set()
    addresses.add(v_ride.source_location)
    addresses.add(v_ride.destination_location)
    for req in pending_requests:
        addresses.add(req.origin)
        addresses.add(req.destination)

    address_list = list(addresses)
    if not address_list:
        return {}

    # 2. קידוד הכתובות ל-URL (מופרדות בתו '|')
    encoded_addresses = "|".join([urllib.parse.quote(addr) for addr in address_list])

    # שליחת הכתובות גם כ-origins וגם כ-destinations כדי לקבל מטריצה מלאה
    url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={encoded_addresses}&destinations={encoded_addresses}&key={api_key}"

    try:
        response = requests.get(url)
        data = response.json()

        time_matrix = {}
        if data.get('status') == 'OK':
            # 3. פענוח המטריצה שחזרה מגוגל למילון מהיר
            for i, origin_addr in enumerate(address_list):
                for j, dest_addr in enumerate(address_list):
                    element = data['rows'][i]['elements'][j]
                    if element['status'] == 'OK':
                        duration_in_seconds = element['duration']['value']
                        time_matrix[(origin_addr, dest_addr)] = duration_in_seconds // 60

        return time_matrix

    except Exception as e:
        print(f"Error fetching bulk travel times: {e}")
        return {}