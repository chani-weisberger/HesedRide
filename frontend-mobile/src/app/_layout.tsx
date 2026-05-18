// _layout.tsx — הגדרת הניווט הכללי של האפליקציה
// כל דף באפליקציה עובר דרך הקובץ הזה

import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,      // מסתיר את ה-header האוטומטי של אקספו
        animation: 'slide_from_right',  // אנימציית מעבר בין דפים
      }}
    />
  );
}