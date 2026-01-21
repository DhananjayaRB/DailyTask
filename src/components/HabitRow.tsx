import { Habit } from '../types';
import { formatDate, isToday } from '../utils/dates';
import { completionsApi } from '../services/api';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';

interface HabitRowProps {
  habit: Habit;
  dates: Date[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onCompletionChange?: () => void;
}

function HabitRow({
  habit,
  dates,
  onDelete,
  onUpdate: _onUpdate, // Prefix with _ to indicate intentionally unused
  onCompletionChange,
}: HabitRowProps) {
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Memoize date strings to prevent unnecessary recalculations
  const dateStrings = useMemo(() => dates.map(d => formatDate(d)), [dates]);

  useEffect(() => {
    loadCompletions();
  }, [dateStrings.join(','), habit.id]);

  const loadCompletions = useCallback(async () => {
    try {
      setIsLoading(true);
      const initialCompletions: Record<string, boolean> = {};
      
      await Promise.all(
        dateStrings.map(async (dateStr) => {
          try {
            const result = await completionsApi.getByHabitAndDate(habit.id, dateStr);
            // Handle both { completed: boolean } and full completion object
            // Type assertion to handle various return types from API
            const completed = result.completed as any;
            const isCompleted = completed === true || completed === 'true' || completed === 1 || completed === 't' || completed === 'T';
            initialCompletions[dateStr] = Boolean(isCompleted);
          } catch {
            initialCompletions[dateStr] = false;
          }
        })
      );
      
      setCompletions(initialCompletions);
    } catch (error) {
      console.error('Error loading completions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateStrings, habit.id]);

  const handleToggle = useCallback(async (date: Date) => {
    const dateStr = formatDate(date);
    const newCompleted = !completions[dateStr];
    
    // Optimistic update
    setCompletions((prev) => ({
      ...prev,
      [dateStr]: newCompleted,
    }));

    try {
      await completionsApi.save({
        habitId: habit.id,
        date: dateStr,
        completed: newCompleted,
      });
      
      // Trigger refresh after a small delay to ensure DB is updated
      if (onCompletionChange) {
        setTimeout(() => {
          onCompletionChange();
        }, 100);
      }
    } catch (error) {
      console.error('Error saving completion:', error);
      // Revert on error
      setCompletions((prev) => ({
        ...prev,
        [dateStr]: !newCompleted,
      }));
      alert('Failed to save completion. Please try again.');
    }
  }, [completions, habit.id, onCompletionChange]);

  const completedCount = useMemo(() => 
    Object.values(completions).filter(Boolean).length,
    [completions]
  );
  const progress = useMemo(() => 
    dates.length > 0 ? (completedCount / dates.length) * 100 : 0,
    [completedCount, dates.length]
  );

  return (
    <tr className="border-b border-surface-border hover:bg-gray-50/50 transition-colors duration-150">
      <td className="p-2 sticky left-0 bg-white z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{habit.emoji}</span>
          <span className="text-xs font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">{habit.name}</span>
          <button
            onClick={() => {
              if (confirm(`Delete "${habit.name}"?`)) {
                onDelete(habit.id);
              }
            }}
            className="ml-auto text-gray-400 hover:text-danger-500 text-xs transition-colors duration-200 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </td>
      <td className="p-2 hidden sm:table-cell">
        <div className="text-xs text-gray-600">{habit.goal} days</div>
      </td>
      {dates.map((date) => {
        const dateStr = formatDate(date);
        const completed = completions[dateStr] || false;
        const today = isToday(date);

        return (
          <td 
            key={dateStr} 
            className={`p-1.5 text-center align-middle ${today ? 'bg-primary-50/50' : ''}`}
          >
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleToggle(date)}
                disabled={isLoading}
                className={`
                  w-6 h-6 rounded-md flex items-center justify-center
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${completed
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white border-2 border-gray-300 text-transparent hover:border-primary-500 hover:bg-primary-50'
                  }
                  ${today ? 'ring-2 ring-primary-200 ring-offset-1' : ''}
                `}
                title={`${dateStr} - ${completed ? 'Completed' : 'Not completed'}`}
              >
                {completed && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          </td>
        );
      })}
      <td className="p-2">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden min-w-[30px]">
            <div
              className="bg-primary-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-600 min-w-[28px] text-right font-medium">
            {Math.round(progress)}%
          </span>
        </div>
      </td>
    </tr>
  );
}

export default memo(HabitRow);
