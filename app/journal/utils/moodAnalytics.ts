import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodType, MOOD_EMOJIS } from './constants';

export interface MoodWithCount extends MoodType {
  count: number;
}

let topMoodsCache: {
  moods: MoodWithCount[];
  timestamp: number;
} | null = null;

const CACHE_EXPIRATION = 60 * 60 * 1000;

export const getRecentJournalKeys = async (): Promise<string[]> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();

    const moodKeys = allKeys.filter((key) => key.startsWith('journal_moods_'));

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentKeys = moodKeys.filter((key) => {
      const dateStr = key.replace('journal_moods_', '');
      try {
        const entryDate = new Date(dateStr);
        return entryDate >= oneMonthAgo;
      } catch (e) {
        return false;
      }
    });

    return recentKeys;
  } catch (error) {
    console.error('Error getting recent journal keys:', error);
    return [];
  }
};

export const getTopMoodsWithCounts = async (limit: number = 5): Promise<MoodWithCount[]> => {
  try {
    const now = Date.now();
    if (topMoodsCache && now - topMoodsCache.timestamp < CACHE_EXPIRATION) {
      return topMoodsCache.moods.slice(0, limit);
    }

    const recentKeys = await getRecentJournalKeys();

    const moodCounts: Record<string, number> = {};

    for (const key of recentKeys) {
      const moodsJson = await AsyncStorage.getItem(key);
      if (moodsJson) {
        try {
          const moods: string[] = JSON.parse(moodsJson);
          if (Array.isArray(moods)) {
            moods.forEach((mood) => {
              moodCounts[mood] = (moodCounts[mood] || 0) + 1;
            });
          }
        } catch (e) {
          console.error('Error parsing moods:', e);
        }
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

    topMoodsCache = {
      moods: moodCountArray,
      timestamp: now,
    };

    return moodCountArray.slice(0, limit);
  } catch (error) {
    console.error('Error getting top moods with counts:', error);
    return [];
  }
};

export const getTopMoods = async (limit: number = 5): Promise<MoodType[]> => {
  const moodsWithCounts = await getTopMoodsWithCounts(limit);
  return moodsWithCounts.map(({ emoji, label, key }) => ({ emoji, label, key }));
};

export const invalidateTopMoodsCache = () => {
  topMoodsCache = null;
};
