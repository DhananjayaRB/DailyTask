import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
}

export default function CountUp({ value, duration = 0.6, className = '' }: CountUpProps) {
  const spring = useSpring(0, { duration, bounce: 0 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}

