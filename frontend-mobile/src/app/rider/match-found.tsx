// rider/match-found.tsx — דף אישור התאמה וניווט (צד נוסע)
// משלב את העיצוב של ללי + הפרוטוקול של חני ורחלי לגוגל מאפס
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';

export default function MatchFoundPage() {
  const [isLoading, setIsLoading] = useState(false);

  // 1. שליפת הפרמטרים הדינמיים שהשרת של חני מעביר (מזהים + פרטי מתנדב)
  const params = useLocalSearchParams<{ 
    volunteer_ride_id: string; 
    ride_request_id: string;
    volunteer_name?: string;
    volunteer_phone?: string;
    volunteer_car?: string;
  }>();

  // שימוש בנתונים של חני, עם גיבוי לנתונים המקוריים של ללי
  const volunteerName = params.volunteer_name || 'ישראל ישראלי';
  const volunteerPhone = params.volunteer_phone || '050-1234567';
  const volunteerCar = params.volunteer_car || 'טויוטה קורולה לבנה';

  // 2. פונקציית האישור הסופית של חני + פתיחת גוגל מאפס לפי בקשת רחלי
  const handleConfirmAndNavigate = async () => {
    setIsLoading(true);
    
    try {
      // כאן בעתיד תתבצע בקשת ה-POST לנתיב של חני: http://127.0.0.1:8000/api/rides/confirm
      // עם הנתונים: volunteer_ride_id ו-ride_request_id
      
      setTimeout(() => {
        setIsLoading(false);
        
        // הלינק של גוגל מאפס שיגיע מחני (כאן שמנו לינק לבדיקה)
        const googleMapsUrl = "https://maps.google.com"; 

        Alert.alert(
          'הנסיעה אושרה סופית! 🎉',
          'ההודעה נשלחה למתנדב והוא בדרך אליך.',
          [
            { 
              text: 'פתח ניווט ב-Google Maps 🗺️', 
              onPress: () => Linking.openURL(googleMapsUrl).catch(() => alert('לא ניתן לפתוח את המפה'))
            },
            { 
              text: 'סגור', 
              onPress: () => router.replace('/') 
            }
          ]
        );
      }, 1200);

    } catch (error) {
      setIsLoading(false);
      Alert.alert('שגיאה', 'לא ניתן לאשר את הנסיעה כרגע');
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>

        {/* האייקון הירוק המהמם של ללי */}
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>נמצא מתנדב!</Text>
        <Text style={styles.subtitle}>המתנדב ממתין לאישורך כדי לצאת לדרך</Text>

        <View style={common.divider} />

        {/* כרטיס פרטי המתנדב של ללי - מעודכן לנתונים דינמיים */}
        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי המתנדב</Text>

          <View style={styles.row}>
            <Text style={styles.rowValue}>{volunteerName}</Text>
            <Text style={styles.rowLabel}>שם</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowValue}>{volunteerPhone}</Text>
            <Text style={styles.rowLabel}>טלפון</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowValue}>{volunteerCar}</Text>
            <Text style={styles.rowLabel}>רכב</Text>
          </View>
        </View>

        {/* הכפתור המרכזי המשודרג: אישור סופי ופתיחת מפות גוגל של רחלי */}
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirmAndNavigate}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.confirmBtnText}>✨ אשר נסיעה ופתח גוגל מאפס</Text>
          )}
        </TouchableOpacity>

        {/* חזרה לדף הבית של ללי */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.homeBtnText}>חזרה לדף הבית</Text>
        </TouchableOpacity>

      </View>
    </ScreenWrapper>
  );
}

// שמרנו על כל הסטייל המקורי והמדויק של ללי!
const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tealAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 40,
    color: colors.white,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    color: colors.primaryNavy,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
    width: '100%',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightCyan,
    width: '100%',
  },
  rowLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.body,
    fontWeight: '500',
  },
  // עדכון קטן לעיצוב הכפתור כדי שיתאים לגוגל מאפס במקום וויז
  confirmBtn: {
    width: '100%',
    backgroundColor: colors.primaryBlue, // החלפנו לכחול המותג שלכן במקום התכלת של וויז
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  homeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});