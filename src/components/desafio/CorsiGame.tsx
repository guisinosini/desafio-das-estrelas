import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Play, Trophy, RefreshCw, Volume2 } from 'lucide-react';
import clsx from 'clsx';

interface CorsiGameProps {
  onComplete: (bonusStars: number, scoreText: string, playTime: number) => void;
  onClose: () => void;
}

// Frequências celestiais na escala pentatônica de Mi Maior para os 9 cubos de Corsi
const CUBO_FREQS = [
  164.81, // Mi3 (Cubo 0)
  196.00, // Sol3 (Cubo 1)
  220.00, // Lá3 (Cubo 2)
  246.94, // Si3 (Cubo 3)
  293.66, // Ré4 (Cubo 4)
  329.63, // Mi4 (Cubo 5)
  392.00, // Sol4 (Cubo 6)
  440.00, // Lá4 (Cubo 7)
  493.88  // Si4 (Cubo 8)
];

export const CorsiGame: React.FC<CorsiGameProps> = ({ onComplete, onClose }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [activeCubo, setActiveCubo] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');

  const startTimeRef = useRef(Date.now());
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Inicializar Sintetizador Nativo Resiliente a Autoplay
  const playSynthTone = (frequency: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'triangle'; // Som de triângulo é mais suave e flutua como ondas espaciais!
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } catch (err) {
      console.log('AudioContext bloqueado:', err);
    }
  };

  const initGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setLevel(0);
    setGameState('playing');
    startTimeRef.current = Date.now();
    addNewStep([]);
  };

  const addNewStep = (currentSeq: number[]) => {
    // Adiciona uma caixa aleatória de 0 a 8 na sequência
    const nextIdx = Math.floor(Math.random() * 9);
    const newSeq = [...currentSeq, nextIdx];
    setSequence(newSeq);
    setLevel(newSeq.length);
    playSequence(newSeq);
  };

  const playSequence = async (seq: number[]) => {
    setIsPlayingSeq(true);
    setPlayerSequence([]);

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const idx = seq[i];
      setActiveCubo(idx);
      playSynthTone(CUBO_FREQS[idx]);
      await new Promise(resolve => setTimeout(resolve, 300));
      setActiveCubo(null);
    }

    setIsPlayingSeq(false);
  };

  const handleCuboClick = (id: number) => {
    if (isPlayingSeq || gameState !== 'playing') return;

    playSynthTone(CUBO_FREQS[id]);
    setActiveCubo(id);
    setTimeout(() => setActiveCubo(null), 150);

    const newPlayerSeq = [...playerSequence, id];
    setPlayerSequence(newPlayerSeq);

    const stepIdx = newPlayerSeq.length - 1;
    if (newPlayerSeq[stepIdx] !== sequence[stepIdx]) {
      handleGameOver();
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      // Se bateu o nível 6 (sequência de 6 contêineres), conquista a vitória máxima espacial!
      if (sequence.length >= 6) {
        handleVictory();
      } else {
        setIsPlayingSeq(true);
        setTimeout(() => {
          addNewStep(sequence);
        }, 800);
      }
    }
  };

  const handleGameOver = () => {
    setGameState('gameover');
    const playTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeout(() => {
      onComplete(2, `Nível ${level} (Corsi)`, playTime);
    }, 1200);
  };

  const handleVictory = () => {
    setGameState('victory');
    const playTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeout(() => {
      onComplete(2, `Nível 6 Concluído (100% de Corsi)`, playTime);
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-md mx-auto w-full select-none">
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-400">Cargas de Corsi</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Treino de Memória Espacial e Foco (Blocos de Corsi)</p>
      </div>

      {gameState === 'idle' ? (
        <div className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-center space-y-6 flex flex-col items-center shrink-0">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center animate-pulse">
            <Box className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">Carregamento Autorizado 📦</h4>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs font-medium">Os contêineres espaciais piscarão em uma ordem geométrica. Toque neles na mesma sequência!</p>
          </div>
          <button
            onClick={initGame}
            className="w-full py-4 bg-primary text-black font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-widest shadow-lg shadow-primary/10"
          >
            <Play className="w-4 h-4 fill-black" /> Iniciar Hangar
          </button>
        </div>
      ) : gameState === 'gameover' ? (
        <div className="w-full bg-red-500/10 border border-red-500/20 rounded-[32px] p-8 text-center space-y-4 shrink-0">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black uppercase italic text-red-400">Hangar Desalinhado!</h4>
          <p className="text-xs text-white/70 font-medium">Você trocou a ordem dos contêineres, mas carregou com sucesso parte das provisões do herói!</p>
          <div className="text-sm font-black uppercase tracking-wider text-yellow-400">
            Nível Alcançado: Nível {level} 📦
          </div>
        </div>
      ) : gameState === 'victory' ? (
        <div className="w-full bg-primary/10 border border-primary/20 rounded-[32px] p-8 text-center space-y-4 shrink-0">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black uppercase italic text-primary">Carga Perfeita!</h4>
          <p className="text-xs text-white/70 font-medium">Fantástica memória espacial! Todas as cargas foram empilhadas com precisão nanométrica.</p>
          <div className="text-sm font-black uppercase tracking-wider text-yellow-400">
            Recompensa: +2 Estrelas ⭐⭐
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-3.5 bg-primary text-black font-black uppercase rounded-2xl text-[10px] tracking-widest transition-all hover:scale-105"
          >
            Voltar ao Hub
          </button>
        </div>
      ) : (
        <div className="space-y-6 w-full flex flex-col items-center">
          
          <div className="flex justify-between items-center w-full px-4 text-xs font-bold text-white/60">
            <span>Caixas na Sequência: <strong className="text-indigo-400">{level} cubos</strong></span>
            <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> Som Ativo</span>
          </div>

          {/* Grade 3x3 de Cubos de Corsi */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs aspect-square p-4 bg-white/5 border border-white/10 rounded-[36px] relative overflow-hidden backdrop-blur-md">
            {Array.from({ length: 9 }).map((_, idx) => {
              const isActive = activeCubo === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleCuboClick(idx)}
                  disabled={isPlayingSeq || gameState !== 'playing'}
                  className={clsx(
                    "aspect-square rounded-2xl border-2 transition-all duration-150 active:scale-90 flex items-center justify-center select-none shadow-md",
                    isActive 
                      ? "bg-indigo-400 border-indigo-300 text-black shadow-[0_0_20px_rgba(129,140,248,0.8)]" 
                      : "bg-white/5 border-white/10 text-white/20 hover:bg-white/10 hover:border-indigo-500/30",
                    isPlayingSeq ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                  )}
                >
                  <Box className="w-6 h-6 opacity-30 group-hover:opacity-60 transition-opacity" />
                </button>
              );
            })}
          </div>

          <p className="text-[8px] font-black uppercase text-center text-white/20 tracking-wider">
            {isPlayingSeq ? '🛡️ OUÇA E OBSERVE A GRADE...' : '👉 SUA VEZ! TOQUE NAS CAIXAS...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CorsiGame;
