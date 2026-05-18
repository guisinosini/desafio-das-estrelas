import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Star, Trophy, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface StroopGameProps {
  onComplete: (bonusStars: number, scoreText: string, playTime: number) => void;
  onClose: () => void;
}

// Opções de Cores Galácticas do Jogo
const COLOR_OPTIONS = [
  { id: 'red', name: 'Vermelho', colorClass: 'text-red-500', bgClass: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-400 text-red-400' },
  { id: 'yellow', name: 'Amarelo', colorClass: 'text-yellow-400', bgClass: 'bg-yellow-400/10 border-yellow-400/30 hover:bg-yellow-400/20 hover:border-yellow-400 text-yellow-400' },
  { id: 'green', name: 'Verde', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-400/10 border-emerald-400/30 hover:bg-emerald-400/20 hover:border-emerald-400 text-emerald-400' },
  { id: 'blue', name: 'Azul', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-400/10 border-cyan-400/30 hover:bg-cyan-400/20 hover:border-cyan-400 text-cyan-400' }
];

export const StroopGame: React.FC<StroopGameProps> = ({ onComplete, onClose }) => {
  const [score, setScore] = useState(0);
  const [targetScore] = useState(10); // Meta: 10 acertos rápidos
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [currentWord, setCurrentWord] = useState({ text: '', colorId: '', wordId: '' });
  const [hasFinished, setHasFinished] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

  const startTimeRef = useRef(Date.now());

  const generateRound = () => {
    // Sorteia um índice para o significado da palavra e um índice diferente para a cor da palavra
    const wordIdx = Math.floor(Math.random() * COLOR_OPTIONS.length);
    let colorIdx = Math.floor(Math.random() * COLOR_OPTIONS.length);
    
    // Forçar que a cor e a palavra sejam contraditórias em 80% das vezes (efeito Stroop puro!)
    if (Math.random() < 0.8) {
      while (colorIdx === wordIdx) {
        colorIdx = Math.floor(Math.random() * COLOR_OPTIONS.length);
      }
    }

    const word = COLOR_OPTIONS[wordIdx];
    const color = COLOR_OPTIONS[colorIdx];

    setCurrentWord({
      text: word.name,
      wordId: word.id,
      colorId: color.id
    });
    setFeedback(null);
  };

  useEffect(() => {
    generateRound();
    startTimeRef.current = Date.now();
  }, []);

  const handleColorClick = (colorId: string) => {
    if (feedback || hasFinished) return;

    setTotalAttempts(prev => prev + 1);

    if (colorId === currentWord.colorId) {
      setFeedback('success');
      const newScore = score + 1;
      setScore(newScore);

      if (newScore >= targetScore) {
        const playTime = Math.round((Date.now() - startTimeRef.current) / 1000);
        const accuracy = Math.round((newScore / (totalAttempts + 1)) * 100);
        setTimeout(() => {
          setHasFinished(true);
          setTimeout(() => {
            onComplete(2, `${targetScore} acertos (${accuracy}% precisão)`, playTime);
          }, 1000);
        }, 600);
      } else {
        setTimeout(() => {
          generateRound();
        }, 600);
      }
    } else {
      setFeedback('error');
      setTimeout(() => {
        generateRound();
      }, 800);
    }
  };

  const getWordColorClass = () => {
    const matched = COLOR_OPTIONS.find(c => c.id === currentWord.colorId);
    return matched ? matched.colorClass : 'text-white';
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-md mx-auto w-full select-none">
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-400">Cores Cósmicas</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Treino de Controle Inibitório e Foco (Stroop)</p>
      </div>

      {/* Barra de Progresso */}
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-white/60">
          <span>Estrelas de Reator: <strong className="text-primary">{score} / {targetScore}</strong></span>
          <span>Cristal Estável</span>
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
          <h4 className="text-xl font-black uppercase italic text-primary">Incrível Agilidade!</h4>
          <p className="text-xs text-white/70 font-medium">Seu cérebro inibiu com maestria os dados incorretos e calibrou os motores da nave!</p>
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
        <div className="space-y-6 w-full flex flex-col items-center">
          
          {/* Caixa Central do Estímulo Stroop */}
          <div className={clsx(
            "w-full aspect-[16/10] bg-white/5 border border-white/10 rounded-[32px] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300",
            feedback === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
            feedback === 'error' ? 'bg-red-500/10 border-red-500/30' : ''
          )}>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
              CLIQUE NA COR DA TINTA!
            </div>

            <AnimatePresence mode="wait">
              <motion.span
                key={currentWord.text + currentWord.colorId}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={clsx("text-4xl font-black uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]", getWordColorClass())}
              >
                {currentWord.text}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Grade de Botões de Cores da Tinta */}
          <div className="grid grid-cols-2 gap-4 w-full">
            {COLOR_OPTIONS.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleColorClick(btn.id)}
                className={clsx(
                  "p-4 rounded-2xl border-2 font-black uppercase text-xs tracking-wider transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2",
                  btn.bgClass
                )}
              >
                <div className={clsx("w-3 h-3 rounded-full bg-current shadow-[0_0_8px_currentColor]")} />
                {btn.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StroopGame;
