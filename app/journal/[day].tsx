import { Ionicons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from '~/components/nativewindui/ActivityIndicator';

import { Text } from '~/components/nativewindui/Text';
import { TextInput } from '~/components/nativewindui/TextInput';

export default function JournalEntryScreen() {
  const { day, content, isNew } = useLocalSearchParams<{
    day: string;
    content: string;
    isNew: string;
  }>();

  const [journalContent, setJournalContent] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formattedDate = (() => {
    try {
      let dateObj;

      if (day) {
        if (day.includes('-') && day.split('-').length === 3) {
          const [year, month, date] = day.split('-').map((num) => parseInt(num, 10));
          dateObj = new Date(year, month - 1, date);
        } else {
          dateObj = new Date(day);
        }
      } else {
        dateObj = new Date();
      }

      return {
        year: dateObj.getFullYear(),
        fullDate: dateObj.toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    } catch (error) {
      console.error('Error parsing date:', error);
      const now = new Date();
      return {
        year: now.getFullYear(),
        fullDate: now.toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    }
  })();

  useEffect(() => {
    const loadJournalEntry = async () => {
      try {
        const storedEntry = await AsyncStorage.getItem(`journal_entry_${day}`);
        const storedTitle = await AsyncStorage.getItem(`journal_title_${day}`);

        if (storedEntry) {
          setJournalContent(storedEntry);
        } else if (content) {
          setJournalContent(content);
          await AsyncStorage.setItem(`journal_entry_${day}`, content);
        } else {
          setJournalContent('');
        }

        if (storedTitle) {
          setJournalTitle(storedTitle);
        } else {
          setJournalTitle('');
        }
      } catch (error) {
        console.error('Failed to load journal entry:', error);
        // Fallback to content from params if storage fails
        if (content) {
          setJournalContent(content);
        }
      }
    };

    // Always load the journal entry when the component mounts or day changes
    loadJournalEntry();

    if (isNew === 'true') {
      // Give focus to title for new entries
      setJournalTitle('');
    }
  }, [day, content, isNew]);

  // Set up auto-save functionality
  useEffect(() => {
    // Clear any existing timer when content changes
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set a new timer to save after 2 seconds of inactivity
    if (journalContent.length > 0) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);

      setAutoSaveTimer(timer);
    }

    // Clean up timer on unmount
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [journalContent, journalTitle]);

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      await AsyncStorage.setItem(`journal_entry_${day}`, journalContent);
      await AsyncStorage.setItem(`journal_title_${day}`, journalTitle);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      console.log(`Journal entry saved for day: ${day}`);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      // You could add an error notification here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F1EFEE] dark:bg-stone-900">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
              <Ionicons name="chevron-back" size={24} color="#555" />
            </TouchableOpacity>

            <View className="flex-row space-x-3">
              {isSaving && (
                <View className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
                  <ActivityIndicator size="small" color="#555" />
                </View>
              )}
              {saved && (
                <View className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
              )}
            </View>
          </View>

          {/* Date Indicator */}
          <View className="flex-row items-center px-5 py-2 opacity-70">
            <Text className="text-sm text-stone-500 dark:text-stone-400">{formattedDate.year}</Text>
            <Text className="mx-2 text-stone-400">•</Text>
            <Text className="text-sm text-stone-500 dark:text-stone-400">{formatTime()}</Text>
            <Text className="mx-2 text-stone-400">•</Text>
            <Text className="text-sm text-stone-500 dark:text-stone-400">
              {formattedDate.fullDate}
            </Text>
          </View>

          <ScrollView className="flex-1 px-5 pt-2">
            {/* Title Input */}
            <TextInput
              value={journalTitle}
              onChangeText={setJournalTitle}
              placeholder="Enter a title..."
              className="mb-4 border-0 bg-[#F1EFEE] pb-2 text-3xl font-bold text-stone-800 dark:bg-stone-900 dark:text-stone-200"
              placeholderTextColor="rgba(100, 116, 139, 0.6)"
              autoFocus={isNew === 'true'}
            />

            {/* Content Input */}
            <TextInput
              multiline
              value={journalContent}
              onChangeText={setJournalContent}
              placeholder="Today marks the beginning of my journey..."
              className="min-h-full border-0 bg-[#f1efee] text-lg leading-relaxed text-stone-800 dark:bg-stone-900 dark:text-stone-300"
              placeholderTextColor="rgba(100, 116, 139, 0.6)"
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Footer Action Buttons */}
          <View className="absolute bottom-0 left-0 right-0">
            <BlurView
              intensity={20}
              tint="light"
              className="border-t border-gray-200 dark:border-stone-800">
              <View className="flex-row justify-around px-6 py-4">
                <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
                  <Ionicons name="attach" size={22} color="#555" />
                </TouchableOpacity>

                <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
                  <Ionicons name="mic-outline" size={22} color="#555" />
                </TouchableOpacity>

                <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
                  <Ionicons name="image-outline" size={22} color="#555" />
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
