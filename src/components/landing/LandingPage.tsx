import React from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Target, 
  Star, 
  Trophy, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  FileText, 
  ArrowRight,
  Globe,
  ChevronDown,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Language, translations } from '../../lib/translations';

interface LandingPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ language, onLanguageChange, onStart }) => {
  const t = translations[language];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
    { code: 'pt-PT', label: 'Português (PT)', flag: '🇵🇹' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: 'es' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'zh', label: 'Mandarin', flag: '🇨🇳' },
  ];

  return (
    <div className="bg-[#0f172a] text-white font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 p-4 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" />
          <span className="font-black italic uppercase tracking-tighter text-xl">
            Desafio das <span className="text-primary">Estrelas</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-white/10 transition-all">
              {languages.find(l => l.code === language)?.flag} <ChevronDown className="w-4 h-4 opacity-40" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left text-sm font-medium border-b border-white/5 last:border-0"
                >
                  <span className="text-lg">{lang.flag}</span> {lang.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onStart} className="hidden md:block bg-primary text-black px-6 py-2 rounded-full font-black uppercase text-xs hover:scale-105 transition-all shadow-lg shadow-primary/20">
            {t.lp_cta_start}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3" /> Metodologia Comprovada
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
              {t.lp_hero_title}
            </h1>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl">
              {t.lp_hero_sub}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={onStart} className="px-10 py-5 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-3">
                {t.lp_cta_start} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="/images/hero.png" 
                alt="Herói Estelar"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 bg-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="rounded-[40px] overflow-hidden border border-white/10 shadow-2xl grayscale-[0.5] hover:grayscale-0 transition-all duration-700">
              <img 
                src="/images/pain.png" 
                alt="Desafios Diários"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
              {t.lp_pain_title}
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              {t.lp_pain_desc}
            </p>
            <ul className="space-y-4">
              {[
                "Acordos não cumpridos",
                "Falta de colaboração nas tarefas domésticas",
                "Dificuldade em lidar com o 'não'",
                "Desorganização constante"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/80 font-bold">
                  <div className="w-2 h-2 rounded-full bg-red-500" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Target className="w-16 h-16 text-primary mx-auto mb-8" />
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-tight">
            {t.lp_method_title}
          </h2>
          <p className="text-xl text-white/60 leading-relaxed">
            {t.lp_method_desc}
          </p>
        </div>

        <div className="max-w-7xl mx-auto mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Globe, title: t.lp_feat_objectives, desc: t.lp_feat_objectives_desc },
            { icon: Rocket, title: t.lp_feat_missions, desc: t.lp_feat_missions_desc },
            { icon: Star, title: t.lp_feat_rewards, desc: t.lp_feat_rewards_desc },
            { icon: FileText, title: t.lp_feat_reports, desc: t.lp_feat_reports_desc }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white/10 transition-all group"
            >
              <feat.icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black uppercase italic mb-4">{feat.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mentor Panel */}
      <section className="py-20 bg-primary/5 border-y border-primary/10">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
              {t.lp_mentor_title}
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              {t.lp_mentor_desc}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <ShieldCheck className="w-6 h-6 text-primary mb-2" />
                <p className="text-xs font-black uppercase tracking-widest text-white/40">Limite Seguro</p>
                <p className="text-sm font-bold">Gestão de Comportamento</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <TrendingUp className="w-6 h-6 text-primary mb-2" />
                <p className="text-xs font-black uppercase tracking-widest text-white/40">Visão Clínica</p>
                <p className="text-sm font-bold">Progresso Histórico</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1e293b] rounded-[40px] p-2 border border-white/10 shadow-2xl">
            <div className="bg-[#0f172a] rounded-[32px] p-8 aspect-video flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                <div className="relative z-10 text-center">
                    <Users className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-white/20 italic">Dashboard do Mentor</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              {t.lp_price_title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly */}
            <div className="p-10 bg-white/5 border border-white/10 rounded-[40px] space-y-8 flex flex-col">
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic">{t.lp_plan_monthly}</h3>
                <p className="text-white/40 text-sm">Ideal para testar a órbita.</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black italic tracking-tighter">R$ 29</span>
                <span className="text-xl text-white/40">/mês</span>
              </div>
              <ul className="space-y-4 flex-1">
                {[
                  "1 Herói Ativo",
                  "Mundo de Recompensas",
                  "Dashboard do Mentor",
                  "Suporte via Email"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> {item}
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className="w-full py-4 bg-white/10 rounded-2xl font-black uppercase text-xs hover:bg-white/20 transition-all">
                {t.lp_subscribe}
              </button>
            </div>

            {/* Annual */}
            <div className="p-10 bg-primary/10 border-2 border-primary rounded-[40px] space-y-8 relative overflow-hidden flex flex-col">
              <div className="absolute top-6 right-6 bg-primary text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {t.lp_save_30}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic">{t.lp_plan_annual}</h3>
                <p className="text-primary/60 text-sm">A jornada completa para a família.</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black italic tracking-tighter text-primary">R$ 249</span>
                <span className="text-xl text-primary/40">/ano</span>
              </div>
              <ul className="space-y-4 flex-1">
                {[
                  "Até 3 Heróis Ativos",
                  "Relatórios Clínicos Ilimitados",
                  "Selo Comandante Fundador",
                  "Suporte Prioritário 24/7",
                  "Acesso a Novos Planetas VIP"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> {item}
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className="w-full py-4 bg-primary text-black rounded-2xl font-black uppercase text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20">
                {t.lp_subscribe}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            <span className="font-black italic uppercase tracking-tighter text-sm">
              Desafio das <span className="text-primary">Estrelas</span>
            </span>
          </div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">
            © 2026 Instituto Kamaleon • Todos os direitos reservados
          </p>
          <div className="flex gap-6 text-white/40">
            <Globe className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <Users className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
};
