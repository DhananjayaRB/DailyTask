import { useState, useEffect, useMemo, memo } from 'react';
import { Habit } from '../types';
import { formatDate, isToday } from '../utils/dates';
import { completionsApi } from '../services/api';

interface ProgressChartProps {
  dates: Date[];
  habits: Habit[];
  refreshKey?: number;
}

function ProgressChart({ dates, habits, refreshKey = 0 }: ProgressChartProps) {
  const [dailyProgress, setDailyProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize date range
  const dateRange = useMemo(() => ({
    startDate: formatDate(dates[0]),
    endDate: formatDate(dates[dates.length - 1]),
  }), [dates]);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      const completions = await completionsApi.getAll({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      // Normalize dates for comparison (handle PostgreSQL date format variations)
      const normalizeDate = (dateStr: string | Date) => {
        if (!dateStr) return '';
        const str = typeof dateStr === 'string' ? dateStr : dateStr.toString();
        // Remove time component if present, keep only YYYY-MM-DD
        return str.split('T')[0].split(' ')[0];
      };

      const progress = dates.map((date) => {
        const dateStr = formatDate(date);
        const dateStrNormalized = normalizeDate(dateStr);
        
        // Filter completions for this specific date that are completed
        const dateCompletions = completions.filter(
          (c: any) => {
            const completionDate = normalizeDate(c.date || '');
            const dateMatch = completionDate === dateStrNormalized;
            // PostgreSQL returns boolean as true/false, but handle all cases
            const isCompleted = c.completed === true || c.completed === 'true' || c.completed === 1 || c.completed === 't' || c.completed === 'T';
            return dateMatch && isCompleted;
          }
        );
        const completed = dateCompletions.length;
        const total = habits.length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        return {
          date: dateStr,
          dateObj: date,
          completed,
          total,
          percentage,
        };
      });

      setDailyProgress(progress);
    } catch (error) {
      console.error('Error loading progress:', error);
      // Set empty progress on error to prevent blank display
      setDailyProgress(dates.map((date) => ({
        date: formatDate(date),
        dateObj: date,
        completed: 0,
        total: habits.length,
        percentage: 0,
      })));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (refreshKey > 0) {
      // Small delay to ensure DB is updated
      const timer = setTimeout(() => {
        loadProgress();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [refreshKey, dateRange.startDate, dateRange.endDate, habits.length]);
  
  // Initial load and when dates/habits change
  useEffect(() => {
    loadProgress();
  }, [dateRange.startDate, dateRange.endDate, habits.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
        <span>📈</span>
        <span>Daily Progress</span>
      </h3>
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {dailyProgress.map((progress) => {
          const today = isToday(progress.dateObj);
          const isComplete = progress.percentage === 100;
          const hasProgress = progress.percentage > 0;
          
          return (
            <div 
              key={progress.date} 
              className={`
                text-center p-2 rounded-lg transition-all duration-200
                ${today 
                  ? 'bg-primary-50 border-2 border-primary-200 shadow-sm' 
                  : hasProgress 
                    ? 'bg-gray-50 border border-gray-200' 
                    : 'bg-white border border-gray-100'
                }
              `}
            >
              {/* Day Name */}
              <div className={`text-[10px] font-semibold mb-2 ${
                today ? 'text-primary-700' : 'text-gray-600'
              }`}>
                {progress.dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              
              {/* Progress Circle */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2">
                <svg className="transform -rotate-90 w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    className={today ? 'text-primary-100' : 'text-gray-200'}
                  />
                  {/* Progress circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 15}`}
                    strokeDashoffset={`${2 * Math.PI * 15 * (1 - progress.percentage / 100)}`}
                    className={
                      isComplete 
                        ? 'text-success-500' 
                        : today 
                          ? 'text-primary-600' 
                          : 'text-primary-500'
                    }
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                </svg>
                {/* Percentage in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-bold ${
                      today ? 'text-primary-700' : 'text-gray-700'
                    }`}>
                      {Math.round(progress.percentage)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Completed/Total */}
              <div className={`
                text-[10px] font-medium
                ${isComplete 
                  ? 'text-success-600' 
                  : today 
                    ? 'text-primary-600' 
                    : 'text-gray-500'
                }
              `}>
                {progress.completed}/{progress.total}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ProgressChart);
