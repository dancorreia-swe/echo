import { useEffect, useMemo } from 'react';
import { View } from 'react-native';

import { JournalStreakChart } from './calendar/streak-view';

import ActionButton from '~/components/ActionButton';
import FrequentMoods from '~/components/FrequentMoods';
import Quote from '~/components/Quote';
import Auth from '~/components/auth/sign-in';
import { Text } from '~/components/nativewindui/Text';
import { useJournalStore } from '~/store/journal-store';

export default function Screen() {
  const { session, loading, initialized, initializeAuth } = useJournalStore();

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  if (loading || !initialized) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-stone-900">
        <Text className="text-stone-600 dark:text-stone-400">Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <View className="flex-1 bg-white p-4 px-8 pt-6 dark:bg-stone-900">
      <Greeting />
      <Quote />
      <FrequentMoods />
      <ActionButton />
      <JournalStreakChart />
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
