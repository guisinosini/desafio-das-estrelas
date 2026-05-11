"use client";

import React from "react";
import { motion } from "framer-motion";

interface CircularProgressProps {
  percentage: number;
  tasksDone: number;
  totalTasks: number;
}

export function CircularProgress({ percentage, tasksDone, totalTasks }: CircularProgressProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-zinc-800"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="96"
          cy="96"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-black text-white tracking-tighter">{percentage}%</span>
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{tasksDone}/{totalTasks} tasks done</span>
      </div>
      
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full -z-10" />
    </div>
  );
}
