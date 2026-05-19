"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Wind, Award, Heart, CheckCircle2, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CognitiveBreathingProps {
  onClose: () => void;
  onAwardStars: (amount: number, reason: string) => void;
  language: string;
}

type BreathingStep = 'inhale' | 'hold' | 'exhale';

export function CognitiveBreathing({ onClose, onAwardStars, language }: CognitiveBreathingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [step, setStep] = useState<BreathingStep>('inhale');
  const [timeLeft, setTimeLeft] = useState(4); // Segundos restantes no passo atual
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Configuração dos tempos das etapas: Cheira Flor (4s) -> Segura Ar (2s) -> Assopra Vela (4s)
  const stepDurations: Record<BreathingStep, number> = {
    inhale: 4,
    hold: 2,
    exhale: 4
  };

  // Traduções Locais Rápidas e Simpáticas
  const t = {
    pt: {
      title: "Respiração Estelar",
      subtitle: "Treino Galáctico de Calma e Foco 🌌",
      startBtn: "Começar Treino 🚀",
      desc: "Cheire a florzinha 🌸 e assopre a velinha 🕯️ para reabastecer seus propulsores de energia mental e focar nas missões!",
      cycle: "Ciclo",
      of: "de 10",
      inhale: "Cheire a Florzinha... 🌸",
      inhaleSub: "Puxe o ar bem fundo pelo nariz!",
      hold: "Segure o Ar... 🧘",
      holdSub: "Sinta a energia estelar dentro de você!",
      exhale: "Assopre a Velinha... 🕯️",
      exhaleSub: "Solte o ar devagar pela boca!",
      finished: "Treino Concluído!",
      finishedDesc: "Excelente piloto! Você regulou seus batimentos, acalmou sua mente e ganhou energia espacial nova!",
      reward: "+3 Estrelas Cósmicas Adicionadas!",
      completeBtn: "Concluir Missão ⭐"
    },
    en: {
      title: "Stellar Breathing",
      subtitle: "Galactic Focus & Calming Training 🌌",
      startBtn: "Start Training 🚀",
      desc: "Smell the flower 🌸 and blow out the candle 🕯️ to recharge your mental thrusters and focus on missions!",
      cycle: "Cycle",
      of: "of 10",
      inhale: "Smell the Flower... 🌸",
      inhaleSub: "Breathe in deeply through your nose!",
      hold: "Hold your Breath... 🧘",
      holdSub: "Feel the stellar energy inside you!",
      exhale: "Blow out the Candle... 🕯️",
      exhaleSub: "Breathe out slowly through your mouth!",
      finished: "Training Complete!",
      finishedDesc: "Excellent pilot! You regulated your heart rate, calmed your mind, and earned brand new space energy!",
      reward: "+3 Cosmic Stars Added!",
      completeBtn: "Complete Mission ⭐"
    }
  };

  const currentT = language === 'en' ? t.en : t.pt;

  // Lógica principal do Timer de Respiração
  useEffect(() => {
    if (!isPlaying || isFinished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Transição de passo
          if (step === 'inhale') {
            setStep('hold');
            return stepDurations.hold;
          } else if (step === 'hold') {
            setStep('exhale');
            return stepDurations.exhale;
          } else {
            // Fim do ciclo de exalação
            if (currentCycle >= 10) {
              handleFinish();
              clearInterval(timerRef.current!);
              return 0;
            } else {
              setCurrentCycle((c) => c + 1);
              setStep('inhale');
              return stepDurations.inhale;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, step, currentCycle, isFinished]);

  const handleStart = () => {
    setIsPlaying(true);
    setStep('inhale');
    setTimeLeft(stepDurations.inhale);
  };

  const handleFinish = () => {
    setIsFinished(true);
    setIsPlaying(false);
    
    // Confetes galácticos em comemoração!
    requestAnimationFrame(() => {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2dd4bf', '#fbbf24', '#a78bfa', '#ff007f', '#ffffff']
      });
    });
  };

  const handleComplete = () => {
    onAwardStars(3, 'Exercício de Respiração Estelar');
    onClose();
  };

  // Cálculo de Porcentagem para o SVG de Progresso
  const totalDuration = stepDurations[step];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-2xl overflow-y-auto">
      <div className="w-full max-w-xl bg-gradient-to-br from-[#0c1020] to-[#1a1b3a] border-2 border-primary/20 rounded-[40px] shadow-2xl relative overflow-hidden p-6 md:p-8">
        
        {/* Efeitos de Fundo Galácticos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        {/* Botão de Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all z-20 cursor-pointer text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          {!isPlaying && !isFinished ? (
            /* TELA INICIAL: EXPLICAÇÃO */
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6 pt-4 relative z-10"
            >
              <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl mx-auto flex items-center justify-center text-primary">
                <Wind className="w-10 h-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                  {currentT.title}
                </h2>
                <p className="text-[11px] font-black uppercase tracking-widest text-primary">
                  {currentT.subtitle}
                </p>
              </div>

              <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto font-medium">
                {currentT.desc}
              </p>

              {/* Dica Ilustrada */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-2">
                  <span className="text-3xl">🌸</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">1. Puxe o Ar</span>
                  <span className="text-[9px] text-white/40 leading-tight">Cheire a florzinha</span>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-2">
                  <span className="text-3xl">🕯️</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">2. Solte o Ar</span>
                  <span className="text-[9px] text-white/40 leading-tight">Assopre a velinha</span>
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full py-4.5 bg-primary hover:bg-[#20b8a4] text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-black" />
                {currentT.startBtn}
              </button>
            </motion.div>
          ) : isPlaying ? (
            /* TELA ATIVA: CRONÔMETRO E GUIA DE RESPIRAÇÃO */
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8 py-4 relative z-10 flex flex-col items-center"
            >
              {/* Contador de Ciclos */}
              <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-white/60">
                {currentT.cycle} <span className="text-primary">{currentCycle}</span> {currentT.of}
              </div>

              {/* Grande Visual do Exercício */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                
                {/* Círculo de Progresso SVG */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="112"
                    cy="112"
                    r="98"
                    className="stroke-white/5 fill-none"
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="112"
                    cy="112"
                    r="98"
                    className={`fill-none transition-all duration-1000 ${
                      step === 'inhale' ? 'stroke-emerald-400' :
                      step === 'hold' ? 'stroke-yellow-400 animate-pulse' :
                      'stroke-pink-400'
                    }`}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 98}
                    strokeDashoffset={2 * Math.PI * 98 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Área Interna: Flor ou Vela Animadas com Framer Motion */}
                <AnimatePresence mode="wait">
                  {step === 'inhale' && (
                    <motion.div
                      key="flower"
                      initial={{ scale: 0.6, opacity: 0.5 }}
                      animate={{ 
                        scale: [0.6, 1.3, 1.25],
                        opacity: 1
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="w-32 h-32 bg-emerald-500/10 rounded-full flex flex-col items-center justify-center border-2 border-emerald-500/20 shadow-[0_0_30px_rgba(52,211,153,0.2)]"
                    >
                      <span className="text-6xl animate-bounce">🌸</span>
                      <motion.div 
                        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 rounded-full border border-emerald-400/20 blur-md pointer-events-none"
                      />
                    </motion.div>
                  )}

                  {step === 'hold' && (
                    <motion.div
                      key="hold-bubble"
                      initial={{ scale: 1.1, opacity: 0.5 }}
                      animate={{ 
                        scale: [1.1, 1.05, 1.1],
                        opacity: 1
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-32 h-32 bg-yellow-500/10 rounded-full flex flex-col items-center justify-center border-2 border-yellow-500/20 shadow-[0_0_30px_rgba(250,204,21,0.2)]"
                    >
                      <span className="text-6xl">🧘</span>
                    </motion.div>
                  )}

                  {step === 'exhale' && (
                    <motion.div
                      key="candle"
                      initial={{ scale: 1.2, opacity: 0.8 }}
                      animate={{ 
                        scale: [1.2, 0.7],
                        opacity: 1
                      }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 4, ease: "linear" }}
                      className="w-32 h-32 bg-pink-500/10 rounded-full flex flex-col items-center justify-center border-2 border-pink-500/20 shadow-[0_0_30px_rgba(244,114,182,0.2)] relative"
                    >
                      {/* Efeitos de Sopros Flutuantes */}
                      {timeLeft < 4 && (
                        <div className="absolute top-4 flex gap-1 justify-center w-full">
                          {[...Array(3)].map((_, i) => (
                            <motion.span
                              key={i}
                              initial={{ opacity: 0.8, y: 0, scale: 1 }}
                              animate={{ opacity: 0, y: -40, scale: 0.5, x: (i - 1) * 15 }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                              className="text-xs"
                            >
                              ✨
                            </motion.span>
                          ))}
                        </div>
                      )}
                      
                      {/* Velinha */}
                      <span className="text-6xl relative select-none">
                        🕯️
                        {/* Chama flutuante com vento */}
                        {timeLeft > 0 && (
                          <motion.span 
                            animate={{ rotate: [-5, 10, -10, 5, -5], y: [-1, 1, -1] }}
                            transition={{ repeat: Infinity, duration: 0.4 }}
                            className="absolute -top-3 left-[18px] text-lg pointer-events-none"
                          >
                            🔥
                          </motion.span>
                        )}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cronômetro no Centro */}
                <div className="absolute bottom-4 bg-[#0c1020]/90 border border-white/10 px-3 py-1 rounded-full shadow-md">
                  <span className="text-xl font-black text-white">{timeLeft}s</span>
                </div>
              </div>

              {/* Instruções Textuais */}
              <div className="space-y-2 max-w-sm">
                <motion.h3 
                  key={step}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`text-xl font-black uppercase tracking-tight ${
                    step === 'inhale' ? 'text-emerald-400' :
                    step === 'hold' ? 'text-yellow-400' :
                    'text-pink-400'
                  }`}
                >
                  {step === 'inhale' ? currentT.inhale : step === 'hold' ? currentT.hold : currentT.exhale}
                </motion.h3>
                <motion.p 
                  key={`${step}-sub`}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 0.6 }}
                  className="text-xs text-white uppercase tracking-wider font-bold"
                >
                  {step === 'inhale' ? currentT.inhaleSub : step === 'hold' ? currentT.holdSub : currentT.exhaleSub}
                </motion.p>
              </div>

              {/* Barra inferior rápida de progresso do Ciclo */}
              <div className="w-full max-w-xs bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  animate={{ width: `${(currentCycle / 10) * 100}%` }}
                  className="h-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-pink-400"
                />
              </div>
            </motion.div>
          ) : (
            /* TELA FINAL: CELEBRAÇÃO E RECOMPENSA */
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 pt-4 relative z-10"
            >
              {/* Medalha Tridimensional */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-400/30"
                />
                <div className="w-20 h-20 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                  <Award className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-black w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border-2 border-zinc-950">
                  ✔
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                  {currentT.finished}
                </h2>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-400">
                  Missão Relaxe no Espaço Concluída!
                </p>
              </div>

              <p className="text-xs md:text-sm text-white/70 leading-relaxed max-w-md mx-auto font-medium">
                {currentT.finishedDesc}
              </p>

              {/* Caixa de Recompensa premium */}
              <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl flex items-center justify-center gap-3 max-w-sm mx-auto">
                <div className="flex gap-1">
                  <span className="text-xl">⭐</span>
                  <span className="text-xl">⭐</span>
                  <span className="text-xl">⭐</span>
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-yellow-300">
                  {currentT.reward}
                </span>
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-yellow-400/10 hover:scale-[1.02] transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {currentT.completeBtn}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
