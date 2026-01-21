import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface CelebrationToastProps {
  message: string;
  emoji: string;
  isVisible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export default function CelebrationToast({
  message,
  emoji,
  isVisible,
  onDismiss,
  duration = 1500,
}: CelebrationToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="bg-white rounded-xl shadow-lg px-6 py-4 border border-primary-200 flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <span className="text-sm font-semibold text-gray-900">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

