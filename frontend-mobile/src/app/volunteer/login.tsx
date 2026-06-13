// volunteer/login.tsx — התחברות והרשמה למתנדב
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Modal
} from 'react-native';
const AsyncStorage = Platform.OS !== 'web'
  ? require('@react-native-async-storage/async-storage').default
  : null;
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';
import { registerVolunteer ,loginVolunteer} from '@/services/authService';
import * as SecureStore from 'expo-secure-store';

export default function VolunteerAuthPage() {

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverPasswordError, setServerPasswordError] = useState('');

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  const [showExistModal, setShowExistModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  // פונקציות Validation פנימיות
  const isNameValid = fullName.trim().split(/\s+/).length >= 2;
  const isPhoneValid = /^05\d{8}$/.test(phoneNumber);
  const isIdValid = /^\d{9}$/.test(username);
  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const showCrossPlatformAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    setLoginAttempted(true);

    if (!username || !password || !isIdValid) {
       return;
    }

    setIsLoading(true);
    setServerPasswordError('');

    try {
      const response = await loginVolunteer(username, password);
      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        if (data.access_token) {
          if (data.user && data.user.id) {
            if (Platform.OS === 'web') {
                localStorage.setItem('userId', String(data.user.id));
            } else if (SecureStore) {
                await SecureStore.setItemAsync('userId', String(data.user.id));
            }
          }
          if (Platform.OS === 'web') {
            localStorage.setItem('userToken', data.access_token || data.token);
            localStorage.setItem('userName', data.user.full_name);
          } else {
            try {
              await SecureStore.setItemAsync('userToken', data.access_token || data.token);
              await SecureStore.setItemAsync('userName', data.user.full_name);
            } catch (e) {
              console.log("SecureStore not available, trying AsyncStorage");
              if (AsyncStorage) {
                await AsyncStorage.setItem('userToken', data.access_token || data.token);
              }
            }
          }
        }
        router.replace('/volunteer/volunteer-type' as any);

      } else if (response.status === 404 || data.detail === "USER_NOT_FOUND") {
        setShowNewUserModal(true);
      } else if (response.status === 401) {
        setServerPasswordError('הסיסמה שגויה. נסה שוב.');
      } else {
        showCrossPlatformAlert('שגיאה', data.detail || 'שגיאה בהתחברות. נסה שוב.');
      }

    } catch (error) {
      console.log("🚨 שגיאה ב-catch:", error);
      setIsLoading(false);
      showCrossPlatformAlert('שגיאת תקשורת', 'לא מצליח להתחבר לשרת');
    }
  };

  const handleRegister = async () => {
    setSubmitAttempted(true);

    if (!isNameValid || !isPhoneValid || !isIdValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerVolunteer(username, fullName, password, phoneNumber);
      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setFullName('');
        setPhoneNumber('');
        setSubmitAttempted(false);
        setSuccessMessage(`✓ ברוך הבא ${data.full_name || ''}! נרשמת בהצלחה. הפרטים שלך כבר הוזנו, כעת נותר רק להתחבר.`);
        setIsLogin(true);
      } else if (response.status === 409) {
        setShowExistModal(true);
      } else {
        showCrossPlatformAlert('אופס...', data.detail || 'ההרשמה נכשלה. נסו שוב.');
      }

    } catch (error) {
      setIsLoading(false);
      showCrossPlatformAlert('שגיאת תקשורת', 'לא מצליח להתחבר לשרת. וודאו שהבאקאנד דולק!');
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>

        <Text style={styles.title}>
          {isLogin ? 'כניסת מתנדב' : 'הרשמת מתנדב'}
        </Text>

        {isLogin && successMessage ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <View style={common.card}>

          {!isLogin && (
            <>
              {/* שדה שם מלא */}
              <TextInput
                style={[styles.input, submitAttempted && !isNameValid && styles.inputError]}
                placeholder="שם מלא"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                textAlign="right"
              />
              {submitAttempted && !isNameValid && (
                <Text style={styles.errorText}>יש לכתוב שם מלא</Text>
              )}

              {/* שדה טלפון */}
              <TextInput
                style={[styles.input, submitAttempted && !isPhoneValid && styles.inputError]}
                placeholder="מספר טלפון נייד"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                textAlign="right"
              />
              {submitAttempted && !isPhoneValid && (
                <Text style={styles.errorText}>מספר פלאפון שגוי</Text>
              )}
            </>
          )}

          {/* שדה תעודת זהות */}
          <TextInput
            style={[
              styles.input,
              (!isLogin && submitAttempted && !isIdValid) || (isLogin && loginAttempted && !isIdValid) ? styles.inputError : null
            ]}
            placeholder="תעודת זהות"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            textAlign="right"
            keyboardType="numeric"
            autoCapitalize="none"
          />
          {((!isLogin && submitAttempted && !isIdValid) || (isLogin && loginAttempted && !isIdValid)) && (
            <Text style={styles.errorText}>תעודת זהות שגויה</Text>
          )}

          {/* שדה סיסמה */}
          <TextInput
            style={[
              styles.input,
              (!isLogin && submitAttempted && !isPasswordValid) || (isLogin && loginAttempted && !password) || (isLogin && !!serverPasswordError) ? styles.inputError : null
            ]}
            placeholder="סיסמה"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (serverPasswordError) setServerPasswordError('');
            }}
            textAlign="right"
          />
          {!isLogin && submitAttempted && !isPasswordValid && (
            <Text style={styles.errorText}>הסיסמה חייבת להכיל 8 תווים, כולל אות קטנה, גדולה ומספר</Text>
          )}
          {isLogin && loginAttempted && !password && (
            <Text style={styles.errorText}>נא להזין סיסמה</Text>
          )}
          {isLogin && serverPasswordError ? (
            <Text style={styles.errorText}>{serverPasswordError}</Text>
          ) : null}

          <TouchableOpacity
            style={[common.buttonPrimary, { marginTop: 10 }]}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={common.buttonTextPrimary}>
                  {isLogin ? 'התחברות' : 'סיום הרשמה'}
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => {
              setIsLogin(!isLogin);
              setSuccessMessage('');
              setServerPasswordError('');
              setPassword('');
              setSubmitAttempted(false);
              setLoginAttempted(false);
            }}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? 'חדש במערכת? לחץ כאן להרשמה'
                : 'כבר יש לך משתמש? חזור להתחברות'}
            </Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>→ חזרה</Text>
        </TouchableOpacity>

      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showExistModal}
        onRequestClose={() => setShowExistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>המשתמש כבר קיים</Text>
            <Text style={styles.modalText}>
              תעודת הזהות שהזנת כבר רשומה במערכת. לחץ על 'מעבר להתחברות' כדי להיכנס למשתמש שלך.
            </Text>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowExistModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>ביטול</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => {
                  setShowExistModal(false);
                  setPassword('');
                  setIsLogin(true);
                }}
              >
                <Text style={styles.modalConfirmBtnText}>מעבר להתחברות</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showNewUserModal}
        onRequestClose={() => setShowNewUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ברוך הבא!</Text>
            <Text style={styles.modalText}>
              נראה שאתה מתנדב חדש במערכת. בוא נשלים את ההרשמה בקצרה.
            </Text>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { flex: 1 }]}
                onPress={() => {
                  setShowNewUserModal(false);
                  setIsLogin(false);
                }}
              >
                <Text style={styles.modalConfirmBtnText}>המשך להרשמה</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { ...typography.h2, textAlign: 'center', marginBottom: 24 },
  input: {
    height: 50,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#d32f2f',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'right',
    marginRight: 4,
  },
  switchBtn: { marginTop: 16, alignItems: 'center' },
  switchText: { color: colors.primaryBlue, fontSize: 14 },
  backBtn: { alignItems: 'center', marginTop: 20, padding: 12 },
  backText: { color: colors.primaryBlue, fontSize: 14 },
  successBanner: {
    backgroundColor: '#e6f4ea',
    borderColor: '#1e8e3e',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  successText: {
    color: '#137333',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 15,
  },
  modalConfirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    backgroundColor: colors.primaryBlue,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});