import { useState, useEffect } from 'react';
import { Habit } from '../types';

const EMOJI_OPTIONS = [
  '⏰', '💪', '📚', '💰', '🎯', '🚫', '📵', '📝', '❄️', '🧘',
  '🏋️', '💧', '🌱', '✨', '🧠', '📖', '🎨', '🏃', '🚴', '🧘‍♀️',
  '🍎', '🥗', '💤', '☀️', '🌙', '🏋️‍♂️', '🧘‍♂️', '🎵', '🎬', '📱',
  '💻', '📸', '🎮', '🎭', '🎪', '🎨', '🖌️', '✍️', '📊', '📈',
  '🎓', '🔬', '🧪', '🔭', '🌍', '🗺️', '🚀', '⭐', '🌟', '💫',
  '🔥', '💎', '🎁', '🎉', '🎊', '🏆', '🥇', '🥈', '🥉', '🎖️',
  '❤️', '💚', '💙', '💜', '🧡', '💛', '🖤', '🤍', '🤎', '💗',
];

const COLOR_OPTIONS = [
  { name: 'Blue', value: 'blue' },
  { name: 'Red', value: 'red' },
  { name: 'Green', value: 'green' },
  { name: 'Purple', value: 'purple' },
  { name: 'Orange', value: 'orange' },
  { name: 'Yellow', value: 'yellow' },
  { name: 'Pink', value: 'pink' },
  { name: 'Indigo', value: 'indigo' },
  { name: 'Cyan', value: 'cyan' },
  { name: 'Teal', value: 'teal' },
];

interface AddHabitModalProps {
  onClose: () => void;
  onAdd: (habit: Omit<Habit, 'id'>) => void;
  editingHabit?: Habit | null;
}

export default function AddHabitModal({ onClose, onAdd, editingHabit }: AddHabitModalProps) {
  const [name, setName] = useState(editingHabit?.name || '');
  const [emoji, setEmoji] = useState(editingHabit?.emoji || '⏰');
  const [goal, setGoal] = useState(editingHabit?.goal || 30);
  const [color, setColor] = useState(editingHabit?.color || 'blue');

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setEmoji(editingHabit.emoji);
      setGoal(editingHabit.goal);
      setColor(editingHabit.color);
    } else {
      setName('');
      setEmoji('⏰');
      setGoal(30);
      setColor('blue');
    }
  }, [editingHabit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({ name: name.trim(), emoji, goal, color });
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in safe-area-top safe-area-bottom"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-surface-border shadow-soft-xl animate-slide-up scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>{editingHabit ? '✏️' : '➕'}</span>
            <span>{editingHabit ? 'Edit Habit' : 'Add New Habit'}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
              placeholder="e.g., Wake up at 05:00"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
            <div className="max-h-40 overflow-y-auto scrollbar-thin bg-gray-50 rounded-lg p-3 border border-surface-border">
              <div className="grid grid-cols-10 gap-1.5">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`
                      text-xl p-2 rounded-md transition-all duration-200
                      ${emoji === em
                        ? 'bg-primary-600 text-white scale-105'
                        : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal (days per month)
            </label>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(parseInt(e.target.value) || 30)}
              min="1"
              max="31"
              className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setColor(col.value)}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border
                    ${color === col.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-surface-border'
                    }
                  `}
                >
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 border border-surface-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-soft flex items-center justify-center gap-2"
            >
              <span>{editingHabit ? '💾' : '➕'}</span>
              <span>{editingHabit ? 'Update Habit' : 'Add Habit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
