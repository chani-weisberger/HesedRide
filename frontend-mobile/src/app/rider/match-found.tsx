// match-found.tsx — דף אישור התאמה
// מוצג כשנמצא מתנדב לנסיעה

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';

export default function MatchFoundPage() {

  const { rideId } = useLocalSearchParams<{ rideId: string }>();

  // ======= פתיחת Waze =======
  // Linking — מאפשר לפתוח אפליקציות חיצוניות
  const openWaze = (address: string) => {
    const url = `waze://?q=${encodeURIComponent(address)}&navigate=yes`;
    Linking.openURL(url).catch(() => {
      // אם Waze לא מותקן — פותח במפות גוגל
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      );
    });
  };

  // ======= ממשק =======
  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>

        {/* אייקון הצלחה */}
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>נמצא מתנדב!</Text>
        <Text style={styles.subtitle}>המתנדב בדרך אליך</Text>

        <View style={common.divider} />

        {/* פרטי המתנדב */}
        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי המתנדב</Text>

          <View style={styles.row}>
            <Text style={styles.rowValue}>ישראל ישראלי</Text>
            <Text style={styles.rowLabel}>שם</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowValue}>050-1234567</Text>
            <Text style={styles.rowLabel}>טלפון</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowValue}>טויוטה קורולה לבנה</Text>
            <Text style={styles.rowLabel}>רכב</Text>
          </View>
        </View>

        {/* כפתור פתיחת Waze */}
        <TouchableOpacity
          style={styles.wazeBtn}
          onPress={() => openWaze('בית חולים איכילוב, תל אביב')}
          activeOpacity={0.8}
        >
          <Text style={styles.wazeBtnText}>🗺️ פתח ב-Waze</Text>
        </TouchableOpacity>

        {/* חזרה לדף הבית */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.homeBtnText}>חזרה לדף הבית</Text>
        </TouchableOpacity>

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tealAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 40,
    color: colors.white,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    color: colors.primaryNavy,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
    width: '100%',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightCyan,
    width: '100%',
  },
  rowLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.body,
    fontWeight: '500',
  },
  wazeBtn: {
    width: '100%',
    backgroundColor: '#33CCFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  wazeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  homeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeBtnText: {
    color: colors.primaryBlue,
    fontSize: 14,
  },
});