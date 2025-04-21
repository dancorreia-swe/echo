import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomToolbar } from './bottom-toolbar';
import { ConflictModal } from './conflict-modal';
import { useJournalEntry } from './hooks/useJournalEntry';
import { MenuModal } from './menu-modal';
import { MoodEmojiPicker, MoodEmojiPickerRef } from './mood-emoji-picker';
import { SaveStatusIndicator } from './save-status-indicator';
import { formatTime } from './utils/dateFormat';

import { Text } from '~/components/nativewindui/Text';
import { TextInput } from '~/components/nativewindui/TextInput';

export default function JournalEntryScreen() {
  const params = useLocalSearchParams<{
    day: string;
    content?: string;
    isNew?: string;
    from?: string;
  }>();

  const [menuVisible, setMenuVisible] = useState(false);
  const moodPickerRef = useRef<MoodEmojiPickerRef>(null);

  const {
    journalContent,
    setJournalContent,
    journalTitle,
    setJournalTitle,
    selectedMoods,
    selectedMoodObjects,
    handleMoodSelect,
    isMoodSelected,
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
    addAttachment,
    attachments,
    removeAttachment,
  } = useJournalEntry(params);

  const handleRemoveAttachment = (uri: string) => {
    Alert.alert('Remove Attachment', 'Are you sure you want to remove this attachment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeAttachment && removeAttachment(uri),
      },
    ]);
  };

  const addDocumentAttachment = (file: { uri: string; type: string; name: string }) => {
    if (!file.type?.startsWith('application')) return;
    addAttachment(file);
  };
  const addImageAttachment = (file: { uri: string; type: string; name: string }) => {
    if (!file.type?.startsWith('image')) return;
    addAttachment(file);
  };

  const renderAttachment = ({ item }: { item: (typeof attachments)[0] }) => (
    <TouchableOpacity
      onLongPress={() => handleRemoveAttachment(item.uri)}
      delayLongPress={500}
      activeOpacity={0.8}
      style={{
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {item.type?.startsWith('image') ? (
        <Image
          source={{ uri: item.uri }}
          style={{
            width: 72,
            height: 72,
            borderRadius: 9,
            backgroundColor: '#e5e5e5',
          }}
        />
      ) : (
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 9,
            backgroundColor: '#ece8e5',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6,
          }}>
          <Ionicons name="document-text" size={32} color="#b0a898" />
          <Text numberOfLines={1} className="mt-1 px-1 text-[11px] text-stone-400">
            {item.name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

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

          <View className="flex-row items-center justify-between px-5 py-2">
            <View className="flex-row items-center opacity-70">
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                {formattedDate.year}
              </Text>
              <Text className="mx-2 text-stone-400">•</Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">{formatTime()}</Text>
              <Text className="mx-2 text-stone-400">•</Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                {formattedDate.fullDate}
              </Text>
            </View>
            <MoodEmojiPicker
              ref={moodPickerRef}
              selectedMoods={selectedMoods}
              onSelectMood={handleMoodSelect}
              isMoodSelected={isMoodSelected}
            />
          </View>

          <ScrollView className="flex-1 px-5 pt-2" keyboardShouldPersistTaps="handled">
            {/* Moods */}
            {selectedMoodObjects.length > 0 && (
              <View className="mb-4">
                <View className="flex-row flex-wrap">
                  {selectedMoodObjects.map((mood, index) => (
                    <View key={mood.key} className="mr-2 flex-row items-center">
                      <Text className="text-md">{mood.emoji}</Text>
                      <Text className="ml-1 text-base text-stone-600 dark:text-stone-400">
                        {mood.label}
                        {index < selectedMoodObjects.length - 1 ? ',' : ''}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  Today I'm feeling{' '}
                  {selectedMoodObjects.map((m) => m.label.toLowerCase()).join(', ')}
                </Text>
              </View>
            )}

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <FlatList
                data={attachments}
                keyExtractor={(item) => item.uri}
                renderItem={renderAttachment}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
                contentContainerStyle={{ alignItems: 'center' }}
              />
            )}

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

          <BottomToolbar onAttachDoc={addDocumentAttachment} onAttachImage={addImageAttachment} />

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
