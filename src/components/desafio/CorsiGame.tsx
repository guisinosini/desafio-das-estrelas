import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Play, Trophy, RefreshCw, Volume2 } from 'lucide-react';
import clsx from 'clsx';

interface CorsiGameProps {
  onComplete: (bonusStars: number, scoreText: string, playTime: number) => void;
  onClose: () => void;
  language: string;
}

const corsiTranslations: Record<string, any> = {
  'pt-BR': {
    title: 'Cargas de Corsi',
    subtitle: 'Treino de Memória de Trabalho Visoespacial',
    idleTitle: 'Ajuste os Sensores de Carga ⚡',
    idleDesc: 'Os hangares de energia piscarão em uma sequência. Decore a ordem espacial e clique neles na mesma ordem!',
    btnStart: 'Ligar Sensores',
    gameOverTitle: 'Sequência Rompida!',
    gameOverDesc: 'Você errou a ordem de carregamento, mas salvou dados parciais excelentes para os motores cognitivos!',
    levelReached: 'Cargas Memorizadas:',
    victoryTitle: 'Bateria Calibrada!',
    victoryDesc: 'Sua memória visoespacial e planejamento motor estão em nível de comandante galáctico! Todas as cargas em ordem.',
    reward: 'Recompensa: +2 Estrelas ⭐⭐',
    backToHub: 'Voltar ao Hub',
    cargas: 'cubos',
    sounds: 'Som Ativo',
    instructionListening: '🛡️ COMPILANDO SEQUÊNCIA DE CARGAS...',
    instructionPlaying: '👉 SUA VEZ! TOQUE NAS CAIXAS...',
    scoreTextGameOver: 'sequência de',
    scoreTextGameOverSub: 'cargas',
    scoreTextVictory: 'Sequência de 7 cargas concluída com sucesso!'
  },
  'pt-PT': {
    title: 'Cargas de Corsi',
    subtitle: 'Treino de Memória de Trabalho Visoespacial',
    idleTitle: 'Ajuste os Sensores de Carga ⚡',
    idleDesc: 'Os hangares de energia piscarão em uma sequência. Decore a ordem espacial e clique neles na mesma ordem!',
    btnStart: 'Ligar Sensores',
    gameOverTitle: 'Sequência Rompida!',
    gameOverDesc: 'Errou a ordem de carregamento, mas salvou dados parciais excelentes para os motores cognitivos!',
    levelReached: 'Cargas Memorizadas:',
    victoryTitle: 'Bateria Calibrada!',
    victoryDesc: 'A sua memória visoespacial e planeamento motor estão em nível de comandante galáctico! Todas as cargas em ordem.',
    reward: 'Recompensa: +2 Estrelas ⭐⭐',
    backToHub: 'Voltar ao Hub',
    cargas: 'cubos',
    sounds: 'Som Ativo',
    instructionListening: '🛡️ COMPILANDO SEQUÊNCIA DE CARGAS...',
    instructionPlaying: '👉 SUA VEZ! TOQUE NAS CAIXAS...',
    scoreTextGameOver: 'sequência de',
    scoreTextGameOverSub: 'cargas',
    scoreTextVictory: 'Sequência de 7 cargas concluída com sucesso!'
  },
  'en': {
    title: 'Corsi Blocks',
    subtitle: 'Visuospatial Working Memory Training',
    idleTitle: 'Adjust Load Sensors ⚡',
    idleDesc: 'The energy hangars will flash in a sequence. Memorize the spatial order and click them in the same order!',
    btnStart: 'Turn On Sensors',
    gameOverTitle: 'Sequence Broken!',
    gameOverDesc: 'You missed the charging order, but saved excellent partial data for the cognitive engines!',
    levelReached: 'Loads Memorized:',
    victoryTitle: 'Battery Calibrated!',
    victoryDesc: 'Your visuospatial memory and motor planning are at a galactic commander level! All loads in order.',
    reward: 'Reward: +2 Stars ⭐⭐',
    backToHub: 'Back to Hub',
    cargas: 'blocks',
    sounds: 'Audio Active',
    instructionListening: '🛡️ COMPILING LOAD SEQUENCE...',
    instructionPlaying: '👉 YOUR TURN! CHARGE THE HANGARS...',
    scoreTextGameOver: 'sequence of',
    scoreTextGameOverSub: 'blocks',
    scoreTextVictory: 'Sequence of 7 blocks completed successfully!'
  },
  'es': {
    title: 'Cargas de Corsi',
    subtitle: 'Entrenamiento de Memoria de Trabalho Visoespacial',
    idleTitle: 'Ajustar Sensores de Carga ⚡',
    idleDesc: 'Los hangares de energía parpadearán en una secuencia. ¡Memoriza el orden espacial y haz clic en ellos en el mismo orden!',
    btnStart: 'Encender Sensores',
    gameOverTitle: '¡Secuencia Rota!',
    gameOverDesc: '¡Cometiste un error en el orden de carga, pero salvaste excelentes datos parciales para los motores cognitivos!',
    levelReached: 'Cargas Memorizadas:',
    victoryTitle: '¡Batería Calibrada!',
    victoryDesc: '¡Tu memoria visoespacial y planificación motora están en el nivel de comandante galáctico! Todas las cargas en orden.',
    reward: 'Recompensa: +2 Estrellas ⭐⭐',
    backToHub: 'Volver al Hub',
    cargas: 'cargas',
    sounds: 'Sonido Activo',
    instructionListening: '🛡️ COMPILANDO SECUENCIA DE CARGAS...',
    instructionPlaying: '👉 ¡TU TURNO! CARGA LOS HANGARES...',
    scoreTextGameOver: 'secuencia de',
    scoreTextGameOverSub: 'cargas',
    scoreTextVictory: '¡Secuencia de 7 cargas completada con éxito!'
  },
  'fr': {
    title: 'Blocs de Corsi',
    subtitle: 'Entraînement à la Mémoire de Travail Visuospatiale',
    idleTitle: 'Ajuster les Capteurs de Charge ⚡',
    idleDesc: 'Les hangars d\'énergie clignoteront dans une séquence. Mémorisez l\'ordre spatial et cliquez dessus dans le même ordre !',
    btnStart: 'Activer les Capteurs',
    gameOverTitle: 'Séquence Rompue !',
    gameOverDesc: 'Vous avez manqué l\'ordre de charge, mais vous avez sauvegardé d\'excellentes données partielles pour les moteurs cognitifs !',
    levelReached: 'Blocs Mémorisés :',
    victoryTitle: 'Batterie Calibrée !',
    victoryDesc: 'Votre mémoire visuospatiale et votre planification motrice sont au niveau d\'un commandant galactique ! Tous les blocs en ordre.',
    reward: 'Récompense : +2 Étoiles ⭐⭐',
    backToHub: 'Retour au Hub',
    cargas: 'blocs',
    sounds: 'Audio Actif',
    instructionListening: '🛡️ COMPILATION DE LA SÉQUENCE...',
    instructionPlaying: '👉 À VOUS ! CHARGEZ LES HANGARS...',
    scoreTextGameOver: 'séquence de',
    scoreTextGameOverSub: 'blocs',
    scoreTextVictory: 'Séquence de 7 blocs complétée avec succès !'
  },
  'it': {
    title: 'Corsi Blocks',
    subtitle: 'Allenamento della Memoria di Lavoro Visuospaziale',
    idleTitle: 'Regola i Sensori di Carico ⚡',
    idleDesc: 'Gli hangar energetici lampeggeranno in una sequenza. Memorizza l\'ordine spaziale e clicca su di essi nello stesso ordine!',
    btnStart: 'Avvia i Sensori',
    gameOverTitle: 'Sequenza Rotta!',
    gameOverDesc: 'Hai sbagliato l\'ordine di caricamento, ma hai salvato eccellenti dati parziali per i motori cognitivi!',
    levelReached: 'Blocchi Memorizzati:',
    victoryTitle: 'Batteria Calibrata!',
    victoryDesc: 'La tua memoria visuospaziale e pianificazione motoria sono a livello di comandante galattico! Tutti i blocchi in ordine.',
    reward: 'Ricompensa: +2 Stelle ⭐⭐',
    backToHub: 'Torna all\'Hub',
    cargas: 'blocchi',
    sounds: 'Audio Attivo',
    instructionListening: '🛡️ COMPILAZIONE SEQUENZA DI CARICO...',
    instructionPlaying: '👉 A TE! CARICA GLI HANGAR...',
    scoreTextGameOver: 'sequenza di',
    scoreTextGameOverSub: 'blocchi',
    scoreTextVictory: 'Sequenza di 7 blocchi completata con successo!'
  },
  'zh': {
    title: '科西方块',
    subtitle: '视觉空间工作记忆训练',
    idleTitle: '调整负荷传感器 ⚡',
    idleDesc: '能量机库将按顺序闪烁。记住空间顺序，并按相同顺序点击它们！',
    btnStart: '启动传感器',
    gameOverTitle: '序列已中断！',
    gameOverDesc: '你错过了充电顺序， bat 为认知引擎保存了出色的部分数据！',
    levelReached: '记住的方块：',
    victoryTitle: '电池已校准！',
    victoryDesc: '你的视觉空间记忆和运动规划达到了银河指挥官的级别！所有负荷均井然有序。',
    reward: '奖励：+2 颗星星 ⭐⭐',
    backToHub: '返回中心',
    cargas: '个方块',
    sounds: '音频已启用',
    instructionListening: '🛡️ 正在编译负载序列...',
    instructionPlaying: '👉 该你了！装载机库...',
    scoreTextGameOver: '序列长度',
    scoreTextGameOverSub: '个方块',
    scoreTextVictory: '成功完成 7 个方块의 序列！'
  }
};

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

export const CorsiGame: React.FC<CorsiGameProps> = ({ onComplete, onClose, language }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [activeCubo, setActiveCubo] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');

  const startTimeRef = useRef(Date.now());
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentLang = language || 'pt-BR';
  const cTrans = corsiTranslations[currentLang] || corsiTranslations['pt-BR'];

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
      if (sequence.length >= 7) {
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
      onComplete(2, `${cTrans.scoreTextGameOver} ${level} ${cTrans.scoreTextGameOverSub}`, playTime);
    }, 1200);
  };

  const handleVictory = () => {
    setGameState('victory');
    const playTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeout(() => {
      onComplete(2, cTrans.scoreTextVictory, playTime);
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
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-400">{cTrans.title}</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{cTrans.subtitle}</p>
      </div>

      {gameState === 'idle' ? (
        <div className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-center space-y-6 flex flex-col items-center shrink-0">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center animate-pulse">
            <Box className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">{cTrans.idleTitle}</h4>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs font-medium">{cTrans.idleDesc}</p>
          </div>
          <button
            onClick={initGame}
            className="w-full py-4 bg-primary text-black font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-widest shadow-lg shadow-primary/10"
          >
            <Play className="w-4 h-4 fill-black" /> {cTrans.btnStart}
          </button>
        </div>
      ) : gameState === 'gameover' ? (
        <div className="w-full bg-red-500/10 border border-red-500/20 rounded-[32px] p-8 text-center space-y-4 shrink-0">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black uppercase italic text-red-400">{cTrans.gameOverTitle}</h4>
          <p className="text-xs text-white/70 font-medium">{cTrans.gameOverDesc}</p>
          <div className="text-sm font-black uppercase tracking-wider text-yellow-400">
            {cTrans.levelReached} {level} ⚡
          </div>
        </div>
      ) : gameState === 'victory' ? (
        <div className="w-full bg-primary/10 border border-primary/20 rounded-[32px] p-8 text-center space-y-4 shrink-0">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black uppercase italic text-primary">{cTrans.victoryTitle}</h4>
          <p className="text-xs text-white/70 font-medium">{cTrans.victoryDesc}</p>
          <div className="text-sm font-black uppercase tracking-wider text-yellow-400">
            {cTrans.reward}
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-3.5 bg-primary text-black font-black uppercase rounded-2xl text-[10px] tracking-widest transition-all hover:scale-105"
          >
            {cTrans.backToHub}
          </button>
        </div>
      ) : (
        <div className="space-y-6 w-full flex flex-col items-center">
          
          <div className="flex justify-between items-center w-full px-4 text-xs font-bold text-white/60">
            <span>{cTrans.levelReached} <strong className="text-indigo-400">{level} {cTrans.cargas}</strong></span>
            <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> {cTrans.sounds}</span>
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
            {isPlayingSeq ? cTrans.instructionListening : cTrans.instructionPlaying}
          </p>
        </div>
      )}
    </div>
  );
};

export default CorsiGame;
