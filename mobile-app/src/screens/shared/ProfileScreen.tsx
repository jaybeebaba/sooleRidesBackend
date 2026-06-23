import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAppModeStore } from '../../store/appMode.store';

export function ProfileScreen() {
  const navigation = useNavigation<any>();

  const user = useAuthStore((state) => state.user);
  const logoutUser = useAuthStore((state) => state.logoutUser);

  // const [activeMode, setActiveMode] = useState<'PASSENGER' | 'DRIVER'>(
  //   'PASSENGER',
  // );

  const activeMode = useAppModeStore((state) => state.activeMode);
  const setActiveMode = useAppModeStore((state) => state.setActiveMode);
  const resetMode = useAppModeStore((state) => state.resetMode);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const isFullyVerified = Boolean(
    user?.isEmailVerified &&
    user?.isPhoneVerified &&
    user?.isIdentityVerified &&
    user?.isFaceVerified,
  );

  const isApprovedDriver = user?.role === 'DRIVER';

  const handleBecomeDriver = () => {
    if (!isFullyVerified) {
      Alert.alert(
        'Verification Required',
        'Please complete your verification before applying to become a driver.',
      );
      return;
    }

    Alert.alert('Coming Soon', 'Driver application will be added later.');
  };

  const handleToggleDriverMode = () => {
    if (!isApprovedDriver) {
      Alert.alert(
        'Driver Approval Required',
        'You need to be approved as a driver before switching to Driver Mode.',
      );
      return;
    }

    setActiveMode(activeMode === 'PASSENGER' ? 'DRIVER' : 'PASSENGER');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          resetMode();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <AppScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <FontAwesome name="user" size={34} color={colors.white} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.fullName || 'SooleRides User'}</Text>

            <Text style={styles.phone}>{user?.phone || 'No phone number'}</Text>
            <Text style={styles.phone}>{user?.email || 'No phone number'}</Text>

            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>
                {isFullyVerified ? 'Verified User' : 'Verification Needed'}
              </Text>
            </View>

            {isApprovedDriver ? (
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Passenger / Driver Mode</Text>

                <Switch
                  value={activeMode === 'DRIVER'}
                  onValueChange={handleToggleDriverMode}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary,
                  }}
                  thumbColor={colors.white}
                />
              </View>
            ) : (
              <Text style={styles.driverHint}>
                Become a driver after full driver verification.
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>

        <View style={styles.menuCard}>
          <MenuItem
            icon="user"
            title="Personal Information"
            onPress={() => navigation.navigate('PersonalInformation')}
          />

          <MenuItem
            icon="check-circle"
            title="Verification"
            onPress={() => navigation.navigate('Verification')}
          />

          <MenuItem
            icon="bookmark"
            title="Saved Routes"
            onPress={() => navigation.navigate('SavedTab')}
          />

          <MenuItem
            icon="phone"
            title="Emergency Contacts"
            onPress={() => navigation.navigate('EmergencyContacts')}
          />

          <MenuItem
            icon="shield"
            title="Safety"
            onPress={() => Alert.alert('Coming Soon')}
          />

          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <FontAwesome name="moon-o" size={18} color={colors.black} />
            </View>

            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Theme Mode</Text>
              <Text style={styles.menuSubtitle}>Placeholder for dark mode</Text>
            </View>

            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{
                false: colors.border,
                true: colors.primary,
              }}
              thumbColor={colors.white}
            />
          </View>

          <MenuItem
            icon="cog"
            title="Settings"
            onPress={() => Alert.alert('Coming Soon')}
          />

          <MenuItem
            icon="question-circle"
            title="Help & Support"
            onPress={() => Alert.alert('Coming Soon')}
          />
        </View>

        {isApprovedDriver ? (
          <AppButton
            title={
              activeMode === 'DRIVER'
                ? 'Switch to Passenger Mode'
                : 'Switch to Driver Mode'
            }
            onPress={handleToggleDriverMode}
            style={styles.driverButton}
          />
        ) : (
          <AppButton
            title="Become a Driver"
            onPress={handleBecomeDriver}
            style={styles.driverButton}
          />
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </AppScreen>
  );
}

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.menuIcon}>
        <FontAwesome name={icon} size={18} color={colors.black} />
      </View>

      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>

      <FontAwesome name="chevron-right" size={14} color={colors.black} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    padding: spacing.md,
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.caption,
    color: colors.black,
  },
  phone: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: colors.success,
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  verifiedText: {
    ...typography.body,
    color: colors.white,
  },
  driverHint: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.sm,
  },
  toggleRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    ...typography.body,
    color: colors.black,
    flex: 1,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  menuCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    ...typography.caption,
    color: colors.black,
  },
  menuSubtitle: {
    ...typography.body,
    color: colors.gray,
    marginTop: 2,
  },
  driverButton: {
    marginTop: spacing.xl,
  },
  logoutButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  logoutText: {
    ...typography.caption,
    color: colors.danger,
  },
});