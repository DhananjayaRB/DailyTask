import { useState, useEffect, useMemo, useCallback } from 'react';
import { Habit } from '../types';
import { getWeekDates, formatDate, getDaysInMonth, getMonthName, isToday } from '../utils/dates';
import { completionsApi } from '../services/api';
import HabitRow from './HabitRow';
import ProgressChart from './ProgressChart';
import AddHabitModal from './AddHabitModal';
import ViewToggle from './ViewToggle';

interface HabitTrackerProps {
  habits: Habit[];
  onAddHabit: (habit: Omit<Habit, 'id'>) => void;
  onDeleteHabit: (id: string) => void;
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void;
}

type ViewMode = 'week' | 'month';

export default function HabitTracker({
  habits,
  onAddHabit,
  onDeleteHabit,
  onUpdateHabit,
}: HabitTrackerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [summaryStats, setSummaryStats] = useState({ 
    totalCompletions: 0, 
    completedToday: 0,
    progress: 0 
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Memoize dates to prevent unnecessary recalculations
  const dates = useMemo(() => {
    return viewMode === 'week' 
      ? getWeekDates(currentDate)
      : getDaysInMonth(currentDate);
  }, [viewMode, currentDate]);

  const loadSummaryStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const startDate = formatDate(dates[0]);
      const endDate = formatDate(dates[dates.length - 1]);
      // Use local date to avoid UTC issues
      const todayDate = new Date();
      const today = formatDate(new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()));
      
      const completions = await completionsApi.getAll({
        startDate,
        endDate,
      });

      // Normalize dates for comparison (handle PostgreSQL date format variations)
      const normalizeDate = (dateStr: string | Date) => {
        if (!dateStr) return '';
        const str = typeof dateStr === 'string' ? dateStr : dateStr.toString();
        // Remove time component if present, keep only YYYY-MM-DD
        return str.split('T')[0].split(' ')[0];
      };

      const totalCompletions = completions.filter((c: any) => {
        const isCompleted = c.completed === true || c.completed === 'true' || c.completed === 1 || c.completed === 't' || c.completed === 'T';
        return isCompleted;
      }).length;
      
      // Count completions for today across all habits
      const todayNormalized = normalizeDate(today);
      const todayCompletions = completions.filter((c: any) => {
        const completionDate = normalizeDate(c.date || '');
        const dateMatch = completionDate === todayNormalized;
        // PostgreSQL returns boolean as true/false, but handle all cases
        const isCompleted = c.completed === true || c.completed === 'true' || c.completed === 1 || c.completed === 't' || c.completed === 'T';
        return dateMatch && isCompleted;
      });
      const completedToday = todayCompletions.length;
      
      const totalPossible = dates.length * habits.length;
      const progress = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;

      setSummaryStats({
        totalCompletions,
        completedToday,
        progress: Math.round(progress),
      });
    } catch (error) {
      console.error('Error loading summary stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [dates, habits.length]);

  useEffect(() => {
    if (refreshKey > 0) {
      // Small delay to ensure DB is updated
      const timer = setTimeout(() => {
        loadSummaryStats();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [refreshKey, loadSummaryStats]);
  
  // Initial load
  useEffect(() => {
    loadSummaryStats();
  }, [loadSummaryStats]);
  
  // Also reload stats when dates change
  useEffect(() => {
    loadSummaryStats();
  }, [dates.length]);

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-3">
      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg p-3 border border-surface-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">📋</span>
            <div className="text-gray-500 text-xs font-medium">Total Habits</div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{habits.length}</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-surface-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">✅</span>
            <div className="text-gray-500 text-xs font-medium">Completed Today</div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {isLoadingStats ? '⏳' : summaryStats.completedToday}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-surface-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">📊</span>
            <div className="text-gray-500 text-xs font-medium">Weekly Progress</div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {isLoadingStats ? '⏳' : `${summaryStats.progress}%`}
          </div>
        </div>
      </div>

      {/* Main Tracker Card - Compact */}
      <div className="bg-white rounded-lg border border-surface-border shadow-sm">
        {/* Header - Compact */}
        <div className="p-2 sm:p-3 border-b border-surface-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
              <button
                onClick={handlePrevious}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 flex-shrink-0 text-sm"
              >
                ←
              </button>
                <button
                  onClick={handleToday}
                  className="px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors duration-200 flex-shrink-0 flex items-center gap-1"
                >
                  <span>📅</span>
                  <span>Today</span>
                </button>
              <button
                onClick={handleNext}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 flex-shrink-0 text-sm"
              >
                →
              </button>
              <h2 className="text-xs sm:text-sm font-semibold text-gray-900 ml-1 truncate">
                {viewMode === 'week' 
                  ? `Week of ${formatDate(dates[0])}`
                  : `${getMonthName(currentDate)} ${currentDate.getFullYear()}`
                }
              </h2>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded transition-colors duration-200 flex items-center gap-1.5"
              >
                <span>➕</span>
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Chart - Compact */}
        <div className="p-2 sm:p-3 border-b border-surface-border">
          <ProgressChart dates={dates} habits={habits} refreshKey={refreshKey} />
        </div>

        {/* Habits Table - Compact */}
        <div className="overflow-x-auto scrollbar-thin">
          {habits.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-500 text-xs mb-1">No habits yet</p>
              <p className="text-gray-400 text-xs">Click "➕ Add" to get started</p>
            </div>
          ) : (
            <div className="min-w-full">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-gray-50/50">
                    <th className="text-left p-2 text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50/50 z-10">
                      Habit
                    </th>
                    <th className="text-left p-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Goal
                    </th>
                    {dates.map((date) => {
                      const today = isToday(date);
                      return (
                        <th
                          key={formatDate(date)}
                          className={`text-center p-1.5 min-w-[40px] align-middle ${
                            today ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <div className="text-[10px] text-gray-500 font-medium leading-tight">
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className={`text-xs font-semibold leading-tight ${
                              today ? 'text-primary-600' : 'text-gray-700'
                            }`}>
                              {date.getDate()}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                    <th className="text-left p-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit) => (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      dates={dates}
                      onDelete={onDeleteHabit}
                      onUpdate={onUpdateHabit}
                      onCompletionChange={useCallback(() => {
                        setRefreshKey(prev => prev + 1);
                      }, [])}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          onAdd={onAddHabit}
        />
      )}
    </div>
  );
}
