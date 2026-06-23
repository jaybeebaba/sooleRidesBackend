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
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { hasSeenOnboarding } from '../../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const loadUser = useAuthStore((state) => state.loadUser);
  

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
  }, [opacity, scale]);

  useEffect(() => {
    const bootstrap = async () => {
  await loadUser();

  const authenticated = useAuthStore.getState().isAuthenticated;
  const seenOnboarding = await hasSeenOnboarding();

  setTimeout(() => {
    if (authenticated) {
      navigation.replace('Home');
      return;
    }

    if (seenOnboarding) {
      navigation.replace('Login');
      return;
    }

    navigation.replace('Onboarding');
  }, 1200);
};

    bootstrap();
  }, [loadUser, navigation]);

  return (
    <AppScreen>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
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
    backgroundColor: colors.white,
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
    fontSize: typography.caption.fontSize,
    color: colors.gray,
    fontWeight: '500',
  },
});