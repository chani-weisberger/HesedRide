// validation.ts — בדיקות תקינות לטפסים
 
export const validateRideForm = (
  origin: string,
  destination: string,
  patientName: string,
  patientPhone: string,
): {[key: string]: string} => {
 
  const errors: {[key: string]: string} = {};
 
  if (!origin) errors.origin = 'נא למלא כתובת מוצא';
  if (!destination) errors.destination = 'נא למלא כתובת יעד';
  if (!patientName) errors.patientName = 'נא למלא שם נוסע';
  if (!patientPhone) errors.patientPhone = 'נא למלא מספר טלפון';
 
  const phoneRegex = /^[0-9]{10}$/;
  if (patientPhone && !phoneRegex.test(patientPhone.replace(/-/g, ''))) {
    errors.patientPhone = 'מספר טלפון לא תקין';
  }
 
  return errors;
};