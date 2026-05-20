// כתובת השרת — משנים רק כאן כשעוברים לשרת אמיתי
const API_URL = 'http://127.0.0.1:8000/api';
// אחראי רק על שליחת הבקשה וקבלת התשובה
export const registerVolunteer = async (
  idNumber: string,
  fullName: string,
  password: string
) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_number: idNumber,
      full_name: fullName,
      password: password,
    }),
  });
  return response;
};