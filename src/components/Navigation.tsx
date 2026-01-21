import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { userStorage } from '../utils/userStorage';

interface NavigationProps {
  onLogout?: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const location = useLocation();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const user = userStorage.getUser();
    if (user) {
      setUserName(user.name);
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      userStorage.clearUser();
      if (onLogout) {
        onLogout();
      } else {
        // Fallback: reload page to trigger login screen
        window.location.href = '/';
      }
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-surface-border safe-area-top">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-12 sm:h-14">
          <Link 
            to="/" 
            className="flex items-center gap-1.5 text-sm sm:text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
          >
            <span className="text-base sm:text-lg">👑</span>
            <span className="hidden sm:inline">Daily Tracker</span>
            <span className="sm:hidden">Tracker</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {userName && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600">
                <span className="text-gray-400">👤</span>
                <span className="font-medium">{userName}</span>
              </div>
            )}
            
            <div className="flex items-center gap-0.5 sm:gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="hidden sm:inline-flex items-center gap-1.5">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <span className="sm:hidden">{item.icon}</span>
                </Link>
              ))}
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="ml-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-danger-600 hover:bg-gray-50 rounded transition-colors duration-200 flex items-center gap-1.5"
              title="Logout"
            >
              <span className="hidden sm:inline">🚪</span>
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
