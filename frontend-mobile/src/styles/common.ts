import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.12)',
    shadowColor: '#0B3A5C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },

  buttonPrimary: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  buttonPrimaryPressed: {
    backgroundColor: colors.primaryBlueDark,
  },

  buttonSecondary: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.tealAccent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonTextPrimary: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  buttonTextSecondary: {
    color: colors.primaryNavy,
    fontSize: 16,
    fontWeight: '600',
  },

  input: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    fontSize: 16,
    color: colors.primaryNavy,
    textAlign: 'right',
  },

  inputFocused: {
    borderColor: colors.inputFocus,
    backgroundColor: '#F0FDFA',
  },

  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },

  errorText: {
    color: colors.error,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
  },

  divider: {
    width: 40,
    height: 3,
    backgroundColor: colors.tealAccent,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 20,
  },
});