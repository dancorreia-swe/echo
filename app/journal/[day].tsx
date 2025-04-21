import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  View,
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

  // Render attachment as card for ScrollView
  const renderAttachmentCard = (item: (typeof attachments)[0]) => {
    const CARD_STYLE = {
      width: 72,
      height: 72,
      borderRadius: 9,
      backgroundColor: '#ece8e5', // Metallic theme, matches doc
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
      marginRight: 12,
    } as const;

    // Image attachments: use same metallic card but with image thumbnail
    if (item.type?.startsWith('image') && item.uri) {
      return (
        <TouchableOpacity
          key={item.uri}
          onLongPress={() => handleRemoveAttachment(item.uri)}
          delayLongPress={500}
          activeOpacity={0.8}
          style={{ alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <View style={CARD_STYLE}>
            <Image
              source={{ uri: item.uri }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 7,
                backgroundColor: '#dbdbdb', // fallback shade for image bg
                resizeMode: 'cover',
              }}
            />
            <Text
              numberOfLines={1}
              style={{
                marginTop: 6,
                paddingHorizontal: 2,
                fontSize: 11,
                color: '#888',
                width: '100%',
                textAlign: 'center',
              }}>
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Document attachments: use same base card, with icon
    if (item.type?.startsWith('application') && item.uri) {
      return (
        <TouchableOpacity
          key={item.uri}
          onLongPress={() => handleRemoveAttachment(item.uri)}
          delayLongPress={500}
          activeOpacity={0.8}
          style={{ alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <View style={CARD_STYLE}>
            <Ionicons name="document-text" size={32} color="#b0a898" />
            <Text
              numberOfLines={1}
              style={{
                marginTop: 6,
                paddingHorizontal: 2,
                fontSize: 11,
                color: '#888',
                width: '100%',
                textAlign: 'center',
              }}>
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
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

            {/* ATTACHMENTS: Horizontally scrollable, custom layout for full control */}
            {attachments && attachments.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={{
                  alignItems: 'center',
                  paddingVertical: 4,
                  minHeight: 80,
                }}
                style={{
                  marginBottom: 16,
                  minHeight: 84,
                }}>
                {attachments.map(renderAttachmentCard)}
              </ScrollView>
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
