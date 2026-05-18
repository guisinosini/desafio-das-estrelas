import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface OrbitalPlanetProps {
  type: 'green' | 'purple' | 'blue' | 'gold' | 'turquoise';
  title?: string;
  subtitle?: string;
}

const planetStyles = {
  green: {
    background: 'radial-gradient(circle at 35% 35%, #4ade80 0%, #166534 60%, #14532d 100%)',
    shadow: '0 0 60px rgba(74, 222, 128, 0.25), inset -15px -15px 40px rgba(0,0,0,0.8), inset 10px 10px 20px rgba(255,255,255,0.1)',
    ringColor: 'rgba(74, 222, 128, 0.15)',
    halo: 'rgba(74, 222, 128, 0.08)'
  },
  purple: {
    background: 'radial-gradient(circle at 35% 35%, #c084fc 0%, #6b21a8 60%, #581c87 100%)',
    shadow: '0 0 60px rgba(192, 132, 252, 0.25), inset -15px -15px 40px rgba(0,0,0,0.8), inset 10px 10px 20px rgba(255,255,255,0.1)',
    ringColor: 'rgba(192, 132, 252, 0.15)',
    halo: 'rgba(192, 132, 252, 0.08)'
  },
  blue: {
    background: 'radial-gradient(circle at 35% 35%, #38bdf8 0%, #0369a1 60%, #0c4a6e 100%)',
    shadow: '0 0 60px rgba(56, 189, 248, 0.3), inset -15px -15px 40px rgba(0,0,0,0.8), inset 10px 10px 20px rgba(255,255,255,0.1)',
    ringColor: 'rgba(56, 189, 248, 0.2)',
    halo: 'rgba(56, 189, 248, 0.08)'
  },
  gold: {
    background: 'radial-gradient(circle at 35% 35%, #facc15 0%, #a16207 60%, #78350f 100%)',
    shadow: '0 0 60px rgba(250, 204, 21, 0.25), inset -15px -15px 40px rgba(0,0,0,0.8), inset 10px 10px 20px rgba(255,255,255,0.1)',
    ringColor: 'rgba(250, 204, 21, 0.15)',
    halo: 'rgba(250, 204, 21, 0.08)'
  },
  turquoise: {
    background: 'radial-gradient(circle at 35% 35%, #2dd4bf 0%, #0f766e 60%, #115e59 100%)',
    shadow: '0 0 60px rgba(45, 212, 191, 0.3), inset -15px -15px 40px rgba(0,0,0,0.8), inset 10px 10px 20px rgba(255,255,255,0.1)',
    ringColor: 'rgba(45, 212, 191, 0.2)',
    halo: 'rgba(45, 212, 191, 0.08)'
  }
};

export const OrbitalPlanet: React.FC<OrbitalPlanetProps> = memo(({ type, title, subtitle }) => {
  const style = planetStyles[type];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
      {/* Halo de luz gigante de atmosfera planetária */}
      <motion.div 
        animate={{ scale: [1, 1.04, 1], opacity: [0.7, 0.9, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[450px] h-[450px] md:w-[700px] md:h-[700px] rounded-full blur-[120px] opacity-30 transition-all duration-1000"
        style={{ backgroundColor: style.halo }}
      />

      {/* Container orbital */}
      <div className="relative w-[320px] h-[320px] md:w-[480px] md:h-[480px] flex items-center justify-center">
        {/* Anéis Planetários inclinados (SVG) */}
        {(type === 'blue' || type === 'turquoise' || type === 'purple') && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute w-[170%] h-[170%] z-[5]"
            style={{ transform: 'rotateX(75deg) rotateY(-15deg)' }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
              <ellipse 
                cx="50" 
                cy="50" 
                rx="46" 
                ry="16" 
                fill="none" 
                stroke={style.ringColor} 
                strokeWidth="1.5"
                strokeDasharray="60 10 40 15"
              />
              <ellipse 
                cx="50" 
                cy="50" 
                rx="41" 
                ry="13" 
                fill="none" 
                stroke={style.ringColor} 
                strokeWidth="0.5" 
                opacity="0.4"
              />
            </svg>
          </motion.div>
        )}

        {/* O Planeta Principal */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="w-[160px] h-[160px] md:w-[240px] md:h-[240px] rounded-full relative z-10 shadow-2xl flex items-center justify-center transition-all duration-1000"
          style={{ 
            background: style.background,
            boxShadow: style.shadow
          }}
        >
          {/* Atmosfera de Vidro/Brilho Superior */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none z-20" />
        </motion.div>

        {/* Luas Orbitando o Planeta */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute w-[120%] h-[120%] z-20"
        >
          <div className="absolute top-2 left-2 w-3 h-3 md:w-5 md:h-5 rounded-full bg-zinc-500 shadow-[inset_-2px_-2px_5px_rgba(0,0,0,0.7),0_0_10px_rgba(255,255,255,0.15)]" />
        </motion.div>
      </div>

      {/* Legenda Galáctica em segundo plano */}
      {(title || subtitle) && (
        <div className="absolute bottom-12 left-12 text-left opacity-20 hidden md:block">
          {subtitle && <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">{subtitle}</p>}
          {title && <h4 className="text-3xl font-black italic uppercase tracking-widest text-white mt-1">{title}</h4>}
        </div>
      )}
    </div>
  );
});

OrbitalPlanet.displayName = 'OrbitalPlanet';
