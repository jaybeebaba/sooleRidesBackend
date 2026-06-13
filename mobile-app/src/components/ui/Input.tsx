import { Text, TextInput, TextInputProps, View } from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label ? (
        <Text className="mb-2 text-sm font-medium text-gray-700">{label}</Text>
      ) : null}

      <TextInput
        className="rounded-2xl border border-gray-300 px-4 py-3 text-base text-black"
        placeholderTextColor="#9CA3AF"
        {...props}
      />

      {error ? (
        <Text className="mt-1 text-sm text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}