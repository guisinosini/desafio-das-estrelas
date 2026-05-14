import React from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Target, 
  Star, 
  Trophy, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Zap,
  MousePointer2,
  Lock,
  Sparkles,
  LayoutDashboard,
  X,
  Globe,
  Clock,
  Users,
  Brain
} from 'lucide-react';
import { Language, translations } from '../../lib/translations';
import { StarField } from '../desafio/HeroElements';

interface LandingPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStart: () => void;
}

const FadeInWhenVisible = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    style={{ position: 'relative', zIndex: 20 }}
  >
    {children}
  </motion.div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ language, onLanguageChange, onStart }) => {
  const t = translations[language];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'pt-BR', label: 'BR', flag: '🇧🇷' },
    { code: 'pt-PT', label: 'PT', flag: '🇵🇹' },
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'it', label: 'IT', flag: '🇮🇹' },
    { code: 'zh', label: 'ZH', flag: '🇨🇳' },
  ];

  return (
    <div className="bg-[#020617] text-white font-sans selection:bg-primary/20 overflow-x-hidden relative">
      <StarField />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 p-4 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
            <Rocket className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <span className="font-black italic uppercase tracking-tighter text-lg md:text-xl hidden xs:block">
            Desafio das <span className="text-primary">Estrelas</span>
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative group">
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 md:px-4 py-2 rounded-full text-[10px] md:text-sm font-bold hover:bg-white/10 transition-all">
              {languages.find(l => l.code === language)?.flag} <span className="hidden sm:inline">{languages.find(l => l.code === language)?.label}</span> <ChevronDown className="w-3 h-3 md:w-4 md:h-4 opacity-40" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[110]">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 hover:text-primary transition-colors text-left text-[11px] md:text-sm font-bold border-b border-white/5 last:border-0"
                >
                  <span className="text-lg">{lang.flag}</span> {lang.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onStart} className="bg-primary text-black px-4 md:px-8 py-2 md:py-2.5 rounded-full font-black uppercase text-[10px] md:text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30">
            {t.login}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-12 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 w-full">
          <div className="space-y-6 md:space-y-10 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-[11px] font-black uppercase tracking-widest"
            >
              <Zap className="w-3.5 h-3.5 fill-primary" /> {t.lp_alliance_sub}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30"
            >
              {t.lp_hero_title}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl lg:text-2xl text-white/50 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              {t.lp_hero_sub}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button onClick={onStart} className="px-8 md:px-12 py-4 md:py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl md:rounded-[32px] shadow-[0_15px_45px_-10px_rgba(45,212,191,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 md:gap-4 text-base md:text-lg">
                {t.lp_cta_start} <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </motion.div>
          </div>

          <div className="relative h-[300px] sm:h-[450px] lg:h-[700px] flex items-center justify-center mt-8 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="relative w-full max-w-[450px] aspect-square lg:aspect-[4/5]"
            >
              <div className="absolute -inset-10 md:-inset-20 bg-primary/20 blur-[80px] md:blur-[150px] rounded-full animate-pulse" />
              <div className="relative h-full rounded-3xl md:rounded-[48px] overflow-hidden border border-white/10 shadow-2xl bg-[#0f172a]">
                <img 
                  src="/images/hero.png" 
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=1200" }}
                  alt="Herói Estelar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 p-4 md:p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl">
                    <div className="flex items-center gap-3 mb-1 md:mb-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-ping" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary">Missão Ativa</span>
                    </div>
                    <p className="font-black italic uppercase text-sm md:text-lg tracking-tighter">Explorar Planeta do Foco</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 text-white/20 flex flex-col items-center gap-2"
        >
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">Scroll</span>
          <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
        </motion.div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 md:py-32 bg-white/[0.02] relative border-y border-white/5 z-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <FadeInWhenVisible>
            <div className="relative group">
              <div className="relative rounded-3xl md:rounded-[56px] overflow-hidden border border-white/10 shadow-2xl grayscale-[0.3] hover:grayscale-0 transition-all duration-1000">
                <img 
                  src="/images/pain.png" 
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200" }}
                  alt="Desafios Diários"
                  className="w-full h-full object-cover aspect-video lg:aspect-square"
                />
              </div>
            </div>
          </FadeInWhenVisible>
          
          <div className="space-y-8 md:space-y-12">
            <FadeInWhenVisible>
                <div className="space-y-4 md:space-y-6">
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                        {t.lp_pain_title}
                    </h2>
                    <p className="text-lg md:text-xl lg:text-2xl text-white/40 leading-relaxed">
                        {t.lp_pain_desc}
                    </p>
                </div>
            </FadeInWhenVisible>

            <div className="grid gap-4 md:gap-6">
              {[
                { text: "Acordos e combinados desrespeitados", icon: X },
                { text: "Falta de motivação para tarefas escolares", icon: X },
                { text: "Dificuldade em gerenciar telas e tempo", icon: X },
                { text: "Atritos constantes na rotina familiar", icon: X }
              ].map((item, i) => (
                <FadeInWhenVisible key={i} delay={i * 0.1}>
                  <div className="flex items-center gap-4 p-4 md:p-5 bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl hover:bg-red-500/5 hover:border-red-500/20 transition-all group">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <item.icon className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                    </div>
                    <span className="text-sm md:text-lg font-bold text-white/70">{item.text}</span>
                  </div>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Method / How it Works */}
      <section className="py-20 md:py-32 px-6 relative z-20">
        <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-10 mb-16 md:mb-32">
          <FadeInWhenVisible>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/20 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-10 border border-primary/30 rotate-12">
                <Target className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] mb-4 md:mb-8">
                {t.lp_method_title}
            </h2>
            <p className="text-lg md:text-xl lg:text-3xl text-white/40 leading-relaxed max-w-3xl mx-auto">
                {t.lp_method_desc}
            </p>
          </FadeInWhenVisible>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 relative">
            {[
                { step: "01", title: t.lp_feat_objectives, desc: t.lp_feat_objectives_desc, icon: Globe },
                { step: "02", title: t.lp_feat_missions, desc: t.lp_feat_missions_desc, icon: Rocket },
                { step: "03", title: t.lp_feat_rewards, desc: t.lp_feat_rewards_desc, icon: Star }
            ].map((item, i) => (
                <FadeInWhenVisible key={i} delay={i * 0.2}>
                    <div className="relative p-8 md:p-10 bg-[#0f172a] border border-white/10 rounded-3xl md:rounded-[48px] hover:border-primary/50 transition-all group overflow-hidden h-full">
                        <div className="absolute -top-4 -right-4 text-7xl md:text-9xl font-black italic text-white/[0.02] group-hover:text-primary/[0.05] transition-colors">{item.step}</div>
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 border border-primary/20">
                            <item.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black uppercase italic mb-3 md:mb-4 tracking-tighter">{item.title}</h3>
                        <p className="text-sm md:text-lg text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                </FadeInWhenVisible>
            ))}
        </div>
      </section>

      {/* Journey Ecosystem Section */}
      <section className="py-20 md:py-32 px-6 relative bg-[#020617] z-20">
        <div className="max-w-7xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-16 md:mb-24 space-y-3 md:space-y-4">
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                O Ecossistema da <span className="text-primary">Jornada</span>
              </h2>
              <p className="text-sm md:text-xl text-white/40 font-bold uppercase tracking-widest">Entenda como a ciência e o jogo se unem</p>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FadeInWhenVisible delay={0.1}>
              <div className="p-8 md:p-10 bg-white/[0.03] border border-white/10 rounded-3xl md:rounded-[48px] h-full flex flex-col space-y-4 md:space-y-6 hover:border-primary/30 transition-all">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-yellow-500/20">
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">{t.lp_token_title}</h3>
                <p className="text-sm md:text-base text-white/50 leading-relaxed">{t.lp_token_desc}</p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <div className="p-8 md:p-10 bg-white/[0.03] border border-white/10 rounded-3xl md:rounded-[48px] h-full flex flex-col space-y-4 md:space-y-6 hover:border-primary/30 transition-all">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">{t.lp_missions_types_title}</h3>
                <p className="text-sm md:text-base text-white/50 leading-relaxed">{t.lp_missions_types_desc}</p>
                <div className="flex flex-wrap gap-2 pt-2 md:pt-4">
                  {['Diárias', 'Semanais', 'Mensais'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40">{tag}</span>
                  ))}
                </div>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.3}>
              <div className="p-8 md:p-10 bg-white/[0.03] border border-white/10 rounded-3xl md:rounded-[48px] h-full flex flex-col space-y-4 md:space-y-6 hover:border-primary/30 transition-all">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-purple-500/20">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">{t.lp_feat_medals}</h3>
                <p className="text-sm md:text-base text-white/50 leading-relaxed">{t.lp_feat_medals_desc}</p>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* Mentor Dashboard Highlight */}
      <section className="py-20 md:py-32 px-6 bg-primary/5 border-y border-primary/10 overflow-hidden relative z-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-8 md:space-y-12">
            <FadeInWhenVisible>
                <div className="space-y-4 md:space-y-6">
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                        {t.lp_mentor_title}
                    </h2>
                    <p className="text-lg md:text-xl lg:text-2xl text-white/50 leading-relaxed">
                        {t.lp_mentor_desc}
                    </p>
                </div>
            </FadeInWhenVisible>

            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              {[
                { icon: ShieldCheck, title: "Gestão de Limites", desc: "Sinalize atritos e deduza estrelas de forma educativa." },
                { icon: FileText, title: t.lp_feat_reports, desc: t.lp_feat_reports_desc },
                { icon: LayoutDashboard, title: "Visão 360°", desc: "Acompanhe o progresso de múltiplos heróis em um só lugar." },
                { icon: TrendingUp, title: "Análise de Dados", desc: "Gráficos de evolução para acompanhamento profissional." }
              ].map((item, i) => (
                <FadeInWhenVisible key={i} delay={i * 0.1}>
                  <div className="space-y-2 md:space-y-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center border border-primary/30">
                        <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <h4 className="font-black uppercase italic text-[11px] md:text-sm">{item.title}</h4>
                    <p className="text-[10px] md:text-xs text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>

          <FadeInWhenVisible delay={0.3}>
            <div className="relative mt-8 lg:mt-0">
                <div className="absolute -inset-6 md:-inset-10 bg-primary/30 blur-[60px] md:blur-[120px] rounded-full opacity-30 animate-pulse" />
                <div className="bg-[#1e293b] rounded-3xl md:rounded-[48px] p-2 md:p-4 border border-white/10 shadow-2xl overflow-hidden">
                    <div className="bg-[#020617] rounded-2xl md:rounded-[36px] aspect-video lg:aspect-[4/3] relative overflow-hidden flex items-center justify-center">
                        <img 
                          src="/images/dashboard.PNG" 
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" }}
                          alt="Mentor Dashboard"
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                        <motion.div 
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute bottom-4 md:bottom-10 left-4 md:left-10 p-3 md:p-6 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl max-w-[200px] md:max-w-none"
                        >
                            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-ping" />
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary">Live Data</span>
                            </div>
                            <p className="font-black italic uppercase text-[10px] md:text-sm tracking-tighter">Sincronização Ativa</p>
                        </motion.div>
                    </div>
                </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Galactic Alliance Section */}
      <section className="py-20 md:py-32 px-6 relative overflow-hidden z-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeInWhenVisible>
            <div className="space-y-6 md:space-y-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                <Users className="w-3 h-3 md:w-3.5 md:h-3.5" /> {t.lp_alliance_sub}
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                {t.lp_alliance_title}
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-white/50 leading-relaxed">
                {t.lp_alliance_desc}
              </p>
              <div className="space-y-3 md:space-y-4 max-w-md mx-auto lg:mx-0">
                {[t.lp_alliance_feat1, t.lp_alliance_feat2, t.lp_alliance_feat3].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    <span className="font-bold text-white/80 text-sm md:text-base">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.2}>
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute -inset-10 bg-purple-500/20 blur-[100px] rounded-full opacity-30" />
              <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl md:rounded-[56px] p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="space-y-4 md:space-y-6">
                  <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-white/5">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40">{t.allianceRanking}</span>
                    <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                  </div>
                  {[
                    { name: "Leo (Você)", stars: 1250, color: "text-primary" },
                    { name: "Dudu (Primo)", stars: 1100, color: "text-white/60" },
                    { name: "Bia (Amiga)", stars: 950, color: "text-white/60" }
                  ].map((player, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3 md:gap-4">
                        <span className="text-base md:text-lg font-black italic text-white/20">0{i+1}</span>
                        <span className={`font-bold text-sm md:text-base ${player.color}`}>{player.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-black tracking-tighter text-sm md:text-base">{player.stars}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Clinical Bridge Section */}
      <section className="py-20 md:py-32 px-6 bg-white/[0.01] border-y border-white/5 relative overflow-hidden z-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeInWhenVisible>
            <div className="relative group rounded-3xl md:rounded-[56px] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" 
                alt="Profissional de Saúde"
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-4 md:top-8 left-4 md:left-8 p-4 md:p-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl max-w-[150px] md:max-w-none">
                <FileText className="w-6 h-6 md:w-8 md:h-8 text-primary mb-1 md:mb-2" />
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Relatórios Clínicos</p>
                <p className="text-sm md:text-lg font-bold italic leading-tight">Baseados em Dados Reais</p>
              </div>
            </div>
          </FadeInWhenVisible>

          <div className="space-y-8 md:space-y-10 text-center lg:text-left">
            <FadeInWhenVisible delay={0.2}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                <Brain className="w-3 h-3 md:w-3.5 md:h-3.5" /> {t.lp_pro_sub}
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                {t.lp_pro_title}
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-white/50 leading-relaxed">
                {t.lp_pro_desc}
              </p>
              <div className="grid gap-4 md:gap-6 max-w-md mx-auto lg:mx-0">
                {[t.lp_pro_feat1, t.lp_pro_feat2, t.lp_pro_feat3].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 md:gap-4 group justify-center lg:justify-start text-left">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary/20 transition-all shrink-0">
                      <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <span className="text-sm md:text-lg font-bold text-white/80 leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 md:py-40 px-6 relative z-20" id="pricing">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-24 space-y-4">
            <FadeInWhenVisible>
                <h2 className="text-4xl md:text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.9]">
                    {t.lp_price_title}
                </h2>
                <p className="text-sm md:text-xl text-white/40 uppercase tracking-widest font-black">Investimento na educação do futuro</p>
            </FadeInWhenVisible>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-10 max-w-5xl mx-auto">
            {/* Monthly */}
            <FadeInWhenVisible>
                <div className="group relative p-8 md:p-12 bg-white/[0.03] border border-white/10 rounded-3xl md:rounded-[56px] hover:bg-white/[0.06] transition-all h-full flex flex-col">
                <div className="space-y-4 mb-8 md:mb-10">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10">
                        <MousePointer2 className="w-6 h-6 md:w-7 md:h-7 text-white/40" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">{t.lp_plan_monthly}</h3>
                    <p className="text-white/40 text-xs md:text-sm font-medium">Ideal para começar a jornada e ver os primeiros resultados.</p>
                </div>
                
                <div className="flex items-baseline gap-2 mb-8 md:mb-12">
                    <span className="text-5xl md:text-6xl font-black italic tracking-tighter">R$ 29</span>
                    <span className="text-xl md:text-2xl text-white/30 uppercase font-black tracking-tighter">/mês</span>
                </div>

                <div className="space-y-4 md:space-y-5 flex-1 mb-8 md:mb-12">
                    {[
                    "1 Perfil de Herói Ativo",
                    "Acesso a todos os Planetas",
                    "Dashboard do Mentor Básico",
                    "Suporte via E-mail"
                    ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 md:gap-4 text-white/60">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                        <span className="font-bold text-xs md:text-sm">{item}</span>
                    </div>
                    ))}
                </div>

                <button onClick={onStart} className="w-full py-5 md:py-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl font-black uppercase text-xs md:text-sm tracking-widest hover:bg-white/10 transition-all">
                    {t.lp_subscribe}
                </button>
                </div>
            </FadeInWhenVisible>

            {/* Annual */}
            <FadeInWhenVisible delay={0.2}>
                <div className="group relative p-8 md:p-12 bg-primary/10 border-2 border-primary rounded-3xl md:rounded-[56px] hover:shadow-[0_0_80px_-20px_rgba(45,212,191,0.3)] transition-all h-full flex flex-col overflow-hidden">
                <div className="absolute top-4 md:top-8 right-4 md:right-8 bg-primary text-black text-[9px] md:text-[11px] font-black px-4 md:px-5 py-1.5 md:py-2 rounded-full uppercase tracking-widest">
                    {t.lp_save_30}
                </div>
                
                <div className="space-y-4 mb-8 md:mb-10">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-primary text-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-primary">{t.lp_plan_annual}</h3>
                    <p className="text-primary/60 text-xs md:text-sm font-medium">A experiência completa para a evolução máxima da família.</p>
                </div>
                
                <div className="flex items-baseline gap-2 mb-8 md:mb-12">
                    <span className="text-6xl md:text-7xl font-black italic tracking-tighter text-white">R$ 249</span>
                    <span className="text-xl md:text-2xl text-primary/40 uppercase font-black tracking-tighter">/ano</span>
                </div>

                <div className="space-y-4 md:space-y-5 flex-1 mb-8 md:mb-12">
                    {[
                    "Até 3 Perfis de Heróis",
                    "Relatórios Clínicos PDF ilimitados",
                    "Histórico Completo de Missões",
                    "Selo Comandante Fundador",
                    "Suporte Prioritário 24/7"
                    ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 md:gap-4 text-white">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                        <span className="font-bold text-xs md:text-sm">{item}</span>
                    </div>
                    ))}
                </div>

                <button onClick={onStart} className="w-full py-5 md:py-7 bg-primary text-black rounded-2xl md:rounded-3xl font-black uppercase text-xs md:text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">
                    {t.lp_subscribe}
                </button>
                </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-32 px-6">
        <FadeInWhenVisible>
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent p-10 md:p-24 rounded-3xl md:rounded-[64px] border border-white/10 text-center space-y-6 md:space-y-10 relative overflow-hidden">
                <h2 className="text-3xl md:text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] relative z-10">
                    Pronto para a <br /><span className="text-primary">Decolagem?</span>
                </h2>
                <p className="text-lg md:text-2xl text-white/50 max-w-2xl mx-auto relative z-10">
                    Junte-se a milhares de famílias que transformaram a rotina em um legado de responsabilidade.
                </p>
                <button onClick={onStart} className="px-10 md:px-16 py-6 md:py-8 bg-primary text-black font-black uppercase tracking-widest rounded-2xl md:rounded-[32px] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3 md:gap-4 text-lg md:text-xl relative z-10 w-full md:w-auto justify-center">
                    {t.lp_cta_start} <Rocket className="w-6 h-6 md:w-7 md:h-7" />
                </button>
            </div>
        </FadeInWhenVisible>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-20 border-t border-white/5 bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 md:gap-16 items-center">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                    <Rocket className="w-4 h-4 text-primary" />
                </div>
                <span className="font-black italic uppercase tracking-tighter text-lg">
                Desafio das <span className="text-primary">Estrelas</span>
                </span>
            </div>
            <p className="text-[10px] md:text-xs text-white/20 leading-relaxed max-w-xs mx-auto md:mx-0 font-medium">
                Uma iniciativa do Instituto Kamaleon para transformar a educação infantil através da tecnologia e psicologia positiva.
            </p>
          </div>
          
          <div className="flex justify-center gap-6 md:gap-10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 cursor-pointer transition-all">
                        <Lock className="w-4 h-4 text-white/20" />
                    </div>
                ))}
            </div>
            <p className="text-[8px] md:text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">
                © 2026 KAMALEON • TODOS OS DIREITOS RESERVADOS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
