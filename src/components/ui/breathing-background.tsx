"use client";

import React from "react";
import { motion } from "framer-motion";

export function BreathingBackground({ animated = false }: { animated?: boolean }) {
  const Container = animated ? motion.div : "div";

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#051210]">
      {/* Layer 1: Emerald Base */}
      <Container 
        {...(animated ? {
          animate: { 
            scale: [1, 1.1, 1.1, 1],
            opacity: [0.3, 0.5, 0.5, 0.3],
          },
          transition: { duration: 12, repeat: Infinity, times: [0, 0.416, 0.583, 1], ease: "easeInOut" }
        } : {})}
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.4)_0%,transparent_60%)]" 
      />

      {/* Layer 2: Gold Peak */}
      <Container 
        {...(animated ? {
          animate: { 
            scale: [1, 1.3, 1.3, 1],
            opacity: [0, 0.8, 0.8, 0],
          },
          transition: { duration: 12, repeat: Infinity, times: [0, 0.416, 0.583, 1], ease: "easeInOut" }
        } : {})}
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.4)_0%,transparent_70%)]" 
      />

      {/* Layer 3: Secondary Emerald */}
      <Container 
        {...(animated ? {
          animate: { 
            opacity: [0.2, 0.4, 0.4, 0.2],
          },
          transition: { duration: 12, repeat: Infinity, times: [0, 0.416, 0.583, 1], ease: "easeInOut" }
        } : {})}
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.2)_0%,transparent_60%)]" 
      />

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      
      {/* Deep Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#051210]/40 to-[#051210] pointer-events-none" />
    </div>
  );
}
