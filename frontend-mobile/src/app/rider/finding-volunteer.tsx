import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams, useNavigation, Stack } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, BackHandler, Platform } from 'react-native';

export default function RiderFindingVolunteerPage() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  const [isCancelling, setIsCancelling] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // === שומר הסף הקשוח: מותר לעזוב את המסך רק אם זה TRUE ===
  const isLeavingLegally = useRef(false);

  const id = params.ride_request_id || params.id || params.requestId || params.request_id;

  // ========================================================
  // נעילה הרמטית של כל דרכי החזרה אחורה
  // ========================================================
  useEffect(() => {
    // 1. אנדרואיד: חסימת כפתור חזרה פיזי
    const onBackPress = () => {
      if (isLeavingLegally.current) return false;
      setIsModalVisible(true);
      return true; // חוסם את הפעולה
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // 2. ראוטר / iOS: חסימת ניווט פנימי
    const unsubscribeRouter = navigation.addListener('beforeRemove', (e) => {
      if (!isLeavingLegally.current) {
        e.preventDefault();
        setIsModalVisible(true);
      }
    });

    // 3. ווב / דפדפן: חסימה אגרסיבית של החץ
    const handleWebBack = () => {
      if (!isLeavingLegally.current) {
        // דוחף את העמוד חזרה להיסטוריה בכוח כדי שלא יברח
        window.history.pushState(null, '', window.location.href);
        setIsModalVisible(true);
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
  }, [navigation]);
  // ========================================================

  useEffect(() => {
    if (!id) {
      Alert.alert("תקלה בניתוב", "מספר הנסיעה חסר!");
      return;
    }

    const checkRideStatus = async () => {
      try {
        const url = `http://127.0.0.1:8000/api/rides/${id}/status?ride_type=request&t=${Date.now()}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();

          if (data.status === 'confirmed') {
            // התאמה נמצאה! מאשרים לשומר הסף לצאת
            isLeavingLegally.current = true;
            setIsModalVisible(false);
            if (timerRef.current) clearInterval(timerRef.current);

            router.replace({
              pathname: '/rider/match-found',
              params: {
                volunteer_name: data.volunteer_name || 'ישראל ישראלי',
                volunteer_phone: data.volunteer_phone || '050-1234567',
                volunteer_car: data.volunteer_car || 'טויוטה קורולה לבנה'
              }
            });
          }
        }
      } catch (error) {
        console.error("שגיאה בפוללינג:", error);
      }
    };

    checkRideStatus();
    const intervalId = setInterval(checkRideStatus, 3000);

    return () => clearInterval(intervalId);
  }, [id]);

  useEffect(() => {
    if (isModalVisible) {
      setCountdown(15);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleConfirmCancel();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isModalVisible]);

  const handleOpenCancelModal = () => {
    if (!id) return;
    setIsModalVisible(true);
  };

  const handleDismissModal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsModalVisible(false);
  };

  const handleConfirmCancel = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      setIsCancelling(true);
      const targetUrl = `http://127.0.0.1:8000/api/rides/request/cancel/${id}`;

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        // ביטול הצליח! מאשרים לשומר הסף לצאת
        isLeavingLegally.current = true;
        setIsModalVisible(false);
        router.replace('/rider/ride-type');
      } else {
        const errorData = await response.json();
        Alert.alert("שגיאה", errorData.detail || "לא ניתן היה לבטל את הבקשה כרגע.");
      }
    } catch (err) {
      console.error("CLIENT DEBUG ERROR:", err);
      Alert.alert("שגיאת תקשורת", "בדקי את החיבור לשרת.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <ScreenWrapper>
      {/* מסירים כל אפשרות חזותית או מחוות לחזרה */}
      <Stack.Screen
        options={{
          headerBackVisible: false,
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />

      <View style={styles.container}>
        <Text style={styles.title}>מחפשים לך מתנדב...</Text>
        <Text style={styles.subtitle}>בקשתך נקלטה. מערכת חסד-רייד מחפשת נהג מתאים עבורך ברגעים אלו.</Text>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} style={styles.loader} />
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleOpenCancelModal}
          disabled={isCancelling}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>ביטול חיפוש נסיעה</Text>
        </TouchableOpacity>
      </View>

      {isModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚠️ ביטול חיפוש נסיעה</Text>
            <Text style={styles.modalText}>
              האם את בטוחה שתרצי לבטל את חיפוש הנסיעה?
            </Text>
            <Text style={styles.timerText}>
              הבקשה תבוטל אוטומטית בעוד {countdown} שניות...
            </Text>

            <View style={styles.modalBtnGroup}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>כן, בטל בקשה</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.dismissButton]}
                onPress={handleDismissModal}
                disabled={isCancelling}
              >
                <Text style={styles.dismissButtonText}>לא, המשך לחפש</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 20 },
  title: { ...typography.h2, color: colors.primaryNavy, textAlign: 'center' },
  subtitle: { ...typography.bodySecondary, textAlign: 'center', paddingHorizontal: 20 },
  loaderContainer: { marginVertical: 20 },
  loader: { transform: [{ scale: 1.5 }] },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#fee2e2',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  cancelButtonText: {
    color: '#991b1b',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
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
  modalCard: {
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
  modalTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalBtnGroup: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#dc2626',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dismissButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
});