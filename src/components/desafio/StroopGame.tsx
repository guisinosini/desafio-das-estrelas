import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Star, Trophy, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface StroopGameProps {
  onComplete: (bonusStars: number, scoreText: string, playTime: number) => void;
  onClose: () => void;
  language: string;
}

const stroopTranslations: Record<string, any> = {
  'pt-BR': {
    title: 'Cores Cósmicas',
    subtitle: 'Treino de Controle Inibitório e Foco (Stroop)',
    starsReactor: 'Estrelas de Reator:',
    crystalStable: 'Cristal Estável',
    victoryTitle: 'Incrível Agilidade!',
    victoryDesc: 'Seu cérebro inibiu com maestria os dados incorretos e calibrou os motores da nave!',
    reward: 'Recompensa: +2 Estrelas ⭐⭐',
    backToHub: 'Voltar ao Hub',
    instruction: 'CLIQUE NA COR DA TINTA!',
    colors: {
      red: 'Vermelho',
      yellow: 'Amarelo',
      green: 'Verde',
      blue: 'Azul'
    },
    scoreText: 'acertos'
  },
  'pt-PT': {
    title: 'Cores Cósmicas',
    subtitle: 'Treino de Controlo Inibitório e Foco (Stroop)',
    starsReactor: 'Estrelas de Reator:',
    crystalStable: 'Cristal Estável',
    victoryTitle: 'Incrível Agilidade!',
    victoryDesc: 'O seu cérebro inibiu com mestria os dados incorretos e calibrou os motores da nave!',
    reward: 'Recompensa: +2 Estrelas ⭐⭐',
    backToHub: 'Voltar ao Hub',
    instruction: 'CLIQUE NA COR DA TINTA!',
    colors: {
      red: 'Vermelho',
      yellow: 'Amarelo',
      green: 'Verde',
      blue: 'Azul'
    },
    scoreText: 'acertos'
  },
  'en': {
    title: 'Cosmic Colors',
    subtitle: 'Inhibitory Control & Focus (Stroop)',
    starsReactor: 'Reactor Stars:',
    crystalStable: 'Stable Crystal',
    victoryTitle: 'Amazing Agility!',
    victoryDesc: 'Your brain successfully inhibited the incorrect data and calibrated the ship\'s engines!',
    reward: 'Reward: +2 Stars ⭐⭐',
    backToHub: 'Back to Hub',
    instruction: 'CLICK THE INK COLOR!',
    colors: {
      red: 'Red',
      yellow: 'Yellow',
      green: 'Green',
      blue: 'Blue'
    },
    scoreText: 'matches'
  },
  'es': {
    title: 'Colores Cósmicos',
    subtitle: 'Control Inhibitorio y Enfoque (Stroop)',
    starsReactor: 'Estrellas del Reactor:',
    crystalStable: 'Cristal Estable',
    victoryTitle: '¡Increíble Agilidad!',
    victoryDesc: '¡Tu cerebro inhibió con maestría los datos incorrectos y calibró los motores de la nave!',
    reward: 'Recompensa: +2 Estrellas ⭐⭐',
    backToHub: 'Volver al Hub',
    instruction: '¡HAZ CLIC EN EL COLOR DE LA TINTA!',
    colors: {
      red: 'Rojo',
      yellow: 'Amarillo',
      green: 'Verde',
      blue: 'Azul'
    },
    scoreText: 'aciertos'
  },
  'fr': {
    title: 'Couleurs Cosmiques',
    subtitle: 'Contrôle Inhibiteur & Concentration (Stroop)',
    starsReactor: 'Étoiles du Réacteur :',
    crystalStable: 'Cristal Stable',
    victoryTitle: 'Incroyable Agilité !',
    victoryDesc: 'Votre cerveau a inhibé avec maîtrise les données incorrectes et a calibré les moteurs du vaisseau !',
    reward: 'Récompense : +2 Étoiles ⭐⭐',
    backToHub: 'Retour au Hub',
    instruction: 'CLIQUEZ SUR LA COULEUR DE L\'ENCRE !',
    colors: {
      red: 'Rouge',
      yellow: 'Jaune',
      green: 'Vert',
      blue: 'Bleu'
    },
    scoreText: 'corrects'
  },
  'it': {
    title: 'Colori Cosmici',
    subtitle: 'Controllo Inibitorio e Flessibilità (Stroop)',
    starsReactor: 'Stelle del Reattore:',
    crystalStable: 'Cristallo Stabile',
    victoryTitle: 'Incredibile Agilità!',
    victoryDesc: 'Il tuo cervello ha inibito con maestria i dati errati e ha calibrato i motori della nave!',
    reward: 'Ricompensa: +2 Stelle ⭐⭐',
    backToHub: 'Torna all\'Hub',
    instruction: 'CLICCA SUL COLORE DELL\'INCHIOSTRO!',
    colors: {
      red: 'Rosso',
      yellow: 'Giallo',
      green: 'Verde',
      blue: 'Blu'
    },
    scoreText: 'corretti'
  },
  'zh': {
    title: '宇宙色彩',
    subtitle: '抑制控制与专注力训练 (Stroop)',
    starsReactor: '反应堆星星：',
    crystalStable: '稳定水晶',
    victoryTitle: '惊人的敏捷度！',
    victoryDesc: '你的大脑成功抑制了错误的数据，并校准了飞船的引擎！',
    reward: '奖励：+2 颗星星 ⭐微',
    backToHub: '返回中心',
    instruction: '点击油墨的颜色！',
    colors: {
      red: '红色',
      yellow: '黄色',
      green: '绿色',
      blue: '蓝色'
    },
    scoreText: '次配对'
  }
};

const COLOR_OPTIONS = [
  { id: 'red', colorClass: 'text-red-500', bgClass: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-400 text-red-400' },
  { id: 'yellow', colorClass: 'text-yellow-400', bgClass: 'bg-yellow-400/10 border-yellow-400/30 hover:bg-yellow-400/20 hover:border-yellow-400 text-yellow-400' },
  { id: 'green', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-400/10 border-emerald-400/30 hover:bg-emerald-400/20 hover:border-emerald-400 text-emerald-400' },
  { id: 'blue', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-400/10 border-cyan-400/30 hover:bg-cyan-400/20 hover:border-cyan-400 text-cyan-400' }
];

export const StroopGame: React.FC<StroopGameProps> = ({ onComplete, onClose, language }) => {
  const [score, setScore] = useState(0);
  const [targetScore] = useState(10);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [currentWord, setCurrentWord] = useState({ text: '', colorId: '', wordId: '' });
  const [hasFinished, setHasFinished] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

  const startTimeRef = useRef(Date.now());

  const currentLang = language || 'pt-BR';
  const sTrans = stroopTranslations[currentLang] || stroopTranslations['pt-BR'];

  const generateRound = () => {
    const wordIdx = Math.floor(Math.random() * COLOR_OPTIONS.length);
    let colorIdx = Math.floor(Math.random() * COLOR_OPTIONS.length);
    
    if (Math.random() < 0.8) {
      while (colorIdx === wordIdx) {
        colorIdx = Math.floor(Math.random() * COLOR_OPTIONS.length);
      }
    }

    const word = COLOR_OPTIONS[wordIdx];
    const color = COLOR_OPTIONS[colorIdx];

    setCurrentWord({
      text: sTrans.colors[word.id] || '',
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
            onComplete(2, `${targetScore} ${sTrans.scoreText} (${accuracy}% accuracy)`, playTime);
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
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-400">{sTrans.title}</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{sTrans.subtitle}</p>
      </div>

      {/* Barra de Progresso */}
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-white/60">
          <span>{sTrans.starsReactor} <strong className="text-primary">{score} / {targetScore}</strong></span>
          <span>{sTrans.crystalStable}</span>
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
              {sTrans.instruction}
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
                {sTrans.colors[btn.id]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StroopGame;
