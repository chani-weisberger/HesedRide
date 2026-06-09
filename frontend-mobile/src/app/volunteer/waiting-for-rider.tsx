// volunteer/waiting-for-rider.tsx — מסך המתנה של המתנדב לאישור הנוסע (צד מתנדב)
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';

export default function WaitingForRiderPage() {
  const router = useRouter();
  
  // 1. התיקון הראשון: קריאת המזהים של הנסיעה שחני צריכה
  const params = useLocalSearchParams<{ volunteer_ride_id: string; ride_request_id: string }>();

  // סטייט שמדמה האם הנוסע כבר אישר את הנסיעה בצד שלו
  const [isRiderConfirmed, setIsRiderConfirmed] = useState(false);

  // הלינק של גוגל מאפס שחני שולחת ב-JSON (לינק בדיקה זמני)
  const googleMapsLink = "https://maps.google.com";

  const handleOpenNavigation = () => {
    // פתיחת הלינק של גוגל מאפס של רחלי
    Linking.openURL(googleMapsLink).catch(() => {
      alert('לא ניתן לפתוח את אפליקציית הניווט');
    });
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        
        {!isRiderConfirmed ? (
          // ⏳ מצב א': בול הקוד המקור והמעוצב שלך! (כל עוד הנוסע לא אישר)
          <View style={styles.centerContent}>
            <ActivityIndicator 
              size="large" 
              color={colors.primaryBlue} 
              style={styles.loader} 
            />
            <Text style={styles.title}>בודק מה עם הנוסע...</Text>
            <Text style={styles.subtitle}>אנא המתן לאישורו של הנוסע על מנת להתחיל בנסיעה</Text>
            
            {/* 🔧 כפתור סימולציה זמני לבדיקה בדפדפן - לוחצים עליו כדי לדמות שהנוסע אישר */}
            <TouchableOpacity 
              style={styles.mockButton} 
              onPress={() => setIsRiderConfirmed(true)}
            >
              <Text style={styles.mockButtonText}>🔧 סימולציה: הנוסע אישר! (ללחוץ לבדיקה)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // 🎉 מצב ב': התיקון השני - מה שקורה כשהנוסע מאשר (הכפתור של רחלי)
          <View style={styles.centerContent}>
            <Text style={[styles.title, { color: '#11caa0' }]}>הנסיעה אושרה סופית! 🥳</Text>
            <Text style={styles.subtitle}>הנוסע אישר את נסיעת החסד שלך. הנה מסלול הנסיעה בגוגל מאפס:</Text>
            
            <View style={styles.btnGroup}>
              {/* הכפתור של רחלי שמנווט לגוגל מאפס */}
              <TouchableOpacity 
                style={common.buttonPrimary} 
                onPress={handleOpenNavigation}
                activeOpacity={0.8}
              >
                <Text style={common.buttonTextPrimary}>פתח ניווט ב-Google Maps 🗺️</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.homeBtn} 
                onPress={() => router.replace('/volunteer/volunteer-type')}
              >
                <Text style={styles.homeBtnText}>חזרה למסך הבית</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>
    </ScreenWrapper>
  );
}

// שמרנו על הסטייל המדויק והנקי שלך!
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  centerContent: { width: '100%', alignItems: 'center', gap: 12 },
  loader: { marginBottom: 24, transform: [{ scale: 1.5 }] },
  title: { ...typography.h2, color: colors.primaryNavy, textAlign: 'center', marginBottom: 8 },
  subtitle: { ...typography.bodySecondary, textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },
  btnGroup: { width: '100%', gap: 12, marginTop: 16 },
  homeBtn: { alignItems: 'center', padding: 12 },
  homeBtnText: { color: colors.primaryBlue, fontSize: 14, fontWeight: '500' },
  
  // עיצוב כפתור הסימולציה
  mockButton: { marginTop: 40, padding: 10, backgroundColor: '#f1f5f9', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  mockButtonText: { color: '#64748b', fontSize: 12, fontStyle: 'italic' }
});