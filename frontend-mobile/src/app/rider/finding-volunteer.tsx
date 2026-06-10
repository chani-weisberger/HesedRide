import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

export default function RiderFindingVolunteerPage() {
  // 🌟 מושכים את כל הפרמטרים כדי לתפוס את ה-ID לא משנה איך הטופס קרא לו!
  const params = useLocalSearchParams();
  const [debugText, setDebugText] = useState('מחפש מזהה נסיעה במערכת...');

  useEffect(() => {
    // מנסים לשלוף את המזהה מכל השמות האפשריים שהטופס יכול היה לשלוח
    const id = params.ride_request_id || params.id || params.requestId || params.request_id;

    if (!id) {
      setDebugText('❌ שגיאה: הטופס הקודם לא העביר מזהה נסיעה!');
      // הקפצת חלון בולט שאי אפשר לפספס!
      Alert.alert(
        "תקלה בניתוב",
        "מספר הנסיעה חסר! המסך לא יכול לחפש נהג. הבעיה היא במסך הטופס שלא העביר את ה-ID."
      );
      return;
    }

    setDebugText(`מתחיל סריקה ללא הפסקה עבור נסיעה: ${id}`);

    const checkRideStatus = async () => {
      try {
        const url = `http://127.0.0.1:8000/api/rides/${id}/status?ride_type=request&t=${Date.now()}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          setDebugText(`✅ השרת ענה. סטטוס: ${data.status}`);

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
        } else {
          setDebugText(`⚠️ השרת החזיר שגיאה: ${response.status}`);
        }
      } catch (error) {
        setDebugText('❌ נותק הקשר עם השרת.');
      }
    };

    checkRideStatus(); // בדיקה ראשונה מיידית
    const intervalId = setInterval(checkRideStatus, 3000);
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

        {/* טקסט הבקרה שמוכיח לנו מה קורה בלייב */}
        <Text style={{ marginTop: 40, color: '#888', fontSize: 14, textAlign: 'center', fontWeight: 'bold' }}>
          {debugText}
        </Text>
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