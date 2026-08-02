import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import * as SecureStore from 'expo-secure-store';

const AsyncStorage =
  Platform.OS !== 'web'
    ? require('@react-native-async-storage/async-storage').default
    : null;

/**
 * VolunteerDashboard executes its corresponding UI or business operation.
 */
export default function VolunteerDashboard() {
  const [firstName, setFirstName] = useState('מתנדב');

  useEffect(() => {
    /**
     * fetchUserName executes its corresponding UI or business operation.
     */
    const fetchUserName = async () => {
      try {
        let storedName: string | null = null;

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
      }
    };

    fetchUserName();
  }, []);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>שלום {firstName}</Text>
          <Text style={styles.subtitle}>
            מוכן/ה לצאת לדרך ולסייע לנוסע שצריך אותך?
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/volunteer/immediate' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>התחל התנדבות</Text>
          <Text style={styles.primaryBtnHint}>חיפוש נוסע בזמן אמת</Text>
        </TouchableOpacity>

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
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  greeting: {
    ...typography.h2,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySecondary,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  primaryBtn: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.primaryBlue,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  primaryBtnHint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  logoutBtn: {
    marginTop: 28,
    padding: 12,
  },
  logoutText: {
    color: colors.error,
    fontSize: 14,
  },
});