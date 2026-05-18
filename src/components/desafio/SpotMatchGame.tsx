import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Moon, Sun, Zap, Rocket, Shield, Heart, Smile, 
  Trophy, Flame, Crown, Sparkles, Check, AlertCircle 
} from 'lucide-react';
import clsx from 'clsx';

interface SpotMatchGameProps {
  onComplete: (bonusStars: number, scoreText: string, playTime: number) => void;
  onClose: () => void;
}

// Catálogo de Ícones do Jogo
const ICON_POOL = [
  { id: 'star', icon: Star, color: 'text-yellow-400' },
  { id: 'moon', icon: Moon, color: 'text-cyan-400' },
  { id: 'sun', icon: Sun, color: 'text-amber-500' },
  { id: 'zap', icon: Zap, color: 'text-orange-400' },
  { id: 'rocket', icon: Rocket, color: 'text-indigo-400' },
  { id: 'shield', icon: Shield, color: 'text-blue-400' },
  { id: 'heart', icon: Heart, color: 'text-red-400' },
  { id: 'smile', icon: Smile, color: 'text-emerald-400' },
  { id: 'trophy', icon: Trophy, color: 'text-yellow-500' },
  { id: 'flame', icon: Flame, color: 'text-rose-500' },
  { id: 'crown', icon: Crown, color: 'text-pink-400' },
  { id: 'sparkles', icon: Sparkles, color: 'text-primary' }
];

export const SpotMatchGame: React.FC<SpotMatchGameProps> = ({ onComplete, onClose }) => {
  const [score, setScore] = useState(0);
  const [targetScore] = useState(5); // Objetivo: 5 acertos
  const [leftDeck, setLeftDeck] = useState<{ id: string; icon: any; color: string; scale: number; rotate: number }[]>([]);
  const [rightDeck, setRightDeck] = useState<{ id: string; icon: any; color: string; scale: number; rotate: number }[]>([]);
  const [commonId, setCommonId] = useState('');
  const [hasFinished, setHasFinished] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const startTimeRef = useRef(Date.now());

  const generateRound = () => {
    // 1. Sortear o ícone comum
    const commonIdx = Math.floor(Math.random() * ICON_POOL.length);
    const common = ICON_POOL[commonIdx];
    setCommonId(common.id);

    // Filtrar o pool para tirar o comum
    const poolWithoutCommon = ICON_POOL.filter(item => item.id !== common.id);

    // 2. Embaralhar o pool restante
    const shuffledPool = [...poolWithoutCommon].sort(() => Math.random() - 0.5);

    // 3. Pegar 5 ícones para o lado esquerdo
    const leftPool = shuffledPool.slice(0, 5);
    
    // 4. Pegar 5 ícones para o lado direito (sem interseção com o esquerdo)
    const rightPool = shuffledPool.slice(5, 10);

    // Função para enriquecer os ícones com tamanho (scale) e rotação aleatórios
    const enrichIcon = (item: any) => {
      const scales = [0.8, 1.0, 1.2, 1.4];
      const rotates = [0, 45, 90, 135, 180, 225, 270, 315];
      return {
        ...item,
        scale: scales[Math.floor(Math.random() * scales.length)],
        rotate: rotates[Math.floor(Math.random() * rotates.length)]
      };
    };

    // 5. Adicionar o comum a ambos os lados e embaralhar as posições finais
    const leftFinal = [...leftPool, common].map(enrichIcon).sort(() => Math.random() - 0.5);
    const rightFinal = [...rightPool, common].map(enrichIcon).sort(() => Math.random() - 0.5);

    setLeftDeck(leftFinal);
    setRightDeck(rightFinal);
    setFeedback(null);
  };

  useEffect(() => {
    generateRound();
    startTimeRef.current = Date.now();
  }, []);

  const handleSymbolClick = (id: string) => {
    if (feedback || hasFinished) return;

    if (id === commonId) {
      setFeedback('success');
      const newScore = score + 1;
      setScore(newScore);

      if (newScore >= targetScore) {
        const playTime = Math.round((Date.now() - startTimeRef.current) / 1000);
        setTimeout(() => {
          setHasFinished(true);
          setTimeout(() => {
            onComplete(2, `${targetScore} acertos`, playTime); // Concede 2 estrelas de bônus!
          }, 1000);
        }, 800);
      } else {
        setTimeout(() => {
          generateRound();
        }, 800);
      }
    } else {
      setFeedback('error');
      setTimeout(() => {
        setFeedback(null);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-lg mx-auto">
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-400">Radares Gêmeos</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Treino de Atenção e Discriminação Visual</p>
      </div>

      {/* Barra de Progresso e Placar */}
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-white/60">
          <span>Acertos: <strong className="text-primary">{score} / {targetScore}</strong></span>
          <span>Objetivo Estelar</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }}
            animate={{ width: `${(score / targetScore) * 100}%` }}
          />
        </div>
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
          <h4 className="text-xl font-black uppercase italic text-primary">Missão Cumprida!</h4>
          <p className="text-xs text-white/70 font-medium">Você encontrou todos os radares de rádio correspondentes. Comunicação espacial restabelecida!</p>
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
        <div className="space-y-6 w-full">
          {/* Instrução em destaque */}
          <div className="text-center text-[10px] font-black uppercase tracking-wider text-white/50 bg-white/5 border border-white/5 py-2 px-4 rounded-xl">
            Encontre o ÚNICO símbolo que se repete nos dois radares!
          </div>

          {/* Radares (Esquerdo e Direito) */}
          <div className="grid grid-cols-2 gap-4 relative">
            
            {/* Feedback Visual Overlay */}
            <AnimatePresence>
              {feedback && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={clsx(
                    "absolute inset-0 z-20 flex items-center justify-center rounded-[32px] backdrop-blur-md border-2",
                    feedback === 'success' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
                  )}
                >
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                    {feedback === 'success' ? (
                      <div className="flex flex-col items-center gap-2">
                        <Check className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">Radar Identificado!</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">Sinal Incorreto...</span>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Radar Esquerdo */}
            <div className="aspect-square bg-indigo-500/5 border-2 border-indigo-500/10 rounded-[32px] p-6 grid grid-cols-3 gap-2 items-center justify-items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
              {leftDeck.map((item, idx) => {
                const SymbolIcon = item.icon;
                return (
                  <button
                    key={`left-${idx}`}
                    onClick={() => handleSymbolClick(item.id)}
                    className="focus:outline-none hover:scale-110 active:scale-95 transition-all p-2 rounded-xl hover:bg-white/5 relative z-10 shrink-0"
                    style={{ transform: `scale(${item.scale}) rotate(${item.rotate}deg)` }}
                  >
                    <SymbolIcon className={clsx("w-7 h-7", item.color)} />
                  </button>
                );
              })}
            </div>

            {/* Radar Direito */}
            <div className="aspect-square bg-indigo-500/5 border-2 border-indigo-500/10 rounded-[32px] p-6 grid grid-cols-3 gap-2 items-center justify-items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
              {rightDeck.map((item, idx) => {
                const SymbolIcon = item.icon;
                return (
                  <button
                    key={`right-${idx}`}
                    onClick={() => handleSymbolClick(item.id)}
                    className="focus:outline-none hover:scale-110 active:scale-95 transition-all p-2 rounded-xl hover:bg-white/5 relative z-10 shrink-0"
                    style={{ transform: `scale(${item.scale}) rotate(${item.rotate}deg)` }}
                  >
                    <SymbolIcon className={clsx("w-7 h-7", item.color)} />
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SpotMatchGame;
