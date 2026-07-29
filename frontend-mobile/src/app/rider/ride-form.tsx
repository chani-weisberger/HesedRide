// ride-form.tsx — טופס בקשת נסיעה מיידית
import { useState } from 'react';
import {
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
import AddressInput from '@/components/AddressInput';

export default function RideFormPage() {

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleNext = () => {
    const newErrors = validateRideForm(origin, destination, patientName, patientPhone);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date();
    const rideDate = now.toISOString().split('T')[0];
    const rideTime = now.toTimeString().split(' ')[0];

    const rideData: RideRequest = {
      origin,
      destination,
      ride_date: rideDate,
      ride_time: rideTime,
      passenger_count: passengerCount,
      patient_name: patientName,
      patient_phone: patientPhone,
    };

    router.push({
      pathname: '/rider/ride-summary' as any,
      params: { rideData: JSON.stringify(rideData) },
    });
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>

        <Text style={styles.title}>הזמנה מיידית</Text>
        <View style={common.divider} />

        <View style={common.card}>
<Text style={styles.sectionTitle}>פרטי הנסיעה</Text>

          <Text style={styles.label}>כתובת מוצא</Text>
          {/* zIndex גבוה יותר למוצא כדי שהרשימה תפתח מעל שדה היעד */}
          <View style={{ zIndex: 20, marginBottom: 4 }}>
            <AddressInput
              placeholder="לדוגמה: רחוב הרצל 10, תל אביב"
              onAddressSelect={(address) => {
                setOrigin(address);
                setErrors(e => ({...e, origin: ''}));
              }}
            />
          </View>
          {errors.origin ? <Text style={styles.errorText}>{errors.origin}</Text> : null}

          <Text style={styles.label}>כתובת יעד</Text>
          <View style={{ zIndex: 10, marginBottom: 4 }}>
            <AddressInput
              placeholder="לדוגמה: בית חולים איכילוב"
              onAddressSelect={(address) => {
                setDestination(address);
                setErrors(e => ({...e, destination: ''}));
              }}
            />
          </View>
          {errors.destination ? <Text style={styles.errorText}>{errors.destination}</Text> : null}

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

        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי הנוסע</Text>

          <Text style={styles.label}>שם מלא</Text>
          <TextInput
            style={[styles.input, errors.patientName ? styles.inputError : null]}
            placeholder="ישראל ישראלי"
            value={patientName}
            onChangeText={(text) => { setPatientName(text); setErrors(e => ({...e, patientName: ''})); }}
            textAlign="right"
          />
          {errors.patientName ? <Text style={styles.errorText}>{errors.patientName}</Text> : null}

          <Text style={styles.label}>מספר טלפון</Text>
          <TextInput
            style={[styles.input, errors.patientPhone ? styles.inputError : null]}
            placeholder="050-1234567"
            value={patientPhone}
            onChangeText={(text) => { setPatientPhone(text); setErrors(e => ({...e, patientPhone: ''})); }}
            textAlign="right"
            keyboardType="phone-pad"
          />
          {errors.patientPhone ? <Text style={styles.errorText}>{errors.patientPhone}</Text> : null}
        </View>

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
  container: { padding: 24, gap: 16 },
  title: { ...typography.h2, textAlign: 'center' },
  sectionTitle: { ...typography.h3, marginBottom: 16 },
  label: { ...typography.label, marginBottom: 6, textAlign: 'right' },
  input: {
    height: 50,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontSize: 16,
  },
  inputError: { borderColor: 'red', borderWidth: 2 },
  errorText: { color: 'red', fontSize: 12, textAlign: 'right', marginBottom: 10 },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 14 },
  counterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryBlue, alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { color: colors.white, fontSize: 22, fontWeight: '600' },
  counterValue: { ...typography.h2, minWidth: 40, textAlign: 'center' },
  btnGroup: { gap: 12, marginTop: 8 },
  backBtn: { alignItems: 'center', padding: 12 },
  backText: { color: colors.primaryBlue, fontSize: 14 },
});