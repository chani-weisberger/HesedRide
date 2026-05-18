// HesedRide — פלטת צבעים רשמית
// כל הצבעים באפליקציה לקוחים מכאן בלבד
// אם רוצים לשנות צבע — משנים רק כאן

export const colors = {

  // צבעים ראשיים
  primaryNavy:  '#061B4D',   // כחול כהה — כותרות, טקסט ראשי
  primaryBlue:  '#2563EB',   // כחול בהיר — כפתורים ראשיים, לינקים
  tealAccent:   '#14B8A6',   // טורקיז — הדגשות, accent
  lightCyan:    '#86E4E1',   // תכלת עדין — גבולות, רקעים משניים
  background:   '#E6F7F5',   // רקע כללי של האפליקציה

  // צבעים נוספים לשימוש פנימי
  white:        '#FFFFFF',
  cardBg:       '#FFFFFF',   // רקע כרטיסיות
  inputBorder:  '#D1D5DB',   // גבול שדות קלט
  textSecondary:'#6B7280',   // טקסט משני / תיאורים
  textHint:     '#9CA3AF',   // placeholder בשדות

  // רמזור דחיפות (פיצ'ר מרכזי במערכת)
  urgent:       '#EF4444',   // אדום — דחוף מאוד
  medium:       '#F59E0B',   // צהוב — בינוני
  low:          '#10B981',   // ירוק — לא דחוף

  // סטטוסים
  success:      '#10B981',
  error:        '#EF4444',
  warning:      '#F59E0B',
  info:         '#2563EB',

} as const;

// טיפוס אוטומטי — מאפשר לריאקט לדעת אילו צבעים קיימים
export type ColorKey = keyof typeof colors;