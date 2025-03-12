import { Ionicons } from '@expo/vector-icons';
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
  Modal,
  Share,
  Alert,
  TouchableWithoutFeedback,
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
  const [menuVisible, setMenuVisible] = useState(false);

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
        if (content) {
          setJournalContent(content);
        }
      }
    };

    loadJournalEntry();

    if (isNew === 'true') {
      setJournalTitle('');
    }
  }, [day, content, isNew]);

  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    if (journalContent.length > 0) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);

      setAutoSaveTimer(timer);
    }

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
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(`journal_entry_${day}`);
              await AsyncStorage.removeItem(`journal_title_${day}`);
              router.back();
            } catch (error) {
              console.error('Failed to delete journal entry:', error);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    setMenuVisible(false);
    try {
      const title = journalTitle || 'Journal Entry';
      const message = `${title}\n\n${journalContent}\n\n${formattedDate.fullDate}`;

      await Share.share({
        message,
        title,
      });
    } catch (error) {
      console.error('Error sharing note:', error);
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
              {isSaving ? (
                <View className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
                  <ActivityIndicator size="small" color="#555" />
                </View>
              ) : saved ? (
                <View className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
                  <Ionicons name="cloud-done-outline" size={20} color="#4CAF50" />
                </View>
              ) : (
                <View className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
                  <Ionicons name="cloud-outline" size={20} color="#555" />
                </View>
              )}

              <View>
                <TouchableOpacity
                  onPress={() => setMenuVisible(!menuVisible)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
                  <Ionicons name="ellipsis-vertical" size={20} color="#555" />
                </TouchableOpacity>

                {menuVisible && (
                  <Modal
                    transparent
                    visible={menuVisible}
                    animationType="fade"
                    onRequestClose={() => setMenuVisible(false)}>
                    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                      <View className="flex-1">
                        <View className="absolute right-4 top-[102px] z-50 w-48 rounded-lg bg-white shadow-xl dark:bg-stone-800">
                          <TouchableOpacity
                            onPress={handleDelete}
                            className="flex-row items-center py-3 pl-4 pr-6">
                            <View className="mr-3">
                              <Ionicons name="trash-outline" size={18} color="#FF5252" />
                            </View>
                            <Text className="text-sm font-medium text-stone-800 dark:text-stone-200">
                              Delete note
                            </Text>
                          </TouchableOpacity>

                          <View className="h-px bg-gray-200 dark:bg-stone-700" />

                          <TouchableOpacity
                            onPress={handleShare}
                            className="flex-row items-center py-3 pl-4 pr-6">
                            <View className="mr-3">
                              <Ionicons name="share-outline" size={18} color="#555" />
                            </View>
                            <Text className="text-sm font-medium text-stone-800 dark:text-stone-200">
                              Share note
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  </Modal>
                )}
              </View>
            </View>
          </View>

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
            <TextInput
              value={journalTitle}
              onChangeText={setJournalTitle}
              placeholder="Enter a title..."
              className="mb-4 border-0 bg-[#F1EFEE] pb-2 text-3xl font-bold text-stone-800 dark:bg-stone-900 dark:text-stone-200"
              placeholderTextColor="rgba(41, 37, 36)"
              autoFocus={isNew === 'true'}
            />

            <TextInput
              multiline
              value={journalContent}
              onChangeText={setJournalContent}
              placeholder="Today marks the beginning of my journey..."
              className="min-h-full border-0 bg-[#f1efee] text-lg leading-relaxed text-stone-800 dark:bg-stone-900 dark:text-stone-300"
              placeholderTextColor="rgba(41, 37, 36)"
              textAlignVertical="top"
            />
          </ScrollView>

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
