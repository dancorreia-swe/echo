import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Share } from 'react-native';

import {
  AUTO_SAVE_DELAY,
  SAVE_INDICATOR_DURATION,
  MOOD_EMOJIS,
  MoodType,
  MAX_MOOD_SELECTIONS,
} from '../utils/constants';
import { formatDate } from '../utils/dateFormat';
import { invalidateTopMoodsCache } from '../utils/moodAnalytics';

export interface JournalEntryParams {
  day: string;
  content?: string;
  isNew?: string;
  from?: string;
}

export const useJournalEntry = (params: JournalEntryParams) => {
  const { day, content, isNew, from } = params;

  const [journalContent, setJournalContent] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [contentConflictModalVisible, setContentConflictModalVisible] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [storedContent, setStoredContent] = useState('');

  const entryKey = useMemo(() => `journal_entry_${day}`, [day]);
  const titleKey = useMemo(() => `journal_title_${day}`, [day]);
  const moodsKey = useMemo(() => `journal_moods_${day}`, [day]);

  const formattedDate = useMemo(() => formatDate(day), [day]);

  const handleMoodSelect = useCallback((mood: MoodType) => {
    setSelectedMoods((prev) => {
      if (prev.includes(mood.key)) {
        return prev.filter((key) => key !== mood.key);
      }

      if (prev.length >= MAX_MOOD_SELECTIONS) {
        return [...prev.slice(1), mood.key];
      }

      return [...prev, mood.key];
    });
  }, []);

  const isMoodSelected = useCallback(
    (moodKey: string) => {
      return selectedMoods.includes(moodKey);
    },
    [selectedMoods]
  );

  const selectedMoodObjects = useMemo(() => {
    return MOOD_EMOJIS.filter((mood) => selectedMoods.includes(mood.key));
  }, [selectedMoods]);

  useEffect(() => {
    const loadJournalEntry = async () => {
      try {
        const storedEntry = await AsyncStorage.getItem(entryKey);
        const storedTitle = await AsyncStorage.getItem(titleKey);
        const storedMoods = await AsyncStorage.getItem(moodsKey);

        if (storedEntry && content && storedEntry !== content) {
          setStoredContent(storedEntry);
          setNewContent(content || '');
          setContentConflictModalVisible(true);
          setJournalContent(storedEntry);
        } else if (storedEntry) {
          setJournalContent(storedEntry);
        } else if (content) {
          setJournalContent(content);
          await AsyncStorage.setItem(entryKey, content);
        } else {
          setJournalContent('');
        }

        if (storedTitle) {
          setJournalTitle(storedTitle);
        } else {
          setJournalTitle('');
        }

        if (storedMoods) {
          try {
            const parsedMoods = JSON.parse(storedMoods);
            if (Array.isArray(parsedMoods)) {
              setSelectedMoods(parsedMoods);
            }
          } catch (e) {
            console.error('Error parsing stored moods:', e);
          }
        }
      } catch (error) {
        console.error('Failed to load journal entry:', error);
        if (content) {
          setJournalContent(content);
        }
      }
    };

    loadJournalEntry();

    if (isNew === 'true' && !journalTitle) {
      setJournalTitle('');
    }
  }, [day, content, isNew, entryKey, titleKey, moodsKey]);

  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    if (journalContent.length > 0) {
      const timer = setTimeout(() => {
        handleSave();
      }, AUTO_SAVE_DELAY);

      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [journalContent, journalTitle, selectedMoods]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      await AsyncStorage.setItem(entryKey, journalContent);
      await AsyncStorage.setItem(titleKey, journalTitle);

      await AsyncStorage.setItem(moodsKey, JSON.stringify(selectedMoods));

      invalidateTopMoodsCache();

      setSaved(true);
      setTimeout(() => setSaved(false), SAVE_INDICATOR_DURATION);

      console.log(`Journal entry saved for day: ${day}`);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, journalContent, journalTitle, selectedMoods, entryKey, titleKey, moodsKey, day]);

  const handleNavigateBack = useCallback(() => {
    if (from === 'audio-entry') {
      router.replace('/');
    } else {
      router.back();
    }
  }, [from]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(entryKey);
              await AsyncStorage.removeItem(titleKey);
              await AsyncStorage.removeItem(moodsKey);
              handleNavigateBack();
            } catch (error) {
              console.error('Failed to delete journal entry:', error);
            }
          },
        },
      ]
    );
  }, [entryKey, titleKey, moodsKey, handleNavigateBack]);

  const handleShare = useCallback(async () => {
    try {
      const title = journalTitle || 'Journal Entry';
      let message = `${title}\n\n${journalContent}\n\n${formattedDate.fullDate}`;

      if (selectedMoods.length > 0) {
        const moodText = selectedMoodObjects
          .map((mood) => `${mood.emoji} ${mood.label}`)
          .join(', ');

        message = `${title}\nMood: ${moodText}\n\n${journalContent}\n\n${formattedDate.fullDate}`;
      }

      await Share.share({
        message,
        title,
      });
    } catch (error) {
      console.error('Error sharing note:', error);
    }
  }, [journalTitle, journalContent, formattedDate, selectedMoodObjects]);

  const handleContentConflict = useMemo(
    () => ({
      override: () => {
        setJournalContent(newContent);
        handleSave();
        setContentConflictModalVisible(false);
      },
      append: () => {
        setJournalContent(storedContent + '\n\n' + newContent);
        handleSave();
        setContentConflictModalVisible(false);
      },
      discard: () => {
        setJournalContent(storedContent);
        setContentConflictModalVisible(false);
      },
    }),
    [newContent, storedContent, handleSave]
  );

  return {
    journalContent,
    setJournalContent,
    journalTitle,
    setJournalTitle,
    selectedMoods,
    selectedMoodObjects,
    handleMoodSelect,
    isMoodSelected,
    isSaving,
    saved,
    formattedDate,
    handleSave,
    handleNavigateBack,
    handleDelete,
    handleShare,
    contentConflictModalVisible,
    setContentConflictModalVisible,
    handleContentConflict,
    isNew,
  };
};
