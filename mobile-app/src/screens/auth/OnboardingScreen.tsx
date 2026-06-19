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
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

export function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const goNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });

      return;
    }

    navigation.replace('Login');
  };

  const skipOnboarding = () => {
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  logo: {
    width: 400,
    height: 150,
    alignSelf: 'center',
    marginTop: 8,
  },
  slide: {
    width: width - 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  illustration: {
    width: width * 0.68,
    height: 220,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111827',
    lineHeight: 30,
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    textAlign: 'center',
    color: '#6B7280',
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
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 6,
  },
  activeDot: {
    width: 38,
    backgroundColor: '#F97316',
  },
  skipText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});