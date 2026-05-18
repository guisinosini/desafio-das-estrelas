import React, { useState, useEffect } from 'react';
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
  Gift,
  Brain,
  FileText,
  CreditCard,
} from 'lucide-react';
import type { Task, Reward, ChildData, TaskRecurrence } from '@/types/desafio';
import { AVATARS } from '@/components/desafio/HeroElements';
import { ClinicalReport } from './ClinicalReport';

interface ParentDashboardProps {
  parentSubView: string;
  setParentSubView: (view: any) => void;
  children: ChildData[];
  activeChild?: ChildData | null;
  activeChildId: string | null;
  setActiveChildId: (id: string | null) => void;
  tasks: Task[];
  rewards: Reward[];
  history: any[];
  setStage: (stage: any) => void;
  setView: (view: any) => void;
  handleLogout: () => void;
  setNewChild: (child: { name: string; avatar: string }) => void;
  setStageSetupChild: () => void;
  handleApprove: (taskId: string) => void;
  updateActiveChild: (updates: Partial<ChildData>) => void;
  addTask: (title: string, starCount: number, recurrence?: TaskRecurrence, planetId?: string) => void;
  customTask: { title: string; stars: number; recurrence: TaskRecurrence; planetId?: string };
  setCustomTask: (task: { title: string; stars: number; recurrence: TaskRecurrence; planetId?: string }) => void;
  addReward: (title: string, cost: number) => void;
  customReward: { title: string; cost: number };
  setCustomReward: (reward: { title: string; cost: number }) => void;
  removeTask: (id: string) => void;
  removeReward: (id: string) => void;
  taskPresets: { title: string; stars: number }[];
  rewardPresets: { title: string; cost: number }[];
  fleetChildren: ChildData[];
  parentPin: string;
  setParentPin: (pin: string) => void;
  fleetId: string;
  setFleetId: (id: string) => void;
  loadFleetRanking: () => void;
  handleDeductStars: (stars: number, reason: string) => void;
  handleSaveNote: (content: string) => void;
  removeChild: (id: string) => void;
  language: any;
  setLanguage: (lang: any) => void;
  t: any;
  parentName: string;
  isPremium: boolean;
  subscriptionPriceId: string | null;
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
  parentPin,
  setParentPin,
  fleetId,
  setFleetId,
  loadFleetRanking,
  handleDeductStars,
  handleSaveNote,
  removeChild,
  language,
  setLanguage,
  t,
  parentName,
  isPremium,
  subscriptionPriceId,
}) => {
  const getPlanName = () => {
    if (!isPremium) return 'Sem Plano';
    const YEARLY_PRICE_IDS = new Set([
      'price_1TXjo1Pc1qFQfvf50bPNi3i7', // BRL
      'price_1TXjv3Pc1qFQfvf5wps2BmFU', // USD
      'price_1TXjw5Pc1qFQfvf5cfszDbqI', // EUR
      'price_1TXjy3Pc1qFQfvf5pCgaPX8Q', // CNY
    ]);
    if (subscriptionPriceId && YEARLY_PRICE_IDS.has(subscriptionPriceId)) {
      return 'Plano Comandante Estelar (Anual)';
    }
    return 'Plano Cadete Espacial (Mensal)';
  };

  const [customBehaviorLabel, setCustomBehaviorLabel] = useState('');
  const [customBehaviorStars, setCustomBehaviorStars] = useState(2);
  const [behaviorNote, setBehaviorNote] = useState('');

  // Função placeholder para envio de e‑mail (substituir por serviço real)
  const sendEmail = async (to: string, subject: string, body: string) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });
    } catch (e) {
      console.error('Falha ao enviar e‑mail de lembrete:', e);
    }
  };

  // Verifica missões atrasadas (≥ 3 dias sem conclusão) e envia alerta ao mentor
  useEffect(() => {
    if (!activeChild) return;
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    tasks.forEach((task) => {
      // Ignora missões já concluídas
      if (task.status === 'done') return;
      // Se nunca foi completada, use a data de criação (assumida como lastCompleted undefined)
      const last = task.lastCompleted ? new Date(task.lastCompleted) : null;
      if (last) {
        if (now.getTime() - last.getTime() >= threeDays) {
          const subject = t.email_reminder_subject.replace('{title}', task.title);
          const body = t.email_reminder_body
            .replace('{title}', task.title)
            .replace('{name}', activeChild.name);
          // Placeholder: usar e‑mail do mentor armazenado na aplicação (ex.: parentPin ou outro campo)
          const mentorEmail = (activeChild as any).mentorEmail || '';
          if (mentorEmail) sendEmail(mentorEmail, subject, body);
        }
      }
    });
  }, [activeChild?.id, tasks]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 md:gap-12 relative z-10">
      {/* Navigation Buttons */}
      <div className="lg:w-64 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide snap-x print:hidden">
        {[
          { id: 'approvals', label: t.approvals, icon: CheckCircle2 },
          { id: 'missions', label: t.controlRoom, icon: Rocket },
          { id: 'ranking', label: t.ranking, icon: Trophy },
          { id: 'fleet', label: t.alliance, icon: Zap },
          { id: 'behavior', label: t.behavior, icon: AlertCircle },
          { id: 'settings', label: t.profileSettings, icon: Settings },
          { id: 'subscription', label: 'Assinatura', icon: CreditCard },
          { id: 'history', label: t.history, icon: History },
          { id: 'reports', label: t.reports, icon: Brain },
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
          <Plus className="w-4 h-4" /> {t.newHero}
        </button>
        <button
          onClick={() => {
            if (confirm(t.confirm_delete_hero.replace('{name}', activeChild?.name || ''))) {
              if (activeChildId) {
                removeChild(activeChildId);
              }
            }
          }}
          className="w-full flex items-center gap-3 px-8 py-5 mt-4 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
        >
          <Trash className="w-4 h-4" /> {t.deleteProfile}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-8 py-5 mt-8 md:mt-20 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sair da Conta
        </button>
      </div>

      {/* Subview Content */}
      <div className="flex-1 space-y-8">
        {/* Approvals */}
        {parentSubView === 'approvals' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">{t.approvals} {t.pending}</h2>
            <div className="grid grid-cols-1 gap-4">
              {tasks.filter((tk: Task) => tk.status === 'pending').map((tk: Task) => (
                <div
                  key={tk.id}
                  className="p-4 md:p-8 bg-white/5 border border-white/10 rounded-3xl md:rounded-[40px] flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md"
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white/5 flex items-center justify-center border-2 border-primary/20 text-2xl md:text-4xl">
                      {AVATARS.find(a => a.id === activeChild?.avatar)?.emoji}
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-black uppercase italic text-white">{tk.title}</p>
                      <p className="text-xs md:text-sm text-primary font-black uppercase">{t.stars} {t.starsToEarn}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleApprove(tk.id)}
                      className="flex-1 sm:w-16 h-14 md:h-16 bg-primary text-black rounded-2xl flex items-center justify-center hover:scale-105 transition-all"
                    >
                      <Check className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <button
                      onClick={() => updateActiveChild({ tasks: tasks.map((tItem: Task) => tItem.id === tk.id ? { ...tItem, status: 'available' } : tItem) })}
                      className="flex-1 sm:w-16 h-14 md:h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-red-500 transition-all"
                    >
                      <X className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === 'pending').length === 0 && (
                <div className="p-24 border-4 border-dashed border-white/5 rounded-[60px] text-center text-white/10 font-black uppercase italic tracking-widest text-xl">
                  {t.allInOrbit}
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
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">{t.controlRoom}</h2>
                <p className="text-white/40">{t.missionControlDesc}</p>
              </div>
            </div>
            {/* Manual Task Input */}
            <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-2xl space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.launchNewMission}:</p>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t.namePlaceholder}
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
                    value={customTask.planetId || ''}
                    onChange={e => setCustomTask({ ...customTask, planetId: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none text-white/60 appearance-none max-w-[120px] truncate"
                  >
                    <option value="">{t.generalPlanet}</option>
                    {activeChild?.planets?.map(p => (
                      <option key={p.id} value={p.id}>{p.icon} {p.title}</option>
                    ))}
                  </select>
                  <select
                    value={customTask.recurrence}
                    onChange={e => setCustomTask({ ...customTask, recurrence: e.target.value as TaskRecurrence })}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none text-white/60"
                  >
                    <option value="daily">{t.daily}</option>
                    <option value="weekly">{t.weekly}</option>
                    <option value="monthly">{t.monthly}</option>
                    <option value="once">{t.once}</option>
                  </select>
                  <button
                    disabled={!customTask.title}
                    onClick={() => {
                      addTask(customTask.title, customTask.stars, customTask.recurrence, customTask.planetId);
                      setCustomTask({ title: '', stars: 5, recurrence: 'daily', planetId: '' });
                    }}
                    className="flex-1 py-2 bg-primary text-black rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase"
                  >
                    <Plus className="w-3 h-3" /> {t.add}
                  </button>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.map((task: Task) => (
                <div key={task.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group">
                  <span className="font-bold text-sm uppercase italic">{task.title}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-black">{task.stars}⭐</span>
                    <button onClick={() => removeTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="p-2 border border-dashed border-white/10 rounded-2xl opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2">{t.quickSuggestions}:</p>
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
                <Gift className="w-4 h-4" /> {t.activeRewards}
              </h3>
              {/* Input Manual Reward */}
              <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-2xl space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.createNewTreasure}:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t.namePlaceholder}
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
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2">{t.quickSuggestions}:</p>
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
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">{t.galacticRanking}</h2>
              <p className="text-white/40">{t.rankingDesc}</p>
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
                          {c.name} {!isOwn && <span className="text-[10px] lowercase text-white/20">{t.aliado}</span>}
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
        {/* Settings */}
        {parentSubView === 'settings' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">{t.profileSettings}</h2>
              <p className="text-white/40">{t.profileSettingsDesc}</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-8 backdrop-blur-md">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.heroName}</label>
                <input
                  type="text"
                  value={activeChild?.name}
                  onChange={e => updateActiveChild({ name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black text-xl outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.chooseAvatar}</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
                  {AVATARS.map((a: any) => (
                    <button
                      key={a.id}
                      onClick={() => updateActiveChild({ avatar: a.id })}
                      className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all border-2",
                        activeChild?.avatar === a.id ? "bg-primary/20 border-primary scale-110" : "bg-white/5 border-white/10 hover:border-white/30"
                      )}
                    >
                      {a.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.systemLanguage}</label>
                <div className="flex flex-wrap gap-3">
                  {(['pt-BR', 'pt-PT', 'en', 'es', 'fr', 'it', 'zh'] as any[]).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border transition-all shadow-xl",
                        language === lang ? "bg-primary border-primary scale-110 rotate-3" : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}
                    >
                      {lang === 'pt-BR' ? '🇧🇷' : 
                       lang === 'pt-PT' ? '🇵🇹' : 
                       lang === 'en' ? '🇺🇸' : 
                       lang === 'es' ? '🇪🇸' : 
                       lang === 'fr' ? '🇫🇷' : 
                       lang === 'it' ? '🇮🇹' : '🇨🇳'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Settings className="w-3 h-3" /> {t.changePin}
                </label>
                <div className="flex gap-4">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder={t.newPinPlaceholder}
                    value={parentPin}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setParentPin(val);
                    }}
                    className="w-40 bg-white/5 border border-white/10 rounded-2xl p-4 font-black text-center text-xl outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-white/40 leading-tight flex-1 flex items-center">
                    {t.pinNotice}
                  </p>
                </div>
              </div>

            </div>

            <div className="flex justify-center">
              <button onClick={() => setView('child')} className="px-10 py-4 bg-primary text-black font-black uppercase rounded-2xl shadow-xl hover:scale-105 transition-all">{t.viewDashboardChanges}</button>
            </div>
          </div>
        )}

        {/* Assinatura */}
        {parentSubView === 'subscription' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-primary flex items-center gap-3">
                <CreditCard className="w-8 h-8" /> Gestão de Assinatura
              </h2>
              <p className="text-white/40">Acompanhe seu status e gerencie o faturamento da sua conta familiar.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6 backdrop-blur-md relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Status da Assinatura</p>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-black italic uppercase tracking-tighter text-white">
                      {getPlanName()}
                    </span>
                    <span className={clsx(
                      "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border shrink-0",
                      isPremium
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {isPremium ? 'Ativo' : 'Pendente'}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-2 font-medium">
                    {isPremium 
                      ? 'Você tem acesso ilimitado a todas as ferramentas, missões, planetas e ao dashboard clínico completo.'
                      : 'Você está no plano padrão. Faça o upgrade para ter acesso ao universo ilimitado.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {isPremium ? (
                    <>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/portal', { method: 'POST' });
                            const data = await res.json();
                            if (data.url) {
                              window.location.href = data.url;
                            } else {
                              throw new Error(data.error || 'Não foi possível carregar o portal');
                            }
                          } catch (e: any) {
                            alert(`Erro ao abrir portal de gerenciamento: ${e.message}`);
                          }
                        }}
                        className="px-8 py-4 bg-primary text-black font-black uppercase rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-xs tracking-widest"
                      >
                        Gerenciar Assinatura
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Você será redirecionado para o portal seguro do Stripe onde poderá cancelar a sua assinatura com um clique. Deseja prosseguir?')) {
                            try {
                              const res = await fetch('/api/portal', { method: 'POST' });
                              const data = await res.json();
                              if (data.url) {
                                window.location.href = data.url;
                              } else {
                                throw new Error(data.error || 'Não foi possível carregar o portal');
                              }
                            } catch (e: any) {
                              alert(`Erro ao abrir portal de cancelamento: ${e.message}`);
                            }
                          }
                        }}
                        className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase rounded-2xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 text-xs tracking-widest"
                      >
                        Cancelar Assinatura
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => window.location.href = '/#pricing'}
                      className="px-8 py-4 bg-primary text-black font-black uppercase rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-xs tracking-widest"
                    >
                      Seja Premium
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fleet */}
        {parentSubView === 'fleet' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-purple-400 flex items-center gap-3">
                <Zap className="w-8 h-8" /> {t.alliance}
              </h2>
              <p className="text-white/40">{t.allianceDesc}</p>
            </div>
            
            <div className="p-4 md:p-8 bg-white/5 border border-purple-500/30 rounded-3xl md:rounded-[40px] space-y-6 backdrop-blur-md">
              <label className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                {t.sharedAllianceCode}
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder={t.placeholder_fleet}
                  value={fleetId}
                  onChange={e => setFleetId(e.target.value.toUpperCase().replace(/\s/g, '-'))}
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl p-4 font-black text-xl md:text-2xl outline-none focus:border-purple-500 transition-all text-white"
                />
                <button onClick={() => loadFleetRanking()} className="px-8 py-4 bg-purple-500 text-white font-black uppercase rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  {t.sync}
                </button>
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex gap-4">
                <AlertCircle className="w-6 h-6 text-purple-400 shrink-0" />
                <p className="text-sm text-purple-200/80 leading-relaxed font-medium">
                  {t.fleetNotice}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Behavior */}
        {parentSubView === 'behavior' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-400">
                {t.behaviorBridge}
              </h2>
              <p className="text-white/40">
                {t.deductStars}
              </p>
            </div>

            {/* Breve Explicação Educacional */}
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-4 backdrop-blur-md">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
              <p className="text-xs sm:text-sm text-red-200/80 leading-relaxed font-medium">
                {t.behaviorNotice}
              </p>
            </div>

            {/* Input para Comportamentos Customizados */}
            <div className="p-4 bg-white/5 border border-dashed border-red-500/30 rounded-2xl space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
                {t.registerNegativeBehavior}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder={t.behaviorPlaceholder}
                  value={customBehaviorLabel}
                  onChange={e => setCustomBehaviorLabel(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-red-500 text-white"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 font-black uppercase">{t.penalty}</span>
                  <input
                    type="number"
                    value={customBehaviorStars}
                    onChange={e => setCustomBehaviorStars(parseInt(e.target.value) || 0)}
                    className="w-16 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs font-bold text-center outline-none text-red-400"
                  />
                  <button
                    disabled={!customBehaviorLabel}
                    onClick={() => {
                      handleDeductStars(customBehaviorStars, customBehaviorLabel);
                      setCustomBehaviorLabel('');
                      setCustomBehaviorStars(2);
                    }}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl hover:scale-105 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-40"
                  >
                    {t.apply}
                  </button>
                </div>
              </div>
            </div>

            {/* Diário de Bordo / Observações Clínicas */}
            <div className="p-8 bg-white/5 border-2 border-dashed border-primary/20 rounded-[40px] space-y-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">{t.reportLogBookTitle}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.reportLogBook}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <textarea
                  placeholder={t.reportLogBookPlaceholder}
                  value={behaviorNote}
                  onChange={e => setBehaviorNote(e.target.value)}
                  className="w-full h-40 bg-white/5 border-2 border-white/10 rounded-3xl p-6 text-sm text-white outline-none focus:border-primary transition-all resize-none font-medium leading-relaxed placeholder:text-white/20"
                />
                <div className="flex justify-end">
                  <button
                    disabled={!behaviorNote.trim()}
                    onClick={() => {
                      handleSaveNote(behaviorNote);
                      setBehaviorNote('');
                      alert(t.note_saved_success);
                    }}
                    className="px-10 py-5 bg-primary text-black rounded-2xl hover:scale-105 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-40 flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(45,212,191,0.3)]"
                  >
                    <CheckCircle2 className="w-5 h-5" /> {t.save_note}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.punishPresets.map((punish: any, i: number) => (
                <button key={i} onClick={() => handleDeductStars(punish.stars, punish.label)} className="p-4 md:p-8 bg-white/5 border border-white/10 rounded-3xl md:rounded-[40px] flex items-center justify-between hover:bg-red-500/10 hover:border-red-500 transition-all group text-left">
                  <div className="flex items-center gap-3 md:gap-4"><div className="w-10 h-10 md:w-14 md:h-14 bg-red-500/20 rounded-xl md:rounded-2xl flex items-center justify-center"><AlertCircle className="w-5 h-5 md:w-8 md:h-8 text-red-500" /></div><span className="font-black uppercase text-xs md:text-base text-white/80">{punish.label}</span></div>
                  <span className="text-lg md:text-xl font-black text-red-500">-{punish.stars}⭐</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {parentSubView === 'history' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <History className="w-8 h-8 text-white/20" /> {t.logNavigation}
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {history.map((h: any) => (
                <div key={h.id} className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-[30px] flex justify-between items-center backdrop-blur-sm group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg",
                      h.type === 'gain' ? "bg-primary/20 text-primary" : h.type === 'redeem' ? "bg-yellow-400/20 text-yellow-400" : "bg-red-500/20 text-red-500"
                    )}>
                      {h.type === 'gain' ? <Plus className="w-5 h-5 md:w-6 md:h-6" /> : h.type === 'redeem' ? <Trophy className="w-5 h-5 md:w-6 md:h-6" /> : <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />}
                    </div>
                    <div>
                      <p className="text-sm md:text-lg font-black uppercase italic text-white/80">{h.title}</p>
                      <p className="text-[8px] md:text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">{h.date}</p>
                    </div>
                  </div>
                  <span className={clsx(
                    "text-xl md:text-2xl font-black italic drop-shadow-sm",
                    h.type === 'gain' ? "text-primary" : h.type === 'redeem' ? "text-yellow-400" : "text-red-400"
                  )}>
                    {h.type === 'gain' ? `+${h.amount}` : `-${h.amount}`}⭐
                  </span>
                </div>
              ))}
              {history.length === 0 && (
                <div className="p-24 border-4 border-dashed border-white/5 rounded-[60px] text-center text-white/10 font-black uppercase italic tracking-widest text-xl">
                  {t.radarEmpty}
                </div>
              )}
            </div>
          </div>
        )}

        {parentSubView === 'reports' && (
          <div className="space-y-8">
            <ClinicalReport activeChild={activeChild} language={language} />
          </div>
        )}
      </div>
    </div>
  );
};
