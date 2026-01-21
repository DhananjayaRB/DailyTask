import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ConfettiBurstProps {
  trigger: number;
  particleCount?: number;
}

export default function ConfettiBurst({ trigger, particleCount = 30 }: ConfettiBurstProps) {
  const prefersReducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (trigger && !prefersReducedMotion) {
      // Generate particles
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Percentage from left
        y: Math.random() * 100, // Percentage from top
        color: ['#6366F1', '#8B5CF6', '#22C55E', '#3B82F6'][Math.floor(Math.random() * 4)], // Soft accent colors
        delay: Math.random() * 0.2,
      }));
      setParticles(newParticles);

      // Clear particles after animation
      const timer = setTimeout(() => {
        setParticles([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger, particleCount, prefersReducedMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            opacity: 0, 
            scale: 0,
            x: '50%',
            y: '50%',
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            x: `${particle.x}%`,
            y: `${particle.y + 50}%`,
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 0.8,
            delay: particle.delay,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: '50%',
            top: '50%',
          }}
        />
      ))}
    </div>
  );
}

