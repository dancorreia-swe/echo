import { useMemo } from 'react';
import { View } from 'react-native';

import ActionButton from '~/components/ActionButton';
import Quote from '~/components/Quote';
import { Text } from '~/components/nativewindui/Text';

export default function Screen() {
  return (
    <View className="flex-1 bg-white p-4 px-8 pt-6 dark:bg-stone-900">
      <Greeting />
      <Quote />
      <ActionButton />
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
      <Text className="font-md text-2xl text-stone-800 dark:text-stone-100">{greeting},</Text>
      <Text className="mt-1 text-4xl font-bold text-stone-900 dark:text-white">Daniel</Text>
    </>
  );
}
