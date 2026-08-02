
import { Stack } from 'expo-router';

/**
 * RootLayout executes its corresponding UI or business operation.
 */
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