import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/layout/AppScreen';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function SavedRoutesScreen() {
  return (
    <AppScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Saved Routes</Text>
        <Text style={styles.subtitle}>
          Your saved routes will appear here.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    ...typography.headingLarge,
    color: colors.black,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.sm,
  },
});