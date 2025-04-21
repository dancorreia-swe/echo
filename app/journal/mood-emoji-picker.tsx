import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

import { MOOD_EMOJIS, MoodType, MAX_MOOD_SELECTIONS } from './utils/constants';

import { Text } from '~/components/nativewindui/Text';

export interface MoodEmojiPickerRef {
  openPicker: () => void;
}

interface MoodEmojiPickerProps {
  selectedMoods: string[];
  onSelectMood: (mood: MoodType) => void;
  isMoodSelected: (moodKey: string) => boolean;
}

export const MoodEmojiPicker = forwardRef<MoodEmojiPickerRef, MoodEmojiPickerProps>(
  ({ selectedMoods, onSelectMood, isMoodSelected }, ref) => {
    const [modalVisible, setModalVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      openPicker: () => setModalVisible(true),
    }));

    const selectedMoodObjects = MOOD_EMOJIS.filter((mood) => selectedMoods.includes(mood.key));

    const getButtonText = () => {
      if (selectedMoods.length === 0) {
        return 'Add mood';
      }

      return '';
    };

    const getButtonEmojis = () => {
      if (selectedMoods.length === 0) {
        return '😶';
      } else if (selectedMoods.length === 1) {
        return selectedMoodObjects[0].emoji;
      } else {
        return selectedMoodObjects.map((m) => m.emoji).join(' ');
      }
    };

    return (
      <>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center rounded-lg px-3 py-2 dark:bg-stone-800">
          <Text className="mr-2 text-xs text-stone-700 dark:text-stone-300">
            {getButtonEmojis()}
          </Text>
          <Text className="text-sm text-stone-600 dark:text-stone-400">{getButtonText()}</Text>
          <Ionicons name="chevron-down" size={16} color="#888" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <Modal
          transparent
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
              <View className="flex-1 items-center justify-center p-5">
                <View className="w-full max-w-md rounded-xl bg-white p-4 dark:bg-stone-800">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-stone-800 dark:text-stone-200">
                      How are you feeling today?
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Ionicons name="close" size={24} color="#888" />
                    </TouchableOpacity>
                  </View>

                  <Text className="mb-4 text-sm text-stone-600 dark:text-stone-400">
                    Select up to {MAX_MOOD_SELECTIONS} moods
                  </Text>

                  <View className="mb-4 flex-row flex-wrap">
                    {selectedMoodObjects.map((mood) => (
                      <View
                        key={mood.key}
                        className="m-1 flex-row items-center rounded-full bg-stone-100 px-3 py-1 dark:bg-blue-900">
                        <Text className="mr-1">{mood.emoji}</Text>
                        <Text className="mr-1 text-xs text-stone-700 dark:text-stone-300">
                          {mood.label}
                        </Text>
                        <TouchableOpacity
                          onPress={() => onSelectMood(mood)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                          <Ionicons name="close-circle" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <FlatList
                    data={MOOD_EMOJIS}
                    numColumns={4}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className={`m-1 flex-1 items-center rounded-lg p-3 ${
                          isMoodSelected(item.key) ? 'bg-stone-200/50 dark:bg-blue-900' : ''
                        }`}
                        onPress={() => onSelectMood(item)}>
                        <Text className="mb-1 text-2xl">{item.emoji}</Text>
                        <Text className="text-xs text-stone-700 dark:text-stone-300">
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.key}
                    style={{ maxHeight: 300 }}
                  />

                  <View className="mt-4 flex-row justify-end">
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      className="rounded-lg bg-stone-500 px-4 py-2">
                      <Text className="font-medium text-white">Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        </Modal>
      </>
    );
  }
);
