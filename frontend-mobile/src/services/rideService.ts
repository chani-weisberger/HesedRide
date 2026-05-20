// rideService.ts — כל הבקשות לשרת שקשורות לנסיעות

const API_URL = 'http://127.0.0.1:8000/api';

// טיפוס — מגדיר מה צריך להיות בבקשת נסיעה
// זה כמו "תבנית" שמבטיחה שלא נשכח שדה
export type RideRequest = {
  origin: string;
  destination: string;
  ride_date: string;
  ride_time: string;
  passenger_count: number;
  patient_name: string;
  patient_phone: string;
};

// פונקציה שמגישה בקשת נסיעה לשרת
export const createRide = async (rideData: RideRequest) => {
  const response = await fetch(`${API_URL}/rides/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rideData),
  });
  return response;
};