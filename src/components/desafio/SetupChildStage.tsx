import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import type { ChildData } from '@/types/desafio';
import { OrbitalPlanet } from './OrbitalPlanet';

interface SetupChildStageProps {
  newChild: Partial<ChildData>;
  setNewChild: (child: Partial<ChildData>) => void;
  setStage: (stage: any) => void;
  handleCreateChild: () => void;
  hasChildren: boolean;
  t: any;
}

const orbitalTransitionVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.1, 
    rotate: 120, 
    x: 300, 
    y: -100 
  },
  animate: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0, 
    x: 0, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 50,
      damping: 14
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.1, 
    rotate: -120, 
    x: -300, 
    y: 100,
    transition: { 
      duration: 0.8,
      ease: "easeInOut"
    }
  }
};

const SetupChildStage = memo(({ 
  newChild, 
  setNewChild, 
  setStage, 
  handleCreateChild, 
  hasChildren,
  t 
}: SetupChildStageProps) => {
  return (
    <motion.div 
      key="setup_child" 
      variants={orbitalTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8 overflow-hidden"
    >
      <OrbitalPlanet type="green" title="Gaya Alfa" subtitle="Setor Origem" />
      
      <div className="relative z-10 space-y-8 flex flex-col justify-center">
        
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-center">{t.whoIsHero}</h2>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[50px] space-y-6 shadow-2xl">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block text-center">{t.heroName}</label>
            <input
              autoFocus
              value={newChild.name || ""}
              onChange={e => setNewChild({ ...newChild, name: e.target.value })}
              type="text"
              placeholder={t.placeholder_hero_name}
              className="w-full bg-transparent border-b-2 border-white/20 p-2 text-2xl font-black text-center outline-none focus:border-primary transition-colors text-white"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block text-center">{t.gender}</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setNewChild({ ...newChild, gender: 'boy' })}
                className={clsx(
                  "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                  newChild.gender === 'boy' ? "bg-primary/20 border-primary scale-105 shadow-lg" : "bg-white/5 border-white/10 hover:border-white/30 text-white/60"
                )}
              >
                <span className="text-3xl">👦</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{t.boy}</span>
              </button>
              <button
                onClick={() => setNewChild({ ...newChild, gender: 'girl' })}
                className={clsx(
                  "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                  newChild.gender === 'girl' ? "bg-pink-500/20 border-pink-500 scale-105 shadow-lg" : "bg-white/5 border-white/10 hover:border-white/30 text-white/60"
                )}
              >
                <span className="text-3xl">👧</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{t.girl}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">{t.birthDate}</label>
              <input
                type="date"
                value={newChild.birthDate || ""}
                onChange={e => {
                  const date = e.target.value;
                  const age = new Date().getFullYear() - new Date(date).getFullYear();
                  setNewChild({ ...newChild, birthDate: date, age });
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold outline-none focus:border-primary transition-colors text-white/80"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">{t.age}</label>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(age => (
                  <button
                    key={age}
                    onClick={() => setNewChild({ ...newChild, age })}
                    className={clsx(
                      "min-w-[40px] h-[40px] rounded-lg border font-black flex items-center justify-center transition-all",
                      newChild.age === age ? "bg-primary border-primary text-black" : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                    )}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block text-center">{t.schoolGrade}</label>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {t.grades.map((grade: string) => (
                <button
                  key={grade}
                  onClick={() => setNewChild({ ...newChild, schoolGrade: grade })}
                  className={clsx(
                    "whitespace-nowrap px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                    newChild.schoolGrade === grade ? "bg-primary border-primary text-black" : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                  )}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!newChild.name}
            onClick={() => setStage('setup_avatar')}
            className="w-full py-6 bg-primary text-black font-black uppercase tracking-widest rounded-[28px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {t.nextStep}
          </button>
        </div>
      </div>
    </motion.div>
  );
});

SetupChildStage.displayName = 'SetupChildStage';

export default SetupChildStage;
