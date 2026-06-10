// ride-summary.tsx — דף סיכום לפני שליחת הבקשה
// מציג את כל הפרטים שהנוסע מילא ומאפשר לאשר או לחזור

import { useState } from 'react';
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

export default function RideSummaryPage() {

  const [isLoading, setIsLoading] = useState(false);

  // קוראים את הנתונים שהועברו מדף הטופס
  const { rideData } = useLocalSearchParams<{ rideData: string }>();

  // JSON.parse — הופך את המחרוזת חזרה לאובייקט
  const ride: RideRequest = JSON.parse(rideData);

  // ======= שליחה לשרת =======
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await createRide(ride);
      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        // עובר לדף חיפוש מתנדב עם מזהה הנסיעה
        router.replace({
          pathname: '/rider/finding-volunteer' as any,
          params: { rideId: data.id },
        });
      } else {
        Alert.alert('שגיאה', data.message || 'הגשת הבקשה נכשלה');
      }

    } catch (error) {
      setIsLoading(false);
      Alert.alert('שגיאת תקשורת', 'לא מצליח להתחבר לשרת');
    }
  };

  // רכיב קטן שמציג שורה אחת בסיכום
  const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowValue}>{value}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );

  // ======= ממשק =======
  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>

        <Text style={styles.title}>סיכום הבקשה</Text>
        <Text style={styles.subtitle}>אנא בדקי שהפרטים נכונים לפני השליחה</Text>

        <View style={common.divider} />

        {/* כרטיסיית פרטי נסיעה */}
        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי הנסיעה</Text>
          <SummaryRow label="מוצא"        value={ride.origin} />
          <SummaryRow label="יעד"         value={ride.destination} />
          <SummaryRow label="מספר נוסעים" value={String(ride.passenger_count)} />
        </View>

        {/* כרטיסיית פרטי נוסע */}
        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי הנוסע</Text>
          <SummaryRow label="שם"    value={ride.patient_name} />
          <SummaryRow label="טלפון" value={ride.patient_phone} />
        </View>

        {/* כפתורים */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={common.buttonPrimary}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={common.buttonTextPrimary}>אישור ושליחה</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
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