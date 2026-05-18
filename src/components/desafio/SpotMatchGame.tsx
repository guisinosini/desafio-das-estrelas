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
  language: string;
}

const spotTranslations: Record<string, any> = {
  'pt-BR': {
    title: 'Radares Gêmeos',
    subtitle: 'Treino de Atenção e Discriminação Visual',
    score: 'Acertos:',
    targetObjective: 'Objetivo Estelar',
    victoryTitle: 'Missão Cumprida!',
    victoryDesc: 'Você encontrou todos os radares de rádio correspondentes. Comunicação espacial restabelecida!',
    reward: 'Recompensa: +2 Estrelas ⭐⭐',
    backToHub: 'Voltar ao Hub',
    instruction: 'Encontre o ÚNICO símbolo que se repete nos dois radares!',
    feedbackSuccess: 'Radar Identificado!',
    feedbackError: 'Sinal Incorreto...',
    scoreText: 'acertos'
  },
  'pt-PT': {
    title: 'Radares Gémeos',
    subtitle: 'Treino de Atenção e Discriminação Visual',
    score: 'Acertos:',
    targetObjective: 'Objetivo Estelar',
    victoryTitle: 'Missão Cumprida!',
    victoryDesc: 'Encontrou todos os radares de rádio correspondentes. Comunicação espacial restabelecida!',
    reward: 'Recompensa: +2 Estrelas ⭐⭐',
    backToHub: 'Voltar ao Hub',
    instruction: 'Encontre o ÚNICO símbolo que se repete nos dois radares!',
    feedbackSuccess: 'Radar Identificado!',
    feedbackError: 'Sinal Incorreto...',
    scoreText: 'acertos'
  },
  'en': {
    title: 'Twin Radars',
    subtitle: 'Attention & Visual Discrimination',
    score: 'Matches:',
    targetObjective: 'Star Objective',
    victoryTitle: 'Mission Accomplished!',
    victoryDesc: 'You found all the matching radio radars. Space communication restored!',
    reward: 'Reward: +2 Stars ⭐⭐',
    backToHub: 'Back to Hub',
    instruction: 'Find the ONLY symbol that repeats in both radars!',
    feedbackSuccess: 'Radar Identified!',
    feedbackError: 'Incorrect Signal...',
    scoreText: 'matches'
  },
  'es': {
    title: 'Radares Gemelos',
    subtitle: 'Atención y Discriminación Visual',
    score: 'Aciertos:',
    targetObjective: 'Objetivo Estelar',
    victoryTitle: '¡Misión Cumplida!',
    victoryDesc: 'Has encontrado todos los radares correspondientes. ¡Comunicación espacial restablecida!',
    reward: 'Recompensa: +2 Estrellas ⭐⭐',
    backToHub: 'Volver al Hub',
    instruction: '¡Encuentra el ÚNICO símbolo que se repite en ambos radares!',
    feedbackSuccess: '¡Radar Identificado!',
    feedbackError: 'Señal Incorrecta...',
    scoreText: 'aciertos'
  },
  'fr': {
    title: 'Radars Jumeaux',
    subtitle: 'Attention & Discrimination Visuelle',
    score: 'Corrects :',
    targetObjective: 'Objectif Stellaire',
    victoryTitle: 'Mission Accomplie !',
    victoryDesc: 'Vous avez trouvé tous les radars correspondants. Communication spatiale rétablie !',
    reward: 'Récompense : +2 Étoiles ⭐⭐',
    backToHub: 'Retour au Hub',
    instruction: 'Trouvez le SEUL symbole qui se répète dans les deux radars !',
    feedbackSuccess: 'Radar Identifié !',
    feedbackError: 'Signal Incorrect...',
    scoreText: 'corrects'
  },
  'it': {
    title: 'Radar Gemelli',
    subtitle: 'Attenzione e Discriminazione Visiva',
    score: 'Corretti:',
    targetObjective: 'Obbiettivo Stellare',
    victoryTitle: 'Missione Compiuta!',
    victoryDesc: 'Hai trovato tutti i radar corrispondenti. Comunicazione spaziale ripristinata!',
    reward: 'Ricompensa: +2 Stelle ⭐⭐',
    backToHub: 'Torna all\'Hub',
    instruction: 'Trova l\'UNICO simbolo che si ripete in entrambi i radar!',
    feedbackSuccess: 'Radar Identificato!',
    feedbackError: 'Segnale Incorretto...',
    scoreText: 'corretti'
  },
  'zh': {
    title: '孪生雷达',
    subtitle: '注意力与视觉辨别训练',
    score: '配对：',
    targetObjective: '星际目标',
    victoryTitle: '任务完成！',
    victoryDesc: '你找到了所有匹配的无线电雷达。空间通信已恢复！',
    reward: '奖励：+2 颗星星 ⭐⭐',
    backToHub: '返回中心',
    instruction: '找出两台雷达中唯一重复的符号！',
    feedbackSuccess: '雷达已识别！',
    feedbackError: '信号错误...',
    scoreText: '匹配'
  }
};

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

export const SpotMatchGame: React.FC<SpotMatchGameProps> = ({ onComplete, onClose, language }) => {
  const [score, setScore] = useState(0);
  const [targetScore] = useState(5);
  const [leftDeck, setLeftDeck] = useState<{ id: string; icon: any; color: string; scale: number; rotate: number }[]>([]);
  const [rightDeck, setRightDeck] = useState<{ id: string; icon: any; color: string; scale: number; rotate: number }[]>([]);
  const [commonId, setCommonId] = useState('');
  const [hasFinished, setHasFinished] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const startTimeRef = useRef(Date.now());

  const currentLang = language || 'pt-BR';
  const st = spotTranslations[currentLang] || spotTranslations['pt-BR'];

  const generateRound = () => {
    const commonIdx = Math.floor(Math.random() * ICON_POOL.length);
    const common = ICON_POOL[commonIdx];
    setCommonId(common.id);

    const poolWithoutCommon = ICON_POOL.filter(item => item.id !== common.id);
    const shuffledPool = [...poolWithoutCommon].sort(() => Math.random() - 0.5);
    const leftPool = shuffledPool.slice(0, 5);
    const rightPool = shuffledPool.slice(5, 10);

    const enrichIcon = (item: any) => {
      const scales = [0.8, 1.0, 1.2, 1.4];
      const rotates = [0, 45, 90, 135, 180, 225, 270, 315];
      return {
        ...item,
        scale: scales[Math.floor(Math.random() * scales.length)],
        rotate: rotates[Math.floor(Math.random() * rotates.length)]
      };
    };

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
            onComplete(2, `${targetScore} ${st.scoreText}`, playTime);
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
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-400">{st.title}</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{st.subtitle}</p>
      </div>

      {/* Barra de Progresso e Placar */}
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-white/60">
          <span>{st.score} <strong className="text-primary">{score} / {targetScore}</strong></span>
          <span>{st.targetObjective}</span>
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
          <h4 className="text-xl font-black uppercase italic text-primary">{st.victoryTitle}</h4>
          <p className="text-xs text-white/70 font-medium">{st.victoryDesc}</p>
          <div className="text-sm font-black uppercase tracking-wider text-yellow-400">
            {st.reward}
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-3.5 bg-primary text-black font-black uppercase rounded-2xl text-[10px] tracking-widest transition-all hover:scale-105"
          >
            {st.backToHub}
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6 w-full">
          <div className="text-center text-[10px] font-black uppercase tracking-wider text-white/50 bg-white/5 border border-white/5 py-2 px-4 rounded-xl">
            {st.instruction}
          </div>

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
                        <span className="text-xs font-black uppercase tracking-widest">{st.feedbackSuccess}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">{st.feedbackError}</span>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Radar Esquerdo */}
            <div className="aspect-square bg-indigo-500/5 border-2 border-indigo-500/10 rounded-[24px] sm:rounded-[32px] p-2 xs:p-4 sm:p-6 grid grid-cols-3 gap-0.5 xs:gap-1 sm:gap-2 items-center justify-items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
              {leftDeck.map((item, idx) => {
                const SymbolIcon = item.icon;
                return (
                  <button
                    key={`left-${idx}`}
                    onClick={() => handleSymbolClick(item.id)}
                    className="focus:outline-none hover:scale-110 active:scale-95 transition-all p-1 xs:p-2 rounded-xl hover:bg-white/5 relative z-10 shrink-0"
                    style={{ transform: `scale(${item.scale}) rotate(${item.rotate}deg)` }}
                  >
                    <SymbolIcon className={clsx("w-5 h-5 xs:w-6 h-6 sm:w-7 h-7", item.color)} />
                  </button>
                );
              })}
            </div>

            {/* Radar Direito */}
            <div className="aspect-square bg-indigo-500/5 border-2 border-indigo-500/10 rounded-[24px] sm:rounded-[32px] p-2 xs:p-4 sm:p-6 grid grid-cols-3 gap-0.5 xs:gap-1 sm:gap-2 items-center justify-items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
              {rightDeck.map((item, idx) => {
                const SymbolIcon = item.icon;
                return (
                  <button
                    key={`right-${idx}`}
                    onClick={() => handleSymbolClick(item.id)}
                    className="focus:outline-none hover:scale-110 active:scale-95 transition-all p-1 xs:p-2 rounded-xl hover:bg-white/5 relative z-10 shrink-0"
                    style={{ transform: `scale(${item.scale}) rotate(${item.rotate}deg)` }}
                  >
                    <SymbolIcon className={clsx("w-5 h-5 xs:w-6 h-6 sm:w-7 h-7", item.color)} />
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
