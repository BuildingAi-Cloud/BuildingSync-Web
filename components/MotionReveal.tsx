"use client";

import { motion, type Variants } from "framer-motion";

// Scroll-reveal primitive used across marketing pages. Fades + lifts
// the wrapped content when it enters the viewport. Honors reduced-
// motion automatically via MotionConfigProvider (the framer-motion
// "reducedMotion: always" mode strips all transforms).
//
// Subtle by design — 12px lift, 350ms, custom-easing curve that
// feels like a confident product, not a marketing site.
//   • once:true so it doesn't re-trigger on scroll up
//   • margin pulls the trigger up so it fires just before the
//     content fully enters view (smoother scroll feel)

const EASE = [0.22, 1, 0.36, 1] as const; // "easeOutExpo"-ish, premium feel
const DEFAULT_DURATION = 0.35;

export function MotionReveal({
  children,
  delay = 0,
  y = 12,
  as = "div",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "article" | "li";
  className?: string;
}) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: DEFAULT_DURATION, delay, ease: EASE }}
      className={className}
    >
      {children}
    </Component>
  );
}

// Stagger container — wrap a list to have children appear in
// sequence. Pair with <MotionRevealItem> for the children.
export function MotionRevealStagger({
  children,
  stagger = 0.08,
  delayChildren = 0,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  stagger?: number;
  delayChildren?: number;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
}) {
  const Component = motion[as] as typeof motion.div;
  const container: Variants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };
  return (
    <Component
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function MotionRevealItem({
  children,
  y = 10,
  as = "div",
  className = "",
}: {
  children: React.ReactNode;
  y?: number;
  as?: "div" | "li" | "article";
  className?: string;
}) {
  const Component = motion[as] as typeof motion.div;
  const item: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: DEFAULT_DURATION, ease: EASE } },
  };
  return (
    <Component variants={item} className={className}>
      {children}
    </Component>
  );
}

// Hover-lift primitive for cards. Subtle elevation + slight scale on
// hover. Reduced-motion strips the transform automatically via the
// global MotionConfig.
export function MotionLift({
  children,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "a" | "article";
}) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      whileHover={{ y: -2, transition: { duration: 0.2, ease: EASE } }}
      whileTap={{ scale: 0.99 }}
      className={className}
    >
      {children}
    </Component>
  );
}
