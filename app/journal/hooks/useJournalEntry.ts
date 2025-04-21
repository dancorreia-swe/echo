import { router } from 'expo-router';
import { deepEqual } from 'fast-equals';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

import { useJournalStore } from '~/store/journal-store';

export interface JournalEntryParams {
  day: string;
  content?: string;
  isNew?: string;
  from?: string;
}

export const useJournalEntry = (params: JournalEntryParams) => {
  const { day, content = '', isNew, from } = params;

  // Only primitive selectors to avoid infinite subscription loops!
  const entries = useJournalStore((s) => s.entries);
  const setEntry = useJournalStore((s) => s.setEntry);
  const removeEntry = useJournalStore((s) => s.removeEntry);

  // Compute entry locally
  const entry = entries[day] || { content: '', title: '', moods: [] };

  // Rest of hook logic as you had (unchanged except for entrySelector removed)
  const [journalContent, setJournalContent] = useState(entry.content || content);
  const [journalTitle, setJournalTitle] = useState(entry.title || '');
  const [selectedMoods, setSelectedMoods] = useState<string[]>(entry.moods || []);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const [contentConflictModalVisible, setContentConflictModalVisible] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [storedContent, setStoredContent] = useState('');

  const formattedDate = useMemo(() => formatDate(day), [day]);

  useEffect(() => {
    setJournalContent(entry.content || content);
    setJournalTitle(entry.title || '');
    setSelectedMoods(entry.moods || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  useEffect(() => {
    if (entry.content && content && entry.content !== content) {
      setStoredContent(entry.content);
      setNewContent(content || '');
      setContentConflictModalVisible(true);
      setJournalContent(entry.content);
    }
    // eslint-disable-next-line
  }, [day, content]);

  const handleMoodSelect = useCallback((mood: MoodType) => {
    setSelectedMoods((prev) => {
      if (prev.includes(mood.key)) return prev.filter((key) => key !== mood.key);
      if (prev.length >= MAX_MOOD_SELECTIONS) return [...prev.slice(1), mood.key];
      return [...prev, mood.key];
    });
  }, []);

  const isMoodSelected = useCallback(
    (moodKey: string) => selectedMoods.includes(moodKey),
    [selectedMoods]
  );

  const selectedMoodObjects = useMemo(
    () => MOOD_EMOJIS.filter((mood) => selectedMoods.includes(mood.key)),
    [selectedMoods]
  );

  const handleSave = useCallback(() => {
    if (isSaving) return;
    if (
      journalContent === entry.content &&
      journalTitle === entry.title &&
      deepEqual(selectedMoods, entry.moods)
    ) {
      return;
    }
    setIsSaving(true);
    setEntry(day, journalContent, journalTitle, selectedMoods);
    invalidateTopMoodsCache?.();
    setSaved(true);
    setTimeout(() => setSaved(false), SAVE_INDICATOR_DURATION);
    setTimeout(() => setIsSaving(false), 400);
    // eslint-disable-next-line
  }, [
    isSaving,
    setEntry,
    day,
    journalContent,
    journalTitle,
    selectedMoods,
    entry.content,
    entry.title,
    entry.moods,
  ]);

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    if (
      journalContent === entry.content &&
      journalTitle === entry.title &&
      deepEqual(selectedMoods, entry.moods)
    ) {
      return;
    }
    autoSaveTimer.current = setTimeout(handleSave, AUTO_SAVE_DELAY);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line
  }, [journalContent, journalTitle, selectedMoods, handleSave]);

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
          onPress: () => {
            removeEntry(day);
            handleNavigateBack();
          },
        },
      ]
    );
  }, [day, removeEntry, handleNavigateBack]);

  const handleShare = useCallback(async () => {
    const title = journalTitle || 'Journal Entry';
    let message = `${title}\n\n${journalContent}\n\n${formattedDate.fullDate}`;
    if (selectedMoods.length > 0) {
      const moodText = selectedMoodObjects.map((m) => `${m.emoji} ${m.label}`).join(', ');
      message = `${title}\nMood: ${moodText}\n\n${journalContent}\n\n${formattedDate.fullDate}`;
    }
    await Share.share({ message, title });
  }, [journalTitle, journalContent, formattedDate, selectedMoodObjects, selectedMoods]);

  const handleContentConflict = useMemo(
    () => ({
      override: () => {
        setJournalContent(newContent);
        setContentConflictModalVisible(false);
        setTimeout(handleSave, 0);
      },
      append: () => {
        setJournalContent(() => storedContent + '\n\n' + newContent);
        setContentConflictModalVisible(false);
        setTimeout(handleSave, 0);
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
    setSelectedMoods,
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
