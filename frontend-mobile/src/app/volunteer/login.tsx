// volunteer/login.tsx — התחברות והרשמה למתנדב
import { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AsyncStorage =
  Platform.OS !== 'web'
    ? require('@react-native-async-storage/async-storage').default
    : null;

import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { registerVolunteer, loginVolunteer } from '@/services/authService';
import * as SecureStore from 'expo-secure-store';

function isValidIsraeliId(id: string): boolean {
  const clean = id.trim();
  if (!/^\d{9}$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = Number(clean[i]) * ((i % 2) + 1);
    if (digit > 9) digit -= 9;
    sum += digit;
  }
  return sum % 10 === 0;
}

export default function VolunteerAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverPasswordError, setServerPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  const [showExistModal, setShowExistModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fullNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const idRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const isNameValid = fullName.trim().split(/\s+/).length >= 2;
  const isPhoneValid = /^05\d{8}$/.test(phoneNumber.replace(/[-\s]/g, ''));
  const isIdValid = isValidIsraeliId(username);
  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const webOutline =
    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

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
              await SecureStore.setItemAsync(
                'userToken',
                data.access_token || data.token
              );
              await SecureStore.setItemAsync('userName', data.user.full_name);
            } catch (e) {
              if (AsyncStorage) {
                await AsyncStorage.setItem(
                  'userToken',
                  data.access_token || data.token
                );
              }
            }
          }
        }
        router.replace('/volunteer/volunteer-type' as any);
      } else if (response.status === 404 || data.detail === 'USER_NOT_FOUND') {
        setShowNewUserModal(true);
      } else if (response.status === 401) {
        setServerPasswordError('הסיסמה שגויה. נסה שוב.');
      } else {
        showCrossPlatformAlert(
          'שגיאה',
          data.detail || 'שגיאה בהתחברות. נסה שוב.'
        );
      }
    } catch (error) {
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
      const response = await registerVolunteer(
        username,
        fullName,
        password,
        phoneNumber
      );
      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setFullName('');
        setPhoneNumber('');
        setSubmitAttempted(false);
        setSuccessMessage(
          `נרשמת בהצלחה${data.full_name ? `, ${data.full_name}` : ''}! אפשר להתחבר עכשיו.`
        );
        setIsLogin(true);
      } else if (response.status === 409) {
        setShowExistModal(true);
      } else {
        showCrossPlatformAlert(
          'אופס...',
          data.detail || 'ההרשמה נכשלה. נסו שוב.'
        );
      }
    } catch (error) {
      setIsLoading(false);
      showCrossPlatformAlert(
        'שגיאת תקשורת',
        'לא מצליח להתחבר לשרת. וודאו שהבאקאנד דולק!'
      );
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>
          {isLogin ? 'כניסת מתנדב' : 'הרשמת מתנדב'}
        </Text>

        {isLogin && successMessage ? (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>ההרשמה הושלמה</Text>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          {!isLogin && (
            <>
              <TextInput
                ref={fullNameRef}
                style={[
                  styles.input,
                  webOutline,
                  focusedField === 'fullName' && styles.inputFocused,
                  submitAttempted && !isNameValid && styles.inputError,
                ]}
                placeholder="שם מלא"
                placeholderTextColor={colors.textHint}
                value={fullName}
                onChangeText={setFullName}
                textAlign="right"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => phoneRef.current?.focus()}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
              />
              {submitAttempted && !isNameValid && (
                <Text style={styles.errorText}>יש לכתוב שם פרטי ומשפחה</Text>
              )}

              <TextInput
                ref={phoneRef}
                style={[
                  styles.input,
                  webOutline,
                  focusedField === 'phone' && styles.inputFocused,
                  submitAttempted && !isPhoneValid && styles.inputError,
                ]}
                placeholder="מספר טלפון נייד"
                placeholderTextColor={colors.textHint}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                textAlign="right"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => idRef.current?.focus()}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
              />
              {submitAttempted && !isPhoneValid && (
                <Text style={styles.errorText}>
                  מספר לא תקין
                </Text>
              )}
            </>
          )}

          <TextInput
            ref={idRef}
            style={[
              styles.input,
              webOutline,
              focusedField === 'id' && styles.inputFocused,
              ((!isLogin && submitAttempted && !isIdValid) ||
                (isLogin && loginAttempted && !isIdValid)) &&
                styles.inputError,
            ]}
            placeholder="תעודת זהות"
            placeholderTextColor={colors.textHint}
            value={username}
            onChangeText={setUsername}
            textAlign="right"
            keyboardType="numeric"
            autoCapitalize="none"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
            onFocus={() => setFocusedField('id')}
            onBlur={() => setFocusedField(null)}
          />
          {((!isLogin && submitAttempted && !isIdValid) ||
            (isLogin && loginAttempted && !isIdValid)) && (
            <Text style={styles.errorText}>תעודת זהות לא תקינה</Text>
          )}

          <View
            style={[
              styles.passwordWrap,
              focusedField === 'password' && styles.passwordFocused,
              ((!isLogin && submitAttempted && !isPasswordValid) ||
                (isLogin && loginAttempted && !password) ||
                (isLogin && !!serverPasswordError)) &&
                styles.passwordError,
            ]}
          >
            <TextInput
              ref={passwordRef}
              style={[styles.passwordInput, webOutline]}
              placeholder="סיסמה"
              placeholderTextColor={colors.textHint}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (serverPasswordError) setServerPasswordError('');
              }}
              textAlign="right"
              returnKeyType="done"
              onSubmitEditing={isLogin ? handleLogin : handleRegister}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {!isLogin && submitAttempted && !isPasswordValid && (
            <Text style={styles.errorText}>
              לפחות 8 תווים, כולל אות גדולה, קטנה ומספר
            </Text>
          )}
          {isLogin && loginAttempted && !password && (
            <Text style={styles.errorText}>נא להזין סיסמה</Text>
          )}
          {isLogin && serverPasswordError ? (
            <Text style={styles.errorText}>{serverPasswordError}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnPrimaryText}>
                {isLogin ? 'התחברות' : 'סיום הרשמה'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => {
              setIsLogin(!isLogin);
              setSuccessMessage('');
              setServerPasswordError('');
              setPassword('');
              setShowPassword(false);
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

        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
          <Text style={styles.backText}>→ חזרה</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={showExistModal}
        onRequestClose={() => setShowExistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>המשתמש כבר קיים</Text>
            <Text style={styles.modalText}>
              תעודת הזהות שהזנת כבר רשומה במערכת. אפשר לעבור להתחברות.
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
        transparent
        visible={showNewUserModal}
        onRequestClose={() => setShowNewUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ברוך הבא!</Text>
            <Text style={styles.modalText}>
              נראה שאתה מתנדב חדש במערכת. בוא נשלים את ההרשמה בקצרה.
            </Text>
            <TouchableOpacity
              style={[styles.modalConfirmBtn, { width: '100%' }]}
              onPress={() => {
                setShowNewUserModal(false);
                setIsLogin(false);
              }}
            >
              <Text style={styles.modalConfirmBtnText}>המשך להרשמה</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.15)',
    shadowColor: '#0B3A5C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  input: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    fontSize: 16,
    color: colors.primaryNavy,
  },
  inputFocused: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#F0FDFA',
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    overflow: 'hidden',
  },
  passwordFocused: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#F0FDFA',
  },
  passwordError: {
    borderColor: colors.error,
  },
  passwordInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.primaryNavy,
    backgroundColor: 'transparent',
  },
  eyeBtn: {
    height: 52,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'right',
    marginRight: 4,
  },
  btnPrimary: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  switchBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchText: {
    color: colors.primaryBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
  },
  backText: {
    color: colors.primaryBlue,
    fontSize: 14,
  },
  successCard: {
    backgroundColor: 'rgba(240, 253, 250, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.tealAccent,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryNavy,
    textAlign: 'center',
    marginBottom: 4,
  },
  successText: {
    color: colors.primaryBlue,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  modalConfirmBtn: {
    flex: 1.4,
    paddingVertical: 14,
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});