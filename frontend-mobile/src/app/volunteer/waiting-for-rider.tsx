// volunteer/waiting-for-rider.tsx
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    View,
    Platform,
    TouchableOpacity
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
// ייבוא בטוח ל-AsyncStorage
const AsyncStorage = Platform.OS !== 'web'
  ? require('@react-native-async-storage/async-storage').default
  : null;



export default function VolunteerWaitingForRiderPage() {
  const { volunteer_ride_id, match_found, match_details, rideData } = useLocalSearchParams<{
    volunteer_ride_id?: string;
    match_found?: string;
    match_details?: string;
    rideData?: string;
  }>();

  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [isCreating, setIsCreating] = useState(!volunteer_ride_id && !!rideData);

  const getAuthToken = async () => {
    if (Platform.OS === 'web') return localStorage.getItem('userToken');
    try {
      let token = await SecureStore.getItemAsync('userToken');
      if (!token && AsyncStorage) token = await AsyncStorage.getItem('userToken');
      return token;
    } catch (error) { return AsyncStorage ? await AsyncStorage.getItem('userToken') : null; }
  };

 const createRideAndStartPolling = async (rideJson: string) => {
  try {
    const ride = JSON.parse(rideJson);
    const token = await getAuthToken();
    let userId = null;
      if (Platform.OS === 'web') {
        userId = localStorage.getItem('userId');
      } else {
        userId = await SecureStore.getItemAsync('userId');
      }

    // בדיקה קריטית: האם יש לנו ID?
    if (!userId) {
      Alert.alert('שגיאה', 'לא נמצא מזהה משתמש. אנא התחברי מחדש.');
      router.replace('/volunteer/login');
      return;
    }

    const response = await fetch('http://127.0.0.1:8000/api/rides/volunteer/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
          source_location: ride.origin,
          destination_location: ride.destination,
          available_seats: Number(ride.seats_count),
          grace_minutes: Number(ride.hesed_minutes),
          volunteer_id: Number(userId),
      })
    });

    // נקודה חשובה: נדפיס את השגיאה אם השרת מחזיר אחת
    if (!response.ok) {
        const errorData = await response.json();
        console.log("Server Error Details:", errorData);
        Alert.alert('שגיאה', errorData.detail || 'לא הצלחנו ליצור את הנסיעה');
        router.back();
        return;
    }

    const data = await response.json();
    setIsCreating(false);

    if (data.match_found) {
        router.replace({
            pathname: '/volunteer/match-found',
            params: { ...data.match_details, volunteer_ride_id: data.volunteer_ride_id }
        });
    } else {
        startPollingFlow(data.volunteer_ride_id);
    }
  } catch (e) {
    console.log("Communication Error:", e);
    Alert.alert('שגיאה', 'בעיית תקשורת');
    router.back();
  }
};

  const startPollingFlow = (rideId: string) => {
    let isMatchFound = false;

    const autoCancelRideInBackend = async () => {
      try {
        const token = await getAuthToken();
        await fetch(`http://127.0.0.1:8000/api/rides/volunteer/cancel/${rideId}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {}
    };

    const checkRideStatus = async () => {
      if (isMatchFound) return;
      try {
        const token = await getAuthToken();
        const response = await fetch(`http://127.0.0.1:8000/api/rides/${rideId}/status?ride_type=volunteer`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'proposed') {
             isMatchFound = true;
             router.replace({
               pathname: '/volunteer/match-found',
               params: {
                 volunteer_ride_id: rideId,
                 ride_request_id: String(data.ride_request_id),
                 passenger_name: data.passenger_name || 'נוסע חסד',
                 origin: data.origin,
                 destination: data.destination
               }
             });
          }
        }
      } catch (error) {}
    };

    const intervalId = setInterval(checkRideStatus, 1000);
    const timeoutId = setTimeout(() => {
        if (!isMatchFound) {
            clearInterval(intervalId);
            autoCancelRideInBackend();
            setShowTimeoutMessage(true);
        }
    }, 3000);

    return () => { clearInterval(intervalId); clearTimeout(timeoutId); };
  };

  useEffect(() => {
    // 1. מקרה של התאמה קיימת (העברה מהסיכום)
    if (match_found === 'true' && match_details) {
      const timer = setTimeout(() => {
        router.replace({ pathname: '/volunteer/match-found', params: { ...JSON.parse(match_details), volunteer_ride_id } });
      }, 1000);
      return () => clearTimeout(timer);
    }

    // 2. מקרה של יצירת נסיעה חדשה
    if (rideData && !volunteer_ride_id) {
        createRideAndStartPolling(rideData);
        return;
    }

    // 3. מקרה של פוללינג רגיל
    if (volunteer_ride_id) {
        return startPollingFlow(volunteer_ride_id);
    }
  }, [volunteer_ride_id, rideData, match_found, match_details]);

  if (showTimeoutMessage) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={styles.emoji}>❤️</Text>
          <Text style={styles.title}>תודה רבה!</Text>
          <Text style={styles.subtitle}>כל הכבוד על הרצון והלב החם להתנדב! כרגע אין חולה במאגר שזקוק להסעה במסלול זה.</Text>
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/volunteer/volunteer-type')}>
            <Text style={styles.homeBtnText}>חזרה למסך הבית</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>{isCreating ? 'מפרסם את הנסיעה...' : 'מחפשים לך נוסע...'}</Text>
        <Text style={styles.subtitle}>אנא המתן, המערכת מנסה להתאים חולה למסלול שלך ברגעים אלו</Text>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} style={styles.loader} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 20 },
  emoji: { fontSize: 64, marginBottom: 10 },
  title: { ...typography.h2, color: colors.primaryNavy, textAlign: 'center' },
  subtitle: { ...typography.bodySecondary, textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
  loaderContainer: { marginVertical: 40, justifyContent: 'center', alignItems: 'center' },
  loader: { transform: [{ scale: 1.5 }] },
  homeBtn: { backgroundColor: colors.primaryBlue, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, marginTop: 30, width: '100%', alignItems: 'center' },
  homeBtnText: { color: colors.white, fontSize: 16, fontWeight: 'bold' }
});