import { OpenAIWhisperAudio } from '@langchain/community/document_loaders/fs/openai_whisper_audio';
import { Document } from '@langchain/core/documents';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import * as FileSystem from 'expo-file-system';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

    // Create a base64 representation of the audio file
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error('Audio file does not exist');
    }

    // Read the file as base64
    const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const apiKey = config?.apiKey || OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Create a Whisper instance
    const whisper = new OpenAIWhisperAudio(base64Audio, {
      clientOptions: {
        apiKey,
      },
    });

    // Transcribe the audio - this returns a Document[]
    const documents = await whisper.load();
    console.log('Transcription completed');

    // Extract the text content from the documents
    const transcriptionText = documents.map((doc) => doc.pageContent).join('\n');

    // If formatting to Markdown is requested
    if (config?.formatToMarkdown) {
      return await convertToMarkdown(transcriptionText, apiKey);
    }

    return transcriptionText;
  } catch (error) {
    console.error('Failed to transcribe audio', error);
    throw error;
  }
}

/**
 * Converts plain text to well-formatted Markdown using OpenAI
 * @param text The text to convert to Markdown
 * @param apiKey OpenAI API key
 * @returns Formatted Markdown text
 */
async function convertToMarkdown(text: string, apiKey: string): Promise<string> {
  try {
    // Initialize the LLM
    const model = new ChatOpenAI({
      apiKey,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.2,
    });

    // Create a prompt template for converting to Markdown
    const promptTemplate = PromptTemplate.fromTemplate(`
      Convert the following transcribed text into well-formatted Markdown.
      
      - Identify and format headings, lists, and paragraphs appropriately
      - Correct any obvious transcription errors
      - Maintain the original meaning and content
      - Use proper Markdown syntax for emphasis where appropriate
      
      Text to convert:
      {text}
      
      Formatted Markdown:
    `);

    // Create a chain to process the text
    const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());

    // Process the text
    const markdownResult = await chain.invoke({
      text,
    });

    return markdownResult;
  } catch (error) {
    console.error('Failed to convert to Markdown', error);
    // Return the original text if conversion fails
    return text;
  }
}

/**
 * Processes a Document array from Whisper transcription
 * @param documents Array of Documents from Whisper transcription
 * @returns Extracted and processed text content
 */
export function processTranscriptionDocuments(documents: Document[]): string {
  if (!documents || documents.length === 0) {
    return '';
  }

  // Extract text content from all documents
  const combinedText = documents
    .map((doc) => {
      // Extract metadata that might be useful
      const metadata = doc.metadata;
      const content = doc.pageContent;

      // You can use metadata for additional context if needed
      return content;
    })
    .join('\n');

  return combinedText;
}
