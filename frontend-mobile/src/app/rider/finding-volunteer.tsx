// rider/finding-volunteer.tsx
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function RiderFindingVolunteerPage() {
  const params = useLocalSearchParams<{ ride_request_id: string }>();

  useEffect(() => {
    if (!params.ride_request_id) return;

    const checkRideStatus = async () => {
      try {
        // 🔥 התיקון המנצח: מוסיפים חותמת זמן ל-URL כדי שהדפדפן בחיים לא יקפיא את התשובה!
        const url = `http://127.0.0.1:8000/api/rides/${params.ride_request_id}/status?ride_type=request&t=${Date.now()}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();

          // ברגע שהמתנדב אישר (confirmed), קופצים אוטומטית למסך הירוק!
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
        console.error("שגיאת רשת זמנית:", error);
      }
    };

    // בדיקה כל 3 שניות
    const intervalId = setInterval(checkRideStatus, 3000);
    return () => clearInterval(intervalId);
  }, [params.ride_request_id]);

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