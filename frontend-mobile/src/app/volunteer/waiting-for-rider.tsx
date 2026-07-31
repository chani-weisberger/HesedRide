import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    View,
    Platform,
    TouchableOpacity,
    Modal
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

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
  const isCancelledRef = useRef(false);

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

      const data = await response.json();
      setIsCreating(false);

      if (data.match_found) {
          router.replace({
              pathname: '/volunteer/match-found',
              params: { ...data.match_details, volunteer_ride_id: data.volunteer_ride_id }
          });
      } else {
          // מפעילים את הפוללינג המבוקר אם לא נמצאה התאמה על השנייה הראשונה
          startPollingFlow(data.volunteer_ride_id);
      }
    } catch (e) {
      Alert.alert('שגיאה', 'בעיית תקשורת');
      router.back();
    }
  };

  const startPollingFlow = (rideId: string) => {
    let isMatchFound = false;

    // הפונקציה שהופכת אותו ל-cancelled אם נגמר הזמן
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
      if (isMatchFound || isCancelledRef.current) return;
      try {
        const token = await getAuthToken();
        const response = await fetch(`http://127.0.0.1:8000/api/rides/${rideId}/status?ride_type=volunteer`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();

          if (data.status === 'cancelled') {
            isCancelledRef.current = true;
            clearInterval(intervalId);
            return;
          }

          if (data.status === 'proposed') {
             isMatchFound = true;
             clearInterval(intervalId);
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

    // חלון זמן ריאלי של 15 שניות לחפש התאמה. אם אין, מבטלים ומקפיצים מודאל.
    const timeoutId = setTimeout(() => {
        if (!isMatchFound) {
            isCancelledRef.current = true;
            clearInterval(intervalId);
            autoCancelRideInBackend(); // הופך ל-cancelled בשרת
            setShowTimeoutMessage(true); // מקפיץ את המודאל לפי השאיפה שלך
        }
    }, 15000);

    return () => { clearInterval(intervalId); clearTimeout(timeoutId); };
  };

  useEffect(() => {
    if (match_found === 'true' && match_details) {
      const timer = setTimeout(() => {
        router.replace({ pathname: '/volunteer/match-found', params: { ...JSON.parse(match_details), volunteer_ride_id } });
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (rideData && !volunteer_ride_id) {
        createRideAndStartPolling(rideData);
        return;
    }

    if (volunteer_ride_id) {
        return startPollingFlow(volunteer_ride_id);
    }
  }, [volunteer_ride_id, rideData, match_found, match_details]);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>{isCreating ? 'מפרסם את הנסיעה...' : 'מחפשים לך נוסע...'}</Text>
        <Text style={styles.subtitle}>אנא המתן, המערכת מנסה להתאים חולה למסלול שלך ברגעים אלו</Text>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} style={styles.loader} />
        </View>
      </View>

      <Modal
        visible={showTimeoutMessage}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.emoji}>❤️</Text>
            <Text style={styles.modalTitle}>תודה רבה!</Text>
            <Text style={styles.modalSubtitle}>כל הכבוד על הרצון והלב החם להתנדב! כרגע אין חולה במאגר שזקוק להסעה במסלול זה.</Text>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => router.replace('/volunteer/volunteer-type')}
            >
              <Text style={styles.homeBtnText}>חזרה למסך הבית</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 20 },
  title: { ...typography.h2, color: colors.primaryNavy, textAlign: 'center' },
  subtitle: { ...typography.bodySecondary, textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
  loaderContainer: { marginVertical: 40, justifyContent: 'center', alignItems: 'center' },
  loader: { transform: [{ scale: 1.5 }] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.white, padding: 30, borderRadius: 16, alignItems: 'center', width: '100%', maxWidth: 400 },
  emoji: { fontSize: 50, marginBottom: 15 },
  modalTitle: { ...typography.h2, color: colors.primaryNavy, textAlign: 'center', marginBottom: 10 },
  modalSubtitle: { ...typography.bodySecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  homeBtn: { backgroundColor: colors.primaryBlue, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center' },
  homeBtnText: { color: colors.white, fontSize: 16, fontWeight: 'bold' }
});