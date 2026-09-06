"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export function CareAIIntro() {
  const [isMounted, setIsMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    
    // Play on every mount (refresh)
    setShowIntro(true);
    
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3500);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 overflow-hidden"
        >
          {/* Subtle ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50/20 to-slate-50 pointer-events-none" />

          {/* Central Content Container */}
          <div className="relative flex flex-col items-center justify-center w-full h-full max-w-md mx-auto px-4 z-10">
            
            {/* Logo Container */}
            <div className="relative flex items-center justify-center mb-6 h-32 w-32">
              {!prefersReducedMotion && (
                <>
                  {/* Concentric Rings */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.5], opacity: [0, 0.2, 0] }}
                    transition={{ duration: 2, delay: 0.2, ease: "easeOut", times: [0, 0.5, 1] }}
                    className="absolute inset-0 rounded-full border border-blue-300 pointer-events-none"
                  />
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 2], opacity: [0, 0.1, 0] }}
                    transition={{ duration: 2, delay: 0.4, ease: "easeOut", times: [0, 0.5, 1] }}
                    className="absolute inset-0 rounded-full border border-teal-200 pointer-events-none"
                  />
                  {/* Particles */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, x: -10 }}
                    animate={{ opacity: [0, 1, 0], y: -30, x: -20 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full left-4 pointer-events-none"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, x: 10 }}
                    animate={{ opacity: [0, 1, 0], y: -20, x: 30 }}
                    transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                    className="absolute w-2 h-2 bg-teal-400 rounded-full right-4 pointer-events-none"
                  />
                </>
              )}
              
              {/* Actual Logo */}
              <motion.img
                src="/favicon.ico"
                alt="CareAI Logo"
                initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.2, opacity: 0, filter: "blur(10px)" }}
                animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ 
                  delay: prefersReducedMotion ? 0 : 0.2, 
                  duration: prefersReducedMotion ? 0.5 : 1, 
                  type: prefersReducedMotion ? "tween" : "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="relative z-10 w-24 h-24 drop-shadow-xl"
              />
            </div>

            {/* Title */}
            <motion.h1
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, filter: "blur(5px)" }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: prefersReducedMotion ? 0.2 : 1.0, duration: 0.6, ease: "easeOut" }}
              className="text-5xl font-bold tracking-tight mb-3"
            >
              <span className="text-slate-900">Care</span>
              <span className="text-blue-600">AI</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 15 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0.4 : 1.5, duration: 0.6, ease: "easeOut" }}
              className="text-lg text-slate-600 font-medium tracking-wide mb-12 text-center"
            >
              Your Health, Clearer Tomorrow
            </motion.p>

            {/* Loading Line & Powered By */}
            <div className="w-full max-w-[200px] flex flex-col items-center">
              <div className="w-full h-[2px] bg-slate-200 rounded-full overflow-hidden mb-3 relative">
                <motion.div
                  initial={prefersReducedMotion ? { width: "100%" } : { width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: prefersReducedMotion ? 0 : 2.0, duration: 0.7, ease: "easeInOut" }}
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-teal-400"
                />
              </div>
              <motion.span
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : 2.2, duration: 0.5 }}
                className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold"
              >
                POWERED BY AI
              </motion.span>
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
