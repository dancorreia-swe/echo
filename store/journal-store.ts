import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { MAX_MOOD_SELECTIONS, MoodType } from '~/app/journal/utils/constants';

export type Attachment = {
  uri: string;
  type: string;
  name: string;
};

interface JournalEntry {
  content: string;
  title: string;
  moods: string[];
  files?: Attachment[];
}

interface JournalStore {
  entries: Record<string, JournalEntry>;
  setEntry: (
    day: string,
    content: string,
    title: string,
    moods: string[],
    files?: Attachment[]
  ) => void;
  setAttachments: (day: string, files: Attachment[]) => void;
  removeEntry: (day: string) => void;
  selectMood: (day: string, mood: MoodType) => void;
}

const _journalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: {},
      setEntry: (day, content, title, moods, files) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [day]: {
              content,
              title,
              moods,
              files: files ?? state.entries[day]?.files ?? [],
            },
          },
        })),
      setAttachments: (day, files) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [day]: {
              ...state.entries[day],
              files,
            },
          },
        })),
      removeEntry: (day) =>
        set((state) => {
          const updatedEntries = { ...state.entries };
          delete updatedEntries[day];
          return { entries: updatedEntries };
        }),
      selectMood: (day, mood) =>
        set((state) => {
          const entry = state.entries[day] || { content: '', title: '', moods: [] };
          const moods = entry.moods.includes(mood.key)
            ? entry.moods.filter((key) => key !== mood.key)
            : entry.moods.length >= MAX_MOOD_SELECTIONS
              ? [...entry.moods.slice(1), mood.key]
              : [...entry.moods, mood.key];
          return {
            entries: {
              ...state.entries,
              [day]: { ...entry, moods },
            },
          };
        }),
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useJournalStore = _journalStore;
export const journalStoreInstance = _journalStore;
