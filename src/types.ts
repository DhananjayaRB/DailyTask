export interface Habit {
  id: string;
  name: string;
  emoji: string;
  goal: number; // days per month
  color: string;
}

export interface Completion {
  date: string; // YYYY-MM-DD format
  habitId: string;
  completed: boolean;
}

export interface DailyProgress {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

