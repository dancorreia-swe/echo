import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Share } from 'react-native';

import { formatDate } from '../utils/dateFormat';

// Constants
export const AUTO_SAVE_DELAY = 2000;
export const SAVE_INDICATOR_DURATION = 2000;

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
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [contentConflictModalVisible, setContentConflictModalVisible] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [storedContent, setStoredContent] = useState('');

  const entryKey = useMemo(() => `journal_entry_${day}`, [day]);
  const titleKey = useMemo(() => `journal_title_${day}`, [day]);

  const formattedDate = useMemo(() => formatDate(day), [day]);

  useEffect(() => {
    const loadJournalEntry = async () => {
      try {
        const storedEntry = await AsyncStorage.getItem(entryKey);
        const storedTitle = await AsyncStorage.getItem(titleKey);

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
  }, [day, content, isNew, entryKey, titleKey]);

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
  }, [journalContent, journalTitle]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      await AsyncStorage.setItem(entryKey, journalContent);
      await AsyncStorage.setItem(titleKey, journalTitle);

      setSaved(true);
      setTimeout(() => setSaved(false), SAVE_INDICATOR_DURATION);

      console.log(`Journal entry saved for day: ${day}`);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, journalContent, journalTitle, entryKey, titleKey, day]);

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
              handleNavigateBack();
            } catch (error) {
              console.error('Failed to delete journal entry:', error);
            }
          },
        },
      ]
    );
  }, [entryKey, titleKey, handleNavigateBack]);

  const handleShare = useCallback(async () => {
    try {
      const title = journalTitle || 'Journal Entry';
      const message = `${title}\n\n${journalContent}\n\n${formattedDate.fullDate}`;

      await Share.share({
        message,
        title,
      });
    } catch (error) {
      console.error('Error sharing note:', error);
    }
  }, [journalTitle, journalContent, formattedDate]);

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
