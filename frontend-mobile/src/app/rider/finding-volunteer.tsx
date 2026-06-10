// rider/finding-volunteer.tsx — מסך המתנה למתנדב (צד נוסע)
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const AsyncStorage = Platform.OS !== 'web'
  ? require('@react-native-async-storage/async-storage').default
  : null;

export default function RiderFindingVolunteerPage() {
  const { ride_request_id } = useLocalSearchParams<{ ride_request_id: string }>();

  const getAuthToken = async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('userToken');
    } else {
      try {
        return await SecureStore.getItemAsync('userToken');
      } catch {
        return AsyncStorage ? await AsyncStorage.getItem('userToken') : null;
      }
    }
  };

  useEffect(() => {
    if (!ride_request_id) return;

    const checkRideStatus = async () => {
      try {
        const token = await getAuthToken();
        const response = await fetch(`http://127.0.0.1:8000/api/rides/${ride_request_id}/status?ride_type=request`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();

          // 🎉 נמצא שידוך או שהנסיעה כבר אושרה! מעבירים את הנוסע למסך הפרטים
          // 🎉 נמצא שידוך או שהנסיעה כבר אושרה! מעבירים את הנוסע למסך הפרטים
          if (data.status === 'proposed' || data.status === 'confirmed') {
            clearInterval(intervalId);
            router.replace({
              pathname: '/rider/match-found',
              params: {
                ride_request_id: ride_request_id,
                ride_status: data.status || 'proposed',
                volunteer_name: data.volunteer_name || 'מתנדב חסד',
                volunteer_phone: data.volunteer_phone || '050-0000000',
                volunteer_car: data.volunteer_car || 'רכב מתנדב'
              }
            });
          }
        }
      } catch (error) {
        console.error("שגיאה בבדיקת סטטוס הנוסע:", error);
      }
    };

    const intervalId = setInterval(checkRideStatus, 4000);
    return () => clearInterval(intervalId);
  }, [ride_request_id]);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>מחפשים לך מתנדב...</Text>
        <Text style={styles.subtitle}>בקשתך נקלטה בהצלחה. מערכת חסד-רייד מחפשת נהג מתאים עבורך ברגעים אלו.</Text>
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