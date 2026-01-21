import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ProgressPulseProps {
  children: ReactNode;
  trigger: boolean;
  className?: string;
}

export default function ProgressPulse({ children, trigger, className = '' }: ProgressPulseProps) {
  return (
    <motion.div
      animate={trigger ? {
        scale: [1, 1.05, 1],
      } : {}}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

