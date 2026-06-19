import { Text, View } from 'react-native';

import { AppScreen } from '../../components/layout/AppScreen';

export function LoginScreen() {
  return (
    <AppScreen>
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold">
          Login Screen
        </Text>
      </View>
    </AppScreen>
  );
}