import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { habitsApi, completionsApi } from '../services/api';
import { Habit } from '../types';

export default function Analytics() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [habitsData, completionsData] = await Promise.all([
        habitsApi.getAll(),
        completionsApi.getAll({
          startDate: format(startOfMonth(selectedMonth), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(selectedMonth), 'yyyy-MM-dd'),
        }),
      ]);

      setHabits(habitsData);

      // Calculate statistics
      const habitStats = habitsData.map((habit) => {
        const habitCompletions = completionsData.filter(
          (c: any) => c.habit_id === parseInt(habit.id) && c.completed
        );
        const totalDays = endOfMonth(selectedMonth).getDate();
        const completionRate = (habitCompletions.length / totalDays) * 100;
        const goalProgress = (habitCompletions.length / habit.goal) * 100;

        return {
          habit,
          completions: habitCompletions.length,
          totalDays,
          completionRate: Math.round(completionRate),
          goalProgress: Math.min(Math.round(goalProgress), 100),
        };
      });

      const totalCompletions = completionsData.filter((c: any) => c.completed).length;
      const totalPossible = habitsData.length * endOfMonth(selectedMonth).getDate();
      const overallProgress = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;

      setStats({
        habitStats,
        totalCompletions,
        totalPossible,
        overallProgress: Math.round(overallProgress),
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, -1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-500 text-sm">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-surface-bg">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>📈</span>
            <span>Analytics</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1.5">
            <span>🔍</span>
            <span>Track your progress and insights</span>
          </p>
        </header>

        {/* Month Selector */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={handlePreviousMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {format(selectedMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
          >
            →
          </button>
        </div>

        {stats && (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-surface-border shadow-soft">
                <div className="text-gray-500 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1.5">
                  <span>📊</span>
                  <span>Overall Progress</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{stats.overallProgress}%</div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.overallProgress}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-surface-border shadow-soft">
                <div className="text-gray-500 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1.5">
                  <span>✅</span>
                  <span>Total Completions</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalCompletions}</div>
                <div className="text-gray-400 text-xs mt-1">
                  out of {stats.totalPossible} possible
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-surface-border shadow-soft">
                <div className="text-gray-500 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1.5">
                  <span>📋</span>
                  <span>Active Habits</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{habits.length}</div>
                <div className="text-gray-400 text-xs mt-1">habits tracked</div>
              </div>
            </div>

            {/* Habit Performance */}
            <div className="bg-white rounded-xl border border-surface-border shadow-soft-lg">
              <div className="p-6 border-b border-surface-border">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span>🏆</span>
                  <span>Habit Performance</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {stats.habitStats.map((stat: any) => (
                  <div key={stat.habit.id} className="bg-gray-50 rounded-lg p-4 border border-surface-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{stat.habit.emoji}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stat.habit.name}</div>
                          <div className="text-xs text-gray-500">
                            {stat.completions} / {stat.totalDays} days
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{stat.completionRate}%</div>
                        <div className="text-xs text-gray-500">Completion</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Daily Completion</span>
                          <span>{stat.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${stat.completionRate}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Goal Progress ({stat.habit.goal} days)</span>
                          <span>{stat.goalProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-success-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${stat.goalProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
