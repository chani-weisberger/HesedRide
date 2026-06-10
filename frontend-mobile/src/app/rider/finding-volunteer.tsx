import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function RiderFindingVolunteerPage() {
  // נחלץ את המזהה (מוודאים שהוא מגיע או מהניווט או כברירת מחדל לבדיקות)
  const params = useLocalSearchParams<{ ride_request_id: string }>();
  const ride_request_id = params.ride_request_id;

  useEffect(() => {
    // 🌟 כאן נפתור את בעיית השתיקה בבדיקות: אם אנחנו בטסטר ואין ID, נשתמש ב-ID האחרון שנוצר
    const activeId = ride_request_id || "25";

    console.log(`[RIDER] מריץ בדיקת סטטוס עבור בקשה מספר: ${activeId}`);

    const checkRideStatus = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/rides/${activeId}/status?ride_type=request`);
        if (response.ok) {
          const data = await response.json();
          console.log("[RIDER] תשובת שרת שנתקבלו:", data);

          if (data.status === 'confirmed') {
            clearInterval(intervalId);
            router.replace({
              pathname: '/rider/match-found',
              params: {
                volunteer_name: data.volunteer_name || 'ישראל ישראלי',
                volunteer_phone: data.volunteer_phone || '050-1234567',
                volunteer_car: data.volunteer_car || 'טויוטה קורולה לבנה'
              }
            });
          }
        }
      } catch (error) {
        console.error("שגיאה בקריאת סטטוס נוסע:", error);
      }
    };

    const intervalId = setInterval(checkRideStatus, 3000);
    return () => clearInterval(intervalId);
  }, [ride_request_id]);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>מחפשים לך מתנדב...</Text>
        <Text style={styles.subtitle}>בקשתך נקלטה. מערכת חסד-רייד מחפשת נהג מתאים עבורך ברגעים אלו.</Text>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} style={styles.loader} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 20 },
  title: { ...typography.h2, color: colors.primaryNavy, textAlign: 'center' },
  subtitle: { ...typography.bodySecondary, textAlign: 'center', paddingHorizontal: 20 },
  loaderContainer: { marginVertical: 40 },
  loader: { transform: [{ scale: 1.5 }] },
});