export interface MoodType {
  emoji: string;
  label: string;
  key: string;
}

export const MAX_MOOD_SELECTIONS = 3;
export const MOOD_EMOJIS: MoodType[] = [
  { emoji: '😊', label: 'Happy', key: 'happy' },
  { emoji: '😍', label: 'Loved', key: 'loved' },
  { emoji: '😌', label: 'Content', key: 'content' },
  { emoji: '🤔', label: 'Thoughtful', key: 'thoughtful' },
  { emoji: '😴', label: 'Tired', key: 'tired' },
  { emoji: '😢', label: 'Sad', key: 'sad' },
  { emoji: '😤', label: 'Frustrated', key: 'frustrated' },
  { emoji: '😰', label: 'Anxious', key: 'anxious' },
  { emoji: '😎', label: 'Cool', key: 'cool' },
  { emoji: '🥳', label: 'Celebrating', key: 'celebrating' },
  { emoji: '🙏', label: 'Grateful', key: 'grateful' },
  { emoji: '💪', label: 'Strong', key: 'strong' },
  { emoji: '🧠', label: 'Focused', key: 'focused' },
  { emoji: '🤩', label: 'Excited', key: 'excited' },
  { emoji: '😐', label: 'Neutral', key: 'neutral' },
  { emoji: '😮', label: 'Surprised', key: 'surprised' },
];

export const AUTO_SAVE_DELAY = 2000;
export const SAVE_INDICATOR_DURATION = 2000;
