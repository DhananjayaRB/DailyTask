import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface AuthScreenProps {
  onLogin: (userData: { name: string; mobile: string; uniqueNumber: string }) => void;
}

type AuthMode = 'login' | 'register';

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [uniqueNumber, setUniqueNumber] = useState('');
  const [errors, setErrors] = useState<{ name?: string; mobile?: string; uniqueNumber?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);

  const validateMobile = (mobileNumber: string): boolean => {
    return /^[0-9]{10}$/.test(mobileNumber.trim());
  };

  const checkMobileExists = async (mobileNumber: string): Promise<boolean> => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');
      const response = await axios.get(`${API_BASE_URL}/users`, {
        params: { mobile: mobileNumber }
      });
      return response.data.exists || false;
    } catch (error) {
      console.error('Error checking mobile:', error);
      return false;
    }
  };

  const getUserByMobile = async (mobileNumber: string): Promise<{ name: string; uniqueNumber: string } | null> => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');
      const response = await axios.get(`${API_BASE_URL}/users`, {
        params: { getUser: true, mobile: mobileNumber }
      });
      
      if (response.data && response.data.exists) {
        // User exists - return their info
        return {
          name: response.data.name || `User ${mobileNumber}`,
          uniqueNumber: response.data.uniqueNumber || mobileNumber.substring(0, 4)
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mobile
    if (!mobile.trim()) {
      setErrors({ mobile: 'Mobile number is required' });
      return;
    }
    
    if (!validateMobile(mobile.trim())) {
      setErrors({ mobile: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    setIsSubmitting(true);
    setIsCheckingMobile(true);

    try {
      // Check if mobile exists
      const mobileExists = await checkMobileExists(mobile.trim());
      
      if (!mobileExists) {
        setErrors({ mobile: 'Mobile number not found. Please register first.' });
        setIsSubmitting(false);
        setIsCheckingMobile(false);
        return;
      }

      // Get user data (we'll use mobile as identifier for now)
      // In a real app, you'd have a users table
      const userData = await getUserByMobile(mobile.trim());
      
      if (userData) {
        onLogin({
          name: userData.name,
          mobile: mobile.trim(),
          uniqueNumber: userData.uniqueNumber,
        });
      } else {
        // Fallback: use mobile number as name
        onLogin({
          name: `User ${mobile.trim()}`,
          mobile: mobile.trim(),
          uniqueNumber: mobile.trim().substring(0, 4),
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrors({ mobile: 'Failed to login. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setIsCheckingMobile(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { name?: string; mobile?: string; uniqueNumber?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!validateMobile(mobile.trim())) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!uniqueNumber.trim()) {
      newErrors.uniqueNumber = 'Unique number is required';
    } else if (uniqueNumber.trim().length < 3) {
      newErrors.uniqueNumber = 'Unique number must be at least 3 characters';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setIsCheckingMobile(true);

    // Check if mobile number already exists
    const mobileExists = await checkMobileExists(mobile.trim());
    
    if (mobileExists) {
      setErrors({ mobile: 'This mobile number is already registered. Please login instead.' });
      setIsSubmitting(false);
      setIsCheckingMobile(false);
      return;
    }

    setIsCheckingMobile(false);

    // Register new user - save to users table
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');
      await axios.post(`${API_BASE_URL}/users`, {
        name: name.trim(),
        mobile_number: mobile.trim(),
        unique_number: uniqueNumber.trim(),
      });
    } catch (error) {
      console.error('Error registering user:', error);
      // Continue anyway - user will be saved when they create first habit
    }

    // Register new user
    setTimeout(() => {
      onLogin({
        name: name.trim(),
        mobile: mobile.trim(),
        uniqueNumber: uniqueNumber.trim(),
      });
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            className="text-5xl mb-4"
          >
            👑
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome to Daily Tracker
          </h1>
          <p className="text-sm text-gray-500">
            {mode === 'login' ? 'Login to continue your journey' : "Let's get you started with your journey"}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => {
              setMode('login');
              setErrors({});
              setName('');
              setMobile('');
              setUniqueNumber('');
            }}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${mode === 'login'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            Login
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrors({});
              setName('');
              setMobile('');
              setUniqueNumber('');
            }}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${mode === 'register'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white rounded-xl border border-surface-border shadow-sm p-6 sm:p-8"
        >
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
            {/* Name Field - Only for Register */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    placeholder="Enter your full name"
                    className={`
                      w-full px-4 py-2.5 rounded-lg border transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      ${errors.name 
                        ? 'border-danger-500 bg-danger-50' 
                        : 'border-gray-300 bg-white hover:border-gray-400'
                      }
                    `}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-danger-500 mt-1.5"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Number Field */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mobile Number <span className="text-danger-500">*</span>
              </label>
              <input
                type="tel"
                id="mobile"
                value={mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setMobile(value);
                  if (errors.mobile) setErrors({ ...errors, mobile: undefined });
                }}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className={`
                  w-full px-4 py-2.5 rounded-lg border transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  ${errors.mobile 
                    ? 'border-danger-500 bg-danger-50' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                  }
                `}
                disabled={isSubmitting}
              />
              {errors.mobile && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-danger-500 mt-1.5"
                >
                  {errors.mobile}
                </motion.p>
              )}
            </div>

            {/* Unique Number Field - Only for Register */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="uniqueNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Unique Number <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="uniqueNumber"
                    value={uniqueNumber}
                    onChange={(e) => {
                      setUniqueNumber(e.target.value);
                      if (errors.uniqueNumber) setErrors({ ...errors, uniqueNumber: undefined });
                    }}
                    placeholder="Enter your unique identifier"
                    className={`
                      w-full px-4 py-2.5 rounded-lg border transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      ${errors.uniqueNumber 
                        ? 'border-danger-500 bg-danger-50' 
                        : 'border-gray-300 bg-white hover:border-gray-400'
                      }
                    `}
                    disabled={isSubmitting}
                  />
                  {errors.uniqueNumber && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-danger-500 mt-1.5"
                    >
                      {errors.uniqueNumber}
                    </motion.p>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">
                    This will be used to identify your account
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`
                w-full py-3 px-4 rounded-lg font-medium text-white
                transition-all duration-200
                ${isSubmitting
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow-md'
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {isCheckingMobile ? 'Checking...' : (mode === 'login' ? 'Logging in...' : 'Getting Started...')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {mode === 'login' ? 'Login' : 'Get Started'} 
                  {mode === 'register' && <span>🚀</span>}
                </span>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center text-xs text-gray-400 mt-6"
        >
          Your data is stored securely and locally
        </motion.p>
      </motion.div>
    </div>
  );
}

