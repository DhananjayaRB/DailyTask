import { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginScreenProps {
  onLogin: (userData: { name: string; mobile: string; uniqueNumber: string }) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [uniqueNumber, setUniqueNumber] = useState('');
  const [errors, setErrors] = useState<{ name?: string; mobile?: string; uniqueNumber?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { name?: string; mobile?: string; uniqueNumber?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(mobile.trim())) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!uniqueNumber.trim()) {
      newErrors.uniqueNumber = 'Unique number is required';
    } else if (uniqueNumber.trim().length < 3) {
      newErrors.uniqueNumber = 'Unique number must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate a small delay for better UX
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
            Let's get you started with your journey
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          className="bg-white rounded-xl border border-surface-border shadow-sm p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
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
            </div>

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

            {/* Unique Number Field */}
            <div>
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
            </div>

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
                  Getting Started...
                </span>
              ) : (
                'Get Started 🚀'
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

