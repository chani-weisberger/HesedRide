import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

/**
 * VolunteerGlobalRideSummaryPage executes its corresponding UI or business operation.
 */
export default function VolunteerGlobalRideSummaryPage() {
  const { rideData, typeTitle } = useLocalSearchParams<{
    rideData: string;
    typeTitle: string;
  }>();

  let ride: {
    origin: string;
    destination: string;
    hesed_minutes: string;
    seats_count: number;
  } | null = null;

  try {
    if (rideData) ride = JSON.parse(rideData);
  } catch {
    ride = null;
  }

  useEffect(() => {
    if (!ride) {
      router.replace('/volunteer/immediate');
    }
  }, [ride]);

  if (!ride) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primaryBlue} />
        </View>
      </ScreenWrapper>
    );
  }

  const currentTypeTitle = typeTitle || 'נסיעה עכשווית';

  /**
   * handleConfirm executes its corresponding UI or business operation.
   */
  const handleConfirm = () => {
    router.replace({
      pathname: '/volunteer/waiting-for-rider',
      params: {
        rideData: rideData,
        typeTitle: typeTitle,
      },
    });
  };

  /**
   * SummaryRow executes its corresponding UI or business operation.
   */
  const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowValue}>{value}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>סיכום: {currentTypeTitle}</Text>
        <Text style={styles.subtitle}>אנא בדוק שהכל נכון לפני השמירה</Text>

        <View style={common.divider} />

        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי המסלול והרכב</Text>
          <SummaryRow label="נקודת מוצא" value={ride.origin} />
          <SummaryRow label="נקודת יעד" value={ride.destination} />
          <SummaryRow label="דקות חסד" value={`${ride.hesed_minutes} דקות`} />
          <SummaryRow label="מושבים פנויים" value={String(ride.seats_count)} />
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={common.buttonPrimary}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={common.buttonTextPrimary}>אישור ופרסום נסיעה </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/volunteer/immediate')}
          >
            <Text style={styles.backText}>→ חזרה לעריכה</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  title: { ...typography.h2, textAlign: 'center', color: colors.primaryNavy },
  subtitle: { ...typography.bodySecondary, textAlign: 'center', marginTop: 4 },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
    color: colors.primaryNavy,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightCyan,
  },
  rowLabel: { ...typography.label, color: colors.textSecondary },
  rowValue: { ...typography.body, fontWeight: '500' },
  btnGroup: { gap: 12, marginTop: 8 },
  backBtn: { alignItems: 'center', padding: 12 },
  backText: { color: colors.primaryBlue, fontSize: 14 },
});