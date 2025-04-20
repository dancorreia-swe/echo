import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { FC } from 'react';
import { View, TouchableOpacity } from 'react-native';

export const BottomToolbar: FC = () => (
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
);
