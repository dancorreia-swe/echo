import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { MoodWithCount, getTopMoodsWithCounts } from '~/app/journal/utils/moodAnalytics';
import { Text } from '~/components/nativewindui/Text';

export default function FrequentMoods() {
  const [topMoods, setTopMoods] = useState<MoodWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopMoods = async () => {
      setLoading(true);
      try {
        const moods = await getTopMoodsWithCounts(5);
        setTopMoods(moods);
      } catch (error) {
        console.error('Error loading top moods:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopMoods();
  }, []);

  if (loading) {
    return (
      <View className="mt-6">
        <Text className="mb-2 text-2xl font-normal text-stone-800 dark:text-stone-200">
          Your Mood Insights
        </Text>
        <View className="rounded-xl bg-stone-100 p-4 dark:bg-stone-800">
          <View className="flex-row items-center justify-center py-2">
            <ActivityIndicator size="small" color="#888" />
          </View>
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
          <Text className="text-sm text-stone-600 dark:text-stone-400">
            Start journaling to see your most frequent moods here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-6">
      <Text className="mb-2 text-xl font-normal text-stone-800 dark:text-stone-200">
        Your Mood Insights
      </Text>

      <View className="rounded-xl bg-stone-100 p-4 dark:bg-stone-800">
        <View className="flex-row flex-wrap justify-between">
          {topMoods.map((mood) => (
            <View key={mood.key} className="mb-2 w-[18%] items-center">
              <View className="relative">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-stone-700">
                  <Text className="text-3xl">{mood.emoji}</Text>
                </View>
                <View className="absolute -bottom-1 -right-1 min-w-[22px] items-center justify-center rounded-full bg-stone-500 px-1 py-0.5">
                  <Text className="text-center text-xs font-bold text-white">{mood.count}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text className="mt-3 text-xs text-stone-500 dark:text-stone-400">
          Based on your journal entries from the past month
        </Text>
      </View>
    </View>
  );
}
