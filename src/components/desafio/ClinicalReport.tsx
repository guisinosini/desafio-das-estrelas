"use client";
import React, { useState, useMemo } from 'react';
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
  Copy,
  ShieldCheck,
  MessageCircle,
  Linkedin,
  Facebook,
  Twitter,
  Send,
  Mail,
  Heart,
  Instagram
} from 'lucide-react';
import type { ChildData, Task, Reward } from '@/types/desafio';
import { Language, translations } from '@/lib/translations';

interface ClinicalReportProps {
  activeChild?: ChildData | null;
  language: Language;
  isSharedView?: boolean;
}

export const ClinicalReport: React.FC<ClinicalReportProps> = ({ activeChild, language, isSharedView = false }) => {
  const t = translations[language];
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyReferralSuccess, setCopyReferralSuccess] = useState(false);

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

  const isInRange = useMemo(() => {
    return (isoStr: string): boolean => {
      if (!startTs && !endTs) return true;
      const dateObj = new Date(isoStr);
      const tVal = dateObj.getTime();
      if (startTs && tVal < startTs) return false;
      if (endTs   && tVal > endTs)   return false;
      return true;
    };
  }, [startTs, endTs]);

  const {
    missionCounts,
    missionMax,
    totalMissionsInPeriod,
    totalTasks,
    taskCompletionRate,
    behaviorDeductions,
    totalDeductionsCount,
    punishCounts,
    punishMax
  } = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(task => {
      if (task.completionLog && task.completionLog.length > 0) {
        const countInRange = task.completionLog.filter(isInRange).length;
        if (countInRange > 0) {
          counts[task.title] = (counts[task.title] || 0) + countInRange;
        }
      } else if (task.status === 'done' && task.lastCompleted) {
        if (isInRange(task.lastCompleted)) {
          counts[task.title] = (counts[task.title] || 0) + 1;
        }
      }
    });
    const maxVal = Math.max(...Object.values(counts), 1);
    const totalMissions = Object.values(counts).reduce((a, b) => a + b, 0);
    const totalTks = tasks.length;
    const rate = totalTks > 0 ? Math.round((totalMissions / totalTks) * 100) : 0;

    const deductions = history.filter(h =>
      (h.type === 'loss' || h.amount < 0) && isInRange(h.date)
    );
    const deductionsCount = deductions.length;

    const punishes: Record<string, number> = {};
    deductions.forEach(b => {
      punishes[b.title] = (punishes[b.title] || 0) + 1;
    });
    const punishesMax = Math.max(...Object.values(punishes), 1);

    return {
      missionCounts: counts,
      missionMax: maxVal,
      totalMissionsInPeriod: totalMissions,
      totalTasks: totalTks,
      taskCompletionRate: rate,
      behaviorDeductions: deductions,
      totalDeductionsCount: deductionsCount,
      punishCounts: punishes,
      punishMax: punishesMax
    };
  }, [tasks, history, isInRange]);

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

  const weeklyData = useMemo(() => {
    let chartStart: Date;
    let chartEnd: Date;

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
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      chartStart = new Date(now);
      chartStart.setDate(now.getDate() + diffToMonday);
      chartStart.setHours(12, 0, 0, 0);
      
      chartEnd = new Date(chartStart);
      chartEnd.setDate(chartStart.getDate() + 6);
      chartEnd.setHours(12, 0, 0, 0);
    }

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
  }, [tasks, startDate, endDate, t.reportDays]);

  const maxWeekly = useMemo(() => {
    return Math.max(...weeklyData.map(w => w.count), 1);
  }, [weeklyData]);

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
      {/* BANNER DE BOAS-VINDAS E APRESENTAÇÃO PARA O PROFISSIONAL */}
      {isSharedView && (
        <div className="bg-gradient-to-r from-indigo-950/70 to-purple-950/70 border-2 border-indigo-500/20 p-6 md:p-8 rounded-[40px] backdrop-blur-2xl shadow-2xl relative overflow-hidden group print:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full -ml-32 -mb-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-400 shrink-0">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-indigo-300">
                    {t.reportWelcomePro}
                  </h2>
                  <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
                    {t.reportPortalTitle}
                  </p>
                </div>
              </div>
              
              <p className="text-xs md:text-sm text-white/70 leading-relaxed font-medium">
                {t.reportWelcomeDesc} <a href="https://www.instagram.com/desafioestrelasapp/" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 font-bold hover:underline inline-flex items-center gap-0.5">@desafioestrelasapp</a>.
              </p>

              {/* Disclaimer do Diagnóstico */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                    {t.reportWarningTitle}
                  </span>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed font-medium">
                    {t.reportWarningDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Ação de Indicar o App */}
            <div className="w-full md:w-auto shrink-0 flex flex-col items-center bg-white/5 border border-white/10 p-6 rounded-3xl text-center space-y-4 md:max-w-[280px]">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
                <Heart className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-white">{t.reportRecommendApp}</h4>
                <p className="text-[10px] text-white/40 leading-normal font-medium">
                  {t.reportRecommendDesc}
                </p>
              </div>
              <button
                onClick={() => setShowReferralModal(true)}
                className="w-full py-3.5 px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-[0.1em] text-[10px] rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> {t.reportRecommendBtn}
              </button>
            </div>
          </div>
        </div>
      )}
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

          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 sm:flex-none px-4 py-3 bg-indigo-500 text-white font-black uppercase tracking-[0.05em] text-[10px] rounded-[16px] shadow-[0_10px_20px_-10px_rgba(99,102,241,0.4)] hover:scale-105 hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> {t.shareReport}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-3 bg-white/10 text-white font-black uppercase tracking-[0.05em] text-[10px] rounded-[16px] border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> {t.reportExport}
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

      {/* Modal de Indicação com Redes Sociais */}
      {showReferralModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/90 backdrop-blur-xl">
          <div className="w-full max-w-lg bg-[#16213e] border-2 border-indigo-500/20 rounded-[40px] shadow-2xl overflow-hidden text-white relative">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-indigo-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter">{t.reportReferralTitle}</h2>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none mt-1">{t.reportReferralSub}</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowReferralModal(false); setCopyReferralSuccess(false); }} 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-white/60 text-xs md:text-sm leading-relaxed font-medium">
                {t.reportReferralDesc}
              </p>

              {/* Botões de Redes Sociais */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    "Olá! Gostaria de recomendar o Desafio das Estrelas (https://www.desafioestrelas.com), uma ferramenta maravilhosa de gamificação galáctica e neurociência que auxilia pais e mentores no desenvolvimento de comportamentos positivos, rotinas saudáveis e treino cognitivo infantil de forma muito afetiva. Vale muito a pena conhecer!"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:scale-[1.03] transition-all text-xs font-black uppercase tracking-wider text-emerald-400"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" /> WhatsApp
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.desafioestrelas.com')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 hover:scale-[1.03] transition-all text-xs font-black uppercase tracking-wider text-sky-400"
                >
                  <Linkedin className="w-4 h-4 shrink-0" /> LinkedIn
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent('https://www.desafioestrelas.com')}&text=${encodeURIComponent(
                    "Recomendo o Desafio das Estrelas: Um aplicativo incrível de gamificação que ajuda no desenvolvimento de rotinas infantis de forma positiva e gamificada!"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:scale-[1.03] transition-all text-xs font-black uppercase tracking-wider text-blue-400"
                >
                  <Send className="w-4 h-4 shrink-0" /> Telegram
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.desafioestrelas.com')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:scale-[1.03] transition-all text-xs font-black uppercase tracking-wider text-indigo-400"
                >
                  <Facebook className="w-4 h-4 shrink-0" /> Facebook
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    "Recomendo o Desafio das Estrelas, uma ferramenta incrível de gamificação e rotinas para apoiar no desenvolvimento de crianças através de reforço positivo! https://www.desafioestrelas.com"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:scale-[1.03] transition-all text-xs font-black uppercase tracking-wider text-white"
                >
                  <Twitter className="w-4 h-4 shrink-0" /> Twitter / X
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent('Recomendação: Desafio das Estrelas')}&body=${encodeURIComponent(
                    "Olá!\n\nGostaria de recomendar o Desafio das Estrelas (https://www.desafioestrelas.com), um aplicativo incrível de gamificação galáctica e neurociência cognitiva para auxiliar no desenvolvimento infantil, ajudando pais e mentores a fortalecerem rotinas, hábitos e habilidades socioemocionais através do reforço positivo.\n\nTenho certeza de que será de grande valor!\n\nAbraços."
                  )}`}
                  className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:scale-[1.03] transition-all text-xs font-black uppercase tracking-wider text-rose-400"
                >
                  <Mail className="w-4 h-4 shrink-0" /> E-mail
                </a>
              </div>

              {/* Mensagem Formatada Pronta para Copiar */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">{t.reportReferralTextLabel}</span>
                <div className="relative">
                  <textarea
                    readOnly
                    value="Olá! Gostaria de recomendar o Desafio das Estrelas (https://www.desafioestrelas.com), uma ferramenta maravilhosa de gamificação galáctica e neurociência que auxilia pais e mentores no desenvolvimento de comportamentos positivos, rotinas saudáveis e treino cognitivo infantil de forma muito afetiva. Vale muito a pena conhecer!"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white/70 outline-none h-24 resize-none pr-12 leading-relaxed"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "Olá! Gostaria de recomendar o Desafio das Estrelas (https://www.desafioestrelas.com), uma ferramenta maravilhosa de gamificação galáctica e neurociência que auxilia pais e mentores no desenvolvimento de comportamentos positivos, rotinas saudáveis e treino cognitivo infantil de forma muito afetiva. Vale muito a pena conhecer!"
                      );
                      setCopyReferralSuccess(true);
                      setTimeout(() => setCopyReferralSuccess(false), 2000);
                    }}
                    className="absolute right-3 top-3 p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                  >
                    {copyReferralSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
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
            <h1 className="text-3xl font-black uppercase italic tracking-tighter mt-1 print:text-black flex flex-wrap items-center gap-3">
              <span>{activeChild.name}</span>
              {(activeChild.age || activeChild.schoolGrade) && (
                <span className="text-[11px] font-bold not-italic tracking-normal text-white/50 print:text-zinc-500 bg-white/5 print:bg-zinc-100 border border-white/10 print:border-zinc-200 px-3 py-1 rounded-full flex items-center gap-2 mt-1 sm:mt-0">
                  {activeChild.age && <span>{activeChild.age} {language === 'en' ? 'years old' : (language === 'es' ? 'años' : 'anos')}</span>}
                  {activeChild.age && activeChild.schoolGrade && <span className="w-1 h-1 rounded-full bg-white/30 print:bg-zinc-400" />}
                  {activeChild.schoolGrade && <span>{activeChild.schoolGrade}</span>}
                </span>
              )}
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

        {/* Desempenho no Laboratório de Treino Cognitivo */}
        {(() => {
          const cognitiveSessions = history.filter(
            h => h.type === 'gain' && (h.title?.startsWith('Treino:') || h.playTime !== undefined) && isInRange(h.date)
          );
          if (cognitiveSessions.length === 0) return null;
          return (
            <div className="space-y-4 print:pt-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 print:text-indigo-800 flex items-center gap-2">
                <Brain className="w-4 h-4" /> {t.reportCognitiveTitle}
              </h3>
              
              <div className="w-full overflow-x-auto border border-white/10 print:border-zinc-200 rounded-2xl bg-white/5 print:bg-white">
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/10 print:border-zinc-200 bg-white/5 print:bg-zinc-50 text-[10px] font-black uppercase tracking-wider text-white/40 print:text-zinc-500">
                      <th className="p-3">{t.reportDate}</th>
                      <th className="p-3">{t.reportTraining}</th>
                      <th className="p-3">{t.reportPlayTime}</th>
                      <th className="p-3 text-right">{t.reportEfficacy}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 print:divide-zinc-100">
                    {cognitiveSessions.map((session, idx) => {
                      const durationText = session.playTime 
                        ? session.playTime < 60 
                          ? `${session.playTime}s` 
                          : `${Math.floor(session.playTime / 60)}m ${session.playTime % 60}s`
                        : 'N/A';
                      return (
                        <tr key={idx} className="hover:bg-white/5 print:hover:bg-transparent">
                          <td className="p-3 text-white/60 print:text-zinc-500">
                            {new Date(session.date).toLocaleDateString(language)}
                          </td>
                          <td className="p-3 font-bold text-white/80 print:text-zinc-800">
                            {session.title.replace('Treino: ', '')}
                          </td>
                          <td className="p-3 font-medium text-white/60 print:text-zinc-600">
                            {durationText}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-400 print:text-emerald-700">
                            {session.scoreText || 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

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

        {/* Rodapé Científico de Responsabilidade Técnica e Marca Registrada */}
        <div className="pt-12 mt-12 border-t border-white/10 print:border-zinc-300 text-center space-y-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 print:text-zinc-500 leading-relaxed">
              © 2026 DESAFIO DAS ESTRELAS. TODOS OS DIREITOS RESERVADOS. <span className="text-primary print:text-zinc-700 font-black">MARCA REGISTRADA</span>.
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-emerald-400 print:text-emerald-700 bg-emerald-500/5 print:bg-zinc-100 px-4 py-1.5 rounded-lg border border-emerald-500/10 print:border-zinc-300 w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-600 shrink-0" />
                <span>Responsável Técnico: Guilherme Carvalho Sinosini – CRP 06/181084</span>
              </div>
              
              <a
                href="https://www.instagram.com/desafioestrelasapp/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-pink-400 hover:text-pink-300 bg-pink-500/5 px-4 py-1.5 rounded-lg border border-pink-500/10 w-fit transition-all hover:scale-105 print:hidden"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>Siga-nos: @desafioestrelasapp</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
