import { colors } from './colors';

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.primaryNavy,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primaryNavy,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.primaryNavy,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.primaryNavy,
    lineHeight: 24,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  hint: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textHint,
  },
} as const;