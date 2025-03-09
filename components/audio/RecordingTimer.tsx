import { View } from 'react-native';

import { Text } from '~/components/nativewindui/Text';

interface RecordingTimerProps {
  recordingDuration: number;
}

export function RecordingTimer({ recordingDuration }: RecordingTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="mb-4 items-center">
      <Text className="text-2xl">{formatTime(recordingDuration)}</Text>
    </View>
  );
}
