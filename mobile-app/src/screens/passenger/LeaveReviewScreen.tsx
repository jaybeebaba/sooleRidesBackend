import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { createReview } from '../../api/reviews.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import type { RootStackParamList } from '../../navigations/RootNavigator';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'LeaveReview'>;

export function LeaveReviewScreen({ navigation, route }: Props) {
  const { bookingId, revieweeId, revieweeName } = route.params;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReview = async () => {
    try {
      setLoading(true);

      await createReview({
        bookingId,
        revieweeId,
        rating,
        comment: comment.trim() || undefined,
      });

      navigation.replace('AuthStatus', {
        type: 'success',
        title: 'Review Submitted',
        message: 'Thank you for sharing your ride experience.',
        buttonText: 'Back to Trips',
        action: 'goTrips',
      });
    } catch (error: any) {
      console.log('CREATE REVIEW ERROR:', error?.response?.data || error);

      Alert.alert(
        'Review Failed',
        error?.response?.data?.message || 'Could not submit review.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <FontAwesome name="chevron-left" size={16} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.title}>Leave Review</Text>

        <Text style={styles.subtitle}>
          How was your ride with {revieweeName || 'this driver'}?
        </Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setRating(value)}
              activeOpacity={0.8}
            >
              <FontAwesome
                name={value <= rating ? 'star' : 'star-o'}
                size={34}
                color={colors.primary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.ratingText}>{rating} out of 5</Text>

        <View style={styles.commentCard}>
          <Text style={styles.inputLabel}>Comment</Text>

          <TextInput
            placeholder="Write something about the ride..."
            placeholderTextColor={colors.gray}
            value={comment}
            onChangeText={setComment}
            style={styles.commentInput}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonWrapper}>
          <AppButton
            title="Submit Review"
            onPress={handleSubmitReview}
            loading={loading}
          />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
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
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ratingText: {
    ...typography.caption,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  commentCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  commentInput: {
    minHeight: 130,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.body,
    color: colors.black,
  },
  buttonWrapper: {
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
});