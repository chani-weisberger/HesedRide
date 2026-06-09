// volunteer/immediate.tsx — טופס הזנת נסיעה עכשווית (צד מתנדב)
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ImmediateRideFormPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [hesedMinutes, setHesedMinutes] = useState('');
  const [seatsCount, setSeatsCount] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleNext = () => {
    // בדיקת חובה לשדות לפי התבנית של ללי
    const newErrors: {[key: string]: string} = {};
    if (!origin.trim()) newErrors.origin = 'חובה להזין נקודת מוצא';
    if (!destination.trim()) newErrors.destination = 'חובה להזין נקודת יעד';
    if (!hesedMinutes.trim()) newErrors.hesedMinutes = 'חובה להזין דקות חסד';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const volunteerRideData = {
      origin,
      destination,
      hesed_minutes: hesedMinutes,
      seats_count: seatsCount,
    };

    // המעבר המעודכן: שולח לדף הסיכום הגלובלי ומספר לו שזו נסיעה עכשווית!
    router.push({
      pathname: '/volunteer/ride-summary' as any,
      params: { 
        rideData: JSON.stringify(volunteerRideData),
        typeTitle: 'התנדבות מיידית' 
      },
    });
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>

        <Text style={styles.title}>נסיעה עכשווית</Text>
        <View style={common.divider} />

        <View style={common.card}>
          <Text style={styles.label}>נקודת מוצא</Text>
          <TextInput
            style={[styles.input, errors.origin ? styles.inputError : null]}
            placeholder="מאיפה אתה יוצא?"
            value={origin}
            onChangeText={(text) => { setOrigin(text); setErrors(e => ({...e, origin: ''})); }}
            textAlign="right"
          />
          {errors.origin ? <Text style={styles.errorText}>{errors.origin}</Text> : null}

          <Text style={styles.label}>נקודת יעד</Text>
          <TextInput
            style={[styles.input, errors.destination ? styles.inputError : null]}
            placeholder="לאן אתה נוסע?"
            value={destination}
            onChangeText={(text) => { setDestination(text); setErrors(e => ({...e, destination: ''})); }}
            textAlign="right"
          />
          {errors.destination ? <Text style={styles.errorText}>{errors.destination}</Text> : null}

          <Text style={styles.label}>מס׳ דקות חסד</Text>
          <TextInput
            style={[styles.input, errors.hesedMinutes ? styles.inputError : null]}
            placeholder="כמה דקות תוכל לסטות מהדרך?"
            value={hesedMinutes}
            onChangeText={(text) => { setHesedMinutes(text); setErrors(e => ({...e, hesedMinutes: ''})); }}
            textAlign="right"
            keyboardType="numeric"
          />
          {errors.hesedMinutes ? <Text style={styles.errorText}>{errors.hesedMinutes}</Text> : null}

          <Text style={styles.label}>מספר מושבים פנויים</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setSeatsCount(Math.min(8, seatsCount + 1))}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{seatsCount}</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setSeatsCount(Math.max(1, seatsCount - 1))}
            >
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={common.buttonPrimary}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={common.buttonTextPrimary}>המשך</Text>
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
  title: { ...typography.h2, textAlign: 'center', color: colors.primaryNavy },
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
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 8, marginBottom: 8 },
  counterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryBlue, alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { color: colors.white, fontSize: 22, fontWeight: '600' },
  counterValue: { ...typography.h2, minWidth: 40, textAlign: 'center' },
  btnGroup: { gap: 12, marginTop: 8 },
  backBtn: { alignItems: 'center', padding: 12 },
  backText: { color: colors.primaryBlue, fontSize: 14 },
});