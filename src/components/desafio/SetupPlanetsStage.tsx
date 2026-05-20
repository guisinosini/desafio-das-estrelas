import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash } from 'lucide-react';
import dynamic from 'next/dynamic';
import { GlassCard } from '@/components/ui/GlassCard';

const OrbitalPlanetDynamic = dynamic(() => import('./OrbitalPlanet').then(mod => mod.OrbitalPlanet), { ssr: false });
import type { Planet } from '@/types/desafio';

interface SetupPlanetsStageProps {
  orbitalTransitionVariants: any;
  t: any;
  customPlanet: { title: string, icon: string };
  setCustomPlanet: React.Dispatch<React.SetStateAction<{ title: string, icon: string }>>;
  addPlanet: (title: string, icon: string) => void;
  planetPresets: any[];
  activeChild: any;
  removePlanet: (id: string) => void;
  setStage: (stage: any) => void;
}

export const SetupPlanetsStage: React.FC<SetupPlanetsStageProps> = memo(({
  orbitalTransitionVariants,
  t,
  customPlanet,
  setCustomPlanet,
  addPlanet,
  planetPresets,
  activeChild,
  removePlanet,
  setStage
}) => {
  return (
    <motion.div 
      key="setup_planets" 
      variants={orbitalTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative z-10 max-w-2xl mx-auto min-h-screen flex flex-col justify-start md:justify-center p-4 md:p-6 py-12 space-y-8"
    >
      <OrbitalPlanetDynamic type="blue" title="Cosmos Blue" subtitle="Setor Cosmos" />
      <div className="relative z-10 space-y-8 flex flex-col justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">{t.destinyPlanets}</h2>
          <p className="text-white/80 text-sm md:text-base leading-relaxed bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg text-left" dangerouslySetInnerHTML={{ __html: t.planetExplainer }} />
        </div>

        <GlassCard className="p-5 md:p-8 rounded-[30px] md:rounded-[40px] space-y-6">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.createPlanet}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Ex: Melhorar em Matemática"
                value={customPlanet.title}
                onChange={e => setCustomPlanet({ ...customPlanet, title: e.target.value })}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-colors text-white"
              />
              <input
                type="text"
                value={customPlanet.icon}
                onChange={e => setCustomPlanet({ ...customPlanet, icon: e.target.value })}
                className="w-full sm:w-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-center outline-none focus:border-primary text-white"
                placeholder="🪐"
              />
              <button
                onClick={() => {
                  if (customPlanet.title) {
                    addPlanet(customPlanet.title, customPlanet.icon || "🪐");
                    setCustomPlanet({ title: "", icon: "🪐" });
                  }
                }}
                disabled={!customPlanet.title}
                className="w-full sm:w-auto bg-primary/20 text-primary p-3 flex justify-center rounded-xl hover:bg-primary/30 transition-colors disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.quickSuggestions}:</p>
            <div className="flex flex-wrap gap-2">
              {planetPresets.map((p: any) => (
                <button
                  key={p.title}
                  onClick={() => addPlanet(p.title, p.icon)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:border-primary/50 transition-colors flex items-center gap-2 text-white/80"
                >
                  <span>{p.icon}</span> {p.title} <Plus className="w-3 h-3 text-white/40" />
                </button>
              ))}
            </div>
          </div>

          {(activeChild?.planets?.length || 0) > 0 && (
            <div className="pt-6 border-t border-white/10 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.chosenPlanets}</p>
              <div className="space-y-2">
                {activeChild?.planets?.map((p: Planet) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.icon}</span>
                      <span className="font-bold text-sm text-white">{p.title}</span>
                    </div>
                    <button onClick={() => removePlanet(p.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setStage('setup_tasks')}
            className="w-full py-5 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {t.traceRoute}
          </button>
        </GlassCard>
      </div>
    </motion.div>
  );
});

SetupPlanetsStage.displayName = 'SetupPlanetsStage';
