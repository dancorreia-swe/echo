import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

import { Text } from '~/components/nativewindui/Text';
import { transcribe } from '~/lib/speech-to-text';

export default function AudioProcessingScreen() {
  const { audioUri, date } = useLocalSearchParams<{ audioUri: string; date: string }>();
  const [status, setStatus] = useState('Processing your audio...');
  const [error, setError] = useState<string | null>(null);

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

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

        const entryDate = date || new Date().toISOString().split('T')[0];

        setTimeout(() => {
          router.replace({
            pathname: '/journal/[day]',
            params: {
              day: entryDate,
              content: transcription,
              isNew: 'true',
              from: 'audio-entry',
            },
          });
        }, 1000);
      } catch (err) {
        setError(`Failed to process audio: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    processAudio();
  }, [audioUri]);

  return (
    <SafeAreaView className="flex-1 bg-[#f1efee] dark:bg-stone-900">
      <StatusBar barStyle="dark-content" backgroundColor="#f1efee" />
      <View className="flex-1 items-center justify-center px-6">
        {error ? (
          <View className="items-center">
            <Text className="mb-4 text-lg font-medium text-red-500">{error}</Text>
            <Text className="text-blue-500 underline" onPress={() => router.back()}>
              Go Back
            </Text>
          </View>
        ) : (
          <View className="w-full items-center justify-center">
            <Text className="mb-6 text-center text-2xl font-semibold text-stone-800 dark:text-stone-200">
              {status}
            </Text>

            <Text className="mb-8 text-center text-stone-500 dark:text-stone-400">
              We're turning your voice into a beautiful journal entry
            </Text>

            <ActivityIndicator size="large" color="#8B5CF6" className="mt-4" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
