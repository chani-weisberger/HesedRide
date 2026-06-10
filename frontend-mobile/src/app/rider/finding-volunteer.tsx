// rider/finding-volunteer.tsx — מסך המתנה למתנדב (צד נוסע)
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function RiderFindingVolunteerPage() {
  const params = useLocalSearchParams<{ ride_request_id: string }>();
  const ride_request_id = params.ride_request_id;

  useEffect(() => {
    // 🌟 התיקון: שקט תעשייתי. מחכים בסבלנות שהדפדפן יטען את ה-ID בלי לזרוק שגיאות אדומות!
    if (!ride_request_id) return;

    const checkRideStatus = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/rides/${ride_request_id}/status?ride_type=request`);

        if (response.ok) {
          const data = await response.json();

          if (['proposed', 'volunteer_approved', 'rider_approved', 'confirmed'].includes(data.status)) {
            clearInterval(intervalId);
            router.replace({
              pathname: '/rider/match-found',
              params: {
                ride_request_id: ride_request_id,
                ride_status: data.status,
                volunteer_name: data.volunteer_name || 'ישראל ישראלי',
                volunteer_phone: data.volunteer_phone || '050-1234567',
                volunteer_car: data.volunteer_car || 'טויוטה קורולה לבנה'
              }
            });
          }
        }
      } catch (error) {
        // מתעלמים משגיאות רשת זמניות כדי לא לעצור את הלולאה
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