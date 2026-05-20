// HesedRide — טיפוגרפיה
// גדלי פונטים וסגנונות טקסט אחידים בכל האפליקציה

import { colors } from './colors';

export const typography = {

  // כותרות
  h1: {
    fontSize:   28,
    fontWeight: '700' as const,
    color:      colors.primaryNavy,
  },
  h2: {
    fontSize:   22,
    fontWeight: '700' as const,
    color:      colors.primaryNavy,
  },
  h3: {
    fontSize:   18,
    fontWeight: '500' as const,
    color:      colors.primaryNavy,
  },

  // גוף טקסט
  body: {
    fontSize:   16,
    fontWeight: '400' as const,
    color:      colors.primaryNavy,
  },
  bodySecondary: {
    fontSize:   14,
    fontWeight: '300' as const,
    color:      colors.textSecondary,
  },

  // תוויות וכפתורים
  label: {
    fontSize:   13,
    fontWeight: '500' as const,
    color:      colors.textSecondary,
  },
  button: {
    fontSize:   16,
    fontWeight: '600' as const,
  },

  // hint בשדות קלט
  hint: {
    fontSize:   13,
    fontWeight: '300' as const,
    color:      colors.textHint,
  },

} as const;