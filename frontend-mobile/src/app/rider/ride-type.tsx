import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors } from '@/styles/colors';
import { common } from '@/styles/common';
import { typography } from '@/styles/typography';

// השארנו רק את אפשרות הנסיעה המיידית
const RIDE_OPTIONS = [
  {
    id: 'immediate',
    title: 'הזמנת נסיעה',
    desc: 'אני צריך/ה נסיעה עכשיו',
    emoji: '🚗',
    bgColor: '#fef3c7',
    route: '/rider/ride-form?type=immediate',
  }
];

export default function RideTypePage() {
  return (
    <ScreenWrapper>
      <View style={styles.container}>

        <View style={styles.header}>
          <Text style={typography.h2}>בקשת נסיעה</Text>
          <Text style={[typography.bodySecondary, styles.subtitle]}>
            המערכת תחפש עבורך מתנדב זמין
          </Text>
        </View>

        <View style={common.divider} />

        <View style={styles.list}>
          {RIDE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionBtn}
              onPress={() => router.push(option.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, { backgroundColor: option.bgColor }]}>
                <Text style={styles.emoji}>{option.emoji}</Text>
              </View>

              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDesc}>{option.desc}</Text>
              </View>

              <Text style={styles.arrow}>←</Text>
            </TouchableOpacity>
          ))}
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
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
  },
  list: {
    gap: 12,
    marginBottom: 24,
  },
  optionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.lightCyan,
    backgroundColor: colors.white,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  optionText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryNavy,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: colors.textHint,
  },
  backBtn: {
    alignItems: 'center',
    padding: 12,
  },
  backText: {
    color: colors.primaryBlue,
    fontSize: 14,
  },
});