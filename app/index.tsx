import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef } from 'react';
import { View, Pressable, Image } from 'react-native';

import { JournalStreakChart } from './calendar/streak-view';

import ActionButton from '~/components/ActionButton';
import FrequentMoods from '~/components/FrequentMoods';
import ProfileSettingsSheet, { ProfileSettingsSheetRef } from '~/components/ProfileSettingsModal';
import Quote from '~/components/Quote';
import Auth from '~/components/auth/sign-in';
import { Text } from '~/components/nativewindui/Text';
import { useJournalStore } from '~/store/journal-store';

export default function Screen() {
  const { session, loading, initialized, initializeAuth } = useJournalStore();
  const profileSheetRef = useRef<ProfileSettingsSheetRef>(null);

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
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Greeting session={session} />
        </View>
        <ProfileButton session={session} onPress={() => profileSheetRef.current?.present()} />
      </View>
      <Quote />
      <FrequentMoods />
      <ActionButton />
      <JournalStreakChart />

      <ProfileSettingsSheet ref={profileSheetRef} />
    </View>
  );
}

function Greeting({ session }: { session: any }) {
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

  const userName = useMemo(() => {
    if (session?.user?.user_metadata?.full_name) {
      return session.user.user_metadata.full_name.split(' ')[0];
    }
    if (session?.user?.email) {
      return session.user.email.split('@')[0];
    }
    return 'User';
  }, [session]);

  return (
    <>
      <Text className="font-md text-2xl text-stone-800 dark:text-stone-100">{greeting},</Text>
      <Text className="mt-1 text-4xl font-bold text-stone-900 dark:text-white">{userName}</Text>
    </>
  );
}

function ProfileButton({ session, onPress }: { session: any; onPress: () => void }) {
  const profileImageUrl = session?.user?.user_metadata?.avatar_url;

  return (
    <Pressable
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-800">
      {profileImageUrl ? (
        <Image
          source={{ uri: profileImageUrl }}
          className="h-8 w-8 rounded-full"
          style={{ width: 32, height: 32 }}
        />
      ) : (
        <Ionicons name="person-outline" size={20} color="#78716c" />
      )}
    </Pressable>
  );
}
