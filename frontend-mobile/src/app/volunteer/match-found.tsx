import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Linking, ActivityIndicator, Platform, Image, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';

export default function MatchFoundPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ passenger_name: string; origin: string; destination: string; ride_request_id: string; volunteer_ride_id: string; }>();

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);
  const [passengerPhone, setPassengerPhone] = useState<string>('');
  const [isExpiredModalVisible, setIsExpiredModalVisible] = useState(false);

  // סטייטים למודאל המעוצב של ביטול הבקשה מצד הנוסע + טיימר למתנדב
  const [isCancelledByRiderModalVisible, setIsCancelledByRiderModalVisible] = useState(false);
  const [riderCancelMessage, setRiderCancelMessage] = useState('');
  const [volunteerCountdown, setVolunteerCountdown] = useState(30);
  const volunteerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // משתנה עזר שמסמן אם אנחנו עוזבים את המסך בצורה חוקית (למשל, כבר לחצנו "חזרה למסך הבית")
  const isLeavingLegally = useRef(false);

  const cancelRideOnServer = async () => {
    if (!params.volunteer_ride_id || isConfirmed) return;
    try {
      if (Platform.OS === 'web') {
        navigator.sendBeacon(`http://127.0.0.1:8000/api/rides/volunteer/cancel/${params.volunteer_ride_id}`);
      } else {
        await fetch(`http://127.0.0.1:8000/api/rides/volunteer/cancel/${params.volunteer_ride_id}`, {
          method: 'PATCH',
        });
      }
    } catch (error) {
      console.log('Cancel error:', error);
    }
  };

  // ========================================================
  // טיפול בחזרה אחורה – כמו כפתור "חזרה למסך הבית"
  // ========================================================
  const handleAttemptLeave = () => {
    if (isLeavingLegally.current) return;
    isLeavingLegally.current = true;

    // מבטלים בשרת (רק אם עוד לא אושר)
    cancelRideOnServer();

    // מחזירים למסך הבית
    router.replace('/volunteer/volunteer-type');
  };

  useEffect(() => {
    // 1. אנדרואיד
    const onBackPress = () => {
      if (isLeavingLegally.current) return false;
      handleAttemptLeave();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // 2. React Navigation (ראוטר פנימי / iOS swipe)
    const unsubscribeRouter = navigation.addListener('beforeRemove', (e) => {
      if (!isLeavingLegally.current) {
        e.preventDefault();
        handleAttemptLeave();
      }
    });

    // 3. Web History API (דפדפן)
    const handleWebBack = () => {
      if (!isLeavingLegally.current) {
        window.history.pushState(null, '', window.location.href);
        handleAttemptLeave();
      }
    };

    if (Platform.OS === 'web') {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handleWebBack);
    }

    return () => {
      backHandler.remove();
      unsubscribeRouter();
      if (Platform.OS === 'web') {
        window.removeEventListener('popstate', handleWebBack);
      }
    };
  }, [navigation, params.volunteer_ride_id, isConfirmed]);
  // ========================================================

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleBeforeUnload = () => {
        cancelRideOnServer();
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (isConfirmed) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/rides/${params.volunteer_ride_id}/status?ride_type=volunteer`);
        const data = await response.json();

        if (data.status === 'expired') {
          clearInterval(interval);
          setIsExpiredModalVisible(true);
          setTimeout(() => {
            isLeavingLegally.current = true;
            router.replace('/volunteer/volunteer-type');
          }, 10000);
        }
      } catch (error) {
        console.log('Status check error:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConfirmed, params.volunteer_ride_id]);

  useEffect(() => {
    if (isCancelledByRiderModalVisible) {
      setVolunteerCountdown(30);
      volunteerTimerRef.current = setInterval(() => {
        setVolunteerCountdown((prev) => {
          if (prev <= 1) {
            if (volunteerTimerRef.current) clearInterval(volunteerTimerRef.current);
            handleVolunteerCancelAndHome();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (volunteerTimerRef.current) clearInterval(volunteerTimerRef.current);
    }

    return () => {
      if (volunteerTimerRef.current) clearInterval(volunteerTimerRef.current);
    };
  }, [isCancelledByRiderModalVisible]);

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
         setRiderCancelMessage(data.detail || 'הנוסע ביטל את הבקשה ברגע האחרון.');
         setIsCancelledByRiderModalVisible(true);
      }
    } catch (error) {
      Alert.alert('שגיאה', 'שגיאת תקשורת מול השרת');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleVolunteerCancelAndHome = async () => {
    if (volunteerTimerRef.current) clearInterval(volunteerTimerRef.current);
    isLeavingLegally.current = true;
    await cancelRideOnServer();
    router.replace('/volunteer/volunteer-type');
  };

  const handleVolunteerResumeSearch = async () => {
    if (volunteerTimerRef.current) clearInterval(volunteerTimerRef.current);
    try {
      await fetch(`http://127.0.0.1:8000/api/rides/volunteer/resume/${params.volunteer_ride_id}`, {
        method: 'PATCH',
      });
      isLeavingLegally.current = true;
      router.replace({
        pathname: '/volunteer/waiting-for-rider',
        params: { volunteer_ride_id: params.volunteer_ride_id }
      });
    } catch (e) {
      isLeavingLegally.current = true;
      router.replace('/volunteer/volunteer-type');
    }
  };

  const handleCancelAndGoHome = async () => {
    isLeavingLegally.current = true;
    await cancelRideOnServer();
    router.replace('/volunteer/volunteer-type');
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

          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelAndGoHome}>
            <Text style={{ color: colors.primaryBlue, fontWeight: '500' }}>חזרה למסך הבית</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isExpiredModalVisible && (
        <View style={styles.expiredOverlay}>
          <View style={styles.expiredModalCard}>
            <Text style={styles.expiredTitle}>⏰ פג תוקף ההצעה</Text>
            <Text style={styles.expiredText}>
              עברו 3 דקות ללא אישור. ההצעה שוחררה למתנדבים אחרים, ותועבר בעוד רגע למסך הבית.
            </Text>
            <TouchableOpacity
              style={[common.buttonPrimary, { marginTop: 16, width: '100%' }]}
              onPress={() => {
                isLeavingLegally.current = true;
                router.replace('/volunteer/volunteer-type');
              }}
            >
              <Text style={common.buttonTextPrimary}>חזרה מיידית למסך הבית</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isCancelledByRiderModalVisible && (
        <View style={styles.expiredOverlay}>
          <View style={styles.expiredModalCard}>
            <Text style={styles.expiredTitle}>⚠️ הנסיעה בוטלה</Text>
            <Text style={styles.expiredText}>{riderCancelMessage}</Text>
            <Text style={styles.timerText}>
              החזרה האוטומטית למסך הבית תתבצע בעוד {volunteerCountdown} שניות...
            </Text>

            <View style={{ width: '100%', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[common.buttonPrimary, { backgroundColor: '#dc2626', width: '100%' }]}
                onPress={handleVolunteerCancelAndHome}
              >
                <Text style={common.buttonTextPrimary}>חזרה למסך הבית</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[common.buttonPrimary, { backgroundColor: colors.primaryBlue, width: '100%' }]}
                onPress={handleVolunteerResumeSearch}
              >
                <Text style={common.buttonTextPrimary}>חזרה לחיפוש נסיעה חדשה</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  expiredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 24,
  },
  expiredModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  expiredTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: 12,
    textAlign: 'center',
  },
  expiredText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
});