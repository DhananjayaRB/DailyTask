import { Habit, Completion } from '../types';

const HABITS_KEY = 'daily-task-habits';
const COMPLETIONS_KEY = 'daily-task-completions';

export const getStoredHabits = (): Habit[] => {
  try {
    const stored = localStorage.getItem(HABITS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveHabits = (habits: Habit[]): void => {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error('Failed to save habits:', error);
  }
};

export const getStoredCompletions = (): Completion[] => {
  try {
    const stored = localStorage.getItem(COMPLETIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveCompletions = (completions: Completion[]): void => {
  try {
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
  } catch (error) {
    console.error('Failed to save completions:', error);
  }
};

export const addCompletion = (completion: Completion): void => {
  const completions = getStoredCompletions();
  const existingIndex = completions.findIndex(
    (c) => c.date === completion.date && c.habitId === completion.habitId
  );
  
  if (existingIndex >= 0) {
    completions[existingIndex] = completion;
  } else {
    completions.push(completion);
  }
  
  saveCompletions(completions);
};

export const getCompletion = (date: string, habitId: string): boolean => {
  const completions = getStoredCompletions();
  const completion = completions.find(
    (c) => c.date === date && c.habitId === habitId
  );
  return completion?.completed ?? false;
};

