import * as SecureStore from 'expo-secure-store';
const API_URL = 'http://127.0.0.1:8000/api';

export type RideRequest = {
  origin: string;
  destination: string;
  ride_date: string;
  ride_time: string;
  passenger_count: number;
  patient_name: string;
  patient_phone: string;
};

/**
 * createRide executes its corresponding UI or business operation.
 */
export const createRide = async (rideData: RideRequest) => {
  const response = await fetch(`${API_URL}/rides/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rideData),
  });
  return response;
};
export type VolunteerRideRequest = {
  source_location: string;
  destination_location: string;
  available_seats: number;
  grace_minutes: number;
};
/**
 * createVolunteerRide executes its corresponding UI or business operation.
 */
export const createVolunteerRide = async (rideData: VolunteerRideRequest) => {
  const token = await SecureStore.getItemAsync('userToken');
  const response = await fetch(`${API_URL}/rides/volunteer/create`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(rideData),
  });
  return response;
};