import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface RocketLaunchStageProps {
  onLaunchComplete: () => void;
}

const LOADING_PHRASES = [
  "Iniciando sistemas...",
  "Carregando Coragem...",
  "Abastecendo Foco...",
  "Calibrando Disciplina...",
  "Injetando Empatia...",
  "Preparando Motor de Hábito...",
  "Sincronizando Emoções...",
  "Ativando Escudo de Resiliência...",
  "Todos os sistemas GO!",
  "Ignição..."
];

export const RocketLaunchStage: React.FC<RocketLaunchStageProps> = ({ onLaunchComplete }) => {
  const [countdown, setCountdown] = useState(10);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown - 1 > 0) {
          setPhraseIndex(10 - (countdown - 1));
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !launched) {
      setLaunched(true);
      setTimeout(() => {
        onLaunchComplete();
      }, 2500); // Wait for the launch animation to finish before proceeding
    }
  }, [countdown, launched, onLaunchComplete]);

  // Generate random stars for the background
  const stars = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2,
  }));

  // Generate smoke particles
  const smokeParticles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `calc(50% + ${(Math.random() - 0.5) * 100}px)`,
    bottom: `${(Math.random() * 20)}px`,
    scale: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 0.5,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0C10] overflow-hidden">
      {/* Dynamic Starfield Background */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
            }}
            animate={
              launched
                ? { top: ['0%', '100%'], opacity: [0, 1, 0] }
                : { opacity: [0.2, 1, 0.2] }
            }
            transition={
              launched
                ? { duration: 0.5, repeat: Infinity, ease: 'linear' }
                : { duration: 2 + star.delay, repeat: Infinity, ease: 'easeInOut' }
            }
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between pb-10">
        
        {/* Top Info: Countdown & Loading Phrase */}
        <motion.div 
          className="mt-20 flex flex-col items-center"
          animate={countdown <= 3 && !launched ? { x: [-2, 2, -2, 2, 0], y: [-1, 1, -1, 1, 0] } : {}}
          transition={{ duration: 0.2, repeat: countdown <= 3 && !launched ? Infinity : 0 }}
        >
          <AnimatePresence mode="wait">
            {!launched && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 2 }}
                className="text-8xl md:text-9xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                {countdown}
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            {!launched && (
              <motion.div
                key={phraseIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
              >
                <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm md:text-base">
                  {LOADING_PHRASES[Math.min(phraseIndex, LOADING_PHRASES.length - 1)]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Rocket & Launchpad Area */}
        <div className="relative flex flex-col items-center w-full max-w-sm mt-auto mb-10">
          
          {/* Rocket Container */}
          <motion.div
            className="relative z-20 flex flex-col items-center"
            initial={{ y: 0 }}
            animate={
              launched
                ? { y: -1500, scale: 0.8 } // Shoot off screen upwards
                : countdown <= 3
                ? { x: [-1, 1, -1, 1, 0], y: [-1, 1, -1, 1, 0] } // Shake
                : { y: [0, -5, 0] } // Gentle hover on pad
            }
            transition={
              launched
                ? { duration: 1.5, ease: 'easeIn' }
                : countdown <= 3
                ? { duration: 0.1, repeat: Infinity }
                : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            {/* The Rocket */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-yellow-500 to-orange-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)] border-4 border-white/20">
              <Rocket className="w-12 h-12 md:w-16 md:h-16 text-white transform -rotate-45" />
            </div>

            {/* Fire and Thrusters (Appears during countdown and gets bigger on launch) */}
            {(countdown <= 5 || launched) && (
              <motion.div 
                className="absolute top-[90%] left-1/2 -translate-x-1/2 w-8"
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: launched ? 200 : (countdown <= 3 ? 80 : 40), 
                  opacity: 1 
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full bg-gradient-to-b from-white via-yellow-400 to-red-500 rounded-full blur-[2px] animate-pulse" />
              </motion.div>
            )}
          </motion.div>

          {/* Launchpad Base */}
          <motion.div 
            className="w-full h-8 bg-gradient-to-b from-white/20 to-transparent rounded-t-[100%] mt-[-10px] z-10"
            animate={launched ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.div 
            className="w-full max-w-[200px] h-2 bg-yellow-400/30 rounded-full blur-sm mt-2 z-10"
            animate={launched ? { opacity: 0 } : { opacity: 1 }}
          />

          {/* Smoke Particles */}
          <AnimatePresence>
            {countdown <= 8 && !launched && (
              <div className="absolute bottom-0 w-full h-32 pointer-events-none z-30">
                {smokeParticles.map((particle) => (
                  <motion.div
                    key={`smoke-${particle.id}`}
                    className="absolute bg-white/20 backdrop-blur-md rounded-full"
                    style={{
                      left: particle.left,
                      bottom: particle.bottom,
                      width: 60 * particle.scale,
                      height: 60 * particle.scale,
                    }}
                    initial={{ opacity: 0, scale: 0.5, x: 0 }}
                    animate={{ 
                      opacity: [0, 0.8, 0], 
                      scale: [0.5, 2, 3],
                      x: (Math.random() - 0.5) * 100
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: particle.delay,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
          
          {/* Intense Launch Smoke */}
          <AnimatePresence>
            {launched && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 5, 8], y: [50, 0, -50] }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute bottom-[-50px] w-[300px] h-[300px] bg-white/30 rounded-full blur-3xl z-30"
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
