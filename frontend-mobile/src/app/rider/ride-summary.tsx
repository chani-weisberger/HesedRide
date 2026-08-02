import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';
import { createRide, RideRequest } from '@/services/rideService';
import { clearRideDraft } from '@/utils/rideDraft';

/**
 * RideSummaryPage executes its corresponding UI or business operation.
 */
export default function RideSummaryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { rideData } = useLocalSearchParams<{ rideData: string }>();

  let ride: RideRequest | null = null;
  try {
    if (rideData) ride = JSON.parse(rideData);
  } catch {
    ride = null;
  }

  useEffect(() => {
    if (!ride) {
      router.replace('/rider/ride-form');
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

  /**
   * handleSubmit executes its corresponding UI or business operation.
   */
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await createRide(ride!);
      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        clearRideDraft();
        router.replace({
          pathname: '/rider/finding-volunteer' as any,
          params: { ride_request_id: data.id },
        });
      } else {
        Alert.alert('שגיאה', data.message || 'הגשת הבקשה נכשלה');
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('שגיאת תקשורת', 'לא מצליח להתחבר לשרת');
    }
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
        <Text style={styles.title}>סיכום הבקשה</Text>
        <Text style={styles.subtitle}>
          אנא בדקי שהפרטים נכונים לפני השליחה
        </Text>

        <View style={common.divider} />

        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי הנסיעה</Text>
          <SummaryRow label="מוצא" value={ride.origin} />
          <SummaryRow label="יעד" value={ride.destination} />
          <SummaryRow
            label="מספר נוסעים"
            value={String(ride.passenger_count)}
          />
        </View>

        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי הנוסע</Text>
          <SummaryRow label="שם" value={ride.patient_name} />
          <SummaryRow label="טלפון" value={ride.patient_phone} />
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={common.buttonPrimary}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={common.buttonTextPrimary}>אישור ושליחה</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/rider/ride-form')}
          >
            <Text style={styles.backText}>→ חזרה לעריכה</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightCyan,
  },
  rowLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.body,
    fontWeight: '500',
  },
  btnGroup: {
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    alignItems: 'center',
    padding: 12,
  },
  backText: {
    color: colors.primaryBlue,
    fontSize: 14,
  },
});