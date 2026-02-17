// Animation variants for Framer Motion
// Consistent, reusable animations across the app

import { easeOut, easeInOut } from 'framer-motion';

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut }
  }
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut }
  }
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easeOut }
  }
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easeOut }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    }
  }
};

export const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
  }
};

export const scaleInBounce = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 10 }
  }
};

export const slideInFromLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 20, stiffness: 100 }
  }
};

export const slideInFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 20, stiffness: 100 }
  }
};

export const slideInFromBottom = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 20, stiffness: 100 }
  }
};

// Modal animations
export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export const modalContent = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 }
  }
};

// Card hover effects
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2, ease: easeOut }
  }
};

export const cardTap = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// Button animations
export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// List item animations
export const listItem = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  }
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

// Sidebar animation
export const sidebarSlide = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 25, stiffness: 200 }
  }
};

// Toast notification
export const toastSlide = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 20, stiffness: 300 }
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Accordion/expand animation
export const expandCollapse = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: easeOut }
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Rotate animation (for icons)
export const rotate = {
  rest: { rotate: 0 },
  hover: { rotate: 15 },
  tap: { rotate: -15 }
};

// Pulse animation
export const pulse = {
  scale: [1, 1.05, 1],
  transition: { duration: 2, repeat: Infinity, ease: easeInOut }
};

// Shimmer loading effect
export const shimmer = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: { duration: 1.5, repeat: Infinity, ease: (t: number) => t }
  }
};

// Floating animation
export const float = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity, ease: easeInOut }
};

// Glow pulse
export const glowPulse = {
  boxShadow: [
    '0 0 20px rgba(255, 153, 102, 0.2)',
    '0 0 40px rgba(255, 153, 102, 0.4)',
    '0 0 20px rgba(255, 153, 102, 0.2)',
  ],
  transition: { duration: 2, repeat: Infinity, ease: easeInOut }
};
