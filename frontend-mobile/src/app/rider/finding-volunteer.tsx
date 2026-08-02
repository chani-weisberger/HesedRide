import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { router, useLocalSearchParams, useNavigation, Stack } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  Platform,
} from 'react-native';

const SEARCH_TIMEOUT_SEC = 30 * 60;

/**
 * formatTime executes its corresponding UI or business operation.
 */
function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * RiderFindingVolunteerPage executes its corresponding UI or business operation.
 */
export default function RiderFindingVolunteerPage() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  const [isCancelling, setIsCancelling] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [searchSecondsLeft, setSearchSecondsLeft] = useState(SEARCH_TIMEOUT_SEC);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timerReady, setTimerReady] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLeavingLegally = useRef(false);
  const didAutoCancelRef = useRef(false);

  const id =
    params.ride_request_id || params.id || params.requestId || params.request_id;
  const storageKey = id ? `rider_search_start_${id}` : null;

  /**
   * clearSearchStart executes its corresponding UI or business operation.
   */
  const clearSearchStart = () => {
    if (Platform.OS === 'web' && storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  useEffect(() => {
    /**
     * onBackPress executes its corresponding UI or business operation.
     */
    const onBackPress = () => {
      if (isLeavingLegally.current) return false;
      setIsModalVisible(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    const unsubscribeRouter = navigation.addListener('beforeRemove', (e) => {
      if (!isLeavingLegally.current) {
        e.preventDefault();
        setIsModalVisible(true);
      }
    });

    /**
     * handleWebBack executes its corresponding UI or business operation.
     */
    const handleWebBack = () => {
      if (!isLeavingLegally.current) {
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

  useEffect(() => {
    if (!id || !storageKey) return;

    let startMs: number;
    if (Platform.OS === 'web') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        startMs = Number(saved);
      } else {
        startMs = Date.now();
        localStorage.setItem(storageKey, String(startMs));
      }
    } else {
      startMs = Date.now();
    }

    const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
    const left = Math.max(0, SEARCH_TIMEOUT_SEC - elapsedSec);
    setSearchSecondsLeft(left);
    setTimerReady(true);

    if (left <= 0) {
      handleSearchTimeout();
    }
  }, [id]);

  useEffect(() => {
    if (!id || !timerReady || showTimeoutModal) return;

    searchTimerRef.current = setInterval(() => {
      setSearchSecondsLeft((prev) => {
        if (prev <= 1) {
          if (searchTimerRef.current) clearInterval(searchTimerRef.current);
          handleSearchTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    };
  }, [id, timerReady, showTimeoutModal]);

  /**
   * handleSearchTimeout executes its corresponding UI or business operation.
   */
  const handleSearchTimeout = async () => {
    if (didAutoCancelRef.current || !id) return;
    didAutoCancelRef.current = true;
    clearSearchStart();

    try {
      await fetch(`http://127.0.0.1:8000/api/rides/request/cancel/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
    } catch (e) {
    }

    setShowTimeoutModal(true);
  };

  useEffect(() => {
    if (!id) {
      Alert.alert('תקלה בניתוב', 'מספר הנסיעה חסר!');
      return;
    }

    /**
     * checkRideStatus executes its corresponding UI or business operation.
     */
    const checkRideStatus = async () => {
      if (didAutoCancelRef.current) return;

      try {
        const url = `http://127.0.0.1:8000/api/rides/${id}/status?ride_type=request&t=${Date.now()}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();

          if (data.status === 'confirmed') {
            isLeavingLegally.current = true;
            clearSearchStart();
            setIsModalVisible(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (searchTimerRef.current) clearInterval(searchTimerRef.current);

            router.replace({
              pathname: '/rider/match-found',
              params: {
                volunteer_name: data.volunteer_name || 'מתנדב',
                volunteer_phone: data.volunteer_phone || '',
                volunteer_car: data.volunteer_car || '',
              },
            });
          }
        }
      } catch (error) {
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

  /**
   * handleOpenCancelModal executes its corresponding UI or business operation.
   */
  const handleOpenCancelModal = () => {
    if (!id) return;
    setIsModalVisible(true);
  };

  /**
   * handleDismissModal executes its corresponding UI or business operation.
   */
  const handleDismissModal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsModalVisible(false);
  };

  /**
   * handleConfirmCancel executes its corresponding UI or business operation.
   */
  const handleConfirmCancel = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      setIsCancelling(true);
      const response = await fetch(
        `http://127.0.0.1:8000/api/rides/request/cancel/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (response.ok) {
        isLeavingLegally.current = true;
        clearSearchStart();
        if (searchTimerRef.current) clearInterval(searchTimerRef.current);
        setIsModalVisible(false);
        router.replace('/rider/ride-type');
      } else {
        const errorData = await response.json();
        Alert.alert(
          'שגיאה',
          errorData.detail || 'לא ניתן היה לבטל את הבקשה כרגע.'
        );
      }
    } catch (err) {
      Alert.alert('שגיאת תקשורת', 'בדקי את החיבור לשרת.');
    } finally {
      setIsCancelling(false);
    }
  };

  /**
   * handleTimeoutGoHome executes its corresponding UI or business operation.
   */
  const handleTimeoutGoHome = () => {
    isLeavingLegally.current = true;
    router.replace('/rider/ride-type');
  };

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          headerBackVisible: false,
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />

      <View style={styles.container}>
        <Text style={styles.title}>מחפשים לך מתנדב...</Text>
        <Text style={styles.subtitle}>
          בקשתך נקלטה. מערכת חסד-רייד מחפשת נהג מתאים עבורך ברגעים אלו.
        </Text>

        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>זמן מקסימלי לחיפוש</Text>
          <Text
            style={[
              styles.timerValue,
              searchSecondsLeft <= 60 && styles.timerUrgent,
            ]}
          >
            {formatTime(searchSecondsLeft)}
          </Text>
        </View>

        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primaryBlue}
            style={styles.loader}
          />
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleOpenCancelModal}
          disabled={isCancelling || showTimeoutModal}
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

      {showTimeoutModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>לא נמצא מתנדב</Text>
            <Text style={styles.modalText}>
              עברה חצי שעה ולא נמצא מתנדב זמין. הבקשה בוטלה — אפשר לנסות שוב
              מאוחר יותר.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.primaryButton, { width: '100%' }]}
              onPress={handleTimeoutGoHome}
            >
              <Text style={styles.confirmButtonText}>חזרה</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    ...typography.h2,
    color: colors.primaryNavy,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  timerBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightCyan,
  },
  timerLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryNavy,
    fontVariant: ['tabular-nums'],
  },
  timerUrgent: {
    color: colors.error,
  },
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
  modalBtnGroup: { width: '100%', gap: 12 },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: { backgroundColor: '#dc2626' },
  primaryButton: { backgroundColor: colors.primaryBlue, marginTop: 16 },
  confirmButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  dismissButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dismissButtonText: { color: '#374151', fontSize: 16, fontWeight: '500' },
});