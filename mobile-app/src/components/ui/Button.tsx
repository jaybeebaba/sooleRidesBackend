import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ title, onPress, loading, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-2xl py-4 items-center ${
        disabled || loading ? 'bg-gray-400' : 'bg-black'
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-white font-semibold text-base">{title}</Text>
      )}
    </TouchableOpacity>
  );
}