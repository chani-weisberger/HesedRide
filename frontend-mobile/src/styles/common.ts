// HesedRide — סגנונות משותפים
// כל מה שחוזר על עצמו בכמה דפים נמצא כאן
// ככה אם רוצים לשנות כפתור — משנים פה אחת ומשתנה בכל מקום

import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const common = StyleSheet.create({

  // רקע כללי של כל דף
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // כרטיסייה לבנה עם צל
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.primaryNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,        // צל באנדרואיד
  },

  // כפתור ראשי — כחול כהה
  buttonPrimary: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  // כפתור משני — שקוף עם מסגרת
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.lightCyan,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  // טקסט של כפתור ראשי
  buttonTextPrimary: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // טקסט של כפתור משני
  buttonTextSecondary: {
    color: colors.primaryNavy,
    fontSize: 16,
    fontWeight: '500',
  },

  // שורת הפרדה
  divider: {
    width: 36,
    height: 2,
    backgroundColor: colors.tealAccent,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 24,
  },

});