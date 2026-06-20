import { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';

type AppScreenProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function AppScreen({ children, style }: AppScreenProps) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={['top', 'bottom']}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});