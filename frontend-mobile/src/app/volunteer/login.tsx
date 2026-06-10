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
} from 'react-native';
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

 const handleLogin = async () => {
  if (!username || !password) {
    Alert.alert('שגיאה', 'נא למלא תעודת זהות וסיסמה');
    return;
  }

  setIsLoading(true);

  try {
    const response = await loginVolunteer(username, password);
    const data = await response.json();
    setIsLoading(false);

    if (response.ok) {
  if (data.access_token) {
  await SecureStore.setItemAsync('userToken', data.access_token);
}
  router.replace('/volunteer/volunteer-type' as any);
} else {
      Alert.alert('שגיאה', data.detail || 'תעודת זהות או סיסמה שגויים');
    }

  } catch (error) {
    setIsLoading(false);
    Alert.alert('שגיאת תקשורת', 'לא מצליח להתחבר לשרת');
  }
};

  const handleRegister = async () => {
    if (!username || !password || !fullName) {
      Alert.alert('שגיאה', 'נא למלא תעודת זהות, שם מלא וסיסמה');
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
        setUsername('');
        setPassword('');
        Alert.alert(
          '✓ ההרשמה בוצעה בהצלחה!',
          `ברוך הבא ${data.full_name}!`,
          [{ text: 'כניסה למערכת', onPress: () => setIsLogin(true) }]
        );
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

        <View style={common.card}>

          {!isLogin && (
            <>
              <TextInput
                style={styles.input}
                placeholder="שם מלא"
                value={fullName}
                onChangeText={setFullName}
                textAlign="right"
              />
              <TextInput
                style={styles.input}
                placeholder="מספר טלפון (אופציונלי)"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                textAlign="right"
              />
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="תעודת זהות"
            value={username}
            onChangeText={setUsername}
            textAlign="right"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder={isLogin ? 'סיסמה' : 'קבע סיסמה'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            textAlign="right"
          />

          <TouchableOpacity
            style={common.buttonPrimary}
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
            onPress={() => setIsLogin(!isLogin)}
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontSize: 16,
  },
  switchBtn: { marginTop: 16, alignItems: 'center' },
  switchText: { color: colors.primaryBlue, fontSize: 14 },
  backBtn: { alignItems: 'center', marginTop: 20, padding: 12 },
  backText: { color: colors.primaryBlue, fontSize: 14 },
});
