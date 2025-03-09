import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import Quote from '~/components/Quote';
import { Text } from '~/components/nativewindui/Text';

export default function Screen() {
  const handleAddEntry = () => {
    router.push('/audio-entry');
  };

  return (
    <View className="mt-3 flex-1 p-4 px-8">
      <Greeting />
      <Quote />

      <TouchableOpacity
        onPress={handleAddEntry}
        className="absolute bottom-8 right-8 flex size-16 items-center justify-center rounded-full bg-stone-500 shadow-md"
        activeOpacity={0.8}>
        <Feather name="feather" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

function Greeting() {
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
    <>
      <Text className="font-md text-2xl">{greeting},</Text>
      <Text className="mt-1 text-4xl font-bold">Daniel</Text>
    </>
  );
}
