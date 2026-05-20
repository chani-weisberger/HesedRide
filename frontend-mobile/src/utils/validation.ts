// validation.ts — בדיקות תקינות לטפסים
// כל פונקציית בדיקה מחזירה הודעת שגיאה או null אם הכל תקין

import { Alert } from 'react-native';

// בדיקת טופס נסיעה מיידית
// מקבלת את כל השדות ומחזירה true אם הכל תקין
export const validateRideForm = (
  origin: string,
  destination: string,
  patientName: string,
  patientPhone: string,
): boolean => {

  if (!origin) {
    Alert.alert('שגיאה', 'נא למלא כתובת מוצא');
    return false;
  }

  if (!destination) {
    Alert.alert('שגיאה', 'נא למלא כתובת יעד');
    return false;
  }

  if (!patientName) {
    Alert.alert('שגיאה', 'נא למלא שם נוסע');
    return false;
  }

  if (!patientPhone) {
    Alert.alert('שגיאה', 'נא למלא מספר טלפון');
    return false;
  }

  // בדיקת פורמט טלפון — 10 ספרות
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(patientPhone.replace(/-/g, ''))) {
    Alert.alert('שגיאה', 'מספר טלפון לא תקין');
    return false;
  }

  return true;
};