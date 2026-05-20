// finding-volunteer.tsx — דף חיפוש מתנדב
// מציג אנימציה של חיפוש ומאפשר ביטול

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';

// כמה שניות לבדוק אם נמצא מתנדב
const POLLING_INTERVAL = 5000; // כל 5 שניות

export default function FindingVolunteerPage() {

  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const [isCancelled, setIsCancelled] = useState(false);

  // ======= אנימציה =======
  // useRef — שומר על ערך בין רינדורים בלי לגרום לרינדור מחדש
  const rotation = useRef(new Animated.Value(0)).current;

  // הפעלת אנימציה סיבובית אינסופית
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // המרת ערך האנימציה לזווית סיבוב
  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ======= בדיקה אם נמצא מתנדב (Polling) =======
  // Polling = בדיקה חוזרת כל X שניות
  useEffect(() => {
    if (isCancelled) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/rides/${rideId}/status`
        );
        const data = await response.json();

        // אם נמצא מתנדב — עוברים לדף האישור
        if (data.status === 'matched') {
          clearInterval(interval);
          router.replace({
            pathname: '/rider/match-found' as any,
            params: { rideId },
          });
        }
      } catch (error) {
        console.log('שגיאה בבדיקת סטטוס');
      }
    }, POLLING_INTERVAL);

    // cleanup — עוצר את הבדיקה כשיוצאים מהדף
    return () => clearInterval(interval);
  }, [isCancelled]);

  // ======= ביטול חיפוש =======
  const handleCancel = () => {
    Alert.alert(
      'ביטול חיפוש',
      'האם את בטוחה שברצונך לבטל את הבקשה?',
      [
        { text: 'לא', style: 'cancel' },
        {
          text: 'כן, בטל',
          style: 'destructive',
          onPress: async () => {
            setIsCancelled(true);
            // TODO: שליחת בקשת ביטול לשרת
            // await cancelRide(rideId);
            router.replace('/');
          },
        },
      ]
    );
  };

  // ======= ממשק =======
  return (
    <ScreenWrapper>
      <View style={styles.container}>

        {/* אנימציית חיפוש */}
        <View style={styles.animationArea}>
          <Animated.View
            style={[
              styles.circle,
              { transform: [{ rotate: spin }] }
            ]}
          />
          <View style={styles.centerText}>
            <Text style={styles.searchTitle}>מחפש מתנדב</Text>
            <Text style={styles.searchSubtitle}>אנא המתן...</Text>
          </View>
        </View>

        {/* מידע על הנסיעה */}
        <View style={common.card}>
          <Text style={styles.infoText}>הבקשה שלך נשלחה בהצלחה</Text>
          <Text style={styles.infoSubText}>
            המערכת מחפשת מתנדב שנמצא על המסלול שלך
          </Text>
        </View>

        {/* כפתור ביטול */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>ביטול חיפוש</Text>
        </TouchableOpacity>

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  animationArea: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: colors.primaryBlue,
    borderTopColor: colors.tealAccent,
    borderRightColor: 'transparent',
  },
  centerText: {
    alignItems: 'center',
  },
  searchTitle: {
    ...typography.h2,
    color: colors.primaryNavy,
  },
  searchSubtitle: {
    ...typography.bodySecondary,
    marginTop: 4,
  },
  infoText: {
    ...typography.body,
    textAlign: 'center',
    fontWeight: '500',
  },
  infoSubText: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  cancelText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '500',
  },
});