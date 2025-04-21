import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { MAX_MOOD_SELECTIONS, MoodType } from '~/app/journal/utils/constants';

interface JournalEntry {
  content: string;
  title: string;
  moods: string[];
}

interface JournalStore {
  entries: Record<string, JournalEntry>;
  setEntry: (day: string, content: string, title: string, moods: string[]) => void;
  removeEntry: (day: string) => void;
  selectMood: (day: string, mood: MoodType) => void;
}

// Instantiate the store and assign to a variable (this is BOTH the hook and the store instance)
const _journalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: {},
      setEntry: (day, content, title, moods) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [day]: { content, title, moods },
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
