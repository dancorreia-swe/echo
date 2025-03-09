import { View } from 'react-native';

import { ActivityIndicator } from './nativewindui/ActivityIndicator';
import { Text } from './nativewindui/Text';

import { useRandomQuote } from '~/lib/useRandomQuote';

export default function Quote() {
  const { currentQuote, isLoading, error } = useRandomQuote();

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>{error}</Text>;
  if (!currentQuote) return null;

  return (
    <View className="my-6 mt-4 flex flex-row">
      <View className="mr-3 w-1 rounded-full bg-stone-400" />

      <View className="flex-1">
        <Text className="mb-1 text-base italic text-stone-700">"{currentQuote.q}"</Text>
        <Text className="text-right text-sm text-stone-500">— {currentQuote.a}</Text>
      </View>
    </View>
  );
}
