// ScreenWrapper — עטיפה לכל דף באפליקציה
// במקום לכתוב את אותו רקע ומרווחים בכל דף,
// פשוט עוטפים כל דף ב-ScreenWrapper והוא מטפל בהכל

import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';

// PropsWithChildren — אומר לריאקט שהרכיב הזה
// יכול לקבל רכיבים אחרים בתוכו (ילדים)
type Props = {
  children: React.ReactNode;
  scrollable?: boolean;  // האם הדף ניתן לגלילה? ברירת מחדל: לא
};

export default function ScreenWrapper({ children, scrollable = false }: Props) {

  // אם הדף ניתן לגלילה — נעטוף ב-ScrollView
  if (scrollable) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // אחרת — דף רגיל ללא גלילה
  return (
    <SafeAreaView style={styles.safe}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
});