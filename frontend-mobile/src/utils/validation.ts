/** בדיקת תעודת זהות ישראלית (כולל ספרת ביקורת) */
export function isValidIsraeliId(id: string): boolean {
  const clean = id.trim();
  if (!/^\d{9}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = Number(clean[i]) * ((i % 2) + 1);
    if (digit > 9) digit -= 9;
    sum += digit;
  }
  return sum % 10 === 0;
}

/** טלפון נייד ישראלי */
export function isValidIsraeliPhone(phone: string): boolean {
  const clean = phone.replace(/[-\s]/g, '');
  return /^05\d{8}$/.test(clean);
}

export const validateRideForm = (
  origin: string,
  destination: string,
  patientName: string,
  patientPhone: string,
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!origin.trim()) errors.origin = 'נא למלא כתובת מוצא';
  if (!destination.trim()) errors.destination = 'נא למלא כתובת יעד';

  if (!patientName.trim()) {
    errors.patientName = 'נא למלא שם נוסע';
  } else if (patientName.trim().split(/\s+/).length < 2) {
    errors.patientName = 'נא למלא שם מלא (פרטי + משפחה)';
  }

  if (!patientPhone.trim()) {
    errors.patientPhone = 'נא למלא מספר טלפון';
  } else if (!isValidIsraeliPhone(patientPhone)) {
    errors.patientPhone = 'מספר טלפון לא תקין (לדוגמה: 0501234567)';
  }

  return errors;
};

export const validateVolunteerAuth = (data: {
  idNumber: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  isRegister: boolean;
}): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!isValidIsraeliId(data.idNumber)) {
    errors.idNumber = 'תעודת זהות לא תקינה';
  }

  if (data.isRegister) {
    if (!data.fullName || data.fullName.trim().split(/\s+/).length < 2) {
      errors.fullName = 'יש למלא שם מלא';
    }
    if (!data.phoneNumber || !isValidIsraeliPhone(data.phoneNumber)) {
      errors.phoneNumber = 'מספר טלפון לא תקין';
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(data.password)) {
      errors.password = 'הסיסמה חייבת 8 תווים לפחות, כולל אות גדולה, קטנה ומספר';
    }
  } else {
    if (!data.password) errors.password = 'נא להזין סיסמה';
  }

  return errors;
};