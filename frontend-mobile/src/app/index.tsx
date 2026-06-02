// index.tsx — דף הפתיחה של HesedRide
// הדף הראשון שהמשתמש רואה

import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { common } from '@/styles/common';

export default function WelcomePage() {
  return (
    <ScreenWrapper>
      <View style={styles.container}>

        {/* לוגו */}
        <View style={styles.logoArea}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>למען האחר. בדרך שלך.</Text>
        </View>

        <View style={common.divider} />

        <Text style={styles.question}>כיצד נוכל לעזור היום?</Text>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={common.buttonPrimary}
            onPress={() => router.push('/volunteer/login')}//עובר לדף לוגאין של המתנדב
            activeOpacity={0.8}
          >
            <Text style={common.buttonTextPrimary}>אני מתנדב</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={common.buttonSecondary}
            onPress={() => router.push('/rider/ride-type')}
            activeOpacity={0.8}
          >
            <Text style={common.buttonTextSecondary}>אני נוסע</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    height: 80,
    width: 240,
  },
  tagline: {
    ...typography.bodySecondary,
    color: colors.primaryBlue,
    marginTop: 8,
  },
  question: {
    ...typography.h3,
    marginBottom: 28,
    textAlign: 'center',
  },
  btnGroup: {
    width: '100%',
    gap: 12,
  },
});