import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Trophy, RefreshCw, Volume2 } from 'lucide-react';
import clsx from 'clsx';

interface SimonGameProps {
  onComplete: (bonusStars: number, scoreText: string, playTime: number) => void;
  onClose: () => void;
}

// Configuração dos Propulsores Espaciais
const THRUSTERS = [
  { id: 0, name: 'Propulsor Azul', color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 active:bg-cyan-500/40 shadow-cyan-500/10', activeColor: 'bg-cyan-400 border-cyan-300 text-black shadow-[0_0_25px_rgba(34,211,238,0.8)]', freq: 261.63 }, // Dó4
  { id: 1, name: 'Propulsor Verde', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 active:bg-emerald-500/40 shadow-emerald-500/10', activeColor: 'bg-emerald-400 border-emerald-300 text-black shadow-[0_0_25px_rgba(52,211,153,0.8)]', freq: 293.66 }, // Ré4
  { id: 2, name: 'Propulsor Amarelo', color: 'bg-amber-500/20 border-amber-500/40 text-amber-400 active:bg-amber-500/40 shadow-amber-500/10', activeColor: 'bg-amber-400 border-amber-300 text-black shadow-[0_0_25px_rgba(251,191,36,0.8)]', freq: 329.63 }, // Mi4
  { id: 3, name: 'Propulsor Vermelho', color: 'bg-rose-500/20 border-rose-500/40 text-rose-400 active:bg-rose-500/40 shadow-rose-500/10', activeColor: 'bg-rose-400 border-rose-300 text-black shadow-[0_0_25px_rgba(251,113,133,0.8)]', freq: 392.00 } // Sol4
];

export const SimonGame: React.FC<SimonGameProps> = ({ onComplete, onClose }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
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

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Efeito de envelope harmônico suave (decay)
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (err) {
      console.log('AudioContext não suportado ou bloqueado:', err);
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
    const nextIdx = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextIdx];
    setSequence(newSeq);
    setLevel(newSeq.length);
    playSequence(newSeq);
  };

  const playSequence = async (seq: number[]) => {
    setIsPlayingSeq(true);
    setPlayerSequence([]);

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      const idx = seq[i];
      setActiveIndex(idx);
      playSynthTone(THRUSTERS[idx].freq);
      await new Promise(resolve => setTimeout(resolve, 250));
      setActiveIndex(null);
    }

    setIsPlayingSeq(false);
  };

  const handleThrusterClick = (id: number) => {
    if (isPlayingSeq || gameState !== 'playing') return;

    // Tocar o tom correspondente
    playSynthTone(THRUSTERS[id].freq);
    setActiveIndex(id);
    setTimeout(() => setActiveIndex(null), 150);

    const newPlayerSeq = [...playerSequence, id];
    setPlayerSequence(newPlayerSeq);

    // Validar passo atual
    const stepIdx = newPlayerSeq.length - 1;
    if (newPlayerSeq[stepIdx] !== sequence[stepIdx]) {
      // ERROU A SEQUÊNCIA!
      handleGameOver();
      return;
    }

    // Se completou a sequência com sucesso
    if (newPlayerSeq.length === sequence.length) {
      // Se bateu o nível 8, conquista a vitória máxima do cockpit!
      if (sequence.length >= 8) {
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
    // Concede a pontuação proporcional ao nível alcançado
    setTimeout(() => {
      onComplete(2, `Nível ${level} (Melodia)`, playTime);
    }, 1200);
  };

  const handleVictory = () => {
    setGameState('victory');
    const playTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeout(() => {
      onComplete(2, `Nível 8 Concluído (100% de ritmo)`, playTime);
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
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-400">Ritmo Estelar</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Treino de Memória Auditiva e Foco (Simon)</p>
      </div>

      {gameState === 'idle' ? (
        <div className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-center space-y-6 flex flex-col items-center shrink-0">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center animate-pulse">
            <Music className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">Ajuste os Alto-Falantes 🔊</h4>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs font-medium">Os propulsores emitirão sinais visuais e musicais. Decore a melodia e repita na mesma ordem!</p>
          </div>
          <button
            onClick={initGame}
            className="w-full py-4 bg-primary text-black font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-widest shadow-lg shadow-primary/10"
          >
            <Play className="w-4 h-4 fill-black" /> Ligar Motores
          </button>
        </div>
      ) : gameState === 'gameover' ? (
        <div className="w-full bg-red-500/10 border border-red-500/20 rounded-[32px] p-8 text-center space-y-4 shrink-0">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black uppercase italic text-red-400">Motor Descalibrado!</h4>
          <p className="text-xs text-white/70 font-medium">Você cometeu um deslize no ritmo, mas ajudou a calibrar parte dos propulsores. Continue praticando!</p>
          <div className="text-sm font-black uppercase tracking-wider text-yellow-400">
            Nível Alcançado: {level} 🎵
          </div>
        </div>
      ) : gameState === 'victory' ? (
        <div className="w-full bg-primary/10 border border-primary/20 rounded-[32px] p-8 text-center space-y-4 shrink-0">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black uppercase italic text-primary">Melodia Concluída!</h4>
          <p className="text-xs text-white/70 font-medium">Sua memória de trabalho auditiva e visual está afiadíssima. Nível de cockpit 100% calibrado!</p>
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
          
          {/* Status do Nível */}
          <div className="flex justify-between items-center w-full px-4 text-xs font-bold text-white/60">
            <span>Sequência Atual: <strong className="text-indigo-400">{level} sons</strong></span>
            <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> Áudio Ativo</span>
          </div>

          {/* Mesa de Simon Says de 4 Propulsores em Círculo Cósmico */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs aspect-square p-2 bg-white/5 border border-white/10 rounded-[40px] relative overflow-hidden backdrop-blur-md">
            
            {/* Lente Central com Foco */}
            <div className="absolute inset-0 m-auto w-16 h-16 bg-zinc-950 border border-white/15 rounded-full flex items-center justify-center text-indigo-400 z-10 pointer-events-none shadow-2xl">
              <span className="text-lg font-black italic">{level}</span>
            </div>

            {THRUSTERS.map((t) => {
              const isActive = activeIndex === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleThrusterClick(t.id)}
                  disabled={isPlayingSeq || gameState !== 'playing'}
                  className={clsx(
                    "rounded-[28px] border-2 transition-all duration-150 active:scale-95 flex flex-col items-center justify-center gap-1 select-none",
                    isActive ? t.activeColor : t.color,
                    isPlayingSeq ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                  )}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span className="text-[8px] font-black uppercase tracking-wider">{t.name.split(' ')[1]}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[8px] font-black uppercase text-center text-white/20 tracking-wider">
            {isPlayingSeq ? '🛡️ OUÇA A MELODIA DO COMPUTADOR...' : '👉 SUA VEZ! TOQUE NOS MOTORES...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SimonGame;
