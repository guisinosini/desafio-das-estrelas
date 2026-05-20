import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Trash } from 'lucide-react';
import dynamic from 'next/dynamic';
import { GlassCard } from '@/components/ui/GlassCard';

const OrbitalPlanetDynamic = dynamic(() => import('./OrbitalPlanet').then(mod => mod.OrbitalPlanet), { ssr: false });
import type { Reward } from '@/types/desafio';

interface SetupRewardsStageProps {
  orbitalTransitionVariants: any;
  t: any;
  customReward: { title: string, cost: number };
  setCustomReward: React.Dispatch<React.SetStateAction<{ title: string, cost: number }>>;
  addReward: (title: string, cost: number) => void;
  rewardPresets: any[];
  rewards: Reward[];
  removeReward: (id: string) => void;
  handleStartAdventure: () => void;
}

export const SetupRewardsStage: React.FC<SetupRewardsStageProps> = memo(({
  orbitalTransitionVariants,
  t,
  customReward,
  setCustomReward,
  addReward,
  rewardPresets,
  rewards,
  removeReward,
  handleStartAdventure
}) => {
  return (
    <motion.div 
      key="setup_rewards" 
      variants={orbitalTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative z-10 max-w-2xl mx-auto min-h-screen flex flex-col justify-start md:justify-center p-4 md:p-6 py-12 space-y-8"
    >
      <OrbitalPlanetDynamic type="turquoise" title="Aurelia Turquesa" subtitle="Setor Relíquia" />
      <div className="relative z-10 space-y-8 flex flex-col justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">{t.galacticTreasures}</h2>
          <p className="text-white/80 text-sm md:text-base leading-relaxed bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg text-left" dangerouslySetInnerHTML={{ __html: t.rewardExplainer }} />
        </div>

        <GlassCard className="p-5 md:p-8 rounded-[30px] md:rounded-[40px] space-y-6">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.createTreasure}:</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Ex: Cinema com pipoca..."
                value={customReward.title}
                onChange={e => setCustomReward({ ...customReward, title: e.target.value })}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-yellow-400 transition-colors text-white"
              />
              <input
                type="number"
                min="1"
                value={customReward.cost}
                onChange={e => setCustomReward({ ...customReward, cost: parseInt(e.target.value) || 0 })}
                className="w-full sm:w-28 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-center outline-none focus:border-yellow-400 text-white"
              />
              <button
                disabled={!customReward.title}
                onClick={() => { addReward(customReward.title, customReward.cost); setCustomReward({ title: "", cost: 50 }); }}
                className="w-full sm:w-auto px-6 py-4 sm:py-0 bg-yellow-400 text-black font-black uppercase text-[10px] rounded-xl hover:scale-105 transition-all shadow-lg shadow-yellow-400/20"
              >
                {t.add}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.quickSuggestions}:</p>
            <div className="flex flex-wrap gap-2">
              {rewardPresets.map((p: any) => (
                <button key={p.title} onClick={() => addReward(p.title, p.cost)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all text-white/80">
                  + {p.title} ({p.cost}⭐)
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {rewards.map((r: Reward) => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center text-yellow-400 font-black">{r.cost}</div>
                  <span className="font-bold uppercase tracking-tight italic text-white">{r.title}</span>
                </div>
                <button onClick={() => removeReward(r.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-5 h-5" /></button>
              </div>
            ))}
            {rewards.length === 0 && <p className="text-center py-8 text-white/20 font-black uppercase italic tracking-widest">{t.noRewardsAdded}</p>}
          </div>

          <button disabled={rewards.length === 0} onClick={handleStartAdventure} className="w-full py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">{t.startChallenge}</button>
        </GlassCard>
      </div>
    </motion.div>
  );
});

SetupRewardsStage.displayName = 'SetupRewardsStage';
