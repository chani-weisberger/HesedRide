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
  Platform
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

  // פונקציות Validation
  const isNameValid = fullName.trim().split(/\s+/).length >= 2;
  const isPhoneValid = /^05\d{8}$/.test(phoneNumber);
  const isIdValid = /^\d{9}$/.test(username);
  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('שגיאה', 'נא למלא תעודת זהות וסיסמה');
      return;
    }
    if (!isIdValid) {
       Alert.alert('שגיאה', 'תעודת זהות חייבת להכיל בדיוק 9 ספרות');
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
          } else {
            try {
              await SecureStore.setItemAsync('userToken', data.access_token || data.token);
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
        // המשתמש לא קיים - מעבירים אותו למסך הרשמה מיד (עוקף את מגבלת הדפדפן)
        setIsLogin(false);

        // מציגים את ההודעה המזמינה
        Alert.alert(
          'ברוך הבא!',
          'נראה שאתה מתנדב חדש במערכת. בוא נשלים את ההרשמה בקצרה.'
        );
      } else if (response.status === 401) {
        setServerPasswordError('הסיסמה שגויה. נסה שוב.');
      } else {
        Alert.alert('שגיאה', data.detail || 'שגיאה בהתחברות. נסה שוב.');
      }

    } catch (error) {
      setIsLoading(false);
      Alert.alert('שגיאת תקשורת', 'לא מצליח להתחבר לשרת');
    }
  };

  const handleRegister = async () => {
    if (!isIdValid || !isPasswordValid || !isNameValid || !isPhoneValid) {
      Alert.alert('שגיאה', 'נא לתקן את השגיאות בשדות טרם ההרשמה');
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
        setSuccessMessage(`✓ ברוך הבא ${data.full_name || ''}! נרשמת בהצלחה. הפרטים שלך כבר הוזנו, כעת נותר רק להתחבר.`);
        setIsLogin(true);
      } else {
        Alert.alert('אופס...', data.error || 'ההרשמה נכשלה. נסו שוב.');
      }

    } catch (error) {
      setIsLoading(false);
      Alert.alert('שגיאת תקשורת', 'לא מצליח להתחבר לשרת. וודאו שהבאקאנד דולק!');
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
              <TextInput
                style={styles.input}
                placeholder="שם מלא"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                textAlign="right"
              />
              {fullName.length > 0 && !isNameValid && (
                <Text style={styles.errorText}>יש להזין שם פרטי ושם משפחה</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="מספר טלפון נייד"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                textAlign="right"
              />
              {phoneNumber.length > 0 && !isPhoneValid && (
                <Text style={styles.errorText}>מספר טלפון חייב להכיל 10 ספרות</Text>
              )}
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="תעודת זהות"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            textAlign="right"
            keyboardType="numeric"
            autoCapitalize="none"
          />
          {username.length > 0 && !isIdValid && (
            <Text style={styles.errorText}>תעודת זהות חייבת להכיל בדיוק 9 ספרות</Text>
          )}

          <TextInput
            style={styles.input}
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
          {isLogin && serverPasswordError ? (
            <Text style={styles.errorText}>{serverPasswordError}</Text>
          ) : null}

          {!isLogin && password.length > 0 && !isPasswordValid && (
            <Text style={styles.errorText}>הסיסמה חייבת להכיל לפחות 8 תווים, כולל אות גדולה, אות קטנה ומספר</Text>
          )}

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
});