import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Image,
} from 'react-native';

type Props = {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
};

export default function ScreenWrapper({
  children,
  scrollable = false,
  padded = true,
}: Props) {
  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, !padded && { padding: 0 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.inner, padded && styles.padded]}>{children}</View>
  );

  return (
    <View style={styles.root}>
      <Image
        source={require('../assets/app-background.png')}
        style={styles.bgImage}
        resizeMode="stretch"
      />
      <SafeAreaView style={styles.safe}>{content}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EAF6FA',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    flexGrow: 1,
  },
  inner: {
    flex: 1,
  },
  padded: {
    padding: 24,
  },
});