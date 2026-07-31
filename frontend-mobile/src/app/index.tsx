import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

export default function WelcomePage() {
  return (
    <ScreenWrapper padded={false}>
      <View style={styles.container}>
        <Text style={styles.question}>כיצד נוכל לעזור היום?</Text>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/volunteer/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>אני מתנדב </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/rider/ride-type')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>אני נוסע </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>נסיעות חסד • התנדבות עם לב</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  question: {
    ...typography.h3,
    marginBottom: 28,
    textAlign: 'center',
  },
  btnGroup: {
    width: '100%',
    maxWidth: 360,
    gap: 14,
  },
  btnPrimary: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 16,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.tealAccent,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: colors.primaryNavy,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 36,
    fontSize: 13,
    color: colors.textHint,
    textAlign: 'center',
  },
});