import React, { useState } from 'react';
import {
  Brain,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  FileText,
} from 'lucide-react';
import type { ChildData, Task, Reward } from '@/types/desafio';
import { Language, translations } from '@/lib/translations';

interface ClinicalReportProps {
  activeChild?: ChildData | null;
  language: Language;
}

export const ClinicalReport: React.FC<ClinicalReportProps> = ({ activeChild, language }) => {
  const t = translations[language];
  const [mentorNotes, setMentorNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const handlePrint = () => window.print();

  return (
    <div className="space-y-8 clinical-report-container" style={{ background: 'transparent' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary/10 border border-primary/20 p-6 rounded-3xl backdrop-blur-md print:hidden">
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary flex items-center gap-2">
            <Brain className="w-6 h-6" /> {t.reportIntegration}
          </h2>
          <p className="text-xs text-white/60 font-medium mt-1">
            {t.reportDesc}
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-xs font-black uppercase text-white/40">{t.reportFrom}</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary"
          />
          <label className="text-xs font-black uppercase text-white/40">{t.reportTo}</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary"
          />
        </div>

        <button
          onClick={handlePrint}
          className="px-6 py-4 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2 shrink-0"
        >
          <Printer className="w-4 h-4" /> {t.reportExport}
        </button>
      </div>

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

        <div className="space-y-3 print:pt-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60 print:text-zinc-800 flex items-center gap-2">
            <FileText className="w-4 h-4" /> {t.reportLogBook}
          </h3>
          <div className="print:hidden">
            <textarea
              value={mentorNotes}
              onChange={e => setMentorNotes(e.target.value)}
              placeholder={t.reportLogPlaceholder}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="hidden print:block text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed border-l-2 border-zinc-400 pl-4 py-1">
            {mentorNotes || t.reportNoNotes}
          </div>
        </div>

        <div className="hidden print:block pt-12 border-t border-zinc-300 text-center text-[9px] text-zinc-500 uppercase tracking-widest">
          {t.reportFooter}
        </div>

      </div>
    </div>
  );
};
