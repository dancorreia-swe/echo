import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomToolbar } from './bottom-toolbar';
import { ConflictModal } from './conflict-modal';
import { useJournalEntry } from './hooks/useJournalEntry';
import { MenuModal } from './menu-modal';
import { SaveStatusIndicator } from './save-status-indicator';
import { formatTime } from './utils/dateFormat';

import { Text } from '~/components/nativewindui/Text';
import { TextInput } from '~/components/nativewindui/TextInput';

export default function JournalEntryScreen() {
  const params = useLocalSearchParams<{
    day: string;
    content: string;
    isNew: string;
    from: string;
  }>();

  const [menuVisible, setMenuVisible] = useState(false);

  const {
    journalContent,
    setJournalContent,
    journalTitle,
    setJournalTitle,
    isSaving,
    saved,
    formattedDate,
    handleNavigateBack,
    handleDelete,
    handleShare,
    contentConflictModalVisible,
    setContentConflictModalVisible,
    handleContentConflict,
    isNew,
  } = useJournalEntry(params);

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
              onPress={handleNavigateBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
              <Ionicons name="chevron-back" size={24} color="#555" />
            </TouchableOpacity>

            <View className="flex-row space-x-3">
              <SaveStatusIndicator isSaving={isSaving} saved={saved} />

              <View>
                <TouchableOpacity
                  onPress={() => setMenuVisible(!menuVisible)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
                  <Ionicons name="ellipsis-vertical" size={20} color="#555" />
                </TouchableOpacity>

                <MenuModal
                  visible={menuVisible}
                  onClose={() => setMenuVisible(false)}
                  onDelete={() => {
                    setMenuVisible(false);
                    handleDelete();
                  }}
                  onShare={() => {
                    setMenuVisible(false);
                    handleShare();
                  }}
                />
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

          <BottomToolbar />

          <ConflictModal
            visible={contentConflictModalVisible}
            onClose={() => setContentConflictModalVisible(false)}
            onOverride={handleContentConflict.override}
            onAppend={handleContentConflict.append}
            onKeepExisting={handleContentConflict.discard}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
