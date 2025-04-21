import { MoodType, MOOD_EMOJIS } from './constants';
import { journalStoreInstance } from '~/store/journal-store';

export interface MoodWithCount extends MoodType {
  count: number;
}

export const getRecentJournalDaysFromEntries = (entries: Record<string, any>): string[] => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return Object.keys(entries).filter((day) => {
    try {
      const entryDate = new Date(day);
      return entryDate >= oneMonthAgo;
    } catch {
      return false;
    }
  });
};

export const getTopMoodsWithCountsFromEntries = (
  entries: Record<string, any>,
  limit: number = 5
): MoodWithCount[] => {
  const recentDays = getRecentJournalDaysFromEntries(entries);

  const moodCounts: Record<string, number> = {};

  for (const day of recentDays) {
    const entry = entries[day];
    if (entry?.moods && Array.isArray(entry.moods)) {
      entry.moods.forEach((mood: string) => {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
    }
  }

  const moodCountArray: MoodWithCount[] = Object.entries(moodCounts)
    .map(([key, count]) => {
      const mood = MOOD_EMOJIS.find((m) => m.key === key);
      if (!mood) return null;
      return {
        ...mood,
        count,
      };
    })
    .filter((item): item is MoodWithCount => item !== null);

  moodCountArray.sort((a, b) => b.count - a.count);

  return moodCountArray.slice(0, limit);
};
