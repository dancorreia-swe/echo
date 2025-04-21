import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';

import { getHorizontalCalendarMatrix, getStreaks } from './calendar-util';

import { useJournalStore } from '~/store/journal-store';

const CELL_SIZE = 15;
const CELL_MARGIN = 3.7;
const WEEK_COUNT = 16;

const streakMilestones = [
  { days: 14, color: 'bg-yellow-300', text: 'text-yellow-700', icon: '🏅' },
  { days: 7, color: 'bg-orange-300', text: 'text-orange-700', icon: '✨' },
  { days: 3, color: 'bg-red-400', text: 'text-red-700', icon: '🔥' },
];

function getStreakMeta(streak: number) {
  for (const m of streakMilestones) if (streak >= m.days) return m;
  return { color: 'bg-emerald-400', text: 'text-emerald-700', icon: '🟩' };
}

export function JournalStreakChart() {
  const entries = useJournalStore((s) => s.entries);

  const { weeks, currentStreak, bestStreak, todayStr } = useMemo(() => {
    const weeksVal = getHorizontalCalendarMatrix(entries, WEEK_COUNT);
    const { currentStreak, bestStreak } = getStreaks(entries);
    const now = new Date();
    const todayStr = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    return { weeks: weeksVal, currentStreak, bestStreak, todayStr };
  }, [entries]);

  if (!weeks?.length) {
    return (
      <View className="mx-auto mt-8 px-2">
        <Text className="text-center text-stone-400">No entries yet.</Text>
      </View>
    );
  }

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const streakMeta = getStreakMeta(currentStreak);

  return (
    <View className="mx-auto mt-8 px-2">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center space-x-1">
          <Text className={`${streakMeta.text} text-md mr-1`}>{streakMeta.icon}</Text>
          <Text className={`${streakMeta.text} text-base font-bold`}>{currentStreak}</Text>
          <Text className="ml-1 text-xs font-medium text-stone-600 dark:text-stone-400">
            day streak
          </Text>
        </View>
        <View className="flex-row items-center space-x-1">
          {bestStreak >= 14 && <Text className="text-xs text-yellow-400">🏅</Text>}
          <Text className="text-xs font-medium text-stone-400 opacity-75">Max {bestStreak}</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="mr-1 flex-col justify-center">
          {weekdays.map((wd, idx) => (
            <Text
              key={`${wd}-${idx}`}
              className="text-center text-[11px] text-stone-400 dark:text-stone-500"
              style={{
                height: CELL_SIZE,
                marginVertical: CELL_MARGIN / 2,
              }}>
              {wd}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row' }}>
          {weeks.map((week, wIdx) => (
            <View key={wIdx} style={{ flexDirection: 'column', marginRight: CELL_MARGIN }}>
              {week.map(({ date, hasEntry }, dIdx) => {
                const isToday = date === todayStr;
                let backgroundColor = '#e0e5e9';
                let opacity = 0.5;
                let borderWidth = 0;
                let borderColor = undefined;

                if (hasEntry) {
                  backgroundColor = isToday ? '#22e96b' : '#22c55e';
                  opacity = 1.0;
                  if (isToday) {
                    borderWidth = 1.3;
                    borderColor = '#2abb3d';
                  }
                }
                return (
                  <View
                    key={date}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      marginVertical: CELL_MARGIN / 2,
                      borderRadius: 3,
                      backgroundColor,
                      opacity,
                      borderWidth,
                      borderColor,
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      <Text className="mt-2 text-xs text-stone-400 dark:text-stone-500">{`Last ${WEEK_COUNT} weeks activity`}</Text>
    </View>
  );
}
