# HesedRide 🚗

מערכת חכמה לניהול ושידוך נסיעות בין מתנדבים לנזקקים.

## 🏗️ Database Architecture
![DB Schema](./db-schema.png)

## 💻 Tech Stack
* **Backend:** FastAPI (Python)
* **Frontend:** React Native (Expo)
* **Database:** PostgreSQL

## 🚀 איך להריץ את הפרויקט (Getting Started)

### Backend
1. נווטי לתיקיית הפרויקט הראשית.
2. הפעילי את הסביבה הווירטואלית: `venv\Scripts\activate`
3. הריצי את השרת: `uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`
4. ה-API יהיה זמין בכתובת: `http://localhost:8000/docs`

### Frontend
1. נווטי לתיקיית `frontend-mobile`.
2. הריצי: `npx expo start --web`

## 📋 סטטוס פיתוח (Milestone 2)
- [x] מנגנון הרשמה (Signup)
- [x] מנגנון התחברות (Login)
- [ ] דשבורד נסיעות (GET /api/requests)
- [ ] מסך בחירת נסיעה
