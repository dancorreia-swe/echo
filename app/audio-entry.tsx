import { router } from 'expo-router';
import { useRef, useEffect } from 'react';
import { View } from 'react-native';

import { ControlButtons } from '~/components/audio/ControlButtons';
import { RecordingTimer } from '~/components/audio/RecordingTimer';
import { VisualizerCircle } from '~/components/audio/VisualizerCircle';
import { Text } from '~/components/nativewindui/Text';
import { useAudioRecording } from '~/hooks/useAudioRecording';

export default function AudioEntryScreen() {
  const wasRecordingRef = useRef<boolean>(false);
  const {
    recording,
    isRecording,
    isPaused,
    metering,
    recordingDuration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    discardRecording,
  } = useAudioRecording();

  function getInstructionText(isRecording: boolean, isPaused: boolean): string {
    if (!isRecording) {
      return 'Tap the microphone to start recording';
    }

    if (isPaused) {
      return 'Recording paused - tap play to resume';
    }

    return 'Speak your thoughts for today';
  }

  useEffect(() => {
    if (isPaused) {
      wasRecordingRef.current = true;
    } else if (!isRecording) {
      wasRecordingRef.current = false;
    }
  }, [isPaused, isRecording]);

  const handleDiscard = async () => {
    await discardRecording();
    router.back();
  };

  const handleCancelDiscard = () => {
    if (isRecording && wasRecordingRef.current) {
      resumeRecording();
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-stone-900">
      {/* Main Content */}
      <View className="flex-1 justify-between p-6 pt-20">
        <View>
          <Text className="mb-2 text-center text-xl font-semibold text-stone-900 dark:text-stone-100">
            {!isRecording ? 'Ready to Record' : isPaused ? 'Paused' : 'Recording...'}
          </Text>
          <Text className="text-center text-gray-500 dark:text-gray-400">
            {getInstructionText(isRecording, isPaused)}
          </Text>
        </View>

        <View className="h-48 items-center justify-center">
          <VisualizerCircle isRecording={isRecording} recording={recording} metering={metering} />
        </View>

        {/* Recording Timer */}
        <RecordingTimer recordingDuration={recordingDuration} />

        {/* Control Buttons */}
        <ControlButtons
          isRecording={isRecording}
          isPaused={isPaused}
          onStart={startRecording}
          onStop={stopRecording}
          onDiscard={handleDiscard}
          onCancelDiscard={handleCancelDiscard}
          onPause={pauseRecording}
          onResume={resumeRecording}
        />
      </View>
    </View>
  );
}
