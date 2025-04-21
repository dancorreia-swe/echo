import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MOOD_EMOJIS } from '../journal/utils/constants';

import { Text } from '~/components/nativewindui/Text';
import { useJournalStore } from '~/store/journal-store';

const { width } = Dimensions.get('window');
const CELL_WIDTH = Math.floor(width / 7);
const CELL_HEIGHT = 45;
const WEEKS_PER_MONTH = 5;
const CALENDAR_HEIGHT = CELL_HEIGHT * WEEKS_PER_MONTH + 12;

const MONTHS = [
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

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const moodMap = Object.fromEntries(MOOD_EMOJIS.map((m) => [m.key, m.emoji]));

function isWritten(entry: any) {
  return (
    !!entry &&
    ((entry.content && entry.content.trim() !== '') ||
      (entry.title && entry.title.trim() !== '') ||
      (Array.isArray(entry.moods) && entry.moods.length > 0))
  );
}

export default function CalendarViewScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const entries = useJournalStore((s) => s.entries);

  const today = useMemo(() => formatDate(new Date()), []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysCount = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const days: {
      day: number;
      formattedDate: string;
      isSunday?: boolean;
      isSaturday?: boolean;
      isWeekend?: boolean;
      written?: boolean;
    }[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: 0, formattedDate: '' });
    }
    for (let i = 1; i <= daysCount; i++) {
      const date = new Date(year, month, i);
      const formattedDate = formatDate(date);
      const dayOfWeek = date.getDay();
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const isWeekend = isSunday || isSaturday;
      const entry = entries[formattedDate];
      const written = isWritten(entry);
      days.push({
        day: i,
        formattedDate,
        isSunday,
        isSaturday,
        isWeekend,
        written,
      });
    }
    const totalWeeks = WEEKS_PER_MONTH;
    const totalCells = totalWeeks * 7;
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push({ day: 0, formattedDate: '' });
    }
    return days;
  }, [currentMonth, entries]);

  const recentEntries = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return Object.entries(entries)
      .filter(([dateStr, entry]: [string, any]) => {
        try {
          const [yy, mm, dd] = dateStr.split('-').map(Number);
          return mm - 1 === month && yy === year && isWritten(entry);
        } catch {
          return false;
        }
      })
      .map(([dateStr, entry]) => {
        const dateObj = parseLocalDateKey(dateStr);
        return {
          id: dateStr,
          date: dateStr,
          title: entry.title || 'Untitled',
          preview: entry.content
            ? entry.content.substring(0, 80) + (entry.content.length > 80 ? '...' : '')
            : '',
          formattedDate: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          moods: entry.moods,
        };
      })
      .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf());
  }, [currentMonth, entries]);

  const monthYearDisplay = useMemo(
    () => `${MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`,
    [currentMonth]
  );

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };
  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  const selectMonth = (month: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(month);
    setCurrentMonth(newDate);
    setShowMonthPicker(false);
  };

  return (
    <View className="flex-1 bg-white dark:bg-stone-900">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-stone-800">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex h-10 w-10 items-center justify-center">
            <Ionicons name="close" size={24} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToToday}
            className="flex h-9 items-center justify-center rounded-full bg-gray-100 px-4 dark:bg-stone-800">
            <Text className="text-sm font-medium text-gray-800 dark:text-stone-200">Today</Text>
          </TouchableOpacity>
        </View>

        <View className="pt-6">
          <View className="mb-6 flex-row items-center justify-between px-4">
            <TouchableOpacity
              onPress={goToPreviousMonth}
              className="h-10 w-10 items-center justify-center">
              <Ionicons name="chevron-back" size={22} color="#555" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowMonthPicker(true)}
              activeOpacity={0.7}
              className="px-4">
              <Text className="text-center text-2xl font-bold text-black dark:text-white">
                {monthYearDisplay}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToNextMonth}
              className="h-10 w-10 items-center justify-center">
              <Ionicons name="chevron-forward" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 0 }}>
            <View style={styles.weekdayHeader}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <View key={index} style={styles.weekdayCell}>
                  <Text
                    className={`text-sm font-medium ${
                      index === 0 || index === 6
                        ? 'text-red-400 dark:text-red-500'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ height: CALENDAR_HEIGHT }}>
              <Animated.View style={[styles.calendarGrid]}>
                {calendarDays.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      if (item.day > 0) {
                        router.push({
                          pathname: '/journal/[day]',
                          params: {
                            day: item.formattedDate,
                            isNew: !item.written ? 'true' : 'false',
                          },
                        });
                      }
                    }}
                    disabled={item.day === 0}
                    style={styles.calendarCell}>
                    {item.day > 0 ? (
                      <View style={styles.dayCellWrapper}>
                        <Text
                          className={`text-lg ${
                            item.isWeekend
                              ? 'text-red-400 dark:text-red-500'
                              : 'text-gray-800 dark:text-gray-200'
                          } ${
                            item.formattedDate === today
                              ? 'font-bold text-blue-500 dark:text-blue-400'
                              : ''
                          }`}>
                          {item.day}
                        </Text>
                        {item.written && (
                          <View className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                        )}
                      </View>
                    ) : (
                      <View style={styles.emptyCell} />
                    )}
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
          </View>
        </View>

        <View className="border-t border-gray-200 dark:border-stone-800" />

        <Text className=" p-4 pb-2 text-lg font-bold text-gray-800 dark:text-gray-200">
          Journal Entries
        </Text>
        <FlatList
          data={recentEntries}
          keyExtractor={(entry) => entry.id}
          style={{ maxHeight: 360 }}
          showsVerticalScrollIndicator
          renderItem={({ item: entry }) => (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/journal/[day]',
                  params: {
                    day: entry.date,
                    isNew: 'false',
                  },
                });
              }}
              className="mb-4 border-b border-gray-100 p-3 px-4 dark:border-stone-800">
              <View className="flex-row items-start justify-between">
                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {entry.formattedDate}
                </Text>
                <View className="flex-row items-center">
                  {(Array.isArray(entry.moods) ? entry.moods : []).map((key) =>
                    moodMap[key] ? (
                      <Text
                        key={key}
                        style={{ fontSize: 16, marginLeft: 2 }}
                        accessibilityLabel={key}>
                        {moodMap[key]}
                      </Text>
                    ) : null
                  )}
                </View>
              </View>
              <Text className="mt-1 text-base font-semibold text-gray-800 dark:text-gray-200">
                {entry.title || 'Untitled'}
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400" numberOfLines={2}>
                {entry.preview}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-4">
              <Text className="text-gray-400 dark:text-gray-500">
                No journal entries this month
              </Text>
            </View>
          }
        />

        <Modal
          visible={showMonthPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMonthPicker(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowMonthPicker(false)}
            activeOpacity={1}>
            <View className="m-5 overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">
              <View className="border-b border-gray-100 p-4 dark:border-stone-700">
                <Text className="text-center text-lg font-bold text-gray-800 dark:text-gray-200">
                  Select Month
                </Text>
              </View>
              <View className="flex-row flex-wrap p-4">
                {MONTHS.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => selectMonth(index)}
                    className={`m-1 h-12 w-[30%] items-center justify-center rounded-full ${
                      index === currentMonth.getMonth()
                        ? 'bg-blue-500 dark:bg-blue-700'
                        : 'bg-gray-100 dark:bg-stone-700'
                    }`}>
                    <Text
                      className={`text-sm font-medium ${
                        index === currentMonth.getMonth()
                          ? 'text-white'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setShowMonthPicker(false)}
                className="border-t border-gray-100 p-4 dark:border-stone-700">
                <Text className="text-center text-base font-medium text-blue-500 dark:text-blue-400">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    width: '100%',
  },
  weekdayCell: {
    width: CELL_WIDTH,
    alignItems: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  calendarCell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    marginBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCell: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
});
