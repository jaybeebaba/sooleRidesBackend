import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createSavedRoute,
  deleteSavedRoute,
  getSavedRoutes,
  type SavedRoute,
} from '../../api/savedRoutes.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import { useRideSearchStore } from '../../store/rideSearch.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { EmptyState } from '../../components/shared/EmptyState';

export function SavedRoutesScreen() {
  const navigation = useNavigation<any>();
  const setSearchParams = useRideSearchStore((state) => state.setSearchParams);

  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSavedRoutes = async () => {
    try {
      setLoading(true);
      const data = await getSavedRoutes();
      setRoutes(data);
    } catch (error: any) {
      console.log('GET SAVED ROUTES ERROR:', error?.response?.data || error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedRoutes();
    }, []),
  );

  const handleAddRoute = async () => {
    const cleanOrigin = origin.trim();
    const cleanDestination = destination.trim();

    if (!cleanOrigin || !cleanDestination) {
      Alert.alert('Missing route', 'Please enter both origin and destination.');
      return;
    }

    try {
      setSaving(true);

      await createSavedRoute({
        origin: cleanOrigin,
        destination: cleanDestination,
      });

      setOrigin('');
      setDestination('');
      await fetchSavedRoutes();
    } catch (error: any) {
      console.log('CREATE SAVED ROUTE ERROR:', error?.response?.data || error);

      Alert.alert(
        'Could not save route',
        error?.response?.data?.message || 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoute = (routeId: string) => {
    Alert.alert(
      'Delete Saved Route',
      'Are you sure you want to delete this saved route?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedRoute(routeId);
              await fetchSavedRoutes();
            } catch (error: any) {
              console.log('DELETE SAVED ROUTE ERROR:', error?.response?.data || error);

              Alert.alert(
                'Delete Failed',
                error?.response?.data?.message || 'Could not delete route.',
              );
            }
          },
        },
      ],
    );
  };

  const handleSearchRoute = (route: SavedRoute) => {
    setSearchParams({
      origin: route.origin,
      destination: route.destination,
      seats: 1,
    });

    navigation.navigate('SearchTab');
  };

  return (
    <AppScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Saved Routes</Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Add New Route</Text>

          <TextInput
            placeholder="Origin"
            placeholderTextColor={colors.gray}
            value={origin}
            onChangeText={setOrigin}
            style={styles.input}
          />

          <TextInput
            placeholder="Destination"
            placeholderTextColor={colors.gray}
            value={destination}
            onChangeText={setDestination}
            style={styles.input}
          />

          <AppButton title="Save Route" onPress={handleAddRoute} loading={saving} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Routes</Text>
          <Text style={styles.countText}>
            {routes.length} {routes.length === 1 ? 'route' : 'routes'}
          </Text>
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!loading && routes.length === 0 && (
          <EmptyState
            icon="bookmark"
            title="No saved routes yet"
            message="Save routes you frequently travel so you can search faster."
          />
        )}

        {!loading &&
          routes.map((route) => (
            <View key={route.id} style={styles.routeCard}>
              <View style={styles.routeInfo}>
                <Text style={styles.routeTitle}>
                  {route.origin} → {route.destination}
                </Text>

                {route.createdAt && (
                  <Text style={styles.routeMeta}>
                    Saved {new Date(route.createdAt).toLocaleDateString()}
                  </Text>
                )}
              </View>

              <View style={styles.routeActions}>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => handleSearchRoute(route)}
                >
                  <FontAwesome name="search" size={15} color={colors.white} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRoute(route.id)}
                >
                  <FontAwesome name="trash" size={15} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  title: {
    ...typography.headingLarge,
    color: colors.black,
    marginBottom: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  countText: {
    ...typography.caption,
    color: colors.gray,
  },
  center: {
    marginTop: spacing.xl,
  },

  routeCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfo: {
    flex: 1,
  },
  routeTitle: {
    ...typography.caption,
    color: colors.black,
  },
  routeMeta: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  routeActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});