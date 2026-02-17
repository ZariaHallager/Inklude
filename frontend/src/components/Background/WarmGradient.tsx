import { motion } from 'framer-motion';

interface WarmGradientProps {
  className?: string;
  showParticles?: boolean;
}

export default function WarmGradient({
  className = '',
  showParticles = true,
}: WarmGradientProps) {
  // Generate random particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div className="absolute inset-0 warm-gradient-base" />

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(ellipse at 30% 40%, rgba(255, 153, 102, 0.1) 0%, transparent 50%)',
            'radial-gradient(ellipse at 70% 60%, rgba(255, 204, 153, 0.1) 0%, transparent 50%)',
            'radial-gradient(ellipse at 40% 70%, rgba(153, 204, 255, 0.08) 0%, transparent 50%)',
            'radial-gradient(ellipse at 60% 30%, rgba(136, 192, 112, 0.08) 0%, transparent 50%)',
            'radial-gradient(ellipse at 30% 40%, rgba(255, 153, 102, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating particles */}
      {showParticles && particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: `rgba(255, 204, 153, ${0.2 + Math.random() * 0.3})`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Vignette effect */}
      <div className="absolute inset-0 warm-gradient-vignette" />
    </div>
  );
}
