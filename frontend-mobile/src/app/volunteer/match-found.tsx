// volunteer/match-found.tsx — מסך נמצאה התאמה למתנדב (צד מתנדב)
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Linking, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';

export default function MatchFoundPage() {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  // שליפת נתוני הנוסע שהעברנו ממסך ה-ride-summary
  const params = useLocalSearchParams<{
    passenger_name: string;
    origin: string;
    destination: string;
    ride_request_id: string;
    volunteer_ride_id: string;
  }>();

  const passengerName = params.passenger_name || 'נוסע חסד';
  const origin = params.origin || 'לא צוין מיקום';
  const destination = params.destination || 'לא צוין יעד';

  // ✨ פונקציית האישור האמיתית מול השרת של רחלי!
  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/rides/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          volunteer_ride_id: Number(params.volunteer_ride_id),
          ride_request_id: Number(params.ride_request_id)
        })
      });

      const data = await response.json();
      setIsConfirming(false);

      if (response.ok && data.status === 'success') {
        // 🎉 הצלחה! הנסיעה מאושרת בדאטה-בייס. מציגים את פרטי הקשר והניווט
        Alert.alert(
          '🎉 הנסיעה אושרה סופית!',
          `השידוך עם ${passengerName} הושלם בהצלחה.\n📞 טלפון לחזרה: ${data.patient_phone || 'לא צוין'}`,
          [
            {
              text: '🗺️ צא לדרך (פתח ניווט)',
              onPress: () => {
                // שליחת המתנדב ישירות לקישור הניווט שנוצר בבקאנד (Waze / Google Maps)
                if (data.waze_route_url) {
                  Linking.openURL(data.waze_route_url);
                } else {
                  Alert.alert('שים לב', 'לא נמצא קישור ניווט תקין, אך הנסיעה רשומה.');
                }
                router.replace('/volunteer/volunteer-type');
              }
            },
            {
              text: 'סגור',
              onPress: () => router.replace('/volunteer/volunteer-type')
            }
          ]
        );
      } else {
        Alert.alert('שגיאה', data.message || 'לא הצלחנו לאשר את הנסיעה בשרת כרגע.');
      }
    } catch (error) {
      setIsConfirming(false);
      console.error("Error confirming ride:", error);
      Alert.alert('שגיאה', 'שגיאת תקשורת בניסיון לאשר את הנסיעה סופית.');
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowValue}>{value}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>

        {/* כותרת חגיגית בשפת המותג */}
        <Text style={styles.title}>נמצאה לך התאמה! 🎉</Text>
        <Text style={styles.subtitle}>מתנדב יקר, נמצא נוסע במסלול שלך</Text>

        <View style={common.divider} />

        {/* כרטיס פרטי הנוסע - משתמש ב-common.card המקורי שלכן */}
        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי הנוסע והמסלול</Text>

          <InfoRow label="שם החולה" value={passengerName} />
          <InfoRow label="נקודת איסוף" value={origin} />
          <InfoRow label="יעד נסיעה" value={destination} />
        </View>

        {/* כפתורי פעולה */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={common.buttonPrimary}
            onPress={handleConfirm}
            disabled={isConfirming}
            activeOpacity={0.8}
          >
            {isConfirming ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={common.buttonTextPrimary}>אישור נסיעה ויציאה לדרך 🤝</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => router.replace('/volunteer/volunteer-type')}>
            <Text style={styles.cancelText}>ביטול וחזרה למסך הבית</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  title: { ...typography.h2, textAlign: 'center', color: colors.primaryNavy },
  subtitle: { ...typography.bodySecondary, textAlign: 'center', marginTop: 4 },
  sectionTitle: { ...typography.h3, marginBottom: 16, color: colors.primaryNavy },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.lightCyan 
  },
  rowLabel: { ...typography.label, color: colors.textSecondary },
  rowValue: { ...typography.body, fontWeight: '500' },
  btnGroup: { gap: 12, marginTop: 16 },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: { color: '#e53e3e', fontSize: 14, fontWeight: '500' },
});