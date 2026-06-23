import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppScreen } from '../../components/layout/AppScreen';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function VerificationScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);

  const handleComingSoon = (title: string) => {
    Alert.alert('Coming Soon', `${title} verification will be added later.`);
  };

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

        <Text style={styles.title}>Verification</Text>

        <Text style={styles.subtitle}>
          Complete your verification to unlock bookings, payments, messaging,
          and driver application.
        </Text>

        <View style={styles.card}>
          <VerificationItem
            title="Email Verification"
            description="Confirm your email address."
            verified={Boolean(user?.isEmailVerified)}
            onPress={() => {
              if (!user?.isEmailVerified) {
                navigation.navigate('EmailVerification');
              }
            }}
          />

          <VerificationItem
            title="Phone Verification"
            description="Confirm your phone number."
            verified={Boolean(user?.isPhoneVerified)}
            onPress={() => {
              if (!user?.isPhoneVerified) {
                navigation.navigate('PhoneVerification');
              }
            }}
          />

          <VerificationItem
            title="Identity Verification"
            description="Verify your government-issued ID."
            verified={Boolean(user?.isIdentityVerified)}
            onPress={() => {
              if (!user?.isIdentityVerified) {
                handleComingSoon('Identity');
              }
            }}
          />

          <VerificationItem
            title="Face Verification"
            description="Verify your face for account safety."
            verified={Boolean(user?.isFaceVerified)}
            last
            onPress={() => {
              if (!user?.isFaceVerified) {
                handleComingSoon('Face');
              }
            }}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function VerificationItem({
  title,
  description,
  verified,
  onPress,
  last,
}: {
  title: string;
  description: string;
  verified: boolean;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.item, last && styles.lastItem]}
      onPress={onPress}
      disabled={verified}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.iconCircle,
          verified ? styles.verifiedCircle : styles.unverifiedCircle,
        ]}
      >
        <FontAwesome
          name={verified ? 'check' : 'times'}
          size={14}
          color={colors.white}
        />
      </View>

      <View style={styles.itemText}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>

      {verified ? (
        <Text style={styles.verifiedText}>Verified</Text>
      ) : (
        <FontAwesome name="chevron-right" size={14} color={colors.gray} />
      )}
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
    ...typography.headingLarge,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  item: {
    minHeight: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  verifiedCircle: {
    backgroundColor: colors.success,
  },
  unverifiedCircle: {
    backgroundColor: colors.danger,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    ...typography.caption,
    color: colors.black,
  },
  itemDescription: {
    ...typography.body,
    color: colors.gray,
    marginTop: 2,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.success,
  },
});