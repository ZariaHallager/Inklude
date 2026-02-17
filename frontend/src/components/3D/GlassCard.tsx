import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  tint?: 'warm' | 'cool' | 'neutral';
  glow?: boolean;
}

const blurMap = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
};

const tintMap = {
  warm: 'bg-gradient-to-br from-accent/5 to-secondary/5',
  cool: 'bg-gradient-to-br from-tertiary/5 to-info/5',
  neutral: 'bg-surface/60',
};

export default function GlassCard({
  children,
  className = '',
  blur = 'lg',
  tint = 'warm',
  glow = true,
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        ${blurMap[blur]}
        ${tintMap[tint]}
        border border-white/10
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
    >
      {/* Inner glow effect */}
      {glow && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Inner warm glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 opacity-50" />
        </div>
      )}

      {/* Multiple shadow layers for depth */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none glass-card-shadow" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
