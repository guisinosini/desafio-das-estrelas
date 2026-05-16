"use client";
import React, { useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
  Brain,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  FileText,
  Share2,
  ExternalLink,
  X,
  Copy
} from 'lucide-react';
import type { ChildData, Task, Reward } from '@/types/desafio';
import { Language, translations } from '@/lib/translations';

interface ClinicalReportProps {
  activeChild?: ChildData | null;
  language: Language;
}

export const ClinicalReport: React.FC<ClinicalReportProps> = ({ activeChild, language }) => {
  const t = translations[language];
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!activeChild) {
    return (
      <div className="p-12 text-center text-white/40 font-black uppercase italic tracking-widest">
        {t.radarEmpty}
      </div>
    );
  }

  const tasks = activeChild.tasks || [];
  const history = activeChild.history || [];
  const planets = activeChild.planets || [];

  const startTs = startDate ? new Date(startDate).getTime() : null;
  const endTs   = endDate   ? new Date(endDate + 'T23:59:59').getTime() : null;

  const isInRange = (isoStr: string): boolean => {
    if (!startTs && !endTs) return true;
    const dateObj = new Date(isoStr);
    const t = dateObj.getTime();
    if (startTs && t < startTs) return false;
    if (endTs   && t > endTs)   return false;
    return true;
  };

  const missionCounts: Record<string, number> = {};
  tasks.forEach(task => {
    if (task.completionLog && task.completionLog.length > 0) {
      const countInRange = task.completionLog.filter(isInRange).length;
      if (countInRange > 0) {
        missionCounts[task.title] = (missionCounts[task.title] || 0) + countInRange;
      }
    } else if (task.status === 'done' && task.lastCompleted) {
      if (isInRange(task.lastCompleted)) {
        missionCounts[task.title] = (missionCounts[task.title] || 0) + 1;
      }
    }
  });
  const missionMax = Math.max(...Object.values(missionCounts), 1);

  const totalMissionsInPeriod = Object.values(missionCounts).reduce((a, b) => a + b, 0);
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((totalMissionsInPeriod / totalTasks) * 100) : 0;

  const behaviorDeductions = history.filter(h =>
    (h.type === 'loss' || h.amount < 0) &&
    isInRange(h.date)
  );
  const totalDeductionsCount = behaviorDeductions.length;

  const punishCounts: Record<string, number> = {};
  behaviorDeductions.forEach(b => {
    punishCounts[b.title] = (punishCounts[b.title] || 0) + 1;
  });
  const punishMax = Math.max(...Object.values(punishCounts), 1);

  const getPlanetStats = (planetId: string) => {
    const planetTasks = tasks.filter(task => task.planetId === planetId);
    const completedCounts: Record<string, number> = {};
    planetTasks.forEach(task => {
      let count = 0;
      if (task.completionLog && task.completionLog.length > 0) {
        count = task.completionLog.filter(isInRange).length;
      } else if (task.status === 'done' && task.lastCompleted && isInRange(task.lastCompleted)) {
        count = 1;
      }
      if (count > 0) completedCounts[task.title] = (completedCounts[task.title] || 0) + count;
    });
    const totalCompleted = Object.values(completedCounts).reduce((a, b) => a + b, 0);
    const planetRate = planetTasks.length > 0 ? Math.round((totalCompleted / planetTasks.length) * 100) : 0;
    return { planetTasks, completedCounts, totalCompleted, planetRate };
  };

  // Cálculo da Atividade Semanal (Missões por dia) - Responsivo ao filtro de datas
  const getWeeklyData = () => {
    let chartStart: Date;
    let chartEnd: Date;

    // Determinar o intervalo do gráfico baseado nos filtros
    if (startDate && endDate) {
      chartStart = new Date(startDate + 'T12:00:00');
      chartEnd = new Date(endDate + 'T12:00:00');
    } else if (endDate) {
      chartEnd = new Date(endDate + 'T12:00:00');
      chartStart = new Date(chartEnd);
      chartStart.setDate(chartEnd.getDate() - 6);
    } else if (startDate) {
      chartStart = new Date(startDate + 'T12:00:00');
      chartEnd = new Date(chartStart);
      chartEnd.setDate(chartStart.getDate() + 6);
    } else {
      // Padrão: semana atual (Segunda a Domingo)
      const now = new Date();
      const day = now.getDay(); // 0 (Dom) a 6 (Sáb)
      const diffToMonday = day === 0 ? -6 : 1 - day;
      chartStart = new Date(now);
      chartStart.setDate(now.getDate() + diffToMonday);
      chartStart.setHours(12, 0, 0, 0);
      
      chartEnd = new Date(chartStart);
      chartEnd.setDate(chartStart.getDate() + 6);
      chartEnd.setHours(12, 0, 0, 0);
    }

    // Pré-processar contagens para evitar loops aninhados pesados
    const countsPerDate: Record<string, number> = {};
    tasks.forEach(task => {
      const logs = task.completionLog || (task.status === 'done' && task.lastCompleted ? [task.lastCompleted] : []);
      logs.forEach(log => {
        const d = log.split('T')[0];
        countsPerDate[d] = (countsPerDate[d] || 0) + 1;
      });
    });

    const days = [];
    const dayKeysMap: Record<number, keyof typeof t.reportDays> = {
      0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat'
    };
    
    const current = new Date(chartStart);
    // Limite de segurança de 31 dias para o gráfico não quebrar visualmente
    const limit = new Date(chartStart);
    limit.setDate(limit.getDate() + 31);
    const finalEnd = chartEnd < limit ? chartEnd : limit;

    while (current <= finalEnd) {
      const dateStr = current.toISOString().split('T')[0];
      const dayKey = dayKeysMap[current.getDay()];
      
      days.push({
        key: dayKey,
        label: t.reportDays[dayKey],
        dateLabel: current.getDate(),
        count: countsPerDate[dateStr] || 0
      });

      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const weeklyData = getWeeklyData();
  const maxWeekly = Math.max(...weeklyData.map(w => w.count), 1);

  const handlePrint = () => window.print();

  const handleShareReport = async () => {
    setIsGeneratingLink(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...activeChild, language })
      });
      const data = await response.json();
      if (data.url) {
        setGeneratedUrl(data.url);
      } else {
        alert(t.shareError);
      }
    } catch (error) {
      console.error(error);
      alert(t.shareError);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-8 clinical-report-container" style={{ background: 'transparent' }}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-indigo-500/10 border-2 border-indigo-500/20 p-8 rounded-[40px] backdrop-blur-2xl print:hidden shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -mr-32 -mt-32" />
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-400 flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
            {t.reportIntegration}
          </h2>
          <p className="text-xs text-white/60 font-medium mt-2 max-w-md leading-relaxed">
            {t.reportDesc}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto relative z-10">
          <div className="flex gap-2 items-center bg-black/20 p-2 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-1 px-2">
              <span className="text-[8px] font-black uppercase text-white/20">{t.reportFrom}</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-transparent border-none p-0 text-xs text-white font-bold outline-none cursor-pointer"
              />
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col gap-1 px-2">
              <span className="text-[8px] font-black uppercase text-white/20">{t.reportTo}</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-transparent border-none p-0 text-xs text-white font-bold outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 sm:flex-none px-8 py-5 bg-indigo-500 text-white font-black uppercase tracking-[0.1em] text-[10px] rounded-[24px] shadow-[0_20px_40px_-10px_rgba(99,102,241,0.4)] hover:scale-105 hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
            >
              <Share2 className="w-5 h-5" /> {t.shareReport}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-8 py-5 bg-white/10 text-white font-black uppercase tracking-[0.1em] text-[10px] rounded-[24px] border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3"
            >
              <Printer className="w-5 h-5" /> {t.reportExport}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Compartilhamento / Consentimento */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/90 backdrop-blur-xl">
          <div className="w-full max-w-md bg-[#16213e] border-2 border-indigo-500/20 rounded-[40px] shadow-2xl overflow-hidden text-white">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-indigo-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter">{t.shareConsentTitle}</h2>
              </div>
              <button 
                onClick={() => { setShowShareModal(false); setGeneratedUrl(''); }} 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {!generatedUrl ? (
                <>
                  <p className="text-white/60 text-sm leading-relaxed font-medium">
                    {t.shareConsentDesc}
                  </p>
                  <button
                    onClick={handleShareReport}
                    disabled={isGeneratingLink}
                    className="w-full py-4 bg-indigo-500 text-white font-black uppercase rounded-2xl shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isGeneratingLink ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    {t.shareConfirm}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <p className="text-green-400 text-xs font-black uppercase">{t.shareLinkGenerated}</p>
                  </div>
                  
                  <div className="relative group">
                    <input
                      readOnly
                      value={generatedUrl}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white/60 outline-none pr-12"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                    >
                      {copySuccess ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={() => window.open(generatedUrl, '_blank')}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                  >
                    <ExternalLink className="w-5 h-5" /> {t.preview}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-[40px] p-6 sm:p-10 backdrop-blur-xl print:bg-white print:text-black print:border-none print:p-0 print:shadow-none space-y-8 text-white">
        <div className="border-b border-white/10 print:border-zinc-300 pb-6 flex justify-between items-start">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary print:text-zinc-500 block">
              {t.reportTitle}
            </span>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter mt-1 print:text-black">
              {activeChild.name}
            </h1>
            <p className="text-xs text-white/40 print:text-zinc-600 font-medium mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {t.reportIssuedAt}: {new Date().toLocaleDateString(language)}
              {(startDate || endDate) && (
                <span className="ml-2">
                  | {t.reportPeriod}: {startDate || '...'} {t.reportTo.toLowerCase()} {endDate || '...'}
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-yellow-400 print:text-zinc-800 block">
              {activeChild.stars}⭐
            </span>
            <span className="text-[9px] font-bold uppercase text-white/40 print:text-zinc-500 block">
              {t.reportCurrentStars}
            </span>
            {activeChild.badges && activeChild.badges.length > 0 && (
              <span className="text-[9px] font-bold uppercase text-primary print:text-zinc-600 block mt-1">
                🏆 {activeChild.badges.length} {t.reportMedals}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-white/5 print:bg-zinc-50 border border-white/5 print:border-zinc-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 print:text-emerald-700">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">{t.reportHabitAdhesion}</span>
            </div>
            <div className="text-3xl font-black italic tracking-tighter print:text-black">
              {taskCompletionRate}%
            </div>
            <div className="w-full h-2 bg-white/10 print:bg-zinc-200 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-400 print:bg-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
            <p className="text-[10px] text-white/40 print:text-zinc-600 leading-relaxed pt-1">
              {t.reportCompletionRate}: {totalMissionsInPeriod} {t.reportMissionsConcluded} {totalTasks} {t.reportTasksConfigured}{startTs || endTs ? '' : ''}.
            </p>
          </div>

          <div className="p-6 bg-white/5 print:bg-zinc-50 border border-white/5 print:border-zinc-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-red-400 print:text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">{t.reportBehaviorFriction}</span>
            </div>
            <div className="text-3xl font-black italic tracking-tighter print:text-black">
              {totalDeductionsCount}
            </div>
            <p className="text-[10px] text-white/40 print:text-zinc-600 leading-relaxed">
              {t.behaviorNotice}
            </p>
          </div>
        </div>

        {/* Gráfico de Atividade Semanal */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60 print:text-zinc-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> {t.reportWeeklyActivity}
          </h3>
          <div className="bg-white/5 print:bg-zinc-50 border border-white/10 print:border-zinc-200 p-6 md:p-8 rounded-3xl flex items-end justify-between gap-2 h-48 sm:h-64">
            {weeklyData.map((day, idx) => {
              const height = (day.count / maxWeekly) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                  <div className="relative w-full flex flex-col items-center justify-end h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      className={clsx(
                        "w-full max-w-[32px] rounded-t-xl transition-all relative overflow-hidden",
                        day.count > 0 ? "bg-primary shadow-[0_0_20px_rgba(45,212,191,0.3)]" : "bg-white/5 print:bg-zinc-200"
                      )}
                    >
                      {day.count > 0 && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      )}
                    </motion.div>
                    {day.count > 0 && (
                      <span className="absolute -top-6 text-[10px] font-black text-primary print:text-zinc-800">
                        {day.count}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[12px] font-black text-white print:text-zinc-900 leading-none">
                      {day.dateLabel}
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-tighter text-white/40 print:text-zinc-500 leading-none">
                      {day.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> {t.reportMissionsDoneTitle}
          </h3>
          <div className="grid gap-2">
            {Object.keys(missionCounts).length === 0 ? (
              <p className="text-xs text-white/40 italic">{t.reportNoMissions}</p>
            ) : (
              Object.entries(missionCounts).map(([title, cnt]) => (
                <div key={title} className="flex items-center gap-2">
                  <span className="w-36 text-xs text-white/60 truncate">{title}</span>
                  <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(cnt / missionMax) * 100}%` }} />
                  </div>
                  <span className="text-xs text-white/80 w-8 text-right">{cnt}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary print:text-zinc-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> {t.reportPlanetEngagement}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {planets.length === 0 ? (
              <p className="text-xs text-white/40 print:text-zinc-500 italic">
                {t.reportNoPlanets}
              </p>
            ) : (
              planets.map(planet => {
                const { planetTasks, completedCounts, totalCompleted, planetRate } = getPlanetStats(planet.id);
                return (
                  <div key={planet.id} className="p-4 bg-white/5 print:bg-zinc-50 rounded-xl border border-white/5 print:border-zinc-200 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{planet.icon || '🪐'}</span>
                        <div>
                          <h4 className="text-sm font-bold print:text-black">{planet.title}</h4>
                          <p className="text-[10px] text-white/40 print:text-zinc-500">
                            {planetTasks.length} {t.reportMissionsLinked}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black print:text-zinc-700">
                          {totalCompleted} {t.reportConclusions} ({planetRate}%)
                        </span>
                        {planetRate >= 100 && planetTasks.length > 0 && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    </div>

                    {Object.keys(completedCounts).length > 0 && (
                      <ul className="list-disc list-inside text-xs text-white/60 print:text-zinc-600">
                        {Object.entries(completedCounts).map(([title, cnt]) => (
                          <li key={title}>{title}: {cnt} {t.reportConclusions.split('(')[0].trim()}</li>
                        ))}
                      </ul>
                    )}

                    <div className="w-full h-1.5 bg-white/5 print:bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(planetRate, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-400 print:text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {t.reportPunishmentsTitle}
          </h3>
          <div className="grid gap-2">
            {Object.keys(punishCounts).length === 0 ? (
              <p className="text-xs text-white/40 italic">{t.reportNoPunishments}</p>
            ) : (
              Object.entries(punishCounts).map(([label, cnt]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-36 text-xs text-white/60 truncate">{label}</span>
                  <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${(cnt / punishMax) * 100}%` }} />
                  </div>
                  <span className="text-xs text-white/80 w-8 text-right">{cnt}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {behaviorDeductions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-400 print:text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {t.reportBehaviorDetail}
            </h3>
            <div className="space-y-2">
              {behaviorDeductions.slice(0, 5).map((item, idx) => (
                <div key={idx} className="p-3 bg-red-500/5 print:bg-white print:border-b print:border-zinc-200 rounded-lg flex justify-between items-center text-xs">
                  <span className="font-bold text-white/80 print:text-zinc-800">{item.title}</span>
                  <span className="text-[10px] text-white/40 print:text-zinc-500">{new Date(item.date).toLocaleDateString(language)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diário de Bordo (Notas Salvas no Histórico) */}
        <div className="space-y-4 print:pt-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60 print:text-zinc-800 flex items-center gap-2">
            <FileText className="w-4 h-4" /> {t.reportLogBook}
          </h3>
          
          <div className="space-y-4">
            {history.filter(h => h.type === 'note' && isInRange(h.date)).length === 0 ? (
              <p className="text-xs text-white/40 print:text-zinc-500 italic">
                {t.reportNoNotes}
              </p>
            ) : (
              history
                .filter(h => h.type === 'note' && isInRange(h.date))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((note, idx) => (
                  <div key={idx} className="p-4 bg-white/5 print:bg-zinc-50 border border-white/10 print:border-zinc-200 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {new Date(note.date).toLocaleDateString(language, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                      <span className="text-[8px] font-bold text-white/20 print:text-zinc-400 uppercase">
                        {t.observation_record}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 print:text-zinc-800 font-medium leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="hidden print:block pt-12 border-t border-zinc-300 text-center text-[9px] text-zinc-500 uppercase tracking-widest">
          {t.reportFooter}
        </div>

      </div>
    </div>
  );
};
