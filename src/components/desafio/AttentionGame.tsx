import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Star, Zap, Skull, Trophy, ShieldAlert, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface AttentionGameProps {
  onComplete: (bonusStars: number, scoreText: string, playTime: number) => void;
  onClose: () => void;
}

type ObjectType = 'gold_star' | 'green_star' | 'red_comet';

interface TargetObject {
  id: number;
  type: ObjectType;
  x: number; // Porcentagem de 10% a 90%
  y: number; // Porcentagem de 10% a 90%
  scale: number;
}

export const AttentionGame: React.FC<AttentionGameProps> = ({ onComplete, onClose }) => {
  const [energy, setEnergy] = useState(0);
  const [targetEnergy] = useState(100);
  const [currentObject, setCurrentObject] = useState<TargetObject | null>(null);
  const [hasFinished, setHasFinished] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [streak, setStreak] = useState(0);
  const startTimeRef = useRef(Date.now());
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const objectIdRef = useRef(0);

  const spawnObject = () => {
    if (hasFinished) return;

    // Determinar tipo do objeto de forma probabilística:
    // 40% Estrela Dourada (GO)
    // 30% Estrela Verde (GO)
    // 30% Meteoro Vermelho (NO-GO / Evitar!)
    const rand = Math.random();
    let type: ObjectType = 'gold_star';
    if (rand > 0.4 && rand <= 0.7) {
      type = 'green_star';
    } else if (rand > 0.7) {
      type = 'red_comet';
    }

    objectIdRef.current += 1;
    const newObj: TargetObject = {
      id: objectIdRef.current,
      type,
      x: Math.floor(Math.random() * 70) + 15, // Entre 15% e 85% para não cortar borda
      y: Math.floor(Math.random() * 60) + 20, // Entre 20% e 80%
      scale: Math.random() * 0.4 + 0.9 // Escala de 0.9 a 1.3
    };

    setCurrentObject(newObj);

    // Tempo de exibição do objeto: entre 1.1s e 1.4s (desafio dinâmico de atenção)
    const duration = Math.random() * 300 + 1100;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Se era um meteoro vermelho (NO-GO) e a criança NÃO clicou (teve autocontrole!),
      // ela ganha +5 pontos de bônus por ter inibido o impulso! Isso é o coração do treino cognitivo!
      if (type === 'red_comet') {
        setEnergy(prev => {
          const newEnergy = Math.min(prev + 5, targetEnergy);
          if (newEnergy >= targetEnergy) {
            triggerWin();
          }
          return newEnergy;
        });
        setStreak(prev => prev + 1);
      } else {
        // Se era uma estrela do bem e ela deixou passar, reseta o combo/streak
        setStreak(0);
      }
      
      // Spawnar o próximo objeto
      setTimeout(() => spawnObject(), 200);
    }, duration);
  };

  const triggerWin = () => {
    setHasFinished(true);
    setCurrentObject(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    const playTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeout(() => {
      onComplete(2, `${clicks} cliques`, playTime); // Concede 2 estrelas de bônus!
    }, 1000);
  };

  useEffect(() => {
    spawnObject();
    startTimeRef.current = Date.now();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasFinished]);

  const handleObjectClick = (e: React.MouseEvent, type: ObjectType) => {
    e.stopPropagation(); // Evitar duplo clique no container
    if (hasFinished) return;

    setClicks(prev => prev + 1);

    if (type === 'gold_star') {
      // Clicou na estrela dourada (+10 de energia!)
      setStreak(prev => prev + 1);
      setEnergy(prev => {
        const newEnergy = Math.min(prev + 10, targetEnergy);
        if (newEnergy >= targetEnergy) triggerWin();
        return newEnergy;
      });
    } else if (type === 'green_star') {
      // Clicou na estrela verde super (+15 de energia!)
      setStreak(prev => prev + 1);
      setEnergy(prev => {
        const newEnergy = Math.min(prev + 15, targetEnergy);
        if (newEnergy >= targetEnergy) triggerWin();
        return newEnergy;
      });
    } else if (type === 'red_comet') {
      // Clicou no meteoro de antimatéria! ERRO DE IMPULSO (No-Go!)
      setStreak(0);
      setEnergy(prev => Math.max(prev - 15, 0)); // Drena 15 de energia, mas não deixa ir abaixo de 0
    }

    // Limpar objeto e forçar novo spawn imediato
    setCurrentObject(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(() => spawnObject(), 200);
  };

  const handleEmptySpaceClick = () => {
    if (hasFinished) return;
    // Clicar no espaço vazio por impulsividade perde um pouco de streak
    setStreak(0);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-lg mx-auto w-full select-none">
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-400">Escudo do Silêncio</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Treino de Controle Inibitório e Foco (Go / No-Go)</p>
      </div>

      {/* Escudo de Carga de Energia */}
      <div className="w-full bg-white/5 border border-white/10 p-4 rounded-3xl flex justify-between items-center gap-4 relative overflow-hidden shrink-0">
        <div className="flex items-center gap-3 relative z-10">
          <div className={clsx(
            "p-2 rounded-xl transition-colors",
            energy > 50 ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
          )}>
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-white/30 block">Energia do Escudo</span>
            <span className="text-xl font-black italic text-white leading-none">{energy} / {targetEnergy} EP</span>
          </div>
        </div>

        {streak >= 3 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full text-[9px] font-black uppercase text-yellow-400 tracking-wider flex items-center gap-1 animate-bounce">
            <Sparkles className="w-3 h-3" /> Combo x{streak}!
          </div>
        )}

        <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${(energy / targetEnergy) * 100}%` }} />
      </div>

      {hasFinished ? (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-primary/10 border-2 border-primary/20 rounded-[32px] p-8 text-center space-y-4 w-full"
        >
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black uppercase italic text-primary">Escudo Carregado!</h4>
          <p className="text-xs text-white/70 font-medium">Seu foco e precisão impediram a antimatéria de atingir os reatores. Nave blindada com sucesso!</p>
          <div className="text-sm font-black uppercase tracking-wider text-yellow-400">
            Recompensa: +2 Estrelas ⭐⭐
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-3.5 bg-primary text-black font-black uppercase rounded-2xl text-[10px] tracking-widest transition-all hover:scale-105"
          >
            Voltar ao Hub
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4 w-full">
          {/* Instruções Dinâmicas */}
          <div className="grid grid-cols-2 gap-2 text-[8px] font-black uppercase tracking-wider text-center shrink-0">
            <div className="bg-emerald-500/5 border border-emerald-500/10 py-1.5 px-2 rounded-xl text-emerald-400 flex items-center justify-center gap-1">
              <Star className="w-3 h-3 fill-emerald-400/20" /> CLIQUE nas Estrelas!
            </div>
            <div className="bg-red-500/5 border border-red-500/10 py-1.5 px-2 rounded-xl text-red-400 flex items-center justify-center gap-1">
              <Skull className="w-3 h-3" /> NÃO CLIQUE nos Meteoros!
            </div>
          </div>

          {/* Campo Espacial Interativo (Canvas Virtual de Clicks) */}
          <div 
            onClick={handleEmptySpaceClick}
            className="w-full aspect-[4/3] bg-black/40 border-2 border-white/10 rounded-[32px] relative overflow-hidden cursor-crosshair"
          >
            {/* Linhas de Radar de Fundo */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.02)_0%,transparent_80%)]" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-white/5" />
            
            {/* Renderização Anada do Objeto Alvo */}
            <AnimatePresence mode="wait">
              {currentObject && (
                <motion.button
                  key={currentObject.id}
                  onClick={(e) => handleObjectClick(e, currentObject.type)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: currentObject.scale, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={clsx(
                    "absolute focus:outline-none shrink-0 p-3 rounded-full flex items-center justify-center shadow-2xl",
                    currentObject.type === 'gold_star' ? "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 shadow-yellow-500/10 animate-pulse" :
                    currentObject.type === 'green_star' ? "bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 shadow-emerald-500/10" :
                    "bg-red-500/10 border border-red-500/30 text-red-500 shadow-red-500/10 animate-bounce"
                  )}
                  style={{
                    left: `${currentObject.x}%`,
                    top: `${currentObject.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {currentObject.type === 'gold_star' && <Star className="w-8 h-8 fill-yellow-400/10" />}
                  {currentObject.type === 'green_star' && <Zap className="w-8 h-8 fill-emerald-400/10" />}
                  {currentObject.type === 'red_comet' && <Skull className="w-8 h-8" />}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttentionGame;
