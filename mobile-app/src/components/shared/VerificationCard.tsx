import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppButton } from '../ui/AppButton';

type Props = {
  visible: boolean;
  onPress: () => void;
};

export function VerificationCard({ visible, onPress }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Complete your verification</Text>

      <Text style={styles.text}>
        Verify your phone number and identity to unlock bookings, messaging,
        payments, and driver application later.
      </Text>

      <AppButton title="Verify Now" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.caption,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  text: {
    ...typography.body,
    color: colors.gray,
    marginBottom: spacing.md,
  },
});