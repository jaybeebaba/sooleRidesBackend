import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PassengerHomeScreen } from '../screens/passenger/PassengerHomeScreen';
import { SearchResultsScreen } from '../screens/passenger/SearchResultsScreen';
import { MyTripsScreen } from '../screens/passenger/MyTripsScreen';
import { SavedRoutesScreen } from '../screens/passenger/SavedRoutesScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { colors } from '../theme/colors';

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  TripsTab: undefined;
  SavedTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,

        tabBarStyle: {
          height: 70 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.white,
          borderTopColor: colors.border,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={PassengerHomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={20} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SearchTab"
        component={SearchResultsScreen}
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="search" size={20} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="TripsTab"
        component={MyTripsScreen}
        options={{
          title: 'Trips',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="car" size={20} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SavedTab"
        component={SavedRoutesScreen}
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="bookmark" size={20} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={20} color={color} />
          ),
        }}
      />
    
    </Tab.Navigator>
  );
}