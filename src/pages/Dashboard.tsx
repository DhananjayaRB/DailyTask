import { useState, useEffect } from 'react';
import HabitTracker from '../components/HabitTracker';
import { Habit } from '../types';
import { habitsApi } from '../services/api';

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await habitsApi.getAll();
      setHabits(data);
    } catch (err) {
      console.error('Error loading habits:', err);
      setError('Failed to load habits. Make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = async (habit: Omit<Habit, 'id'>) => {
    try {
      const newHabit = await habitsApi.create(habit);
      setHabits([...habits, newHabit]);
    } catch (err) {
      console.error('Error adding habit:', err);
      alert('Failed to add habit');
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await habitsApi.delete(id);
      setHabits(habits.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
      alert('Failed to delete habit');
    }
  };

  const handleUpdateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      const updated = await habitsApi.update(id, updates);
      setHabits(habits.map((h) => (h.id === id ? updated : h)));
    } catch (err) {
      console.error('Error updating habit:', err);
      alert('Failed to update habit');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">⏳</div>
          <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-500 text-sm">Loading your habits...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg p-6">
        <div className="bg-white rounded-xl p-6 max-w-md w-full border border-surface-border shadow-soft">
          <div className="text-4xl mb-3 text-center">⚠️</div>
          <div className="text-danger-500 text-sm font-medium mb-2 text-center">Connection Error</div>
          <div className="text-gray-600 text-sm mb-4 text-center">{error}</div>
          <button
            onClick={loadHabits}
            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6 bg-surface-bg">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-7xl">
        <header className="mb-3">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5 flex items-center gap-2">
            <span>📊</span>
            <span>Dashboard</span>
          </h1>
          <p className="text-gray-500 text-xs flex items-center gap-1.5">
            <span>🎯</span>
            <span>Track your daily habits and build consistency</span>
          </p>
        </header>
        <HabitTracker
          habits={habits}
          onAddHabit={handleAddHabit}
          onDeleteHabit={handleDeleteHabit}
          onUpdateHabit={handleUpdateHabit}
        />
      </div>
    </div>
  );
}
