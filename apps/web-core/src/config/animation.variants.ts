/**
 * Animation Variants for Framer Motion
 * Centralized animation presets to ensure consistency across the application.
 */
import { type Variants, type Transition } from 'framer-motion';

// --- Transitions ---
export const defaultTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut',
};

export const quickTransition: Transition = {
  duration: 0.15,
};

export const delayedTransition = (delay: number): Transition => ({
  duration: 0.3,
  delay,
});

// --- Variants ---

/**
 * Fade in from the left with a slight slide.
 * Use for toolbar elements appearing sequentially.
 */
export const fadeSlideLeft: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

/**
 * Fade in from the right with a slight slide.
 * Use for batch action buttons appearing from the right.
 */
export const fadeSlideRight: Variants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
};

/**
 * Fade in with a subtle scale.
 * Use for select-all checkbox or important interactive elements.
 */
export const fadeScale: Variants = {
  initial: { opacity: 0, scale: 0.95, x: -10 },
  animate: { opacity: 1, scale: 1, x: 0 },
  exit: { opacity: 0, scale: 0.95, x: -10 },
};

/**
 * Fade in with a vertical slide.
 * Use for main content areas transitioning between skeleton and data.
 */
export const fadeSlideUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

/**
 * Simple fade in/out.
 * Use for modals, overlays, or subtle transitions.
 */
export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
