import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function RideSummaryScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // קבלת הפרטים שהוזנו במסך הקודם
  const params = useLocalSearchParams<{
    origin: string;
    destination: string;
    ride_date: string;
    ride_time: string;
  }>();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('שגיאה', 'לא נמצא טוקן התחברות. אנא התחברי מחדש.');
        setIsLoading(false);
        return;
      }

      // שליחת בקשת יצירת הנסיעה לשרת של רחלי
      const response = await fetch('http://127.0.0.1:8000/api/rides/volunteer/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          origin: params.origin,
          destination: params.destination,
          ride_date: params.ride_date,
          ride_time: params.ride_time,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        if (data.match_found) {
          // 🚗 תרחיש 1: נמצאה התאמה מיידית! מטיסים למסך המאץ'
          router.replace({
            pathname: '/volunteer/match-found',
            params: {
              passenger_name: data.match_details.passenger_name,
              origin: data.match_details.origin,
              destination: data.match_details.destination,
              ride_request_id: data.match_details.ride_request_id,
              volunteer_ride_id: data.id // 🔥 עודכן ל-data.id לפי השרת!
            }
          });
        } else {
          // ⏳ תרחיש 2: אין התאמה מיידית, מעבירים למסך הגלגל המסתובב
          router.replace({
            pathname: '/volunteer/waiting-for-rider',
            params: { volunteer_ride_id: data.id } // 🔥 עודכן ל-data.id הרשמי!
          });
        }
      } else {
        Alert.alert('שגיאה מהשרת', data.detail || 'יצירת הנסיעה נכשלה');
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('שגיאת תקשורת', 'לא ניתן להתחבר לשרת. ודאי שהשרת פועל.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>סיכום פרטי הנסיעה</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>מוצא:</Text>
        <Text style={styles.value}>{params.origin}</Text>
        
        <Text style={styles.label}>יעד:</Text>
        <Text style={styles.value}>{params.destination}</Text>
        
        <Text style={styles.label}>תאריך:</Text>
        <Text style={styles.value}>{params.ride_date}</Text>
        
        <Text style={styles.label}>שעה:</Text>
        <Text style={styles.value}>{params.ride_time}</Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>אישור ופרסום נסיעה</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});