import { FontAwesome } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
};

export function UserAvatar({ name, imageUrl, size = 46 }: Props) {
  const initial = name?.trim()?.[0]?.toUpperCase();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      ) : initial ? (
        <Text style={styles.initial}>{initial}</Text>
      ) : (
        <FontAwesome name="user" size={size * 0.45} color={colors.white} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    ...typography.caption,
    color: colors.white,
  },
});