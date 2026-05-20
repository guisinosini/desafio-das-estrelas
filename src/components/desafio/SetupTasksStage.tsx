import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash } from 'lucide-react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { GlassCard } from '@/components/ui/GlassCard';

const OrbitalPlanetDynamic = dynamic(() => import('./OrbitalPlanet').then(mod => mod.OrbitalPlanet), { ssr: false });
import type { Planet, Task, TaskRecurrence } from '@/types/desafio';

interface SetupTasksStageProps {
  orbitalTransitionVariants: any;
  t: any;
  customTask: { title: string, stars: number, recurrence: TaskRecurrence, planetId?: string };
  setCustomTask: React.Dispatch<React.SetStateAction<{ title: string, stars: number, recurrence: TaskRecurrence, planetId?: string }>>;
  addTask: (title: string, stars: number, recurrence: TaskRecurrence, planetId?: string) => void;
  taskPresets: any[];
  activeChild: any;
  tasks: Task[];
  removeTask: (id: string) => void;
  setStage: (stage: any) => void;
}

export const SetupTasksStage: React.FC<SetupTasksStageProps> = memo(({
  orbitalTransitionVariants,
  t,
  customTask,
  setCustomTask,
  addTask,
  taskPresets,
  activeChild,
  tasks,
  removeTask,
  setStage
}) => {
  return (
    <motion.div 
      key="setup_tasks" 
      variants={orbitalTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative z-10 w-full max-w-2xl mx-auto flex-1 flex flex-col justify-start md:justify-center px-4 py-8 md:p-6 space-y-6 md:space-y-8"
    >
      <OrbitalPlanetDynamic type="gold" title="Helios Prime" subtitle="Setor Estelar" />
      <div className="relative z-10 space-y-8 flex flex-col justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">{t.journeyMissions}</h2>
          <p className="text-white/80 text-sm md:text-base leading-relaxed bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg text-left" dangerouslySetInnerHTML={{ __html: t.taskExplainer }} />
        </div>

        <GlassCard className="p-5 md:p-8 rounded-[30px] md:rounded-[40px] space-y-6">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.createMission}:</p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Ex: Lavar louça..."
                  value={customTask.title}
                  onChange={e => setCustomTask({ ...customTask, title: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-colors text-white"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customTask.stars}
                  onChange={e => setCustomTask({ ...customTask, stars: parseInt(e.target.value) || 0 })}
                  className="w-full sm:w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-center outline-none focus:border-primary text-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.linkPlanet}</p>
                <select
                  value={customTask.planetId || ''}
                  onChange={e => setCustomTask({ ...customTask, planetId: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-colors text-white/85 appearance-none cursor-pointer"
                >
                  <option value="" className="text-black">{t.generalPlanetOption}</option>
                  {activeChild?.planets?.map((p: Planet) => (
                    <option key={p.id} value={p.id} className="text-black">{p.icon} {p.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 flex-wrap gap-1 justify-center sm:justify-start">
                  {['daily', 'weekly', 'monthly', 'once'].map((rec) => (
                    <button
                      key={rec}
                      onClick={() => setCustomTask({ ...customTask, recurrence: rec as TaskRecurrence })}
                      className={clsx(
                        "px-3 py-2 text-[8px] md:text-[10px] font-black uppercase rounded-lg transition-all flex-1 sm:flex-none",
                        customTask.recurrence === rec ? "bg-primary text-black" : "text-white/40 hover:text-white"
                      )}
                    >
                      {rec === 'daily' ? t.daily : rec === 'weekly' ? t.weekly : rec === 'monthly' ? t.monthly : t.once}
                    </button>
                  ))}
                </div>
                <button
                  disabled={!customTask.title}
                  onClick={() => { addTask(customTask.title, customTask.stars, customTask.recurrence, customTask.planetId); setCustomTask({ title: "", stars: 5, recurrence: 'daily', planetId: "" }); }}
                  className="w-full sm:w-auto flex-1 py-3 bg-primary text-black font-black uppercase text-[10px] rounded-xl hover:scale-105 transition-all"
                >
                  {t.addMissionBtn}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.quickSuggestions}:</p>
            <div className="flex flex-wrap gap-2">
              {taskPresets.map((p: any) => (
                <button key={p.title} onClick={() => addTask(p.title, p.stars, p.recurrence || 'daily')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all text-white/80">
                  + {p.title} ({p.stars}⭐)
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {tasks.map((tItem: Task) => (
              <div key={tItem.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">{tItem.stars}</div>
                  <span className="font-bold uppercase tracking-tight italic text-white">{tItem.title}</span>
                </div>
                <button onClick={() => removeTask(tItem.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-5 h-5" /></button>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-center py-8 text-white/20 font-black uppercase italic tracking-widest">{t.radarEmpty}</p>}
          </div>

          <button disabled={tasks.length === 0} onClick={() => setStage('setup_rewards')} className="w-full py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">{t.continue}</button>
        </GlassCard>
      </div>
    </motion.div>
  );
});

SetupTasksStage.displayName = 'SetupTasksStage';
