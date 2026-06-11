import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

export default function RiderMatchFoundPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ volunteer_name: string; volunteer_phone: string; volunteer_car: string; }>();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: '#2ed573' }]}>
          <Text style={styles.checkmarkIcon}>✓</Text>
        </View>

        <Text style={styles.title}>המתנדב בדרך אליך!</Text>
        <Text style={styles.subtitle}>נסיעת החסד אושרה והמתנדב יצא לכיוונך.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>פרטי הנהג והרכב</Text>
          <View style={styles.row}>
            <Text style={styles.rowValue}>{params.volunteer_name}</Text>
            <Text style={styles.rowLabel}>שם</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowValue}>{params.volunteer_phone}</Text>
            <Text style={styles.rowLabel}>טלפון</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#2ed573' }]} onPress={() => router.replace('/rider/ride-type')}>
          <Text style={styles.buttonText}>הבנתי, חזרה למסך הבית</Text>
        </TouchableOpacity>
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