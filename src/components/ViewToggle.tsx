interface ViewToggleProps {
  viewMode: 'week' | 'month';
  onViewChange: (mode: 'week' | 'month') => void;
}

export default function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded p-0.5 border border-surface-border">
      <button
        onClick={() => onViewChange('week')}
        className={`
          px-2 py-1 text-xs font-medium rounded transition-all duration-200
          ${viewMode === 'week'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
          }
        `}
      >
        Week
      </button>
      <button
        onClick={() => onViewChange('month')}
        className={`
          px-2 py-1 text-xs font-medium rounded transition-all duration-200
          ${viewMode === 'month'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
          }
        `}
      >
        Month
      </button>
    </div>
  );
}
