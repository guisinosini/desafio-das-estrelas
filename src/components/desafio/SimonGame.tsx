import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Trophy, RefreshCw, Volume2 } from 'lucide-react';
import clsx from 'clsx';

interface SimonGameProps {
  onComplete: (bonusStars: number, scoreText: string, playTime: number) => void;
  onClose: () => void;
  language: string;
}

const simonTranslations: Record<string, any> = {
  'pt-BR': {
    title: 'Ritmo Estelar',
    subtitle: 'Treino de Memória Auditiva e Foco (Simon)',
    idleTitle: 'Ajuste os Alto-Falantes 🔊',
    idleDesc: 'Os propulsores emitirão sinais visuais e musicais. Decore a melodia e repita na mesma ordem!',
    btnStart: 'Ligar Motores',
    gameOverTitle: 'Motor Descalibrado!',
    gameOverDesc: 'Você cometeu um deslize no ritmo, mas ajudou a calibrar parte dos propulsores. Continue praticando!',
    levelReached: 'Nível Alcançado:',
    victoryTitle: 'Melodia Concluída!',
    victoryDesc: 'Sua memória de trabalho auditiva e visual está afiadíssima. Nível de cockpit 100% calibrado!',
    reward: 'Recompensa: +2 Estrelas ⭐⭐',
    backToHub: 'Voltar ao Hub',
    currentSeq: 'Sequência Atual:',
    sounds: 'sons',
    audioActive: 'Áudio Ativo',
    instructionListening: '🛡️ OUÇA A MELODIA DO COMPUTADOR...',
    instructionPlaying: '👉 SUA VEZ! TOQUE NOS MOTORES...',
    thrusters: {
      blue: 'Azul',
      green: 'Verde',
      yellow: 'Amarelo',
      red: 'Vermelho'
    },
    scoreTextGameOver: 'Nível',
    scoreTextGameOverSub: '(Melodia)',
    scoreTextVictory: 'Nível 8 Concluído (100% de ritmo)'
  },
  'pt-PT': {
    title: 'Ritmo Estelar',
    subtitle: 'Treino de Memória Auditiva e Foco (Simon)',
    idleTitle: 'Ajuste os Alto-Falantes 🔊',
    idleDesc: 'Os propulsores emitirão sinais visuais e musicais. Decore a melodia e repita na mesma ordem!',
    btnStart: 'Ligar Motores',
    gameOverTitle: 'Motor Descalibrado!',
    gameOverDesc: 'Cometeu um deslize no ritmo, mas ajudou a calibrar parte dos propulsores. Continue a praticar!',
    levelReached: 'Nível Alcançado:',
    victoryTitle: 'Melodia Concluída!',
    victoryDesc: 'A sua memória de trabalho auditiva e visual está afiadíssima. Nível de cockpit 100% calibrado!',
    reward: 'Recompensa: +2 Estrelas ⭐⭐',
    backToHub: 'Voltar ao Hub',
    currentSeq: 'Sequência Atual:',
    sounds: 'sons',
    audioActive: 'Áudio Ativo',
    instructionListening: '🛡️ OUÇA A MELODIA DO COMPUTADOR...',
    instructionPlaying: '👉 SUA VEZ! TOQUE NOS MOTORES...',
    thrusters: {
      blue: 'Azul',
      green: 'Verde',
      yellow: 'Amarelo',
      red: 'Vermelho'
    },
    scoreTextGameOver: 'Nível',
    scoreTextGameOverSub: '(Melodia)',
    scoreTextVictory: 'Nível 8 Concluído (100% de ritmo)'
  },
  'en': {
    title: 'Star Rhythm',
    subtitle: 'Auditory Memory & Focus Training (Simon)',
    idleTitle: 'Adjust Speakers 🔊',
    idleDesc: 'The thrusters will emit visual and musical signals. Memorize the melody and repeat in the same order!',
    btnStart: 'Turn On Engines',
    gameOverTitle: 'Engine Uncalibrated!',
    gameOverDesc: 'You slipped on the rhythm, but helped calibrate some thrusters. Keep practicing!',
    levelReached: 'Level Reached:',
    victoryTitle: 'Melody Completed!',
    victoryDesc: 'Your auditory and visual working memory is extremely sharp. Cockpit level 100% calibrated!',
    reward: 'Reward: +2 Stars ⭐⭐',
    backToHub: 'Back to Hub',
    currentSeq: 'Current Sequence:',
    sounds: 'sounds',
    audioActive: 'Audio Active',
    instructionListening: '🛡️ LISTEN TO THE MELODY...',
    instructionPlaying: '👉 YOUR TURN! TOUCH THE ENGINES...',
    thrusters: {
      blue: 'Blue',
      green: 'Green',
      yellow: 'Yellow',
      red: 'Red'
    },
    scoreTextGameOver: 'Level',
    scoreTextGameOverSub: '(Melody)',
    scoreTextVictory: 'Level 8 Completed (100% rhythm)'
  },
  'es': {
    title: 'Ritmo Estelar',
    subtitle: 'Memoria Auditiva y Entrenamiento de Enfoque (Simon)',
    idleTitle: 'Ajustar Altavoces 🔊',
    idleDesc: 'Los propulsores emitirán señales visuales y musicales. ¡Memoriza la melodía y repítela en el mismo orden!',
    btnStart: 'Encender Motores',
    gameOverTitle: '¡Motor Descalibrado!',
    gameOverDesc: 'Cometiste un desliz en el ritmo, pero ayudaste a calibrar algunos propulsores. ¡Sigue practicando!',
    levelReached: 'Nivel Alcanzado:',
    victoryTitle: '¡Melodía Completada!',
    victoryDesc: 'Tu memoria de trabajo auditiva y visual es sumamente aguda. ¡Nivel de cabina 100% calibrado!',
    reward: 'Recompensa: +2 Estrellas ⭐⭐',
    backToHub: 'Volver al Hub',
    currentSeq: 'Secuencia Actual:',
    sounds: 'sonidos',
    audioActive: 'Audio Activo',
    instructionListening: '🛡️ ESCUCHA LA MELODÍA DEL ORDENADOR...',
    instructionPlaying: '👉 ¡TU TURNO! TOCA LOS MOTORES...',
    thrusters: {
      blue: 'Azul',
      green: 'Verde',
      yellow: 'Amarillo',
      red: 'Rojo'
    },
    scoreTextGameOver: 'Nivel',
    scoreTextGameOverSub: '(Melodía)',
    scoreTextVictory: 'Nivel 8 Completado (100% ritmo)'
  },
  'fr': {
    title: 'Rythme Stellaire',
    subtitle: 'Mémoire Auditive & Concentration (Simon)',
    idleTitle: 'Ajuster les Haut-Parleurs 🔊',
    idleDesc: 'Les propulseurs émettront des signaux visuels et musicaux. Mémorisez la mélodie et répétez-la dans le même ordre !',
    btnStart: 'Démarrer les Moteurs',
    gameOverTitle: 'Moteur Décalibré !',
    gameOverDesc: 'Vous avez fait une erreur de rythme, mais vous avez aidé à calibrer certains propulseurs. Continuez à vous entraîner !',
    levelReached: 'Niveau Atteint :',
    victoryTitle: 'Mélodie Complétée !',
    victoryDesc: 'Votre mémoire de travail auditive et visuelle est extrêmement aiguisée. Niveau de cockpit 100% calibré !',
    reward: 'Récompense : +2 Étoiles ⭐⭐',
    backToHub: 'Retour au Hub',
    currentSeq: 'Séquence Actuelle :',
    sounds: 'sons',
    audioActive: 'Audio Actif',
    instructionListening: '🛡️ ÉCOUTEZ LA MÉLODIE...',
    instructionPlaying: '👉 À VOUS ! TOUCHEZ LES MOTEURS...',
    thrusters: {
      blue: 'Bleu',
      green: 'Vert',
      yellow: 'Jaune',
      red: 'Rouge'
    },
    scoreTextGameOver: 'Niveau',
    scoreTextGameOverSub: '(Mélodie)',
    scoreTextVictory: 'Niveau 8 Complété (100% de rythme)'
  },
  'it': {
    title: 'Ritmo Stellare',
    subtitle: 'Memoria Uditiva e Allenamento di Focus (Simon)',
    idleTitle: 'Regola gli Altoparlanti 🔊',
    idleDesc: 'I propulsori emetteranno segnali visivi e musicali. Memorizza la melodia e ripetila nello stesso ordine!',
    btnStart: 'Avvia i Motori',
    gameOverTitle: 'Motore Decalibrato!',
    gameOverDesc: 'Hai commesso un errore di ritmo, ma hai aiutato a calibrare alcuni propulsori. Continua a esercitarti!',
    levelReached: 'Livello Raggiunto:',
    victoryTitle: 'Melodia Completata!',
    victoryDesc: 'La tua memoria di lavoro uditiva e visiva è estremamente affilata. Livello di cockpit 100% calibrato!',
    reward: 'Ricompensa: +2 Stelle ⭐⭐',
    backToHub: 'Torna all\'Hub',
    currentSeq: 'Sequenza Corrente:',
    sounds: 'suoni',
    audioActive: 'Audio Attivo',
    instructionListening: '🛡️ ASCOLTA LA MELODIA DEL COMPUTER...',
    instructionPlaying: '👉 A TE! TOCCA I MOTORI...',
    thrusters: {
      blue: 'Blu',
      green: 'Verde',
      yellow: 'Giallo',
      red: 'Rosso'
    },
    scoreTextGameOver: 'Livello',
    scoreTextGameOverSub: '(Melodia)',
    scoreTextVictory: 'Livello 8 Completato (100% ritmo)'
  },
  'zh': {
    title: '星际节奏',
    subtitle: '听觉记忆与专注力训练 (Simon)',
    idleTitle: '调整扬声器 🔊',
    idleDesc: '推进器将发出视觉和音乐信号。记住旋律并按相同顺序重复！',
    btnStart: '启动引擎',
    gameOverTitle: '引擎未校准！',
    gameOverDesc: '你在节奏上犯了错，但帮助校准了推进器。继续练习！',
    levelReached: '达到等级：',
    victoryTitle: '旋律已完成！',
    victoryDesc: '你的听觉和视觉工作记忆非常敏锐。驾驶舱水平已 100% 校准！',
    reward: '奖励：+2 颗星星 ⭐⭐',
    backToHub: '返回中心',
    currentSeq: '当前序列：',
    sounds: '个声音',
    audioActive: '音频已启用',
    instructionListening: '🛡️ 聆听计算机旋律...',
    instructionPlaying: '👉 该你了！触碰引擎...',
    thrusters: {
      blue: '蓝色',
      green: '绿色',
      yellow: '黄色',
      red: '红色'
    },
    scoreTextGameOver: '等级',
    scoreTextGameOverSub: '(旋律)',
    scoreTextVictory: '等级 8 已完成 (100% 节奏)'
  }
};

const THRUSTERS = [
  { id: 0, colorKey: 'blue', color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 active:bg-cyan-500/40 shadow-cyan-500/10', activeColor: 'bg-cyan-400 border-cyan-300 text-black shadow-[0_0_25px_rgba(34,211,238,0.8)]', freq: 261.63 },
  { id: 1, colorKey: 'green', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 active:bg-emerald-500/40 shadow-emerald-500/10', activeColor: 'bg-emerald-400 border-emerald-300 text-black shadow-[0_0_25px_rgba(52,211,153,0.8)]', freq: 293.66 },
  { id: 2, colorKey: 'yellow', color: 'bg-amber-500/20 border-amber-500/40 text-amber-400 active:bg-amber-500/40 shadow-amber-500/10', activeColor: 'bg-amber-400 border-amber-300 text-black shadow-[0_0_25px_rgba(251,191,36,0.8)]', freq: 329.63 },
  { id: 3, colorKey: 'red', color: 'bg-rose-500/20 border-rose-500/40 text-rose-400 active:bg-rose-500/40 shadow-rose-500/10', activeColor: 'bg-rose-400 border-rose-300 text-black shadow-[0_0_25px_rgba(251,113,133,0.8)]', freq: 392.00 }
];

export const SimonGame: React.FC<SimonGameProps> = ({ onComplete, onClose, language }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');

  const startTimeRef = useRef(Date.now());
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentLang = language || 'pt-BR';
  const sTrans = simonTranslations[currentLang] || simonTranslations['pt-BR'];

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

    playSynthTone(THRUSTERS[id].freq);
    setActiveIndex(id);
    setTimeout(() => setActiveIndex(null), 150);

    const newPlayerSeq = [...playerSequence, id];
    setPlayerSequence(newPlayerSeq);

    const stepIdx = newPlayerSeq.length - 1;
    if (newPlayerSeq[stepIdx] !== sequence[stepIdx]) {
      handleGameOver();
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
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
    setTimeout(() => {
      onComplete(2, `${sTrans.scoreTextGameOver} ${level} ${sTrans.scoreTextGameOverSub}`, playTime);
    }, 1200);
  };

  const handleVictory = () => {
    setGameState('victory');
    const playTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeout(() => {
      onComplete(2, sTrans.scoreTextVictory, playTime);
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
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-400">{sTrans.title}</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{sTrans.subtitle}</p>
      </div>

      {gameState === 'idle' ? (
        <div className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-center space-y-6 flex flex-col items-center shrink-0">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center animate-pulse">
            <Music className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">{sTrans.idleTitle}</h4>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs font-medium">{sTrans.idleDesc}</p>
          </div>
          <button
            onClick={initGame}
            className="w-full py-4 bg-primary text-black font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-widest shadow-lg shadow-primary/10"
          >
            <Play className="w-4 h-4 fill-black" /> {sTrans.btnStart}
          </button>
        </div>
      ) : gameState === 'gameover' ? (
        <div className="w-full bg-red-500/10 border border-red-500/20 rounded-[32px] p-8 text-center space-y-4 shrink-0">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black uppercase italic text-red-400">{sTrans.gameOverTitle}</h4>
          <p className="text-xs text-white/70 font-medium">{sTrans.gameOverDesc}</p>
          <div className="text-sm font-black uppercase tracking-wider text-yellow-400">
            {sTrans.levelReached} {level} 🎵
          </div>
        </div>
      ) : gameState === 'victory' ? (
        <div className="w-full bg-primary/10 border border-primary/20 rounded-[32px] p-8 text-center space-y-4 shrink-0">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black uppercase italic text-primary">{sTrans.victoryTitle}</h4>
          <p className="text-xs text-white/70 font-medium">{sTrans.victoryDesc}</p>
          <div className="text-sm font-black uppercase tracking-wider text-yellow-400">
            {sTrans.reward}
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-3.5 bg-primary text-black font-black uppercase rounded-2xl text-[10px] tracking-widest transition-all hover:scale-105"
          >
            {sTrans.backToHub}
          </button>
        </div>
      ) : (
        <div className="space-y-6 w-full flex flex-col items-center">
          
          <div className="flex justify-between items-center w-full px-4 text-xs font-bold text-white/60">
            <span>{sTrans.currentSeq} <strong className="text-indigo-400">{level} {sTrans.sounds}</strong></span>
            <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> {sTrans.audioActive}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs aspect-square p-2 bg-white/5 border border-white/10 rounded-[40px] relative overflow-hidden backdrop-blur-md">
            
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
                  <span className="text-[8px] font-black uppercase tracking-wider">{sTrans.thrusters[t.colorKey]}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[8px] font-black uppercase text-center text-white/20 tracking-wider">
            {isPlayingSeq ? sTrans.instructionListening : sTrans.instructionPlaying}
          </p>
        </div>
      )}
    </div>
  );
};

export default SimonGame;
