import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Compass, Shield, Sparkles, X, ChevronRight, Gamepad2, Award, Box } from 'lucide-react';
import MemoryGame from './MemoryGame';
import SpotMatchGame from './SpotMatchGame';
import AttentionGame from './AttentionGame';
import StroopGame from './StroopGame';
import SimonGame from './SimonGame';
import CorsiGame from './CorsiGame';

interface CognitiveLabProps {
  onClose: () => void;
  onAwardStars: (amount: number, gameTitle: string, scoreText?: string, playTime?: number) => void;
  language: string;
}

const labTranslations: Record<string, any> = {
  'pt-BR': {
    energyTitle: 'Energia Diária de Treino',
    bonusActive: 'Bônus de Estrelas Ativo:',
    completed: 'Concluídos',
    bonusPerGame: '+2⭐ por Treino',
    activeModule: 'MÓDULO DE TREINAMENTO ATIVO',
    academyTitle: 'ACADEMIA COGNITIVA INTERGALÁCTICA',
    labTitle: 'Laboratório de Treino',
    games: {
      memory: {
        title: 'Pares Estelares',
        desc: 'Treino de Memória de Trabalho Visual e Foco',
        prefix: 'Treino: Pares Estelares 🧠'
      },
      spot: {
        title: 'Radares Gêmeos',
        desc: 'Treino de Atenção Concentrada e Discriminação Visual',
        prefix: 'Treino: Radares Gêmeos 🪐'
      },
      attention: {
        title: 'Escudo do Silêncio',
        desc: 'Treino de Controle Inibitório e Freio de Impulsividade',
        prefix: 'Treino: Escudo do Silêncio ☄️'
      },
      stroop: {
        title: 'Cores Cósmicas',
        desc: 'Treino de Controle Inibitório e Atenção Seletiva (Stroop)',
        prefix: 'Treino: Cores Cósmicas 🌈'
      },
      simon: {
        title: 'Ritmo Estelar',
        desc: 'Treino de Memória Auditiva e Foco (Simon says)',
        prefix: 'Treino: Ritmo Estelar 🎵'
      },
      corsi: {
        title: 'Cargas de Corsi',
        desc: 'Treino de Memória de Trabalho Visoespacial e Planejamento',
        prefix: 'Treino: Cargas de Corsi 📦'
      }
    }
  },
  'pt-PT': {
    energyTitle: 'Energia Diária de Treino',
    bonusActive: 'Bónus de Estrelas Ativo:',
    completed: 'Concluídos',
    bonusPerGame: '+2⭐ por Treino',
    activeModule: 'MÓDULO DE TREINAMENTO ATIVO',
    academyTitle: 'ACADEMIA COGNITIVA INTERGALÁCTICA',
    labTitle: 'Laboratório de Treino',
    games: {
      memory: {
        title: 'Pares Estelares',
        desc: 'Treino de Memória de Trabalho Visual e Foco',
        prefix: 'Treino: Pares Estelares 🧠'
      },
      spot: {
        title: 'Radares Gémeos',
        desc: 'Treino de Atenção Concentrada e Discriminação Visual',
        prefix: 'Treino: Radares Gémeos 🪐'
      },
      attention: {
        title: 'Escudo do Silêncio',
        desc: 'Treino de Controlo Inibitório e Travão de Impulsividade',
        prefix: 'Treino: Escudo do Silêncio ☄️'
      },
      stroop: {
        title: 'Cores Cósmicas',
        desc: 'Treino de Controlo Inibitório e Atenção Seletiva (Stroop)',
        prefix: 'Treino: Cores Cósmicas 🌈'
      },
      simon: {
        title: 'Ritmo Estelar',
        desc: 'Treino de Memória Auditiva e Foco (Simon says)',
        prefix: 'Treino: Ritmo Estelar 🎵'
      },
      corsi: {
        title: 'Cargas de Corsi',
        desc: 'Treino de Memória de Trabalho Visoespacial e Planeamento',
        prefix: 'Treino: Cargas de Corsi 📦'
      }
    }
  },
  'en': {
    energyTitle: 'Daily Training Energy',
    bonusActive: 'Active Star Bonus:',
    completed: 'Completed',
    bonusPerGame: '+2⭐ per Game',
    activeModule: 'ACTIVE TRAINING MODULE',
    academyTitle: 'INTERGALACTIC COGNITIVE ACADEMY',
    labTitle: 'Training Lab',
    games: {
      memory: {
        title: 'Star Pairs',
        desc: 'Visual Working Memory and Focus Training',
        prefix: 'Train: Star Pairs 🧠'
      },
      spot: {
        title: 'Twin Radars',
        desc: 'Concentrated Attention and Visual Discrimination Training',
        prefix: 'Train: Twin Radars 🪐'
      },
      attention: {
        title: 'Shield of Silence',
        desc: 'Inhibitory Control and Impulsivity Brake Training',
        prefix: 'Train: Shield of Silence ☄️'
      },
      stroop: {
        title: 'Cosmic Colors',
        desc: 'Inhibitory Control and Selective Attention Training (Stroop)',
        prefix: 'Train: Cosmic Colors 🌈'
      },
      simon: {
        title: 'Star Rhythm',
        desc: 'Auditory Memory and Focus Training (Simon says)',
        prefix: 'Train: Star Rhythm 🎵'
      },
      corsi: {
        title: 'Corsi Blocks',
        desc: 'Visuospatial Working Memory and Planning Training',
        prefix: 'Train: Corsi Blocks 📦'
      }
    }
  },
  'es': {
    energyTitle: 'Energía Diaria de Entrenamiento',
    bonusActive: 'Bono de Estrellas Activo:',
    completed: 'Completado',
    bonusPerGame: '+2⭐ por Juego',
    activeModule: 'MÓDULO DE ENTRENAMIENTO ACTIVO',
    academyTitle: 'ACADEMIA COGNITIVA INTERGALÁCTICA',
    labTitle: 'Laboratorio de Entrenamiento',
    games: {
      memory: {
        title: 'Pares Estelares',
        desc: 'Entrenamiento de Memoria de Trabajo Visual y Enfoque',
        prefix: 'Entrenar: Pares Estelares 🧠'
      },
      spot: {
        title: 'Radares Gemelos',
        desc: 'Entrenamiento de Atención Concentrada y Discriminación Visual',
        prefix: 'Entrenar: Radares Gemelos 🪐'
      },
      attention: {
        title: 'Escudo del Silencio',
        desc: 'Entrenamiento de Control Inhibitorio y Freno de Impulsividad',
        prefix: 'Entrenar: Escudo del Silencio ☄️'
      },
      stroop: {
        title: 'Colores Cósmicos',
        desc: 'Entrenamiento de Control Inhibitorio y Atención Selectiva (Stroop)',
        prefix: 'Entrenar: Colores Cósmicos 🌈'
      },
      simon: {
        title: 'Ritmo Estelar',
        desc: 'Entrenamiento de Memoria Auditiva y Enfoque (Simon dice)',
        prefix: 'Entrenar: Ritmo Estelar 🎵'
      },
      corsi: {
        title: 'Cargas de Corsi',
        desc: 'Entrenamiento de Memoria de Trabalho Visoespacial y Planificación',
        prefix: 'Entrenar: Cargas de Corsi 📦'
      }
    }
  },
  'fr': {
    energyTitle: 'Énergie d\'Entraînement Quotidienne',
    bonusActive: 'Bonus d\'Étoiles Actif :',
    completed: 'Complété',
    bonusPerGame: '+2⭐ par Jeu',
    activeModule: 'MODULE D\'ENTRAÎNEMENT ACTIF',
    academyTitle: 'ACADÉMIE COGNITIVE INTERGALACTIQUE',
    labTitle: 'Laboratoire d\'Entraînement',
    games: {
      memory: {
        title: 'Paires Stellaires',
        desc: 'Entraînement de la Mémoire de Travail Visuelle et Concentration',
        prefix: 'Entraîner : Paires Stellaires 🧠'
      },
      spot: {
        title: 'Radars Jumeaux',
        desc: 'Entraînement de l\'Attention Concentrée et Discrimination Visuelle',
        prefix: 'Entraîner : Radars Jumeaux 🪐'
      },
      attention: {
        title: 'Bouclier du Silence',
        desc: 'Entraînement du Contrôle Inhibiteur et Frein de l\'Impulsivité',
        prefix: 'Entraîner : Bouclier du Silence ☄️'
      },
      stroop: {
        title: 'Couleurs Cosmiques',
        desc: 'Entraînement du Contrôle Inhibiteur et Attention Sélective (Stroop)',
        prefix: 'Entraîner : Couleurs Cosmiques 🌈'
      },
      simon: {
        title: 'Rythme Stellaire',
        desc: 'Entraînement de la Mémoire Auditive et Concentration (Simon dit)',
        prefix: 'Entraîner : Rythme Stellaire 🎵'
      },
      corsi: {
        title: 'Blocs de Corsi',
        desc: 'Entraînement de la Mémoire de Travail Visuospatiale et Planification',
        prefix: 'Entraîner : Blocs de Corsi 📦'
      }
    }
  },
  'it': {
    energyTitle: 'Energia Giornaliera di Allenamento',
    bonusActive: 'Bonus Stelle Attivo:',
    completed: 'Completati',
    bonusPerGame: '+2⭐ per Gioco',
    activeModule: 'MODULO DI ALLENAMENTO ATTIVO',
    academyTitle: 'ACCADEMIA COGNITIVA INTERGALATTICA',
    labTitle: 'Laboratorio di Allenamento',
    games: {
      memory: {
        title: 'Coppie Stellari',
        desc: 'Allenamento di Memoria di Lavoro Visiva e Concentrazione',
        prefix: 'Allena: Coppie Stellari 🧠'
      },
      spot: {
        title: 'Radar Gemelli',
        desc: 'Allenamento di Attenzione Concentrata e Discriminazione Visiva',
        prefix: 'Allena: Radar Gemelli 🪐'
      },
      attention: {
        title: 'Scudo del Silenzio',
        desc: 'Allenamento del Controllo Inibitorio e Freno all\'Impulsività',
        prefix: 'Allena: Scudo del Silenzio ☄️'
      },
      stroop: {
        title: 'Colori Cosmici',
        desc: 'Allenamento del Controllo Inibitorio e Attenzione Selettiva (Stroop)',
        prefix: 'Allena: Colori Cosmici 🌈'
      },
      simon: {
        title: 'Ritmo Stellare',
        desc: 'Allenamento di Memoria Uditiva e Concentrazione (Simon dice)',
        prefix: 'Allena: Ritmo Stellare 🎵'
      },
      corsi: {
        title: 'Blocchi di Corsi',
        desc: 'Allenamento di Memoria di Lavoro Visuospaziale e Pianificazione',
        prefix: 'Allena: Blocchi di Corsi 📦'
      }
    }
  },
  'zh': {
    energyTitle: '每日训练能量',
    bonusActive: '活跃星星红利：',
    completed: '已完成',
    bonusPerGame: '+2⭐ 每次训练',
    activeModule: '活跃训练模块',
    academyTitle: '星际认知学堂',
    labTitle: '训练实验室',
    games: {
      memory: {
        title: '星际配对',
        desc: '视觉工作记忆与专注力训练',
        prefix: '训练：星际配对 🧠'
      },
      spot: {
        title: '孪生雷达',
        desc: '专注注意力和视觉辨别训练',
        prefix: '训练：孪生雷达 🪐'
      },
      attention: {
        title: '静音之盾',
        desc: '抑制控制和冲动制动训练',
        prefix: '训练：静音之盾 ☄️'
      },
      stroop: {
        title: '宇宙色彩',
        desc: '抑制控制和选择性注意力训练 (Stroop)',
        prefix: '训练：宇宙色彩 🌈'
      },
      simon: {
        title: '星际节奏',
        desc: '听觉记忆和专注力训练 (Simon说)',
        prefix: '训练：星际节奏 🎵'
      },
      corsi: {
        title: '科尔西方块',
        desc: '视觉空间工作记忆与规划训练',
        prefix: '训练：科尔西方块 📦'
      }
    }
  }
};

export const CognitiveLab: React.FC<CognitiveLabProps> = ({ onClose, onAwardStars, language }) => {
  const [activeGame, setActiveGame] = useState<'memory' | 'spot' | 'attention' | 'stroop' | 'simon' | 'corsi' | null>(null);
  const [dailyGamesPlayed, setDailyGamesPlayed] = useState(0);
  const maxDailyGames = 3;

  const currentLang = language || 'pt-BR';
  const lt = labTranslations[currentLang] || labTranslations['pt-BR'];

  const handleGameComplete = (bonusStars: number, scoreText: string, playTime: number) => {
    let gameTitle = lt.labTitle;
    if (activeGame === 'memory') gameTitle = lt.games.memory.prefix;
    if (activeGame === 'spot') gameTitle = lt.games.spot.prefix;
    if (activeGame === 'attention') gameTitle = lt.games.attention.prefix;
    if (activeGame === 'stroop') gameTitle = lt.games.stroop.prefix;
    if (activeGame === 'simon') gameTitle = lt.games.simon.prefix;
    if (activeGame === 'corsi') gameTitle = lt.games.corsi.prefix;

    onAwardStars(bonusStars, gameTitle, scoreText, playTime);
    setDailyGamesPlayed(prev => prev + 1);
  };

  const getGameTitle = () => {
    if (activeGame === 'memory') return lt.games.memory.title;
    if (activeGame === 'spot') return lt.games.spot.title;
    if (activeGame === 'attention') return lt.games.attention.title;
    if (activeGame === 'stroop') return lt.games.stroop.title;
    if (activeGame === 'simon') return lt.games.simon.title;
    if (activeGame === 'corsi') return lt.games.corsi.title;
    return lt.labTitle;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-4 bg-zinc-950/95 backdrop-blur-2xl overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="w-full max-w-2xl bg-[#090f1d] border-2 border-indigo-500/20 rounded-[28px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
      >
        {/* Header do Hub */}
        <div className="p-4 sm:p-6 md:p-8 border-b border-white/10 flex justify-between items-center bg-indigo-500/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black uppercase italic tracking-tighter text-white">
                {getGameTitle()}
              </h2>
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-primary/80">
                {activeGame ? lt.activeModule : lt.academyTitle}
              </p>
            </div>
          </div>
          <button 
            onClick={activeGame ? () => setActiveGame(null) : onClose} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Corpo Principal (Chaveador de Telas) */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 flex flex-col justify-center min-h-0">
          <AnimatePresence mode="wait">
            {!activeGame ? (
              <motion.div 
                key="menu"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Banner de Status Diário */}
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between text-left">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 block">{lt.energyTitle}</span>
                    <h4 className="text-xs font-bold text-white/80">{lt.bonusActive} {dailyGamesPlayed} / {maxDailyGames} {lt.completed}</h4>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-400/10 px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase text-yellow-400 tracking-wider shrink-0">
                    <Sparkles className="w-3.5 h-3.5 fill-yellow-400/20" /> {lt.bonusPerGame}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  
                  {/* Card Jogo 1: Memória Espacial */}
                  <button 
                    onClick={() => setActiveGame('memory')}
                    className="group w-full p-3 xs:p-4 sm:p-5 bg-white/5 hover:bg-indigo-500/5 border border-white/10 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 flex items-center justify-between text-left hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 xs:w-14 xs:h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all shrink-0">
                        <Brain className="w-5 h-5 xs:w-7 xs:h-7" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs xs:text-sm font-black uppercase tracking-wider text-white group-hover:text-indigo-400 transition-colors truncate">{lt.games.memory.title}</h3>
                        <p className="text-[9px] xs:text-[10px] text-white/50 font-bold mt-0.5 leading-snug break-words">{lt.games.memory.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>

                  {/* Card Jogo 2: Radares Gêmeos */}
                  <button 
                    onClick={() => setActiveGame('spot')}
                    className="group w-full p-3 xs:p-4 sm:p-5 bg-white/5 hover:bg-indigo-500/5 border border-white/10 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 flex items-center justify-between text-left hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 xs:w-14 xs:h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all shrink-0">
                        <Compass className="w-5 h-5 xs:w-7 xs:h-7" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs xs:text-sm font-black uppercase tracking-wider text-white group-hover:text-indigo-400 transition-colors truncate">{lt.games.spot.title}</h3>
                        <p className="text-[9px] xs:text-[10px] text-white/50 font-bold mt-0.5 leading-snug break-words">{lt.games.spot.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>

                  {/* Card Jogo 3: Escudo do Silêncio */}
                  <button 
                    onClick={() => setActiveGame('attention')}
                    className="group w-full p-3 xs:p-4 sm:p-5 bg-white/5 hover:bg-indigo-500/5 border border-white/10 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 flex items-center justify-between text-left hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 xs:w-14 xs:h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all shrink-0">
                        <Shield className="w-5 h-5 xs:w-7 xs:h-7" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs xs:text-sm font-black uppercase tracking-wider text-white group-hover:text-indigo-400 transition-colors truncate">{lt.games.attention.title}</h3>
                        <p className="text-[9px] xs:text-[10px] text-white/50 font-bold mt-0.5 leading-snug break-words">{lt.games.attention.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>

                  {/* Card Jogo 4: Cores Cósmicas */}
                  <button 
                    onClick={() => setActiveGame('stroop')}
                    className="group w-full p-3 xs:p-4 sm:p-5 bg-white/5 hover:bg-indigo-500/5 border border-white/10 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 flex items-center justify-between text-left hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 xs:w-14 xs:h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all shrink-0">
                        <Sparkles className="w-5 h-5 xs:w-7 xs:h-7" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs xs:text-sm font-black uppercase tracking-wider text-white group-hover:text-indigo-400 transition-colors truncate">{lt.games.stroop.title}</h3>
                        <p className="text-[9px] xs:text-[10px] text-white/50 font-bold mt-0.5 leading-snug break-words">{lt.games.stroop.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>

                  {/* Card Jogo 5: Ritmo Estelar */}
                  <button 
                    onClick={() => setActiveGame('simon')}
                    className="group w-full p-3 xs:p-4 sm:p-5 bg-white/5 hover:bg-indigo-500/5 border border-white/10 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 flex items-center justify-between text-left hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 xs:w-14 xs:h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all shrink-0">
                        <Gamepad2 className="w-5 h-5 xs:w-7 xs:h-7" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs xs:text-sm font-black uppercase tracking-wider text-white group-hover:text-indigo-400 transition-colors truncate">{lt.games.simon.title}</h3>
                        <p className="text-[9px] xs:text-[10px] text-white/50 font-bold mt-0.5 leading-snug break-words">{lt.games.simon.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>

                  {/* Card Jogo 6: Cargas de Corsi */}
                  <button 
                    onClick={() => setActiveGame('corsi')}
                    className="group w-full p-3 xs:p-4 sm:p-5 bg-white/5 hover:bg-indigo-500/5 border border-white/10 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 flex items-center justify-between text-left hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 xs:w-14 xs:h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all shrink-0">
                        <Box className="w-5 h-5 xs:w-7 xs:h-7" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs xs:text-sm font-black uppercase tracking-wider text-white group-hover:text-indigo-400 transition-colors truncate">{lt.games.corsi.title}</h3>
                        <p className="text-[9px] xs:text-[10px] text-white/50 font-bold mt-0.5 leading-snug break-words">{lt.games.corsi.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>

                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="game"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                {activeGame === 'memory' && (
                  <MemoryGame 
                    onComplete={handleGameComplete} 
                    onClose={() => setActiveGame(null)} 
                    language={currentLang}
                  />
                )}
                {activeGame === 'spot' && (
                  <SpotMatchGame 
                    onComplete={handleGameComplete} 
                    onClose={() => setActiveGame(null)} 
                    language={currentLang}
                  />
                )}
                {activeGame === 'attention' && (
                  <AttentionGame 
                    onComplete={handleGameComplete} 
                    onClose={() => setActiveGame(null)} 
                    language={currentLang}
                  />
                )}
                {activeGame === 'stroop' && (
                  <StroopGame 
                    onComplete={handleGameComplete} 
                    onClose={() => setActiveGame(null)} 
                    language={currentLang}
                  />
                )}
                {activeGame === 'simon' && (
                  <SimonGame 
                    onComplete={handleGameComplete} 
                    onClose={() => setActiveGame(null)} 
                    language={currentLang}
                  />
                )}
                {activeGame === 'corsi' && (
                  <CorsiGame 
                    onComplete={handleGameComplete} 
                    onClose={() => setActiveGame(null)} 
                    language={currentLang}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CognitiveLab;
