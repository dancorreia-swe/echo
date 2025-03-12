import { Recording } from 'expo-av/build/Audio';
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

interface VisualizerCircleProps {
  isRecording: boolean;
  recording: Recording | undefined;
  metering: number | undefined;
}

export function VisualizerCircle({ isRecording, recording, metering }: VisualizerCircleProps) {
  const animatedSize = useRef(new Animated.Value(200)).current;
  const BASE_SIZE = 200;

  // Update circle size based on audio level
  useEffect(() => {
    if (isRecording && recording) {
      Animated.spring(animatedSize, {
        toValue: BASE_SIZE,
        useNativeDriver: false,
        friction: 6,
      }).start();

      if (metering !== undefined && metering > -160) {
        const normalizedValue = Math.max(0, (metering + 160) / 160); // 0 to 1

        if (normalizedValue > 0.05) {
          const newSize = BASE_SIZE + normalizedValue * 70; // 200 to 320 based on volume

          Animated.spring(animatedSize, {
            toValue: newSize,
            useNativeDriver: false,
            friction: 6,
            tension: 80,
          }).start();
        }
      }
    } else {
      // Reset to base size when not recording
      Animated.spring(animatedSize, {
        toValue: BASE_SIZE,
        useNativeDriver: false,
        friction: 6,
      }).start();
    }
  }, [isRecording, recording, metering, animatedSize]);

  return (
    <Animated.View
      className="rounded-full border-2 border-green-300 bg-green-100 dark:border-green-700 dark:bg-green-900/40"
      style={{
        width: animatedSize,
        height: animatedSize,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
  );
}
