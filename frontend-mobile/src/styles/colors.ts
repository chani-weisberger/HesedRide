
export const colors = {
  primaryNavy: '#0B3A5C',
  primaryBlue: '#0D9488',      // טורקיז ראשי (במקום כחול גנרי)
  primaryBlueDark: '#0F766E',
  tealAccent: '#14B8A6',
  lightCyan: '#99F6E4',
  softCyan: '#CCFBF1',
  background: '#E8F8F6',
  backgroundAlt: '#F0FDFA',

  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputFocus: '#14B8A6',
  textSecondary: '#64748B',
  textHint: '#94A3B8',

  urgent: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
  success: '#10B981',
  error: '#DC2626',
  warning: '#F59E0B',
  info: '#0EA5E9',
} as const;

export type ColorKey = keyof typeof colors;