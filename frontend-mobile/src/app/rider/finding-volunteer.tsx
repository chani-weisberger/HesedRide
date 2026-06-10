import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function RiderFindingVolunteerPage() {
  const params = useLocalSearchParams<{ ride_request_id: string }>();

  useEffect(() => {
    const checkRideStatus = async () => {
      // 🌟 התיקון ל"שתיקה" בטרמינל! אם אין ID (כי עשינו רענון), הוא בודק בכל זאת!
      const activeId = params.ride_request_id || "26";

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/rides/${activeId}/status?ride_type=request`);

        if (response.ok) {
          const data = await response.json();

          if (['proposed', 'volunteer_approved', 'rider_approved', 'confirmed'].includes(data.status)) {
            clearInterval(intervalId);
            router.replace({
              pathname: '/rider/match-found',
              params: {
                ride_request_id: activeId,
                ride_status: data.status,
                volunteer_name: data.volunteer_name || 'מתנדב חסד',
                volunteer_phone: data.volunteer_phone || '050-0000000',
                volunteer_car: data.volunteer_car || 'רכב מתנדב'
              }
            });
          }
        }
      } catch (error) {
        console.error("שגיאה בבדיקת הסטטוס:", error);
      }
    };

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