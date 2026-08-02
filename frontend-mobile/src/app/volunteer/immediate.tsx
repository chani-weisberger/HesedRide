import ScreenWrapper from '@/components/ScreenWrapper';
import AddressInput from '@/components/AddressInput';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

/**
 * ImmediateRideFormPage executes its corresponding UI or business operation.
 */
export default function ImmediateRideFormPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [hesedMinutes, setHesedMinutes] = useState('');
  const [seatsCount, setSeatsCount] = useState(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const webOutline =
    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

  /**
   * handleNext executes its corresponding UI or business operation.
   */
  const handleNext = () => {
    const newErrors: { [key: string]: string } = {};
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

    router.push({
      pathname: '/volunteer/volunteer-ride-summary' as any,
      params: {
        rideData: JSON.stringify(volunteerRideData),
        typeTitle: 'התנדבות מיידית',
      },
    });
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>פרטי ההתנדבות</Text>
        <Text style={styles.subtitle}>מאיפה ולאן, וכמה גמישות יש לך בדרך</Text>

        <View style={styles.card}>
          <Text style={styles.label}>נקודת מוצא</Text>
          <View style={{ zIndex: 20, marginBottom: 4 }}>
            <AddressInput
              placeholder="מאיפה אתה יוצא?"
              onAddressSelect={(address) => {
                setOrigin(address);
                setErrors((e) => ({ ...e, origin: '' }));
              }}
            />
          </View>
          {errors.origin ? (
            <Text style={styles.errorText}>{errors.origin}</Text>
          ) : null}

          <Text style={styles.label}>נקודת יעד</Text>
          <View style={{ zIndex: 10, marginBottom: 4 }}>
            <AddressInput
              placeholder="לאן אתה נוסע?"
              onAddressSelect={(address) => {
                setDestination(address);
                setErrors((e) => ({ ...e, destination: '' }));
              }}
            />
          </View>
          {errors.destination ? (
            <Text style={styles.errorText}>{errors.destination}</Text>
          ) : null}

          <Text style={styles.label}>דקות חסד</Text>
          <TextInput
            style={[
              styles.input,
              webOutline,
              focusedField === 'hesed' && styles.inputFocused,
              errors.hesedMinutes ? styles.inputError : null,
            ]}
            placeholder="כמה דקות תוכל לסטות מהדרך?"
            placeholderTextColor={colors.textHint}
            value={hesedMinutes}
            onChangeText={(text) => {
              setHesedMinutes(text.replace(/[^0-9]/g, ''));
              setErrors((e) => ({ ...e, hesedMinutes: '' }));
            }}
            textAlign="right"
            keyboardType="numeric"
            returnKeyType="done"
            onFocus={() => setFocusedField('hesed')}
            onBlur={() => setFocusedField(null)}
          />
          {errors.hesedMinutes ? (
            <Text style={styles.errorText}>{errors.hesedMinutes}</Text>
          ) : null}

          <View style={styles.seatsContainer}>
            <Text style={styles.label}>מושבים פנויים</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setSeatsCount(Math.max(1, seatsCount - 1))}
                activeOpacity={0.8}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{seatsCount}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setSeatsCount(Math.min(8, seatsCount + 1))}
                activeOpacity={0.8}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>המשך</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/volunteer/volunteer-type')}
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
  seatsContainer: {
    marginTop: 12,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 8,
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