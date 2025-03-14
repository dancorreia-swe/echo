import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '~/components/nativewindui/Text';

const { width } = Dimensions.get('window');
const CELL_WIDTH = Math.floor(width / 7);
const CELL_HEIGHT = 45;
const WEEKS_PER_MONTH = 6;
const CALENDAR_HEIGHT = CELL_HEIGHT * WEEKS_PER_MONTH + 20;

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

export default function CalendarViewScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [writtenDays, setWrittenDays] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [recentEntries, setRecentEntries] = useState([]);
  const [initialRender, setInitialRender] = useState(true);

  const today = useMemo(() => formatDate(new Date()), []);

  const monthYearDisplay = useMemo(() => {
    return `${MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysCount = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const days = [];

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

      days.push({
        day: i,
        formattedDate,
        isSunday,
        isSaturday,
        isWeekend,
      });
    }

    const totalWeeks = WEEKS_PER_MONTH;
    const totalCells = totalWeeks * 7;
    const remainingCells = totalCells - days.length;

    for (let i = 0; i < remainingCells; i++) {
      days.push({ day: 0, formattedDate: '' });
    }

    return days;
  }, [currentMonth]);

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const loadJournalData = useCallback(async () => {
    try {
      setLoading(true);
      const entries = {};
      const journalEntries: any[] = [];

      const keys = await AsyncStorage.getAllKeys();
      const journalKeys = keys.filter((key) => key.startsWith('journal_entry_'));

      for (const key of journalKeys) {
        const date = key.replace('journal_entry_', '');
        const journalEntry = await AsyncStorage.getItem(key);
        const titleKey = `journal_title_${date}`;
        const title = (await AsyncStorage.getItem(titleKey)) || 'Untitled';

        if (journalEntry && journalEntry.trim().length > 0) {
          entries[date] = true;

          const [year, month, day] = date.split('-').map((num) => parseInt(num, 10));
          const entryDate = new Date(year, month - 1, day);

          if (
            entryDate.getMonth() === currentMonth.getMonth() &&
            entryDate.getFullYear() === currentMonth.getFullYear()
          ) {
            journalEntries.push({
              id: date,
              date,
              title,
              preview: journalEntry.substring(0, 80) + (journalEntry.length > 80 ? '...' : ''),
              formattedDate: entryDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              }),
            });
          }
        }
      }

      // Sort entries by date (newest first)
      journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

      setWrittenDays(entries);
      setRecentEntries(journalEntries);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load journal data:', error);
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    if (initialRender) {
      setInitialRender(false);
      return;
    }

    loadJournalData();
  }, [currentMonth, initialRender, loadJournalData]);

  useFocusEffect(
    useCallback(() => {
      if (!initialRender) {
        loadJournalData();
      }
      return () => {};
    }, [loadJournalData, initialRender])
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

  const selectMonth = (month) => {
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

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
                {loading ? (
                  <View className="items-center justify-center" style={{ height: CALENDAR_HEIGHT }}>
                    <ActivityIndicator size="small" color="#555" />
                  </View>
                ) : (
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
                                isNew: !(writtenDays[item.formattedDate] as any) ? 'true' : 'false',
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
                            {writtenDays[item.formattedDate] && (
                              <View className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                            )}
                          </View>
                        ) : (
                          <View style={styles.emptyCell} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </Animated.View>
                )}
              </View>
            </View>
          </View>

          <View className="border-t border-gray-200 dark:border-stone-800" />

          <View className="mt-4 px-5 pb-8">
            <Text className="mb-2 text-lg font-bold text-gray-800 dark:text-gray-200">
              Journal Entries
            </Text>

            {recentEntries.length > 0 ? (
              recentEntries.map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  onPress={() => {
                    router.push({
                      pathname: '/journal/[day]',
                      params: {
                        day: entry.date,
                        isNew: 'false',
                      },
                    });
                  }}
                  className="mb-4 border-b border-gray-100 pb-4 dark:border-stone-800">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {entry.formattedDate}
                    </Text>
                  </View>
                  <Text className="mt-1 text-base font-semibold text-gray-800 dark:text-gray-200">
                    {entry.title || 'Untitled'}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400" numberOfLines={2}>
                    {entry.preview}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View className="items-center justify-center py-4">
                <Text className="text-gray-400 dark:text-gray-500">
                  No journal entries this month
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

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
