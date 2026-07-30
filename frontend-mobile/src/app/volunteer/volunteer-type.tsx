import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';
import * as SecureStore from 'expo-secure-store';

const AsyncStorage = Platform.OS !== 'web'
  ? require('@react-native-async-storage/async-storage').default
  : null;

// השארנו רק את אפשרות התנדבות בזמן אמת
const VOLUNTEER_OPTIONS = [
  {
    id: 'immediate',
    title: 'התנדבות עכשיו',
    desc: 'אני פנוי/ה לסייע ברגע זה',
    emoji: '⚡',
    bgColor: '#fef3c7',
    route: '/volunteer/immediate',
  }
];

export default function VolunteerDashboard() {
  const [firstName, setFirstName] = useState('מתנדב');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        let storedName = null;

        if (Platform.OS === 'web') {
          storedName = localStorage.getItem('userName');
        } else {
          try {
            storedName = await SecureStore.getItemAsync('userName');
          } catch (e) {
            if (AsyncStorage) {
              storedName = await AsyncStorage.getItem('userName');
            }
          }
        }

        if (storedName) {
          const first = storedName.trim().split(/\s+/)[0];
          setFirstName(first);
        }
      } catch (error) {
        console.log("Error fetching user name:", error);
      }
    };

    fetchUserName();
  }, []);

  return (
    <ScreenWrapper>
      <View style={styles.container}>

        <View style={styles.header}>
          <Text style={typography.h2}>שלום {firstName}!</Text>
          <Text style={[typography.bodySecondary, styles.subtitle]}>
            מוכן/ה להתנדב עכשיו?
          </Text>
        </View>

        <View style={common.divider} />

        <View style={styles.list}>
          {VOLUNTEER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionBtn}
              onPress={() => router.push(option.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, { backgroundColor: option.bgColor }]}>
                <Text style={styles.emoji}>{option.emoji}</Text>
              </View>

              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDesc}>{option.desc}</Text>
              </View>

              <Text style={styles.arrow}>←</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            if (Platform.OS === 'web') {
              localStorage.clear();
            }
            router.replace('/');
          }}
        >
          <Text style={styles.logoutText}>יציאה מהמערכת</Text>
        </TouchableOpacity>

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 8 },
  subtitle: { marginTop: 6, textAlign: 'center' },
  list: { gap: 12, marginBottom: 24 },
  optionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.lightCyan,
    backgroundColor: colors.white,
  },
  iconWrap: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  optionText: { flex: 1, alignItems: 'flex-end' },
  optionTitle: { fontSize: 16, fontWeight: '500', color: colors.primaryNavy },
  optionDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 18, color: colors.textHint },
  logoutBtn: { alignItems: 'center', padding: 12 },
  logoutText: { color: colors.error, fontSize: 14 },
});