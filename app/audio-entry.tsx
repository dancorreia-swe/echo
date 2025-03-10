import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { View } from 'react-native';

import { ControlButtons } from '~/components/audio/ControlButtons';
import { RecordingTimer } from '~/components/audio/RecordingTimer';
import { VisualizerCircle } from '~/components/audio/VisualizerCircle';
import { Text } from '~/components/nativewindui/Text';
import { useAudioRecording } from '~/hooks/useAudioRecording';

export default function AudioEntryScreen() {
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

  const wasRecordingRef = useRef<boolean>(false);

  // Track if we were recording before pausing (for alert cancel handling)
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
    // Resume recording if user cancels
    if (isRecording && wasRecordingRef.current) {
      resumeRecording();
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Main Content */}
      <View className="flex-1 justify-between p-6 pt-20">
        <View>
          <Text className="mb-2 text-center text-xl font-semibold">
            {isRecording ? 'Recording...' : 'Ready to Record'}
          </Text>
          <Text className="text-center text-gray-500">
            {isRecording
              ? 'Speak your thoughts for today'
              : 'Tap the microphone to start recording'}
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
          onStart={startRecording}
          onStop={stopRecording}
          onDiscard={handleDiscard}
          onCancelDiscard={handleCancelDiscard}
          onPause={pauseRecording}
        />
      </View>
    </View>
  );
}
