import { Habit } from '../types';
import { formatDate, isToday } from '../utils/dates';
import { completionsApi } from '../services/api';
import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { motion } from 'framer-motion';

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
  const [animatedCheckbox, setAnimatedCheckbox] = useState<string | null>(null);
  const [highlightedRow, setHighlightedRow] = useState(false);
  const previousCompletions = useRef<Record<string, boolean>>({});

  // Memoize date strings to prevent unnecessary recalculations
  const dateStrings = useMemo(() => dates.map(d => formatDate(d)), [dates]);

  useEffect(() => {
    loadCompletions();
  }, [dateStrings.join(','), habit.id]);

  const loadCompletions = useCallback(async () => {
    try {
      setIsLoading(true);
      const initialCompletions: Record<string, boolean> = {};
      
      // Instead of multiple API calls, fetch all completions for the date range at once
      if (dateStrings.length > 0) {
        try {
          const startDate = dateStrings[0];
          const endDate = dateStrings[dateStrings.length - 1];
          const allCompletions = await completionsApi.getAll({
            startDate,
            endDate,
            habitId: habit.id,
          });
          
          // Process all completions at once
          dateStrings.forEach((dateStr) => {
            const completion = allCompletions.find((c: any) => {
              const completionDate = typeof c.date === 'string' 
                ? c.date.split('T')[0].split(' ')[0] 
                : formatDate(new Date(c.date));
              return completionDate === dateStr;
            });
            
            if (completion) {
              const completed = completion.completed as any;
              const isCompleted = completed === true || completed === 'true' || completed === 1 || completed === 't' || completed === 'T';
              initialCompletions[dateStr] = Boolean(isCompleted);
            } else {
              initialCompletions[dateStr] = false;
            }
          });
        } catch (error) {
          console.error('Error loading completions:', error);
          // Fallback: set all to false on error
          dateStrings.forEach((dateStr) => {
            initialCompletions[dateStr] = false;
          });
        }
      }
      
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
    setCompletions((prev) => {
      previousCompletions.current = { ...prev };
      return {
        ...prev,
        [dateStr]: newCompleted,
      };
    });

    // Trigger animation
    if (newCompleted) {
      setAnimatedCheckbox(dateStr);
      setHighlightedRow(true);
      setTimeout(() => {
        setAnimatedCheckbox(null);
        setHighlightedRow(false);
      }, 400);
    }

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
    <motion.tr 
      className="border-b border-surface-border hover:bg-gray-50/50 transition-colors duration-150"
      animate={highlightedRow ? {
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
      } : {}}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
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
              <motion.button
                onClick={() => handleToggle(date)}
                disabled={isLoading}
                className={`
                  w-6 h-6 rounded-md flex items-center justify-center
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${completed
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white border-2 border-gray-300 text-transparent hover:border-primary-500 hover:bg-primary-50'
                  }
                  ${today ? 'ring-2 ring-primary-200 ring-offset-1' : ''}
                `}
                title={`${dateStr} - ${completed ? 'Completed' : 'Not completed'}`}
                animate={animatedCheckbox === dateStr && completed ? {
                  scale: [1, 1.08, 1],
                } : {}}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {completed && (
                  <motion.svg 
                    className="w-3.5 h-3.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                      delay: 0.05,
                    }}
                  >
                    <motion.path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0.05,
                      }}
                    />
                  </motion.svg>
                )}
              </motion.button>
            </div>
          </td>
        );
      })}
      <td className="p-2">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden min-w-[30px]">
            <motion.div
              className="bg-primary-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          </div>
          <motion.span 
            className="text-[10px] text-gray-600 min-w-[28px] text-right font-medium"
            key={Math.round(progress)}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      </td>
    </motion.tr>
  );
}

export default memo(HabitRow);
