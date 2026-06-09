// volunteer/ride-summary.tsx — דף סיכום גלובלי לכל סוגי ההתנדבויות (צד מתנדב)
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function VolunteerGlobalRideSummaryPage() {
  const [isLoading, setIsLoading] = useState(false);

  // קוראים את הנתונים ואת סוג ההתנדבות
  const { rideData, typeTitle } = useLocalSearchParams<{ rideData: string; typeTitle: string }>();

  const ride = rideData ? JSON.parse(rideData) : { origin: '', destination: '', hesed_minutes: '', seats_count: 1 };
  
  // אם לא עבר סוג, ברירת המחדל היא נסיעה עכשווית
  const currentTypeTitle = typeTitle || 'נסיעה עכשווית';

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'המערכת מעדכנת! 🚀', 
        `הפרטים שלך עבור ${currentTypeTitle} נקלטו בהצלחה במערכת החסד!`,
        [{ text: 'מעולה!', onPress: () => router.replace('/volunteer/volunteer-type') }]
      );
    }, 800);
  };

  const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowValue}>{value}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>

        {/* הכותרת משתנה אוטומטית לפי מה שנבחר! */}
        <Text style={styles.title}>סיכום: {currentTypeTitle}</Text>
        <Text style={styles.subtitle}>אנא בדוק שהכל נכון לפני השמירה</Text>

        <View style={common.divider} />

        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי המסלול והרכב</Text>
          <SummaryRow label="נקודת מוצא"      value={ride.origin} />
          <SummaryRow label="נקודת יעד"       value={ride.destination} />
          <SummaryRow label="דקות חסד"        value={`${ride.hesed_minutes} דקות`} />
          <SummaryRow label="מושבים פנויים"    value={String(ride.seats_count)} />
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity style={common.buttonPrimary} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8}>
            {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={common.buttonTextPrimary}>אישור ופרסום נסיעה ✨</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
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
  sectionTitle: { ...typography.h3, marginBottom: 16, color: colors.primaryNavy },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.lightCyan },
  rowLabel: { ...typography.label, color: colors.textSecondary },
  rowValue: { ...typography.body, fontWeight: '500' },
  btnGroup: { gap: 12, marginTop: 8 },
  backBtn: { alignItems: 'center', padding: 12 },
  backText: { color: colors.primaryBlue, fontSize: 14 },
});// volunteer/ride-summary.tsx — דף סיכום גלובלי לכל סוגי ההתנדבויות (צד מתנדב)
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {ActivityIndicator,Alert,StyleSheet,Text,TouchableOpacity,View,} from 'react-native';
import { createVolunteerRide, VolunteerRideRequest } from '@/services/rideService';

export default function VolunteerGlobalRideSummaryPage() {
  const [isLoading, setIsLoading] = useState(false);

  // קוראים את הנתונים ואת סוג ההתנדבות
  const { rideData, typeTitle } = useLocalSearchParams<{ rideData: string; typeTitle: string }>();

  const ride = rideData ? JSON.parse(rideData) : { origin: '', destination: '', hesed_minutes: '', seats_count: 1 };
  
  // אם לא עבר סוג, ברירת המחדל היא נסיעה עכשווית
  const currentTypeTitle = typeTitle || 'נסיעה עכשווית';

 const handleSubmit = async () => {
  setIsLoading(true);

  try {
    const volunteerRide: VolunteerRideRequest = {
      source_location: ride.origin,
      destination_location: ride.destination,
      available_seats: ride.seats_count,
      grace_minutes: Number(ride.hesed_minutes),
    };

    const response = await createVolunteerRide(volunteerRide);
    const data = await response.json();
    setIsLoading(false);

    if (response.ok) {
      if (data.match_found) {
        Alert.alert(
          '🎉 נמצא נוסע!',
          `שם: ${data.match_details.passenger_name}\nמוצא: ${data.match_details.origin}\nיעד: ${data.match_details.destination}`,
          [{ text: 'מעולה!', onPress: () => router.replace('/volunteer/volunteer-type' as any) }]
        );
      } else {
        Alert.alert(
          '✅ הנסיעה נרשמה!',
          'לא נמצא נוסע כרגע — נעדכן אותך כשתמצא התאמה!',
          [{ text: 'אוקי', onPress: () => router.replace('/volunteer/volunteer-type' as any) }]
        );
      }
    } else {
      Alert.alert('שגיאה', data.detail || 'משהו השתבש');
    }

  } catch (error) {
    setIsLoading(false);
    Alert.alert('שגיאת תקשורת', 'לא מצליח להתחבר לשרת');
  }
};

  const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowValue}>{value}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>

        {/* הכותרת משתנה אוטומטית לפי מה שנבחר! */}
        <Text style={styles.title}>סיכום: {currentTypeTitle}</Text>
        <Text style={styles.subtitle}>אנא בדוק שהכל נכון לפני השמירה</Text>

        <View style={common.divider} />

        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי המסלול והרכב</Text>
          <SummaryRow label="נקודת מוצא"      value={ride.origin} />
          <SummaryRow label="נקודת יעד"       value={ride.destination} />
          <SummaryRow label="דקות חסד"        value={`${ride.hesed_minutes} דקות`} />
          <SummaryRow label="מושבים פנויים"    value={String(ride.seats_count)} />
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity style={common.buttonPrimary} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8}>
            {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={common.buttonTextPrimary}>אישור ופרסום נסיעה ✨</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
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
  sectionTitle: { ...typography.h3, marginBottom: 16, color: colors.primaryNavy },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.lightCyan },
  rowLabel: { ...typography.label, color: colors.textSecondary },
  rowValue: { ...typography.body, fontWeight: '500' },
  btnGroup: { gap: 12, marginTop: 8 },
  backBtn: { alignItems: 'center', padding: 12 },
  backText: { color: colors.primaryBlue, fontSize: 14 },
});