import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppScreen } from '../../components/layout/AppScreen';
import type { RootStackParamList } from '../../navigations/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 500);

    return () => clearTimeout(timer);
  }, [navigation, opacity, scale]);

  return (
    <AppScreen>
      <View style={styles.container}>
        <Animated.View style={[styles.logoWrapper, { opacity, transform: [{ scale }] }]}>
          <Image
            source={require('../../assets/images/soolerides-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <ActivityIndicator size="large" color="#F97316" style={styles.loader} />

        <Text style={styles.caption}>Ride smarter. Travel better.</Text>
      </View>
    </AppScreen>
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
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 500,
    height: 220,
  },
  loader: {
    marginTop: 18,
  },
  caption: {
    position: 'absolute',
    bottom: 40,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});