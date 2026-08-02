import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { RideRequest } from '@/services/rideService';
import { validateRideForm } from '@/utils/validation';
import { saveRideDraft, loadRideDraft } from '@/utils/rideDraft';
import AddressInput from '@/components/AddressInput';

/**
 * RideFormPage executes its corresponding UI or business operation.
 */
export default function RideFormPage() {
  const draft = loadRideDraft();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [passengerCount, setPassengerCount] = useState(
    draft?.passenger_count || 1
  );
  const [patientName, setPatientName] = useState(draft?.patient_name || '');
  const [patientPhone, setPatientPhone] = useState(draft?.patient_phone || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const nameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const webOutline =
    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

  useEffect(() => {
    saveRideDraft({
      passenger_count: passengerCount,
      patient_name: patientName,
      patient_phone: patientPhone,
    });
  }, [passengerCount, patientName, patientPhone]);

  /**
   * handleNext executes its corresponding UI or business operation.
   */
  const handleNext = () => {
    const newErrors = validateRideForm(
      origin,
      destination,
      patientName,
      patientPhone
    );
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date();
    const rideData: RideRequest = {
      origin,
      destination,
      ride_date: now.toISOString().split('T')[0],
      ride_time: now.toTimeString().split(' ')[0],
      passenger_count: passengerCount,
      patient_name: patientName,
      patient_phone: patientPhone,
    };

    saveRideDraft({
      passenger_count: passengerCount,
      patient_name: patientName,
      patient_phone: patientPhone,
    });

    router.push({
      pathname: '/rider/ride-summary' as any,
      params: { rideData: JSON.stringify(rideData) },
    });
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>פרטי הנסיעה</Text>
        <Text style={styles.subtitle}>מאיפה ולאן, ופרטי הנוסע ליצירת קשר</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>מסלול</Text>

          <Text style={styles.label}>כתובת מוצא</Text>
          <View style={{ zIndex: 20, marginBottom: 4 }}>
            <AddressInput
              placeholder="לדוגמה: רחוב הרצל 10, תל אביב"
              onAddressSelect={(address) => {
                setOrigin(address);
                setErrors((e) => ({ ...e, origin: '' }));
              }}
            />
          </View>
          {errors.origin ? (
            <Text style={styles.errorText}>{errors.origin}</Text>
          ) : null}

          <Text style={styles.label}>כתובת יעד</Text>
          <View style={{ zIndex: 10, marginBottom: 4 }}>
            <AddressInput
              placeholder="לדוגמה: בית חולים איכילוב"
              onAddressSelect={(address) => {
                setDestination(address);
                setErrors((e) => ({ ...e, destination: '' }));
              }}
            />
          </View>
          {errors.destination ? (
            <Text style={styles.errorText}>{errors.destination}</Text>
          ) : null}

          <Text style={styles.label}>מספר נוסעים</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() =>
                setPassengerCount(Math.max(1, passengerCount - 1))
              }
              activeOpacity={0.8}
            >
              <Text style={styles.counterBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{passengerCount}</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() =>
                setPassengerCount(Math.min(8, passengerCount + 1))
              }
              activeOpacity={0.8}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>פרטי הנוסע</Text>

          <Text style={styles.label}>שם מלא</Text>
          <TextInput
            ref={nameRef}
            style={[
              styles.input,
              webOutline,
              focusedField === 'name' && styles.inputFocused,
              errors.patientName ? styles.inputError : null,
            ]}
            placeholder="שם מלא"
            placeholderTextColor={colors.textHint}
            value={patientName}
            onChangeText={(text) => {
              setPatientName(text);
              setErrors((e) => ({ ...e, patientName: '' }));
            }}
            textAlign="right"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => phoneRef.current?.focus()}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
          />
          {errors.patientName ? (
            <Text style={styles.errorText}>{errors.patientName}</Text>
          ) : null}

          <Text style={styles.label}>מספר טלפון</Text>
          <TextInput
            ref={phoneRef}
            style={[
              styles.input,
              webOutline,
              focusedField === 'phone' && styles.inputFocused,
              errors.patientPhone ? styles.inputError : null,
            ]}
            placeholder="מספר טלפון"
            placeholderTextColor={colors.textHint}
            value={patientPhone}
            onChangeText={(text) => {
              setPatientPhone(text);
              setErrors((e) => ({ ...e, patientPhone: '' }));
            }}
            textAlign="right"
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={handleNext}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
          />
          {errors.patientPhone ? (
            <Text style={styles.errorText}>{errors.patientPhone}</Text>
          ) : null}
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>המשך לסיכום</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/rider/ride-type')}
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
    paddingVertical: 24,
    gap: 16,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 4,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.15)',
    shadowColor: '#0B3A5C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 8,
    textAlign: 'right',
  },
  label: {
    ...typography.label,
    marginBottom: 6,
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  input: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    fontSize: 16,
    color: colors.primaryNavy,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputFocused: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#F0FDFA',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 8,
    marginRight: 4,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 8,
    marginBottom: 4,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    alignItems: 'center',
  },
  btnPrimary: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.primaryBlue,
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
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