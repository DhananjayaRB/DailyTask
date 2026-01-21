import { useState, useEffect } from 'react';
import { habitsApi } from '../services/api';
import { Habit } from '../types';
import AddHabitModal from '../components/AddHabitModal';
import { userStorage } from '../utils/userStorage';

export default function Settings() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setIsLoading(true);
      const data = await habitsApi.getAll();
      setHabits(data);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = async (habit: Omit<Habit, 'id'>) => {
    try {
      const newHabit = await habitsApi.create(habit);
      setHabits([...habits, newHabit]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding habit:', error);
      alert('Failed to add habit');
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    try {
      await habitsApi.delete(id);
      setHabits(habits.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit');
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowAddModal(true);
  };

  const handleUpdateHabit = async (habit: Omit<Habit, 'id'>) => {
    if (!editingHabit) return;
    
    try {
      const updated = await habitsApi.update(editingHabit.id, habit);
      setHabits(habits.map((h) => (h.id === editingHabit.id ? updated : h)));
      setEditingHabit(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error updating habit:', error);
      alert('Failed to update habit');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-500 text-sm">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-surface-bg">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>⚙️</span>
            <span>Settings</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1.5">
            <span>🔧</span>
            <span>Manage your habits and preferences</span>
          </p>
        </header>

        <div className="bg-white rounded-xl border border-surface-border shadow-soft-lg">
          <div className="p-6 border-b border-surface-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>📝</span>
              <span>Your Habits</span>
            </h2>
            <button
              onClick={() => {
                setEditingHabit(null);
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-soft flex items-center gap-2"
            >
              <span>➕</span>
              <span>Add New Habit</span>
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-gray-500 text-sm mb-1">No habits yet</p>
              <p className="text-gray-400 text-xs">Click "Add New Habit" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="p-4 hover:bg-gray-50/50 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{habit.emoji}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{habit.name}</div>
                        <div className="text-xs text-gray-500">
                          Goal: {habit.goal} days/month
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditHabit(habit)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-surface-border flex items-center gap-1.5"
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="px-3 py-1.5 text-xs font-medium text-danger-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200 border border-danger-200 flex items-center gap-1.5"
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl p-6 border border-surface-border shadow-soft">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>ℹ️</span>
            <span>About</span>
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <span>🎯</span>
              <span>Daily Task Tracker helps you build consistency and track your habits.</span>
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <span>💻</span>
              <span>Version 2.0 • Built with React, TypeScript, and PostgreSQL</span>
            </p>
          </div>
        </div>

        {/* Logout Section */}
        <div className="mt-6 bg-white rounded-xl p-6 border border-surface-border shadow-soft">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>🔐</span>
            <span>Account</span>
          </h2>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                userStorage.clearUser();
                window.location.href = '/';
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-danger-600 hover:text-white hover:bg-danger-600 rounded-lg transition-colors duration-200 border border-danger-300 hover:border-danger-600 flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

        {showAddModal && (
          <AddHabitModal
            onClose={() => {
              setShowAddModal(false);
              setEditingHabit(null);
            }}
            onAdd={editingHabit ? handleUpdateHabit : handleAddHabit}
            editingHabit={editingHabit}
          />
        )}
      </div>
    </div>
  );
}
