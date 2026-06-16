import { Image, StyleSheet, Text, View } from 'react-native';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../src/assets/images/soolerides-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.subtitle}>Ride smarter. Travel better.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logo: {
    width: 270,
    height: 130,
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});