import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View, TouchableOpacity, Alert } from 'react-native';

interface ControlButtonsProps {
  isRecording: boolean;
  onStart: () => Promise<void>;
  onStop: () => Promise<string | undefined | null>;
  onDiscard: () => Promise<void>;
  onCancelDiscard: () => void;
  onPause: () => Promise<void>;
}

export function ControlButtons({
  isRecording,
  onStart,
  onStop,
  onDiscard,
  onCancelDiscard,
  onPause,
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
        className="flex size-16 items-center justify-center rounded-full bg-stone-500"
        activeOpacity={0.8}>
        <Feather name="x" size={32} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={isRecording ? onStop : onStart}
        className={`flex size-16 items-center justify-center rounded-full ${
          isRecording ? 'bg-red-500' : 'bg-stone-500'
        }`}
        activeOpacity={0.8}>
        <Ionicons name={isRecording ? 'square' : 'mic'} size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
