import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppScreen } from '../../components/layout/AppScreen';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function PersonalInformationScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);

  const names = user?.fullName?.split(' ') || [];
  const firstName = names[0] || 'Not provided';
  const lastName = names.slice(1).join(' ') || 'Not provided';

  return (
    <AppScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <FontAwesome name="chevron-left" size={16} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.title}>Personal Information</Text>

        <View style={styles.infoCard}>
          <InfoRow label="First Name" value={firstName} />
          <InfoRow label="Last Name" value={lastName} />
          <InfoRow label="Phone Number" value={user?.phone || 'Not provided'} />
          <InfoRow label="Email Address" value={user?.email || 'Not provided'} />
          <InfoRow label="Role" value={user?.role || 'PASSENGER'} />
          <InfoRow
            label="Email Verification"
            value={user?.isEmailVerified ? 'Verified' : 'Not verified'}
          />
          <InfoRow
            label="Phone Verification"
            value={user?.isPhoneVerified ? 'Verified' : 'Not verified'}
          />
          <InfoRow
            label="Identity Verification"
            value={user?.isIdentityVerified ? 'Verified' : 'Not verified'}
          />
          <InfoRow
            label="Face Verification"
            value={user?.isFaceVerified ? 'Verified' : 'Not verified'}
            last
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function InfoRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, last && styles.lastRow]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headingMedium,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    overflow: 'hidden',
  },
  infoRow: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.primary,
    flex: 1,
  },
  infoValue: {
    ...typography.body,
    color: colors.gray,
    flex: 1,
    textAlign: 'right',
  },
});