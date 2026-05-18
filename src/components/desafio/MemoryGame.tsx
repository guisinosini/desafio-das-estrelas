import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Moon, Sun, Zap, Compass, Star, RefreshCw, Trophy } from 'lucide-react';
import clsx from 'clsx';

interface MemoryGameProps {
  onComplete: (bonusStars: number, scoreText: string, playTime: number) => void;
  onClose: () => void;
}

const ICONS = [
  { icon: Rocket, color: 'text-indigo-400', id: 'rocket' },
  { icon: Moon, color: 'text-cyan-400', id: 'moon' },
  { icon: Sun, color: 'text-yellow-400', id: 'sun' },
  { icon: Zap, color: 'text-amber-400', id: 'zap' },
  { icon: Compass, color: 'text-emerald-400', id: 'compass' },
  { icon: Star, color: 'text-pink-400', id: 'star' }
];

export const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete, onClose }) => {
  const [cards, setCards] = useState<{ id: string; icon: any; color: string; index: number; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
  const startTimeRef = useRef(Date.now());

  const initGame = () => {
    const deck = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({
        ...item,
        index: idx,
        isFlipped: false,
        isMatched: false
      }));
    setCards(deck);
    setSelectedCards([]);
    setMoves(0);
    setHasFinished(false);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || selectedCards.length >= 2 || hasFinished) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newSelected;
      
      if (cards[firstIdx].id === cards[secondIdx].id) {
        // Encontrou um par!
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setSelectedCards([]);

          // Verificar se acabou o jogo
          if (matchedCards.every(c => c.isMatched)) {
            setHasFinished(true);
            const playTime = Math.round((Date.now() - startTimeRef.current) / 1000);
            setTimeout(() => {
              onComplete(2, `${moves} movimentos`, playTime); // Concede 2 estrelas de bônus!
            }, 1000);
          }
        }, 600);
      } else {
        // Não deu match
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-400">Pares Estelares</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Treino de Memória de Trabalho</p>
      </div>

      <div className="flex justify-between items-center w-full px-4 text-xs font-bold text-white/60">
        <span>Movimentos: <strong className="text-primary">{moves}</strong></span>
        <button onClick={initGame} className="flex items-center gap-1 hover:text-primary transition-colors uppercase tracking-wider text-[10px] font-black">
          <RefreshCw className="w-3.5 h-3.5" /> Reiniciar
        </button>
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
          <h4 className="text-xl font-black uppercase italic text-primary">Excelente Trabalho!</h4>
          <p className="text-xs text-white/70 font-medium">Sua memória espacial está brilhando hoje. Você ajudou sua tripulação galáctica!</p>
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
        <div className="grid grid-cols-4 gap-3 w-full">
          {cards.map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <button
                key={idx}
                onClick={() => handleCardClick(idx)}
                className="aspect-square relative rounded-2xl overflow-hidden focus:outline-none perspective shadow-lg"
              >
                <div className={clsx(
                  "w-full h-full relative transition-transform duration-500 transform-style-3d",
                  (card.isFlipped || card.isMatched) ? "rotate-y-180" : ""
                )}>
                  {/* Frente do Card (Virado / Revelado) */}
                  <div className={clsx(
                    "absolute inset-0 w-full h-full backface-hidden rounded-2xl border flex items-center justify-center transition-all bg-indigo-500/10 border-indigo-500/20 text-white rotate-y-180",
                    card.isMatched ? "bg-emerald-500/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : ""
                  )}>
                    <CardIcon className={clsx("w-8 h-8", card.color)} />
                  </div>

                  {/* Verso do Card (Escondido) */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/20 hover:bg-white/10 hover:border-primary/20 transition-all">
                    <span className="text-lg font-black font-mono">?</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Estilo para rotação 3D de cartas */}
      <style jsx global>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default MemoryGame;
