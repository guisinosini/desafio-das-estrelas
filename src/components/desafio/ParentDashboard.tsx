import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Rocket,
  Trophy,
  Zap,
  AlertCircle,
  Settings,
  History,
  Plus,
  Trash,
  LogOut,
  Check,
  X,
} from 'lucide-react';
import type { Task, Reward, ChildData, TaskRecurrence } from '@/types/desafio';
import { AVATARS } from '@/components/desafio/HeroElements';

interface ParentDashboardProps {
  parentSubView: string;
  setParentSubView: (view: string) => void;
  children: ChildData[];
  activeChild?: ChildData | null;
  activeChildId: string | null;
  setActiveChildId: (id: string | null) => void;
  tasks: Task[];
  rewards: Reward[];
  history: any[];
  setStage: (stage: string) => void;
  setView: (view: string) => void;
  handleLogout: () => Promise<void>;
  setNewChild: (child: { name: string; avatar: string }) => void;
  setStageSetupChild: () => void;
  handleApprove: (taskId: string) => void;
  updateActiveChild: (updates: Partial<ChildData>) => void;
  addTask: (title: string, starCount: number, recurrence?: TaskRecurrence) => void;
  customTask: { title: string; stars: number; recurrence: TaskRecurrence };
  setCustomTask: (task: { title: string; stars: number; recurrence: TaskRecurrence }) => void;
  addReward: (title: string, cost: number) => void;
  customReward: { title: string; cost: number };
  setCustomReward: (reward: { title: string; cost: number }) => void;
  removeTask: (id: string) => void;
  removeReward: (id: string) => void;
  taskPresets: { title: string; stars: number }[];
  rewardPresets: { title: string; cost: number }[];
  fleetChildren: ChildData[];
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  parentSubView,
  setParentSubView,
  children,
  activeChild,
  activeChildId,
  setActiveChildId,
  tasks,
  rewards,
  history,
  setStage,
  setView,
  handleLogout,
  setNewChild,
  setStageSetupChild,
  handleApprove,
  updateActiveChild,
  addTask,
  customTask,
  setCustomTask,
  addReward,
  customReward,
  setCustomReward,
  removeTask,
  removeReward,
  taskPresets,
  rewardPresets,
  fleetChildren,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 md:gap-12 relative z-10">
      {/* Navigation Buttons */}
      <div className="lg:w-64 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide snap-x">
        {[
          { id: 'approvals', label: 'Validações', icon: CheckCircle2 },
          { id: 'missions', label: 'Sala de Controle', icon: Rocket },
          { id: 'ranking', label: 'Ranking', icon: Trophy },
          { id: 'fleet', label: 'Aliança', icon: Zap },
          { id: 'behavior', label: 'Comportamento', icon: AlertCircle },
          { id: 'settings', label: 'Ajustes Perfil', icon: Settings },
          { id: 'history', label: 'Histórico', icon: History },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setParentSubView(item.id)}
            className={clsx(
              'flex-none lg:w-full flex items-center gap-3 px-6 lg:px-8 py-4 lg:py-5 rounded-2xl lg:rounded-[28px] text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl snap-center',
              parentSubView === item.id ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
            )}
          >
            <item.icon className="w-4 h-4" /> {item.label}
          </button>
        ))}
        <button
          onClick={() => { setStage('setup_child'); setNewChild({ name: '', avatar: 'ast1' }); }}
          className="flex-none lg:w-full flex items-center gap-3 px-6 lg:px-8 py-4 lg:py-5 rounded-2xl lg:rounded-[28px] text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all snap-center"
        >
          <Plus className="w-4 h-4" /> Novo Herói
        </button>
        <button
          onClick={() => {
            if (confirm(`Tem certeza que deseja excluir o perfil de ${activeChild?.name}?`)) {
              const remaining = children.filter(c => c.id !== activeChildId);
              // Note: parent component will handle resetting stage if needed
            }
          }}
          className="w-full flex items-center gap-3 px-8 py-5 mt-4 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
        >
          <Trash className="w-4 h-4" /> Excluir Perfil
        </button>
        <button
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="w-full flex items-center gap-3 px-8 py-5 mt-8 md:mt-20 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Resetar Tudo
        </button>
      </div>

      {/* Subview Content */}
      <div className="flex-1 space-y-8">
        {/* Approvals */}
        {parentSubView === 'approvals' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Relatórios Pendentes</h2>
            <div className="grid grid-cols-1 gap-4">
              {tasks.filter((t: Task) => t.status === 'pending').map((t: Task) => (
                <div
                  key={t.id}
                  className="p-4 md:p-8 bg-white/5 border border-white/10 rounded-3xl md:rounded-[40px] flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md"
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white/5 flex items-center justify-center border-2 border-primary/20 text-2xl md:text-4xl">
                      {AVATARS.find(a => a.id === activeChild?.avatar)?.emoji}
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-black uppercase italic text-white">{t.title}</p>
                      <p className="text-xs md:text-sm text-primary font-black uppercase">{t.stars} estrelas em jogo</p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleApprove(t.id)}
                      className="flex-1 sm:w-16 h-14 md:h-16 bg-primary text-black rounded-2xl flex items-center justify-center hover:scale-105 transition-all"
                    >
                      <Check className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <button
                      onClick={() => updateActiveChild({ tasks: tasks.map((tk: Task) => tk.id === t.id ? { ...tk, status: 'available' } : tk) })}
                      className="flex-1 sm:w-16 h-14 md:h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-red-500 transition-all"
                    >
                      <X className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === 'pending').length === 0 && (
                <div className="p-24 border-4 border-dashed border-white/5 rounded-[60px] text-center text-white/10 font-black uppercase italic tracking-widest text-xl">
                  Tudo em Órbita!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Missions Control */}
        {parentSubView === 'missions' && (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Sala de Controle</h2>
                <p className="text-white/40">Edite as missões e recompensas do universo.</p>
              </div>
            </div>
            {/* Manual Task Input */}
            <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-2xl space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Lançar Nova Missão:</p>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome..."
                    value={customTask.title}
                    onChange={e => setCustomTask({ ...customTask, title: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    value={customTask.stars}
                    onChange={e => setCustomTask({ ...customTask, stars: parseInt(e.target.value) || 0 })}
                    className="w-14 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-center outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={customTask.recurrence}
                    onChange={e => setCustomTask({ ...customTask, recurrence: e.target.value as TaskRecurrence })}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none text-white/60"
                  >
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="once">Única</option>
                  </select>
                  <button
                    disabled={!customTask.title}
                    onClick={() => {
                      addTask(customTask.title, customTask.stars, customTask.recurrence);
                      setCustomTask({ title: '', stars: 5, recurrence: 'daily' });
                    }}
                    className="flex-1 py-2 bg-primary text-black rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase"
                  >
                    <Plus className="w-3 h-3" /> Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.map((t: Task) => (
                <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group">
                  <span className="font-bold text-sm uppercase italic">{t.title}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-black">{t.stars}⭐</span>
                    <button onClick={() => removeTask(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="p-2 border border-dashed border-white/10 rounded-2xl opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2">Sugestões:</p>
                <div className="flex flex-wrap gap-1">
                  {taskPresets.map(p => (
                    <button key={p.title} onClick={() => addTask(p.title, p.stars)} className="px-2 py-1 bg-white/5 rounded-md text-[8px] font-bold uppercase hover:bg-primary hover:text-black transition-all">
                      +{p.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rewards Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-yellow-400 flex items-center gap-2">
                <Gift className="w-4 h-4" /> Recompensas Ativas
              </h3>
              {/* Input Manual Reward */}
              <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-2xl space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Criar Novo Tesouro:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome..."
                    value={customReward.title}
                    onChange={e => setCustomReward({ ...customReward, title: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-yellow-400"
                  />
                  <input
                    type="number"
                    value={customReward.cost}
                    onChange={e => setCustomReward({ ...customReward, cost: parseInt(e.target.value) || 0 })}
                    className="w-14 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-center outline-none"
                  />
                  <button
                    disabled={!customReward.title}
                    onClick={() => { addReward(customReward.title, customReward.cost); setCustomReward({ title: '', cost: 50 }); }}
                    className="p-2 bg-yellow-400 text-black rounded-xl hover:scale-105 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reward List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {rewards.map((r: Reward) => (
                  <div key={r.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group">
                    <span className="font-bold text-sm uppercase italic">{r.title}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-yellow-400 font-black">{r.cost}⭐</span>
                      <button onClick={() => removeReward(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="p-2 border border-dashed border-white/10 rounded-2xl opacity-40 hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2">Sugestões:</p>
                  <div className="flex flex-wrap gap-1">
                    {rewardPresets.map(p => (
                      <button key={p.title} onClick={() => addReward(p.title, p.cost)} className="px-2 py-1 bg-white/5 rounded-md text-[8px] font-bold uppercase hover:bg-yellow-400 hover:text-black transition-all">
                        +{p.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ranking */}
        {parentSubView === 'ranking' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Ranking Galáctico</h2>
              <p className="text-white/40">Classificação dos heróis por total de estrelas.</p>
            </div>
            <div className="space-y-4">
              {[...children, ...fleetChildren].sort((a, b) => b.stars - a.stars).map((c: ChildData, idx: number) => {
                const avatar = AVATARS.find(av => av.id === c.avatar) || AVATARS[0];
                const isOwn = children.some(own => own.id === c.id);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={clsx(
                      'p-6 rounded-[30px] border-2 flex items-center justify-between backdrop-blur-md transition-all',
                      idx === 0 ? 'bg-yellow-400/10 border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.2)]' : isOwn ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/10'
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl">
                          {avatar.emoji}
                        </div>
                        <div
                          className={clsx(
                            'absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2',
                            idx === 0 ? 'bg-yellow-400 text-black border-white' :
                              idx === 1 ? 'bg-zinc-300 text-black border-white' :
                                idx === 2 ? 'bg-orange-400 text-black border-white' : 'bg-zinc-800 text-white border-white/20'
                          )}
                        >
                          {idx + 1}º
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">
                          {c.name} {!isOwn && <span className="text-[10px] lowercase text-white/20">(aliado)</span>}
                        </h3>
                        <p className="text-sm font-black uppercase text-primary">{c.stars}⭐</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
        {/* Additional subviews (fleet, behavior, settings, history) can be added similarly */}
      </div>
    </div>
  );
};
