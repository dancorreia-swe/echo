import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View, TouchableOpacity, Alert } from 'react-native';

interface ControlButtonsProps {
  isRecording: boolean;
  isPaused?: boolean;
  onStart: () => Promise<void>;
  onStop: () => Promise<string | undefined | null>;
  onDiscard: () => Promise<void>;
  onCancelDiscard: () => void;
  onPause: () => Promise<void>;
  onResume?: () => Promise<void>;
}

export function ControlButtons({
  isRecording,
  isPaused = false,
  onStart,
  onStop,
  onDiscard,
  onCancelDiscard,
  onPause,
  onResume,
}: ControlButtonsProps) {
  const handleCancelPress = () => {
    if (isRecording) {
      // Pause the recording while the alert is shown
      onPause();

      Alert.alert('Discard Recording', 'Are you sure you want to discard this recording?', [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancelDiscard,
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: onDiscard,
        },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <View className="mb-10 flex-row items-center justify-between px-6">
      <TouchableOpacity
        onPress={handleCancelPress}
        className="flex size-14 items-center justify-center rounded-full bg-stone-500 dark:bg-stone-600"
        activeOpacity={0.8}>
        <Feather name="x" size={28} color="white" />
      </TouchableOpacity>

      {isRecording && (
        <TouchableOpacity
          onPress={isPaused ? onResume : onPause}
          className="flex size-14 items-center justify-center rounded-full bg-amber-500 dark:bg-amber-600"
          activeOpacity={0.8}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={28} color="white" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={isRecording ? onStop : onStart}
        className={`flex size-14 items-center justify-center rounded-full ${
          isRecording ? 'bg-red-500 dark:bg-red-600' : 'bg-stone-500 dark:bg-stone-600'
        }`}
        activeOpacity={0.8}>
        <Ionicons name={isRecording ? 'square' : 'mic'} size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
