import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

export default function RiderFindingVolunteerPage() {
  const params = useLocalSearchParams();

  useEffect(() => {
    // שולפים את המזהה
    const id = params.ride_request_id || params.id || params.requestId || params.request_id;

    if (!id) {
      Alert.alert("תקלה בניתוב", "מספר הנסיעה חסר!");
      return;
    }

    const checkRideStatus = async () => {
      try {
        const url = `http://127.0.0.1:8000/api/rides/${id}/status?ride_type=request&t=${Date.now()}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();

          // ברגע שהמתנדב אישר, עוברים למסך ההצלחה
          if (data.status === 'confirmed') {
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
        console.error("שגיאה בפוללינג:", error);
      }
    };

    checkRideStatus(); // בדיקה ראשונה
    const intervalId = setInterval(checkRideStatus, 3000); // בדיקה כל 3 שניות

    // מנקה את הטיימר ברגע שעוזבים את המסך
    return () => clearInterval(intervalId);
  }, [params]);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>מחפשים לך מתנדב...</Text>
        <Text style={styles.subtitle}>בקשתך נקלטה. מערכת חסד-רייד מחפשת נהג מתאים עבורך ברגעים אלו.</Text>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} style={styles.loader} />
        </View>
        {/* טקסט הדיבוג נמחק מכאן לחלוטין! UI נקי בלבד. */}
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