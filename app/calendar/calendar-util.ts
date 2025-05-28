import { Dimensions } from 'react-native';

import { MOOD_EMOJIS } from '../journal/utils/constants';

const { width } = Dimensions.get('window');
export const CELL_WIDTH = Math.floor(width / 7);
export const CELL_HEIGHT = 45;
export const WEEKS_PER_MONTH = 5;
export const CALENDAR_HEIGHT = CELL_HEIGHT * WEEKS_PER_MONTH + 12;

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Calendar
export function formatDateCalendarList(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const moodMap = Object.fromEntries(MOOD_EMOJIS.map((m) => [m.key, m.emoji]));

export function isWritten(entry: any) {
  return (
    !!entry &&
    ((entry.content && entry.content.trim() !== '') ||
      (entry.title && entry.title.trim() !== '') ||
      (Array.isArray(entry.moods) && entry.moods.length > 0))
  );
}

export function getCalendarMatrix(entries: Record<string, any>, weekCount = 16) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const matrix: { date: string; hasEntry: boolean }[][] = [];

  const current = new Date(today);
  current.setDate(today.getDate() - dayOfWeek);

  for (let w = 0; w < weekCount; w++) {
    const week: { date: string; hasEntry: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const thisDate = new Date(current);
      const str = formatDate(thisDate);
      week.push({
        date: str,
        hasEntry: !!entries[str] && isWritten(entries[str]),
      });
      current.setDate(current.getDate() + 1);
    }
    matrix.push(week);
  }
  return matrix;
}

// Streaks
export function getStreaks(entries: Record<string, any>): {
  currentStreak: number;
  bestStreak: number;
} {
  const sortedDates = Object.keys(entries)
    .filter((date) => isWritten(entries[date]))
    .sort();
  if (sortedDates.length === 0) return { currentStreak: 0, bestStreak: 0 };
  const datesSet = new Set(sortedDates);
  // Find best streak
  let best = 1,
    cur = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseLocalDateKey(sortedDates[i - 1]);
    const curr = parseLocalDateKey(sortedDates[i]);
    // Are they consecutive?
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      cur += 1;
      if (cur > best) best = cur;
    } else {
      cur = 1;
    }
  }
  // Find current streak (must include today or yesterday)
  let currentStreak = 0;
  const date = new Date();
  for (;;) {
    const str = formatDate(date);
    if (datesSet.has(str)) {
      currentStreak += 1;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  return { bestStreak: best, currentStreak };
}

export function getHorizontalCalendarMatrix(
  entries: Record<string, any>,
  weekCount = 12 // about 3 months visible
) {
  const today = new Date();
  // go back weekCount * 7 days
  const start = new Date(today);
  start.setDate(today.getDate() - (weekCount * 7 - 1));
  // Fill [ [week0(days...)], [week1(days...)], ... ]
  const weeks: { date: string; hasEntry: boolean }[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < weekCount; w++) {
    const week: { date: string; hasEntry: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = formatDate(cursor);
      week.push({
        date: dateStr,
        hasEntry: !!entries[dateStr] && isWritten(entries[dateStr]),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
