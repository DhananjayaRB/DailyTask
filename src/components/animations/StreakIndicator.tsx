import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StreakIndicatorProps {
  streak: number;
  previousStreak: number;
  className?: string;
}

export default function StreakIndicator({ streak, previousStreak, className = '' }: StreakIndicatorProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (streak > previousStreak && streak > 0) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 600);
      return () => clearTimeout(timer);
    }
  }, [streak, previousStreak]);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
              <span>🔥</span>
              <span>Streak!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.span
        key={streak}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="inline-block"
      >
        {streak}
      </motion.span>
    </div>
  );
}

