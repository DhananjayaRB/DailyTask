import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
        </div>
      </div>
    </nav>
  );
}
