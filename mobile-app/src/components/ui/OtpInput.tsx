import { useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';


type Props = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
};

export function OtpInput({
  value,
  onChange,
  onComplete,
}: Props) {
  const inputs = useRef<TextInput[]>([]);

  const otpArray = value.padEnd(6, ' ').split('');

  const handleChange = (
    text: string,
    index: number,
  ) => {
    const char = text.slice(-1);

    const newOtp = value
      .padEnd(6, ' ')
      .split('');

    newOtp[index] = char;

    const otp = newOtp.join('').trimEnd();

    onChange(otp);

    if (otp.length === 6) {
      onComplete?.(otp);
    }

    if (char && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: 6 }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) {
              inputs.current[index] = ref;
            }
          }}
          value={otpArray[index].trim()}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) =>
            handleChange(text, index)
          }
          style={styles.input}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  input: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
  },
});