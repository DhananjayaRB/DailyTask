import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AuthScreen from './components/AuthScreen';
import { userStorage } from './utils/userStorage';
import { initUser } from './services/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user has already logged in
    const loginCompleted = userStorage.isLoginCompleted();
    setIsLoggedIn(loginCompleted);
    setIsChecking(false);
  }, []);

  const handleLogin = async (userData: { name: string; mobile: string; uniqueNumber: string }) => {
    userStorage.saveUser(userData);
    
    // Initialize user with default habits
    try {
      await initUser(userData.mobile);
      console.log('✅ Default habits initialized for user');
    } catch (error) {
      console.error('Error initializing default habits:', error);
      // Don't block login if initialization fails
    }
    
    setIsLoggedIn(true);
  };

  // Show loading state while checking login status
  if (isChecking) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  // Show login/register screen if not logged in
  if (!isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Show main app if logged in
  return (
    <Router>
      <div className="min-h-screen bg-surface-bg text-gray-900">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
