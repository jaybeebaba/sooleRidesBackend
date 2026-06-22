import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function PassengerHomeScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  

 

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState('1');


  const isFullyVerified = Boolean(
    user?.isEmailVerified &&
    user?.isPhoneVerified &&
    user?.isIdentityVerified &&
    user?.isFaceVerified,
  );

  const handleSwapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSearch = () => {
    const cleanOrigin = origin.trim();
    const cleanDestination = destination.trim();
    const cleanSeats = seats.trim();

    if (!cleanOrigin || !cleanDestination) {
      Alert.alert('Missing route', 'Please enter both departure and destination.');
      return;
    }

    if (cleanSeats && Number(cleanSeats) < 1) {
      Alert.alert('Invalid seats', 'Seats must be at least 1.');
      return;
    }

    console.log({
      origin: cleanOrigin,
      destination: cleanDestination,
      date: date,
      seats: cleanSeats ? Number(cleanSeats) : undefined,
    });

    navigation.navigate('SearchTab');
  };

  return (
    <AppScreen>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <FontAwesome name="user" size={22} color={colors.white} />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              Good day, {user?.fullName?.split(' ')[0] || 'Passenger'}
            </Text>

            <View style={styles.locationRow}>
              <FontAwesome name="map-marker" size={14} color={colors.gray} />
              <Text style={styles.location}>Lagos, Nigeria</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notificationButton}>
            <FontAwesome name="bell-o" size={20} color={colors.black} />
          </TouchableOpacity>
        </View>

        {!isFullyVerified && (
          <View style={styles.verificationCard}>
            <Text style={styles.verificationTitle}>Complete your verification</Text>

            <Text style={styles.verificationText}>
              Verify your phone number and identity to unlock bookings,
              messaging, payments, and driver application later.
            </Text>

            <AppButton
              title="Verify Now"
              onPress={() => navigation.navigate('PhoneVerification')}
            />
          </View>
        )}

        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <View style={styles.compactField}>
              <Text style={styles.fieldLabel}>From</Text>
              <TextInput
                placeholder="Departure"
                placeholderTextColor={colors.gray}
                value={origin}
                onChangeText={setOrigin}
                style={styles.fieldInput}
              />
            </View>

            <TouchableOpacity
              style={styles.swapButton}
              onPress={handleSwapLocations}
              activeOpacity={0.8}
            >
              <FontAwesome name="exchange" size={16} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.compactField}>
              <Text style={styles.fieldLabel}>To</Text>
              <TextInput
                placeholder="Destination"
                placeholderTextColor={colors.gray}
                value={destination}
                onChangeText={setDestination}
                style={styles.fieldInput}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.searchRow}>
  <View style={styles.compactField}>
    <Text style={styles.fieldLabel}>Date</Text>

    <TextInput
      placeholder="YYYY-MM-DD"
      placeholderTextColor={colors.gray}
      value={date}
      onChangeText={setDate}
      style={styles.fieldInput}
    />
  </View>

  <View style={styles.verticalDivider} />

  <View style={styles.compactField}>
    <Text style={styles.fieldLabel}>Seats</Text>

    <TextInput
      placeholder="1"
      placeholderTextColor={colors.gray}
      value={seats}
      onChangeText={setSeats}
      keyboardType="number-pad"
      style={styles.fieldInput}
    />
  </View>
</View>

          <View style={styles.searchButton}>
            <AppButton title="Search Rides" onPress={handleSearch} />
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={handleSearch}>
            <FontAwesome name="car" size={20} color={colors.primary} />
            <Text style={styles.actionTitle}>Book a Ride</Text>
            <Text style={styles.actionText}>Find available rides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SavedTab')}
          >
            <FontAwesome name="bookmark" size={20} color={colors.primary} />
            <Text style={styles.actionTitle}>Saved Routes</Text>
            <Text style={styles.actionText}>View saved routes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('EmergencyContacts')}
          >
            <FontAwesome name="phone" size={20} color={colors.primary} />
            <Text style={styles.actionTitle}>Emergency</Text>
            <Text style={styles.actionText}>Manage contacts</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Routes</Text>
          <Text style={styles.viewAll}>View all</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Lagos to Abuja', 'Lagos to Ibadan', 'Abuja to Kaduna'].map(
            (route) => (
              <View key={route} style={styles.routeCard}>
                <Text style={styles.routeTitle}>{route}</Text>
                <Text style={styles.routePrice}>From ₦7,000</Text>
              </View>
            ),
          )}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Rides</Text>
          <Text style={styles.viewAll}>View all</Text>
        </View>

        <View style={styles.rideCard}>
          <Text style={styles.rideTitle}>Lagos → Abuja</Text>
          <Text style={styles.rideMeta}>Sun, 26 May • 08:00 AM</Text>
          <Text style={styles.rideMeta}>3 seats available • From ₦7,000</Text>
        </View>

        <View style={styles.rideCard}>
          <Text style={styles.rideTitle}>Ibadan → Lagos</Text>
          <Text style={styles.rideMeta}>Mon, 27 May • 10:30 AM</Text>
          <Text style={styles.rideMeta}>2 seats available • From ₦3,500</Text>
        </View>
      </ScrollView>
    </AppScreen>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
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
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  verificationTitle: {
    ...typography.caption,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  verificationText: {
    ...typography.body,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  searchCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.lg
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactField: {
    flex: 1,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: 2,
  },
  fieldInput: {
    ...typography.body,
    color: colors.black,
    paddingVertical: 2,
    minHeight: 32,
  },
  fieldInputText: {
    ...typography.body,
    color: colors.black,
    paddingVertical: 8,
    minHeight: 32,
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  verticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  searchButton: {
    marginTop: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.sm,
  },
  actionTitle: {
    ...typography.caption,
    color: colors.black,
    marginTop: spacing.sm,
  },
  actionText: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.black,
  },
  viewAll: {
    ...typography.caption,
    color: colors.primary,
  },
  routeCard: {
    width: 130,
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  routeTitle: {
    ...typography.caption,
    color: colors.white,
  },
  routePrice: {
    ...typography.body,
    color: colors.lightGray,
    marginTop: spacing.xs,
  },
  rideCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rideTitle: {
    ...typography.caption,
    color: colors.black,
  },
  rideMeta: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },
});