import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NotificationBell } from './NotificationBell';
import { UserAvatar } from './UserAvatar';

type Props = {
  fullName?: string | null;
  imageUrl?: string | null;
  location?: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;

};

export function HomeHeader({
  fullName,
  imageUrl,
  location = 'Location unavailable',
  notificationCount = 0,
  onNotificationPress,
  onAvatarPress,
}: Props) {
  const firstName = fullName?.split(' ')[0] || 'Passenger';

  return (
    <View style={styles.header}>
      <UserAvatar name={fullName} imageUrl={imageUrl} onPress={onAvatarPress} />

      <View style={styles.headerText}>
        <Text style={styles.greeting}>Hi, {firstName}</Text>

        <View style={styles.locationRow}>
          <FontAwesome name="map-marker" size={14} color={colors.gray} />
          <Text style={styles.location}>{location}</Text>
        </View>
      </View>

      <NotificationBell
        count={notificationCount}
        onPress={onNotificationPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  greeting: {
    ...typography.caption,
    color: colors.black,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  location: {
    ...typography.body,
    color: colors.gray,
    marginLeft: spacing.xs,
  },
});