import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = {
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  message: string;
};

export function EmptyState({ icon = 'info-circle', title, message }: Props) {
  return (
    <View style={styles.card}>
      <FontAwesome name={icon} size={28} color={colors.gray} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.caption,
    color: colors.black,
    marginTop: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});