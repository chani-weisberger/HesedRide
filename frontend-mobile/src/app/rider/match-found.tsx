// rider/match-found.tsx — מסך נמצא מתנדב (צד נוסע)
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

export default function RiderMatchFoundPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    volunteer_name: string;
    volunteer_phone: string;
    volunteer_car: string;
  }>();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.checkmarkIcon}>✓</Text>
        </View>

        <Text style={styles.title}>נמצא מתנדב!</Text>
        <Text style={styles.subtitle}>המתנדב ממתין לאישורך כדי לצאת לדרך</Text>

        {/* כרטיס פרטי המתנדב המעוצב שלכן */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>פרטי המתנדב</Text>

          <View style={styles.row}>
            <Text style={styles.rowValue}>{params.volunteer_name || 'ישראל ישראלי'}</Text>
            <Text style={styles.rowLabel}>שם</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowValue}>{params.volunteer_phone || '050-1234567'}</Text>
            <Text style={styles.rowLabel}>טלפון</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowValue}>{params.volunteer_car || 'טויוטה קורולה לבנה'}</Text>
            <Text style={styles.rowLabel}>רכב</Text>
          </View>
        </View>

        {/* כפתור הפעולה המרכזי שלכן */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/rider/ride-type')}
        >
          <Text style={styles.buttonText}>✨ אשר נסיעה ופתח גוגל מאפס</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 },
  iconContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1dd1a1', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  checkmarkIcon: { color: colors.white, fontSize: 36, fontWeight: 'bold' },
  title: { ...typography.h1, color: colors.primaryNavy, textAlign: 'center', fontWeight: '700' },
  subtitle: { ...typography.bodySecondary, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  card: { width: '100%', maxWidth: 320, backgroundColor: colors.white, borderRadius: 20, padding: 20, gap: 12, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 }, android: { elevation: 4 }, web: { boxShadow: '0px 4px 16px rgba(0,0,0,0.06)' } }) },
  cardTitle: { ...typography.h3, color: colors.primaryNavy, textAlign: 'center', marginBottom: 8, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.lightCyan },
  rowLabel: { ...typography.label, color: colors.textSecondary },
  rowValue: { ...typography.body, fontWeight: '500', color: colors.primaryNavy },
  primaryButton: { width: '100%', backgroundColor: colors.primaryBlue, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  buttonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 }
});