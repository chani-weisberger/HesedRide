// ride-form.tsx — טופס בקשת נסיעה מיידית
// תאריך ושעה מתמלאים אוטומטית בעת השליחה

import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';
import { RideRequest } from '@/services/rideService';
import { validateRideForm } from '@/utils/validation';

export default function RideFormPage() {

  // ======= State — שדות הטופס =======
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  // ======= מעבר לדף סיכום =======
  const handleNext = () => {
    if (!validateRideForm(origin, destination, patientName, patientPhone)) return;

    // תאריך ושעה נוכחיים — מתמלאים אוטומטית
    const now = new Date();
    const rideDate = now.toISOString().split('T')[0];   // 2026-05-20
    const rideTime = now.toTimeString().split(' ')[0];  // 14:30:00

    const rideData: RideRequest = {
      origin,
      destination,
      ride_date: rideDate,
      ride_time: rideTime,
      passenger_count: passengerCount,
      patient_name: patientName,
      patient_phone: patientPhone,
    };

    // מעביר את הנתונים לדף הסיכום
    router.push({
      pathname: '/rider/ride-summary' as any,
      params: { rideData: JSON.stringify(rideData) },
    });
  };

  // ======= ממשק =======
  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>

        {/* כותרת */}
        <Text style={styles.title}>הזמנה מיידית</Text>
        <View style={common.divider} />

        {/* פרטי הנסיעה */}
        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי הנסיעה</Text>

          <Text style={styles.label}>כתובת מוצא</Text>
          <TextInput
            style={styles.input}
            placeholder="לדוגמה: רחוב הרצל 10, תל אביב"
            value={origin}
            onChangeText={setOrigin}
            textAlign="right"
          />

          <Text style={styles.label}>כתובת יעד</Text>
          <TextInput
            style={styles.input}
            placeholder="לדוגמה: בית חולים איכילוב"
            value={destination}
            onChangeText={setDestination}
            textAlign="right"
          />

          <Text style={styles.label}>מספר נוסעים</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setPassengerCount(Math.min(8, passengerCount + 1))}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>

            <Text style={styles.counterValue}>{passengerCount}</Text>

            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setPassengerCount(Math.max(1, passengerCount - 1))}
            >
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* פרטי הנוסע */}
        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי הנוסע</Text>

          <Text style={styles.label}>שם מלא</Text>
          <TextInput
            style={styles.input}
            placeholder="ישראל ישראלי"
            value={patientName}
            onChangeText={setPatientName}
            textAlign="right"
          />

          <Text style={styles.label}>מספר טלפון</Text>
          <TextInput
            style={styles.input}
            placeholder="050-1234567"
            value={patientPhone}
            onChangeText={setPatientPhone}
            textAlign="right"
            keyboardType="phone-pad"
          />
        </View>

        {/* כפתורים */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={common.buttonPrimary}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={common.buttonTextPrimary}>המשך לסיכום</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>→ חזרה</Text>
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
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  label: {
    ...typography.label,
    marginBottom: 6,
    textAlign: 'right',
  },
  input: {
    height: 50,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontSize: 16,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 14,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '600',
  },
  counterValue: {
    ...typography.h2,
    minWidth: 40,
    textAlign: 'center',
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