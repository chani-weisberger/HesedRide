// volunteer/volunteer-ride-summary.tsx — דף סיכום גלובלי לכל סוגי ההתנדבויות (צד מתנדב)
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
    Platform
} from 'react-native';
const AsyncStorage = Platform.OS !== 'web'
  ? require('@react-native-async-storage/async-storage').default
  : null;
import { VolunteerRideRequest } from '@/services/rideService';
import * as SecureStore from 'expo-secure-store';

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
      // 1. 🔑 שולפים מהזיכרון את הטוקן שללי שמרה בלוגין
      // 🔑 מנגנון שליפת טוקן חכם ומוגן מפני קריסות דפדפן
      let token: string | null = null;

      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      } else {
        try {
          token = await SecureStore.getItemAsync('userToken');
        } catch (error) {
          console.log("SecureStore not available:", error);
        }
        if (!token && AsyncStorage) {
          token = await AsyncStorage.getItem('userToken');
        }
      }

      // גיבוי לפיתוח: אם אין טוקן בכלל, נשים טוקן דמי כדי שהבקשה לא תיכשל
      if (!token) {
        console.warn("⚠️ לא נמצא טוקן! משתמש בטוקן זמני.");
        token = "mock-token-fallback";
      }

      const volunteerRide: VolunteerRideRequest = {
        source_location: ride.origin,
        destination_location: ride.destination,
        available_seats: ride.seats_count,
        grace_minutes: Number(ride.hesed_minutes),
      };

      // 2. 🌐 שולחים את הבקשה לרחלי, ומצרפים את ה-Token ב-Headers
      const response = await fetch('http://127.0.0.1:8000/api/rides/volunteer/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 🔥 שורת הקסם של רחלי!
        },
        body: JSON.stringify(volunteerRide)
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        if (data.match_found) {
          // 🚗 תרחיש 1: נמצאה התאמה מיידית! מטיסים למסך הבא
          router.replace({
            pathname: '/volunteer/match-found',
            params: {
              passenger_name: data.match_details.passenger_name,
              origin: data.match_details.origin,
              destination: data.match_details.destination,
              ride_request_id: data.match_details.ride_request_id,
              volunteer_ride_id: data.volunteer_ride_id
            }
          });
        } else {
          // ⏳ תרחיש 2: לא נמצאה התאמה מיידית, הנסיעה בסטטוס pending
          // מנווטים למסך ההמתנה עם הגלגל ומעבירים לו את ה-ID האמיתי של הנסיעה
          router.replace({
            pathname: '/volunteer/waiting-for-rider',
            params: { volunteer_ride_id: data.volunteer_ride_id }
          });
        }
      } else {
        Alert.alert('שגיאה מהשרת', data.detail || 'משהו השתבש, אולי בעיית הרשאה');
      }

    } catch (error) {
      setIsLoading(false);
      console.error("שגיאת תקשורת מלאה:", error);
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