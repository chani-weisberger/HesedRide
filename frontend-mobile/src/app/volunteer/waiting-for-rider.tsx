// volunteer/waiting-for-rider.tsx — מסך המתנה לאישור הנוסע (צד מתנדב)
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
const AsyncStorage = Platform.OS !== 'web'
  ? require('@react-native-async-storage/async-storage').default
  : null;

export default function VolunteerWaitingForRiderPage() {
  const [isCanceling, setIsCanceling] = useState(false);
  
  // 🔔 השורה הזו נמחקה בטעות – החזרנו אותה כדי שהמחשב יזהה את ה-ID!
  const { volunteer_ride_id } = useLocalSearchParams<{ volunteer_ride_id: string }>();

  // ✨ פונקציית עזר קטנה וחכמה לשליפת הטוקן מבלי לקרוס בדפדפן
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
    // אם אין ID (כי נכנסו לדף ישירות), לא מריצים את הלולאה סתם
    if (!volunteer_ride_id) {
      console.warn("לא נמצא מזהה נסיעה (volunteer_ride_id) תקין במסך ההמתנה");
      return;
    }

    // בדיקה אוטומטית (Polling) מול רחלי כל 4 שניות
    const checkRideStatus = async () => {
      try {
        const token = await getAuthToken(); // ✨ משתמשים בפונקציה המוגנת החדשה
        
        const response = await fetch(`http://127.0.0.1:8000/api/rides/${volunteer_ride_id}/status?ride_type=volunteer`, {
          headers: {
            'Authorization': `Bearer ${token}` // שולחים את הטוקן גם כאן
          }
        });

        if (response.ok) {
          const data = await response.json();

          if (data.status === 'confirmed') {
             clearInterval(intervalId);
             Alert.alert('🎉 הנוסע אישר!', 'נמצאה התאמה והנוסע אישר את הנסיעה.', [
               { text: 'מעולה!', onPress: () => router.replace('/volunteer/volunteer-type') }
             ]);
          }
          // ✨ הוספנו: תנאי עצירה חכם במידה ועבר הזמן ולא נמצא נוסע במערכת!
          else if (data.status === 'no_match_available') {
             clearInterval(intervalId); // עוצרים מיד את הריצה ברקע
             Alert.alert(
               'תודה רבה! ❤️',
               'כל הכבוד על הרצון והלב החם להתנדב! כרגע אין חולה במאגר שזקוק להסעה במסלול זה. נשמח לעמוד בקשר בנסיעות הבאות.',
               [
                 { text: 'חזרה למסך הבית', onPress: () => router.replace('/volunteer/volunteer-type') }
               ]
             );
          }
        }
      } catch (error) {
        console.error("שגיאה בבדיקת הסטטוס מהשרת:", error);
      }
    };

    // מפעילים את הלולאה
    const intervalId = setInterval(checkRideStatus, 4000);
    return () => clearInterval(intervalId); // מנקים כשיוצאים מהמסך
  }, [volunteer_ride_id]);

  // ❌ פונקציית ביטול החיפוש
  const handleCancelSearch = async () => {
    if (!volunteer_ride_id) {
      router.replace('/volunteer/volunteer-type');
      return;
    }

    setIsCanceling(true);
    try {
      const token = await getAuthToken(); // ✨ משתמשים בפונקציה המוגנת החדשה
      
      const response = await fetch(`http://127.0.0.1:8000/api/rides/volunteer/cancel/${volunteer_ride_id}`, {
      method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setIsCanceling(false);
      if (response.ok) {
        Alert.alert('החיפוש בוטל', 'נסיעת ההתנדבות שלך בוטלה בהצלחה.', [
          { text: 'אוקי', onPress: () => router.replace('/volunteer/volunteer-type') }
        ]);
      } else {
        Alert.alert('שגיאה', 'לא הצלחנו לבטל את הנסיעה בשרת כרגע.');
      }
    } catch (error) {
      setIsCanceling(false);
      Alert.alert('שגיאה', 'שגיאת תקשורת בניסיון לבטל את הנסיעה.');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>מחפשים לך נוסע...</Text>
        <Text style={styles.subtitle}>אנא המתן, המערכת מנסה להתאים חולה למסלול שלך ברגעים אלו</Text>

        <View style={styles.loaderContainer}>
          {/* הגלגל המסתובב הגדול שלך! */}
          <ActivityIndicator size="large" color={colors.primaryBlue} style={styles.loader} />
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={handleCancelSearch} 
            disabled={isCanceling}
          >
            {isCanceling ? (
              <ActivityIndicator color={colors.primaryBlue} />
            ) : (
              <Text style={styles.cancelText}>ביטול חיפוש והתנדבות</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 20 },
  title: { ...typography.h2, color: colors.primaryNavy, textAlign: 'center' },
  subtitle: { ...typography.bodySecondary, textAlign: 'center', paddingHorizontal: 20 },
  loaderContainer: { marginVertical: 40, justifyContent: 'center', alignItems: 'center' },
  loader: { transform: [{ scale: 1.5 }] },
  btnGroup: { width: '100%', marginTop: 20 },
  cancelBtn: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.primaryBlue, alignItems: 'center' },
  cancelText: { color: colors.primaryBlue, fontWeight: '600', fontSize: 16 },
});