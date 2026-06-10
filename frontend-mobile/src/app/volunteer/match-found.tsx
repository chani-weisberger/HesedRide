// volunteer/match-found.tsx — מסך נמצאה התאמה למתנדב (צד מתנדב)
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';

export default function MatchFoundPage() {
  const router = useRouter();
  
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

  const handleConfirm = () => {
    // מעבר למסך ההמתנה המעודכן (משימה 3) + העברת המזהים בשביל הלינק של גוגל מאפס
    router.replace({
      pathname: '/volunteer/waiting-for-rider',
      params: {
        volunteer_ride_id: params.volunteer_ride_id,
        ride_request_id: params.ride_request_id
      }
    });
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

        {/* כפתורי פעולה בסגנון שלכן - מתוקן מ-div ל-View! */}
        <View style={styles.btnGroup}>
          <TouchableOpacity 
            style={common.buttonPrimary} 
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={common.buttonTextPrimary}>אישור נסיעה והמתנה לנוסע 🤝</Text>
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