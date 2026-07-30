# HesedRide 🚗

מערכת לניהול ושידוך נסיעות בין מתנדבים לנזקקים.

## 💻 Tech Stack
* **Backend:** FastAPI (Python)
* **Frontend:** React Native (Expo)
* **Database:** PostgreSQL (Supabase)

## 🔐 משתני סביבה
צרי קובץ `.env` בשורש הפרויקט:
```
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_secret_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 🚀 הרצת הפרויקט

### Backend
1. הפעילי סביבה וירטואלית: `venv\Scripts\activate`
2. התקיני תלויות: `pip install -r requirements.txt`
3. הריצי שרת: `uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`
4. API זמין בכתובת: `http://localhost:8000/docs`

### Frontend
1. כנסי לתיקייה: `cd frontend-mobile`
2. הריצי: `npx expo start --web`

## 📋 סטטוס פיתוח
- [x] הרשמה והתחברות
- [ ] דשבורד נסיעות
- [ ] מסך בחירת נסיעה
