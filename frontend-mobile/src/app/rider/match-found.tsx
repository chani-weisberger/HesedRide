import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

export default function RiderMatchFoundPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    ride_request_id: string;
    ride_status: string; 
    volunteer_name: string;
    volunteer_phone: string;
    volunteer_car: string;
  }>();

  const [currentStatus, setCurrentStatus] = useState(params.ride_status || 'proposed');
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/rides/${params.ride_request_id}/status?ride_type=request`);
        if (response.ok) {
          const data = await response.json();
          setCurrentStatus(data.status);
        }
      } catch (error) {
        console.error(error);
      }
    };
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, [params.ride_request_id]);

  const handleRiderConfirm = async () => {
    setIsConfirming(true);
    try {
      // מוצאים את ה-Volunteer ID מהסטטוס
      const statusRes = await fetch(`http://127.0.0.1:8000/api/rides/${params.ride_request_id}/status?ride_type=request`);
      const statusData = await statusRes.json();

      const response = await fetch(`http://127.0.0.1:8000/api/rides/confirm?user_type=rider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteer_ride_id: statusData.volunteer_ride_id,
          ride_request_id: Number(params.ride_request_id)
        })
      });
      if (response.ok) {
        setCurrentStatus('rider_confirmed');
      }
    } catch (error) {
      Alert.alert('שגיאה', 'תקשורת נכשלה');
    } finally {
      setIsConfirming(false);
    }
  };

 const isConfirmed = currentStatus === 'confirmed';
 const hasRiderApproved = currentStatus === 'rider_approved' || currentStatus === 'volunteer_approved';

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: isConfirmed ? '#2ed573' : '#ffa502' }]}>
          <Text style={styles.checkmarkIcon}>{isConfirmed ? '✓' : '⏰'}</Text>
        </View>

        <Text style={styles.title}>{isConfirmed ? 'המתנדב בדרך אליך!' : 'נמצא מתנדב עבורך!'}</Text>
        <Text style={styles.subtitle}>
          {isConfirmed ? 'נסיעת החסד אושרה סופית על ידי שניכם!' : hasRiderApproved ? 'אישרת מצידך! ממתין לאישור סופי מהמתנדב...' : 'המתנדב ממתין לאישורך המקביל כדי לצאת לדרך'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>פרטי הנהג והרכב</Text>
          <View style={styles.row}>
            <Text style={styles.rowValue}>{params.volunteer_name}</Text>
            <Text style={styles.rowLabel}>שם המתנדב</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowValue}>{params.volunteer_phone}</Text>
            <Text style={styles.rowLabel}>טלפון</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowValue}>{params.volunteer_car}</Text>
            <Text style={styles.rowLabel}>רכב</Text>
          </View>
        </View>

        {!isConfirmed && !hasRiderApproved && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleRiderConfirm} disabled={isConfirming}>
            {isConfirming ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🤝 אשר נסיעה חגיגית ויציאה לדרך</Text>}
          </TouchableOpacity>
        )}

        {isConfirmed && (
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#2ed573' }]} onPress={() => router.replace('/rider/ride-type')}>
            <Text style={styles.buttonText}>חזרה למסך הבית</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 },
  iconContainer: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  checkmarkIcon: { color: colors.white, fontSize: 32, fontWeight: 'bold' },
  title: { ...typography.h1, color: colors.primaryNavy, textAlign: 'center', fontWeight: '700' },
  subtitle: { ...typography.bodySecondary, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  card: { width: '100%', maxWidth: 320, backgroundColor: colors.white, borderRadius: 20, padding: 20, gap: 12, boxShadow: '0px 4px 16px rgba(0,0,0,0.06)' },
  cardTitle: { ...typography.h3, color: colors.primaryNavy, textAlign: 'center', marginBottom: 8, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.lightCyan },
  rowLabel: { ...typography.label, color: colors.textSecondary },
  rowValue: { ...typography.body, fontWeight: '500', color: colors.primaryNavy },
  primaryButton: { width: '100%', backgroundColor: colors.primaryBlue, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  buttonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 }
});