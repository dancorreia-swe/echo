import * as FileSystem from 'expo-file-system';

type TranscribeConfig = {
  apiKey: string;
  model?: string;
  language?: string;
  temperature?: number;
  formatToMarkdown?: boolean;
};

/**
 * Transcribes audio to text and optionally formats it as Markdown
 * @param audioUri URI of the audio file to transcribe
 * @param config Configuration options for transcription
 * @returns Transcribed text as string or markdown
 */
export async function transcribe(audioUri: string, config?: TranscribeConfig): Promise<string> {
  try {
    if (!audioUri) {
      throw new Error('No audio recording available to transcribe');
    }

    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error('Audio file does not exist');
    }

    // Create FormData object
    const formData = new FormData();

    // Get file extension from URI
    const fileExtension = audioUri.split('.').pop() || 'wav';

    // Append the file directly
    formData.append('audio', {
      uri: audioUri,
      name: `audio.${fileExtension}`,
      type: `audio/${fileExtension}`,
    } as any);

    // Append other configuration options
    if (config) {
      if (config.apiKey) formData.append('apiKey', config.apiKey);
      if (config.model) formData.append('model', config.model);
      if (config.language) formData.append('language', config.language);
      if (config.temperature !== undefined)
        formData.append('temperature', config.temperature.toString());
      if (config.formatToMarkdown !== undefined)
        formData.append('formatToMarkdown', config.formatToMarkdown.toString());
    }

    const response = await fetch('http://localhost:3000/whisper', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!data.journal) {
      throw new Error('Failed to transcribe audio');
    }

    return data.journal;
  } catch (error) {
    console.error('Failed to transcribe audio', error);
    throw error;
  }
}
