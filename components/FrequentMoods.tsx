import React, { useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { getTopMoodsWithCountsFromEntries, MoodWithCount } from '~/app/journal/utils/moodAnalytics';
import { useJournalStore } from '~/store/journal-store';
import { Text } from '~/components/nativewindui/Text';

export default function FrequentMoods() {
  const entries = useJournalStore((s) => s.entries);

  const topMoods: MoodWithCount[] = useMemo(
    () => getTopMoodsWithCountsFromEntries(entries, 5),
    [entries]
  );

  if (!entries || Object.keys(entries).length === 0) {
    return (
      <View className="mt-6">
        <Text className="mb-2 text-2xl font-normal text-stone-800 dark:text-stone-200">
          Your Mood Insights
        </Text>
        <View className="rounded-xl bg-stone-100 p-4 dark:bg-stone-800">
          <Text className="text-sm text-stone-600 dark:text-stone-400">
            Start journaling to see your most frequent moods here.
          </Text>
        </View>
      </View>
    );
  }

  if (topMoods.length === 0) {
    return (
      <View className="mt-6">
        <Text className="mb-2 text-2xl font-normal text-stone-800 dark:text-stone-200">
          Your Mood Insights
        </Text>
        <View className="rounded-xl bg-stone-100 p-4 dark:bg-stone-800">
          <ActivityIndicator size="small" color="#888" />
        </View>
      </View>
    );
  }

  return (
    <View className="mt-6">
      <Text className="mb-2 text-xl font-normal text-stone-800 dark:text-stone-200">
        Your Mood Insights
      </Text>
      <View className="rounded-xl bg-stone-100 px-2 py-4 dark:bg-stone-800">
        <View className="flex-row flex-wrap items-start gap-1">
          {topMoods.map((mood) => (
            <View key={mood.key} className="mb-2 w-[18%] items-center">
              <View className="relative">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm dark:bg-stone-700">
                  <Text className="text-xl">{mood.emoji}</Text>
                </View>
                <View className="absolute -bottom-1 -right-3 min-w-[24px] items-center justify-center rounded-full bg-stone-500 px-2 py-0.5">
                  <Text className="text-center text-xs font-bold text-white">{mood.count}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <Text className="mx-auto mt-3 text-xs text-stone-500 dark:text-stone-400">
          Based on your journal entries from the past month
        </Text>
      </View>
    </View>
  );
}
