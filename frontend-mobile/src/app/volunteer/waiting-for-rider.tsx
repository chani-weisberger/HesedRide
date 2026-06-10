// volunteer/waiting-for-rider.tsx — מסך המתנה לאישור הנוסע (צד מתנדב)
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
const AsyncStorage = Platform.OS !== 'web'
  ? require('@react-native-async-storage/async-storage').default
  : null;

export default function VolunteerWaitingForRiderPage() {
  const { volunteer_ride_id } = useLocalSearchParams<{ volunteer_ride_id: string }>();
  // משתנה חדש ששולט האם להציג את מסך התודה במקום את הגלגל
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  const getAuthToken = async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('userToken');
    } else {
      try {
        let token = await SecureStore.getItemAsync('userToken');
        if (!token && AsyncStorage) token = await AsyncStorage.getItem('userToken');
        return token;
      } catch (error) {
        console.log("SecureStore error, falling back to AsyncStorage");
        return AsyncStorage ? await AsyncStorage.getItem('userToken') : null;
      }
    }
  };

  useEffect(() => {
    if (!volunteer_ride_id) {
      console.warn("לא נמצא מזהה נסיעה (volunteer_ride_id) תקין במסך ההמתנה");
      return;
    }

    let isMatchFound = false;

    // פונקציה שמבטלת את הנסיעה בשרת מאחורי הקלעים
    const autoCancelRideInBackend = async () => {
      try {
        const token = await getAuthToken();
        await fetch(`http://127.0.0.1:8000/api/rides/volunteer/cancel/${volunteer_ride_id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("נסיעת ההתנדבות בוטלה אוטומטית בשרת");
      } catch (error) {
        console.error("שגיאה בביטול אוטומטי של הנסיעה:", error);
      }
    };

    const checkRideStatus = async () => {
      if (isMatchFound) return;
      try {
        const token = await getAuthToken();

        const response = await fetch(`http://127.0.0.1:8000/api/rides/${volunteer_ride_id}/status?ride_type=volunteer`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();

          if (data.status === 'proposed') {
             isMatchFound = true;
             clearInterval(intervalId);
             clearTimeout(timeoutId);

             router.replace({
               pathname: '/volunteer/match-found',
               params: {
                 volunteer_ride_id: volunteer_ride_id,
                 ride_request_id: String(data.ride_request_id),
                 passenger_name: data.passenger_name || 'נוסע חסד',
                 origin: data.origin,
                 destination: data.destination
               }
             });
          }
          else if (data.status === 'confirmed') {
             isMatchFound = true;
             clearInterval(intervalId);
             clearTimeout(timeoutId);
             if (Platform.OS === 'web') {
               window.alert('🎉 הנסיעה מאושרת! נמצאה התאמה והנסיעה אושרה.');
               router.replace('/volunteer/volunteer-type');
             } else {
               Alert.alert('🎉 הנסיעה מאושרת!', 'נמצאה התאמה והנסיעה אושרה.', [
                 { text: 'מעולה!', onPress: () => router.replace('/volunteer/volunteer-type') }
               ]);
             }
          }
        }
      } catch (error) {
        console.error("שגיאה בבדיקת הסטטוס מהשרת:", error);
      }
    };

    const intervalId = setInterval(checkRideStatus, 2000);
    checkRideStatus();

    // פונקציית סיום הזמן - עכשיו משנה את המסך במקום להקפיץ Alert
    const handleTimeout = () => {
      if (!isMatchFound) {
        clearInterval(intervalId);
        autoCancelRideInBackend(); // מבטלים בשרת
        setShowTimeoutMessage(true); // מפעילים את מסך התודה המעוצב!
      }
    };

    const timeoutId = setTimeout(handleTimeout, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [volunteer_ride_id]);

  // אם עברו 5 שניות, נציג את המסך הזה במקום את הגלגל שמסתובב
  if (showTimeoutMessage) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={styles.emoji}>❤️</Text>
          <Text style={styles.title}>תודה רבה!</Text>
          <Text style={styles.subtitle}>
            כל הכבוד על הרצון והלב החם להתנדב! כרגע אין חולה במאגר שזקוק להסעה במסלול זה. נשמח לעמוד בקשר בנסיעות הבאות.
          </Text>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/volunteer/volunteer-type')}
          >
            <Text style={styles.homeBtnText}>חזרה למסך הבית</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  // המסך הרגיל שמוצג במהלך ה-5 שניות הראשונות
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>מחפשים לך נוסע...</Text>
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
  homeBtn: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 30,
    width: '100%',
    alignItems: 'center'
  },
  homeBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold'
  }
});