import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Text } from '~/components/nativewindui/Text';
import { transcribe } from '~/lib/speech-to-text';

export default function AudioProcessingScreen() {
  const { audioUri } = useLocalSearchParams<{ audioUri: string }>();
  const [status, setStatus] = useState('Processing your audio...');
  const [error, setError] = useState<string | null>(null);

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    const processAudio = async () => {
      if (!audioUri) {
        setError('No audio recording found');
        return;
      }

      try {
        setStatus('Transcribing your audio...');
        const transcription = await transcribe(audioUri as string);
        console.log(transcription);
        setStatus('Creating your journal entry...');

        const timestamp = Date.now().toString();

        try {
          await AsyncStorage.setItem(`journal_entry_${timestamp}`, transcription);
          console.log(`Saved transcription to AsyncStorage with key: journal_entry_${timestamp}`);

          setTimeout(() => {
            router.replace({
              pathname: '/journal/[day]',
              params: {
                day: timestamp,
                content: transcription,
                isNew: 'true',
              },
            });
          }, 1000);
        } catch (storageError) {
          console.error('Failed to save transcription to AsyncStorage:', storageError);
          // Still navigate even if storage fails
          setTimeout(() => {
            router.replace({
              pathname: '/journal/[day]',
              params: {
                day: timestamp,
                content: transcription,
                isNew: 'true',
              },
            });
          }, 1000);
        }
      } catch (err) {
        setError(`Failed to process audio: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    processAudio();
  }, [audioUri]);

  return (
    <View className="flex-1 items-center justify-center bg-white p-6 dark:bg-stone-900">
      {error ? (
        <View className="items-center">
          <Text className="mb-4 text-lg font-medium text-red-500">{error}</Text>
          <Text className="text-blue-500 underline" onPress={() => router.back()}>
            Go Back
          </Text>
        </View>
      ) : (
        <>
          <Animated.View
            style={animatedStyles}
            className="mb-8 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-80"
          />

          <Text className="mb-2 text-xl font-medium text-stone-800 dark:text-stone-200">
            {status}
          </Text>

          <Text className="text-center text-stone-500 dark:text-stone-400">
            We're turning your voice into a beautiful journal entry
          </Text>

          <ActivityIndicator size="large" color="#8B5CF6" className="mt-8" />
        </>
      )}
    </View>
  );
}
