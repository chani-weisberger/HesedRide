import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Linking, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';

export default function MatchFoundPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ passenger_name: string; origin: string; destination: string; ride_request_id: string; volunteer_ride_id: string; }>();

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);
  const [passengerPhone, setPassengerPhone] = useState<string>('');

  const handleVolunteerConfirm = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/rides/confirm?user_type=volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteer_ride_id: Number(params.volunteer_ride_id),
          ride_request_id: Number(params.ride_request_id)
        })
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setNavigationUrl(data.navigation_url || null);
        setPassengerPhone(data.patient_phone || '058-4657588');
        setIsConfirmed(true);
      } else {
         Alert.alert('שגיאה', 'לא ניתן לאשר את הנסיעה');
      }
    } catch (error) {
      Alert.alert('שגיאה', 'שגיאת תקשורת');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOpenNavigation = () => {
    if (navigationUrl) {
      if (Platform.OS === 'web') window.open(navigationUrl, '_blank');
      else Linking.openURL(navigationUrl);
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowValue}>{value}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {isConfirmed && <Text style={styles.successBadge}>✓ נסיעה פעילה</Text>}
        <Text style={styles.title}>{isConfirmed ? `אתה בדרך אל ${params.passenger_name}! 🚗` : 'נמצאה לך התאמה! 🎉'}</Text>
        <Text style={styles.subtitle}>
          {isConfirmed ? 'תודה על חסד עצום! הניווט פתוח עבורך:' : 'מתנדב יקר, נמצא נוסע במסלול שלך'}
        </Text>

        <View style={common.card}>
          <Text style={styles.sectionTitle}>פרטי הנסיעה</Text>
          <InfoRow label="שם החולה" value={params.passenger_name || 'נוסע חסד'} />
          {isConfirmed && <InfoRow label="טלפון לתיאום" value={passengerPhone} />}
          <InfoRow label="נקודת איסוף" value={params.origin || ''} />
          <InfoRow label="יעד נסיעה" value={params.destination || ''} />
        </View>

        <View style={styles.btnGroup}>
          {!isConfirmed ? (
            <TouchableOpacity style={common.buttonPrimary} onPress={handleVolunteerConfirm} disabled={isConfirming}>
              {isConfirming ? <ActivityIndicator color="#fff" /> : <Text style={common.buttonTextPrimary}>אישור נסיעה ויציאה לדרך 🤝</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[common.buttonPrimary, { backgroundColor: '#4285F4', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
              onPress={handleOpenNavigation}
            >
              <Image
                source={{ uri: 'https://img.icons8.com/color/48/000000/google-maps-new.png' }}
                style={{ width: 26, height: 26, marginLeft: 10 }}
                resizeMode="contain"
              />
              <Text style={common.buttonTextPrimary}>פתח ניווט ב-Google Maps</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.replace('/volunteer/volunteer-type')}>
            <Text style={{ color: colors.primaryBlue, fontWeight: '500' }}>חזרה למסך הבית</Text>
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
});