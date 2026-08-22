"use client";

import { forwardRef, useImperativeHandle, useCallback } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimate } from "motion/react";

export const SparklesIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "" },
    ref
  ) => {
    const [scope, animate] = useAnimate();

    const start = useCallback(async () => {
      animate(
        ".sparkle-main",
        { scale: [1, 1.25, 1], rotate: [0, 15, -10, 0] },
        { duration: 0.5, ease: "easeInOut" }
      );
      animate(
        ".sparkle-small-1",
        { scale: [1, 1.3, 0.8, 1], opacity: [0.6, 1, 0.8, 1], y: [0, -2, 0] },
        { duration: 0.45, ease: "easeOut" }
      );
      animate(
        ".sparkle-small-2",
        { scale: [1, 1.3, 0.8, 1], opacity: [0.6, 1, 0.8, 1], y: [0, 2, 0] },
        { duration: 0.45, ease: "easeOut", delay: 0.1 }
      );
    }, [animate]);

    const stop = useCallback(async () => {
      animate(
        ".sparkle-main, .sparkle-small-1, .sparkle-small-2",
        { scale: 1, rotate: 0, opacity: 1, y: 0 },
        { duration: 0.25, ease: "easeInOut" }
      );
    }, [animate]);

    useImperativeHandle(ref, () => ({
      startAnimation: start,
      stopAnimation: stop,
    }));

    return (
      <motion.svg
        ref={scope}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cursor-pointer ${className}`}
        onHoverStart={start}
        onHoverEnd={stop}
      >
        <motion.path
          d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
          className="sparkle-main origin-center"
        />
        <motion.path
          d="M5 3v4"
          className="sparkle-small-1"
        />
        <motion.path
          d="M19 17v4"
          className="sparkle-small-2"
        />
        <motion.path
          d="M3 5h4"
          className="sparkle-small-1"
        />
        <motion.path
          d="M17 19h4"
          className="sparkle-small-2"
        />
      </motion.svg>
    );
  }
);

SparklesIcon.displayName = "SparklesIcon";
export default SparklesIcon;
