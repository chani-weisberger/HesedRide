// volunteer/login.tsx — התחברות והרשמה למתנדב
// הלוגיקה של התקשורת עם השרת עברה ל-authService.ts
// הקובץ הזה אחראי רק על מה שמוצג על המסך

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

// ייבוא פונקציית ההרשמה מ-authService
import { registerVolunteer } from '@/services/authService';

export default function VolunteerAuthPage() {

  // ======= State =======
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ======= התחברות (זמנית — סימולציה) =======
  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('שגיאה', 'נא למלא שם משתמש וסיסמה');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (username.toLowerCase() === 'test' && password === '1234') {
        Alert.alert('הצלחה', 'ברוך הבא למערכת HesedRide!');
        // כשיש דשבורד: router.replace('/volunteer/dashboard')
      } else {
        Alert.alert('אופס...', 'אינך רשום במערכת. מעביר לטופס הרשמה.');
        setIsLogin(false);
      }
    }, 1500);
  };

  // ======= הרשמה — משתמש ב-authService =======
  const handleRegister = async () => {
    if (!username || !password || !fullName) {
      Alert.alert('שגיאה', 'נא למלא תעודת זהות, שם מלא וסיסמה');
      return;
    }

    setIsLoading(true);

    try {
      // קוראים לפונקציה מ-authService במקום לכתוב את הבקשה כאן
      const response = await registerVolunteer(username, fullName, password, phone);
      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        Alert.alert(
          'הצלחה!',
          `נרשמת בהצלחה!\nשם: ${data.full_name}\nתפקיד: ${data.role}`
        );
        setFullName('');
        setPhone('');
        setUsername('');
        setPassword('');
        setIsLogin(true);
      } else {
        Alert.alert('אופס...', data.error || 'ההרשמה נכשלה. נסו שוב.');
      }

    } catch (error) {
      setIsLoading(false);
      Alert.alert('שגיאת תקשורת', 'לא מצליח להתחבר לשרת. וודאו שהבאקאנד דולק!');
    }
  };

  // ======= ממשק =======
  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>

        <Text style={styles.title}>
          {isLogin ? 'כניסת מתנדב' : 'הרשמת מתנדב'}
        </Text>

        <View style={common.card}>

          {/* שדות הרשמה — מופיעים רק במצב הרשמה */}
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
                value={phone}
                onChangeText={setPhone}
                textAlign="right"
              />
            </>
          )}

          {/* שדות משותפים */}
          <TextInput
            style={styles.input}
            placeholder={isLogin ? 'שם משתמש' : 'תעודת זהות'}
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

          {/* כפתור ראשי */}
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

          {/* מעבר בין התחברות להרשמה */}
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

        {/* חזרה לדף הפתיחה */}
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
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 24,
  },
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
  switchBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: colors.primaryBlue,
    fontSize: 14,
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
});