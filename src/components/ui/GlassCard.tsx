import React from 'react';
import clsx from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div 
      className={clsx(
        "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
