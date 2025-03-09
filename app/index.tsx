import { useMemo } from 'react';
import { View } from 'react-native';

import { Text } from '~/components/nativewindui/Text';
import { useRandomQuote } from '~/lib/useRandomQuote';

export default function Screen() {
  const greeting = useMemo(() => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return 'Good morning';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Good afternoon';
    } else if (currentHour >= 18 && currentHour < 22) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  }, []);

  return (
    <View className="mt-3 p-4 px-6">
      <View>
        <Text className="font-md text-2xl">{greeting},</Text>
        <Text className="mt-1 text-4xl font-bold">Daniel</Text>
      </View>
    </View>
  );
}
