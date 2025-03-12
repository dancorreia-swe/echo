import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';
import { useState, useRef, useEffect } from 'react';

export function useAudioRecording() {
  const [recording, setRecording] = useState<Recording | undefined>(undefined);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [metering, setMetering] = useState<number | undefined>(undefined);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const meteringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUnloadedRef = useRef<boolean>(false);

  // Cleanup function to clear all intervals
  const clearAllIntervals = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (meteringIntervalRef.current) {
      clearInterval(meteringIntervalRef.current);
      meteringIntervalRef.current = null;
    }
  };

  // Start monitoring audio levels when recording
  useEffect(() => {
    if (isRecording && recording && !isPaused) {
      meteringIntervalRef.current = setInterval(async () => {
        try {
          if (!recording) return;

          const { metering } = await recording.getStatusAsync();
          setMetering(metering);
          console.log('metering', metering);
        } catch (error) {
          console.error('Error monitoring loudness:', error);
        }
      }, 100);
    }

    return () => {
      if (meteringIntervalRef.current) {
        clearInterval(meteringIntervalRef.current);
        meteringIntervalRef.current = null;
      }
    };
  }, [isRecording, recording, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllIntervals();

      // Only try to stop and unload if we haven't already done so
      if (recording && !isUnloadedRef.current) {
        isUnloadedRef.current = true;
        recording.stopAndUnloadAsync().catch((err) => {
          // If it's already unloaded, that's fine
          if (!err.message?.includes('already been unloaded')) {
            console.error('Error during cleanup:', err);
          }
        });
      }
    };
  }, [recording]);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      // Reset unloaded state for new recording
      isUnloadedRef.current = false;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });

      setRecording(recording);
      setIsRecording(true);
      setIsPaused(false);

      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    clearAllIntervals();

    let uri;

    if (recording && !isUnloadedRef.current) {
      try {
        isUnloadedRef.current = true;
        await recording.stopAndUnloadAsync();
        uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);
      } catch (err) {
        if (err.message?.includes('already been unloaded')) {
          console.log('Recording was already unloaded');
        } else {
          console.error('Error stopping recording:', err);
        }
      }
    }

    setRecording(undefined);
    setIsRecording(false);
    setIsPaused(false);
    setMetering(undefined);
    setRecordingDuration(0);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    return uri;
  }

  async function discardRecording() {
    console.log('Discarding recording..');
    clearAllIntervals();

    // Stop and unload the recording without saving it
    if (recording && !isUnloadedRef.current) {
      try {
        isUnloadedRef.current = true;
        await recording.stopAndUnloadAsync();
      } catch (err) {
        if (err.message?.includes('already been unloaded')) {
          console.log('Recording was already unloaded');
        } else {
          console.error('Error discarding recording:', err);
        }
      }
    }

    setRecording(undefined);
    setIsRecording(false);
    setIsPaused(false);
    setMetering(undefined);
    setRecordingDuration(0);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    console.log('Recording discarded');
  }

  async function pauseRecording() {
    console.log('Pausing recording...');
    clearAllIntervals();

    try {
      if (recording && isRecording && !isPaused) {
        await recording.pauseAsync();
        setIsPaused(true);
        console.log('Recording paused');
      }
    } catch (err) {
      console.error('Failed to pause recording', err);
    }
  }

  async function resumeRecording() {
    console.log('Resuming recording...');

    try {
      if (recording && isRecording && isPaused) {
        await recording.startAsync();

        // Restart the timer for recording duration
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);

        setIsPaused(false);
        console.log('Recording resumed');
      }
    } catch (err) {
      console.error('Failed to resume recording', err);
    }
  }

  return {
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
  };
}
