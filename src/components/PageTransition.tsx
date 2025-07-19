import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/contexts/NavigationContext';

interface PageTransitionProps {
  children: React.ReactNode;
  router: any;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, router }) => {
  const { direction, isMobile } = useNavigation();

  // Animation variants for different directions
  const variants = {
    // Forward navigation (slide from right)
    forward: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-100%', opacity: 0 }
    },
    // Backward navigation (slide from left)
    backward: {
      initial: { x: '-100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 0 }
    },
    // Desktop - fade transition
    desktop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    }
  };

  const currentVariant = isMobile ? variants[direction] : variants.desktop;

  const transition = {
    type: 'tween' as const,
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1] as const // Cubic bezier for smooth feel
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.route}
        initial={currentVariant.initial}
        animate={currentVariant.animate}
        exit={currentVariant.exit}
        transition={transition}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: isMobile ? 'hidden' : 'visible'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
