import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Compass, Shield, Sparkles, X, ChevronRight, Gamepad2, Award } from 'lucide-react';
import MemoryGame from './MemoryGame';
import SpotMatchGame from './SpotMatchGame';
import AttentionGame from './AttentionGame';

interface CognitiveLabProps {
  onClose: () => void;
  onAwardStars: (amount: number, gameTitle: string, scoreText?: string, playTime?: number) => void;
  language: string;
}

export const CognitiveLab: React.FC<CognitiveLabProps> = ({ onClose, onAwardStars, language }) => {
  const [activeGame, setActiveGame] = useState<'memory' | 'spot' | 'attention' | null>(null);
  const [dailyGamesPlayed, setDailyGamesPlayed] = useState(0);
  const maxDailyGames = 3;

  const handleGameComplete = (bonusStars: number, scoreText: string, playTime: number) => {
    // Determinar o nome descritivo do jogo
    let gameTitle = 'Treinamento Cognitivo';
    if (activeGame === 'memory') gameTitle = 'Treino: Pares Estelares 🧠';
    if (activeGame === 'spot') gameTitle = 'Treino: Radares Gêmeos 🪐';
    if (activeGame === 'attention') gameTitle = 'Treino: Escudo do Silêncio ☄️';

    // Sincronizar as estrelas conquistadas com o banco de dados e estado local do herói
    onAwardStars(bonusStars, gameTitle, scoreText, playTime);
    setDailyGamesPlayed(prev => prev + 1);
  };

  const getGameTitle = () => {
    if (activeGame === 'memory') return 'Pares Estelares';
    if (activeGame === 'spot') return 'Radares Gêmeos';
    if (activeGame === 'attention') return 'Escudo do Silêncio';
    return 'Laboratório de Treino';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-2xl overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="w-full max-w-2xl bg-[#090f1d] border-2 border-indigo-500/20 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header do Hub */}
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-indigo-500/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
                {getGameTitle()}
              </h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-primary/80">
                {activeGame ? 'MÓDULO DE TREINAMENTO ATIVO' : 'ACADEMIA COGNITIVA INTERGALÁCTICA'}
              </p>
            </div>
          </div>
          <button 
            onClick={activeGame ? () => setActiveGame(null) : onClose} 
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Principal (Chaveador de Telas) */}
        <div className="p-8 overflow-y-auto flex-1 flex flex-col justify-center min-h-0">
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
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex justify-between items-center text-left">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Energia Diária de Treino</span>
                    <h4 className="text-xs font-bold text-white/80">Bônus de Estrelas Ativo: {dailyGamesPlayed} / {maxDailyGames} Concluídos</h4>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-400/10 px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase text-yellow-400 tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 fill-yellow-400/20" /> +2⭐ por Treino
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  
                  {/* Card Jogo 1: Memória Espacial */}
                  <button 
                    onClick={() => setActiveGame('memory')}
                    className="group w-full p-5 bg-white/5 hover:bg-indigo-500/5 border border-white/10 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 flex items-center justify-between text-left hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                        <Brain className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-indigo-400 transition-colors">Pares Estelares</h3>
                        <p className="text-[10px] text-white/50 font-bold mt-1">Treino de Memória de Trabalho Visual e Foco</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* Card Jogo 2: Radares Gêmeos */}
                  <button 
                    onClick={() => setActiveGame('spot')}
                    className="group w-full p-5 bg-white/5 hover:bg-indigo-500/5 border border-white/10 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 flex items-center justify-between text-left hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                        <Compass className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-indigo-400 transition-colors">Radares Gêmeos</h3>
                        <p className="text-[10px] text-white/50 font-bold mt-1">Treino de Atenção Concentrada e Discriminação Visual</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* Card Jogo 3: Escudo do Silêncio */}
                  <button 
                    onClick={() => setActiveGame('attention')}
                    className="group w-full p-5 bg-white/5 hover:bg-indigo-500/5 border border-white/10 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 flex items-center justify-between text-left hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                        <Shield className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-indigo-400 transition-colors">Escudo do Silêncio</h3>
                        <p className="text-[10px] text-white/50 font-bold mt-1">Treino de Controle Inibitório e Freio de Impulsividade</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
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
                  />
                )}
                {activeGame === 'spot' && (
                  <SpotMatchGame 
                    onComplete={handleGameComplete} 
                    onClose={() => setActiveGame(null)} 
                  />
                )}
                {activeGame === 'attention' && (
                  <AttentionGame 
                    onComplete={handleGameComplete} 
                    onClose={() => setActiveGame(null)} 
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
