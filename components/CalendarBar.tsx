import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { View, Pressable } from 'react-native';

import { Text } from './nativewindui/Text';

import { cn } from '~/lib/cn';
import { useJournalStore } from '~/store/journal-store';

export function CalendarBar() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);

  const entries = useJournalStore((s) => s.entries);

  const weekDays = useMemo(() => {
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const entry = entries[formattedDate];
      const written =
        !!entry &&
        ((entry.content && entry.content.trim() !== '') ||
          (entry.title && entry.title.trim() !== '') ||
          (Array.isArray(entry.moods) && entry.moods.length > 0));

      return {
        date,
        dayNum: date.getDate(),
        dayName: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i],
        isCurrentDay: date.toDateString() === today.toDateString(),
        formattedDate,
        written,
      };
    });
  }, [entries, today]);

  const formattedDate = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const dayName = days[today.getDay()];
    const monthName = months[today.getMonth()];
    const date = today.getDate();
    const year = today.getFullYear();
    return `${dayName} ${monthName} ${date} ${year}`;
  }, [today]);

  return (
    <Pressable
      onLongPress={() => router.push('calendar/calendar-view')}
      className="h-36 border-b border-b-[#E7E1DE] bg-[#F1EFEE] px-8 pt-16 dark:border-b-stone-700 dark:bg-stone-800">
      <View className="mb-2 flex-row items-center justify-between">
        {weekDays.map((day, index) => (
          <Day
            key={index}
            day={day.dayNum.toString()}
            dayName={day.dayName}
            currentDay={day.isCurrentDay}
            written={day.written}
            onPress={() => {
              router.push({
                pathname: '/journal/[day]',
                params: {
                  day: day.formattedDate,
                  isNew: !day.written ? 'true' : 'false',
                },
              });
            }}
          />
        ))}
      </View>
      <Text className="text-center text-xs uppercase text-stone-500 dark:text-stone-400">
        {formattedDate}
      </Text>
    </Pressable>
  );
}

type DayProps = {
  day: string;
  dayName: string;
  currentDay?: boolean;
  written?: boolean;
  onPress?: () => void;
};

function Day({ currentDay, day, dayName, written, onPress }: DayProps) {
  return (
    <Pressable onPress={onPress} className="items-center">
      <Text className="mb-1 text-xs text-stone-500 dark:text-stone-400">{dayName}</Text>
      <View
        className={cn(
          'flex aspect-square size-8 items-center justify-center rounded-full',
          currentDay && 'bg-stone-500 dark:bg-stone-700',
          written && 'border-2 border-stone-500/30 dark:border-stone-600/40',
          currentDay && written && 'border-emerald-300 dark:border-emerald-800'
        )}>
        <Text
          className={cn(
            'text-md font-semibold',
            currentDay ? 'text-white' : 'text-stone-900 dark:text-stone-100',
            currentDay && written && 'text-emerald-300 dark:text-emerald-400'
          )}>
          {day}
        </Text>
      </View>
    </Pressable>
  );
}
