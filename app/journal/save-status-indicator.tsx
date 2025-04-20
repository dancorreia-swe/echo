import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { ActivityIndicator } from '~/components/nativewindui/ActivityIndicator';

interface SaveStatusIndicatorProps {
  isSaving: boolean;
  saved: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ isSaving, saved }) => {
  if (isSaving) {
    return (
      <View className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
        <ActivityIndicator size="small" color="#555" />
      </View>
    );
  } else if (saved) {
    return (
      <View className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
        <Ionicons name="cloud-done-outline" size={20} color="#4CAF50" />
      </View>
    );
  } else {
    return (
      <View className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFEE] dark:bg-stone-800">
        <Ionicons name="cloud-outline" size={20} color="#555" />
      </View>
    );
  }
};
