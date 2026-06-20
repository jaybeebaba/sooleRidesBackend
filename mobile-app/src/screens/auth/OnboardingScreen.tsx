import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { onboardingSlides } from '../../assets/data/onboardingData';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { markOnboardingSeen } from '../../utils/tokenStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

export function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const goNext = async () => {
  if (currentIndex < onboardingSlides.length - 1) {
    flatListRef.current?.scrollToIndex({
      index: currentIndex + 1,
      animated: true,
    });

    return;
  }

  await markOnboardingSeen();
  navigation.replace('Login');
};

const skipOnboarding = async () => {
  await markOnboardingSeen();
  navigation.replace('Login');
};

  return (
    <AppScreen>
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/soolerides-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <FlatList
          ref={flatListRef}
          data={onboardingSlides}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x /
                event.nativeEvent.layoutMeasurement.width,
            );

            setCurrentIndex(index);
          }}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image
                source={item.image}
                style={styles.illustration}
                resizeMode="contain"
              />

              <Text style={styles.title}>{item.title}</Text>

              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
        />

        <View style={styles.bottomArea}>
          <View style={styles.dotsWrapper}>
            {onboardingSlides.map((slide, index) => (
              <View
                key={slide.id}
                style={[
                  styles.dot,
                  currentIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <AppButton
            title={
              currentIndex === onboardingSlides.length - 1
                ? 'Get Started'
                : 'Next'
            }
            onPress={goNext}
          />

          <TouchableOpacity onPress={skipOnboarding} activeOpacity={0.7}>
            <Text style={styles.skipText}>{
              currentIndex === onboardingSlides.length - 1
                ? ''
                : 'Skip'
            }</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  logo: {
    ...typography.logo,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  slide: {
    width: width - 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.sm,
  },
  illustration: {
    width: width * 0.68,
    height: 220,
    marginBottom: 20,
  },
  title: {
    ...typography.headingMedium,
    textAlign: 'center',
    color: colors.black,
    marginTop: spacing.sm,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    color: colors.gray,
    marginTop: 10,
    paddingHorizontal: 14,
  },
  bottomArea: {
    paddingBottom: 18,
  },
  dotsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.lightGray,
    marginHorizontal: 6,
  },
  activeDot: {
    width: 38,
    backgroundColor: colors.primary,
  },
  skipText: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.gray,
    fontSize: 16,
    fontWeight: '500',
  },
});