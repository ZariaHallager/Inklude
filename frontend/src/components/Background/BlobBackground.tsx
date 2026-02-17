import { motion } from 'framer-motion';

interface BlobBackgroundProps {
  className?: string;
  variant?: 'default' | 'subtle' | 'vibrant';
}

export default function BlobBackground({
  className = '',
  variant = 'default'
}: BlobBackgroundProps) {
  const opacityMap = {
    subtle: { blob1: 0.05, blob2: 0.03, blob3: 0.04 },
    default: { blob1: 0.1, blob2: 0.08, blob3: 0.06 },
    vibrant: { blob1: 0.15, blob2: 0.12, blob3: 0.1 },
  };

  const opacity = opacityMap[variant];

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Primary blob - warm coral */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(255, 153, 102, ${opacity.blob1}) 0%, transparent 70%)`,
          top: '10%',
          left: '20%',
        }}
        animate={{
          x: [0, 50, 0, -30, 0],
          y: [0, 30, -20, 10, 0],
          scale: [1, 1.1, 1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary blob - soft apricot */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(255, 204, 153, ${opacity.blob2}) 0%, transparent 70%)`,
          bottom: '20%',
          right: '15%',
        }}
        animate={{
          x: [0, -40, 20, -10, 0],
          y: [0, -20, 40, -30, 0],
          scale: [1, 1.15, 0.95, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Tertiary blob - soft sky blue */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(153, 204, 255, ${opacity.blob3}) 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          x: [0, 30, -40, 20, 0],
          y: [0, -40, 20, -10, 0],
          scale: [1, 1.2, 1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Small accent blobs */}
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(136, 192, 112, ${opacity.blob3}) 0%, transparent 70%)`,
          top: '70%',
          left: '10%',
        }}
        animate={{
          x: [0, 20, -10, 15, 0],
          y: [0, -15, 25, -5, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[250px] h-[250px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(245, 169, 98, ${opacity.blob3}) 0%, transparent 70%)`,
          top: '20%',
          right: '25%',
        }}
        animate={{
          x: [0, -25, 15, -20, 0],
          y: [0, 20, -15, 10, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
