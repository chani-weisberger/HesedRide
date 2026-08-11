# HesedRide

Real-time ride matching between volunteers and medical patients, with route-detour constraints and a careful ride-status lifecycle.

**My role:** Project lead & backend developer (team of 4)

## Highlights
- Matching algorithm using travel times and grace-time / detour limits
- Status flow: pending → proposed → confirmed / cancelled (timeouts, cancel, resume)
- Auth and ride APIs; integration with a React Native (Expo) client

## Tech stack
- Backend: Python, FastAPI, SQLAlchemy, PostgreSQL (Supabase), JWT
- Frontend: React Native (Expo)
- Maps: Google Maps API

## Run locally

### Backend
Set DATABASE_URL, JWT_SECRET, GOOGLE_MAPS_API_KEY in a .env file, then:

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

### Frontend
cd frontend-mobile
npx expo start --web

## Academic context
Application Development Workshop project — grade 100.
