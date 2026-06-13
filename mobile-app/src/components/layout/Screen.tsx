import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = false }: ScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-6"
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5 py-6">{children}</View>
    </SafeAreaView>
  );
}