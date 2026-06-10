// volunteer/match-found.tsx — מסך נמצאה התאמה + נסיעה פעילה
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Linking, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';

export default function MatchFoundPage() {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRideActive, setIsRideActive] = useState(false); // ✨ מצב חדש: הנסיעה פעילה ויצאה לדרך!
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);
  const [passengerPhone, setPassengerPhone] = useState<string>('');

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

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/rides/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteer_ride_id: Number(params.volunteer_ride_id),
          ride_request_id: Number(params.ride_request_id)
        })
      });

      const data = await response.json();
      setIsConfirming(false);

      if (response.ok && data.status === 'success') {
        // 🎉 הצלחה! במקום אלרט מעצבן, מעבירים את המסך למצב "נסיעה פעילה"
        setNavigationUrl(data.waze_route_url || null);
        setPassengerPhone(data.patient_phone || 'לא צוין');
        setIsRideActive(true);
      } else {
        Alert.alert('שגיאה', data.message || 'לא הצלחנו לאשר את הנסיעה.');
      }
    } catch (error) {
      setIsConfirming(false);
      Alert.alert('שגיאה', 'שגיאת תקשורת באישור הנסיעה.');
    }
  };

  const handleOpenNavigation = () => {
    if (navigationUrl) {
      if (Platform.OS === 'web') {
        window.open(navigationUrl, '_blank'); // פתיחה חלקה ב-Web ללא חוסם פופ-אפים!
      } else {
        Linking.openURL(navigationUrl);
      }
    } else {
      Alert.alert('שים לב', 'לא נמצא קישור ניווט תקין.');
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowValue}>{value}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );

  // 🌟 מסך ב': המתנדב אישר והוא רשמית בדרך אל המטופל!
  if (isRideActive) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={styles.successBadge}>✓ נסיעה פעילה</Text>
          <Text style={styles.title}>אתה בדרך אל {passengerName}! 🚗</Text>
          <Text style={styles.subtitle}>תודה על חסד עצום! פרטי הנסיעה והניווט זמינים עבורך כעת:</Text>

          <View style={common.card}>
            <Text style={styles.sectionTitle}>פרטי קשר ואיסוף</Text>
            <InfoRow label="טלפון לתיאום" value={passengerPhone} />
            <InfoRow label="נקודת איסוף" value={origin} />
            <InfoRow label="יעד חולה" value={destination} />
          </View>

          <View style={styles.btnGroup}>
            <TouchableOpacity
              style={[common.buttonPrimary, { backgroundColor: '#2ed573' }]}
              onPress={handleOpenNavigation}
            >
              <Text style={common.buttonTextPrimary}>🗺️ פתח מפת ניווט (Waze / גוגל)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.replace('/volunteer/volunteer-type')}
            >
              <Text style={{ color: colors.primaryBlue, fontWeight: '500' }}>סיום וחזרה למסך הבית</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  // 🌟 מסך א': נמצאה התאמה, ממתין לאישור המתנדב (הסטטוס המקורי)
  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>נמצאה לך התאמה! 🎉</Text>
        <Text style={styles.subtitle}>מתנדב יקר, נמצא נוסע במסלול שלך</Text>
        <View style={common.divider} />

        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי הנוסע והמסלול</Text>
          <InfoRow label="שם החולה" value={passengerName} />
          <InfoRow label="נקודת איסוף" value={origin} />
          <InfoRow label="יעד נסיעה" value={destination} />
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity style={common.buttonPrimary} onPress={handleConfirm} disabled={isConfirming}>
            {isConfirming ? <ActivityIndicator color={colors.white} /> : <Text style={common.buttonTextPrimary}>אישור נסיעה ויציאה לדרך 🤝</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.replace('/volunteer/volunteer-type')}>
            <Text style={styles.cancelText}>ביטול וחזרה למסך הבית</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  successBadge: { backgroundColor: '#e1f7ec', color: '#2ed573', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, fontWeight: 'bold', alignSelf: 'center', fontSize: 14, marginBottom: -8 },
  title: { ...typography.h2, textAlign: 'center', color: colors.primaryNavy },
  subtitle: { ...typography.bodySecondary, textAlign: 'center', marginTop: 4 },
  sectionTitle: { ...typography.h3, marginBottom: 16, color: colors.primaryNavy },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.lightCyan },
  rowLabel: { ...typography.label, color: colors.textSecondary },
  rowValue: { ...typography.body, fontWeight: '500' },
  btnGroup: { gap: 12, marginTop: 16 },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: { color: '#e53e3e', fontSize: 14, fontWeight: '500' },
});