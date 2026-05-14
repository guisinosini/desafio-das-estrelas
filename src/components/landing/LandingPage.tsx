import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  Clock
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
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ language, onLanguageChange, onStart }) => {
  const t = translations[language];
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
    { code: 'pt-PT', label: 'Português (PT)', flag: '🇵🇹' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'zh', label: 'Mandarin', flag: '🇨🇳' },
  ];

  return (
    <div className="bg-[#020617] text-white font-sans selection:bg-primary/20 overflow-x-hidden relative">
      <StarField />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-[#020617]/50 backdrop-blur-xl border-b border-white/5 p-4 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <span className="font-black italic uppercase tracking-tighter text-xl hidden sm:block">
            Desafio das <span className="text-primary">Estrelas</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/10 transition-all">
              {languages.find(l => l.code === language)?.flag} <span className="hidden md:inline">{languages.find(l => l.code === language)?.label}</span> <ChevronDown className="w-4 h-4 opacity-40" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[110]">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className="w-full px-5 py-4 flex items-center gap-3 hover:bg-primary/10 hover:text-primary transition-colors text-left text-sm font-bold border-b border-white/5 last:border-0"
                >
                  <span className="text-xl">{lang.flag}</span> {lang.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onStart} className="bg-primary text-black px-8 py-2.5 rounded-full font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30">
            {t.login}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 px-6 overflow-hidden">
        <motion.div style={{ opacity, scale }} className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-widest"
            >
              <Zap className="w-3.5 h-3.5 fill-primary" /> Metodologia de Reforço Positivo
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30"
            >
              {t.lp_hero_title}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/50 leading-relaxed max-w-xl"
            >
              {t.lp_hero_sub}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-5"
            >
              <button onClick={onStart} className="px-12 py-6 bg-primary text-black font-black uppercase tracking-widest rounded-[32px] shadow-[0_20px_60px_-15px_rgba(45,212,191,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 text-lg">
                {t.lp_cta_start} <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>
          </div>

          <div className="relative lg:h-[700px] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring" }}
              className="relative w-full max-w-[500px] aspect-[4/5]"
            >
              <div className="absolute -inset-20 bg-primary/20 blur-[150px] rounded-full animate-pulse" />
              <div className="absolute -inset-1 bg-gradient-to-br from-primary via-purple-500 to-blue-500 rounded-[50px] opacity-20 blur-sm" />
              <div className="relative h-full rounded-[48px] overflow-hidden border border-white/10 shadow-2xl bg-[#0f172a]">
                <img 
                  src="/images/hero.png" 
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=1200" }}
                  alt="Herói Estelar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Missão Ativa</span>
                    </div>
                    <p className="font-black italic uppercase text-lg italic tracking-tighter">Explorar Planeta do Foco</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* Pain Points Section */}
      <section className="py-32 bg-white/[0.02] relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
          <FadeInWhenVisible>
            <div className="relative group">
              <div className="absolute -inset-4 bg-red-500/10 blur-2xl rounded-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative rounded-[56px] overflow-hidden border border-white/10 shadow-2xl grayscale-[0.3] hover:grayscale-0 transition-all duration-1000">
                <img 
                  src="/images/pain.png" 
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200" }}
                  alt="Desafios Diários"
                  className="w-full h-full object-cover aspect-square md:aspect-video lg:aspect-square"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent pointer-events-none" />
              </div>
            </div>
          </FadeInWhenVisible>
          
          <div className="space-y-12">
            <FadeInWhenVisible>
                <div className="space-y-6">
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                        {t.lp_pain_title}
                    </h2>
                    <p className="text-xl md:text-2xl text-white/40 leading-relaxed">
                        {t.lp_pain_desc}
                    </p>
                </div>
            </FadeInWhenVisible>

            <div className="grid gap-6">
              {[
                { text: "Acordos e combinados desrespeitados", icon: X },
                { text: "Falta de motivação para tarefas escolares", icon: X },
                { text: "Dificuldade em gerenciar telas e tempo", icon: X },
                { text: "Atritos constantes na rotina familiar", icon: X }
              ].map((item, i) => (
                <FadeInWhenVisible key={i} delay={i * 0.1}>
                  <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-red-500/5 hover:border-red-500/20 transition-all group">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <item.icon className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-lg font-bold text-white/70">{item.text}</span>
                  </div>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Method / How it Works */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-10 mb-32">
          <FadeInWhenVisible>
            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-primary/30 rotate-12">
                <Target className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
                {t.lp_method_title}
            </h2>
            <p className="text-xl md:text-3xl text-white/40 leading-relaxed max-w-3xl mx-auto">
                {t.lp_method_desc}
            </p>
          </FadeInWhenVisible>
        </div>

        {/* Funnel Steps */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent hidden lg:block -translate-y-1/2" />
            
            {[
                { step: "01", title: t.lp_feat_objectives, desc: t.lp_feat_objectives_desc, icon: Globe },
                { step: "02", title: t.lp_feat_missions, desc: t.lp_feat_missions_desc, icon: Rocket },
                { step: "03", title: t.lp_feat_rewards, desc: t.lp_feat_rewards_desc, icon: Star }
            ].map((item, i) => (
                <FadeInWhenVisible key={i} delay={i * 0.2}>
                    <div className="relative p-10 bg-[#0f172a] border border-white/10 rounded-[48px] hover:border-primary/50 transition-all group overflow-hidden">
                        <div className="absolute -top-4 -right-4 text-9xl font-black italic text-white/[0.02] group-hover:text-primary/[0.05] transition-colors">{item.step}</div>
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all">
                            <item.icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tighter">{item.title}</h3>
                        <p className="text-lg text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                </FadeInWhenVisible>
            ))}
        </div>
      </section>

      {/* Journey Ecosystem Section */}
      <section className="py-32 px-6 relative bg-[#020617]">
        <div className="max-w-7xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                O Ecossistema da <span className="text-primary">Jornada</span>
              </h2>
              <p className="text-xl text-white/40 font-bold uppercase tracking-widest">Entenda como a ciência e o jogo se unem</p>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Token Economy */}
            <FadeInWhenVisible delay={0.1}>
              <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[48px] h-full flex flex-col space-y-6 hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{t.lp_token_title}</h3>
                <p className="text-white/50 leading-relaxed">{t.lp_token_desc}</p>
              </div>
            </FadeInWhenVisible>

            {/* Mission Types */}
            <FadeInWhenVisible delay={0.2}>
              <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[48px] h-full flex flex-col space-y-6 hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{t.lp_missions_types_title}</h3>
                <p className="text-white/50 leading-relaxed">{t.lp_missions_types_desc}</p>
                <div className="flex gap-2 pt-4">
                  {['Diárias', 'Semanais', 'Mensais'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">{tag}</span>
                  ))}
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Medals */}
            <FadeInWhenVisible delay={0.3}>
              <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[48px] h-full flex flex-col space-y-6 hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                  <Trophy className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{t.lp_feat_medals}</h3>
                <p className="text-white/50 leading-relaxed">{t.lp_feat_medals_desc}</p>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* Mentor Dashboard Highlight */}
      <section className="py-32 px-6 bg-primary/5 border-y border-primary/10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <FadeInWhenVisible>
                <div className="space-y-6">
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                        {t.lp_mentor_title}
                    </h2>
                    <p className="text-xl md:text-2xl text-white/50 leading-relaxed">
                        {t.lp_mentor_desc}
                    </p>
                </div>
            </FadeInWhenVisible>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { icon: ShieldCheck, title: "Gestão de Limites", desc: "Sinalize atritos e deduza estrelas de forma educativa." },
                { icon: FileText, title: t.lp_feat_reports, desc: t.lp_feat_reports_desc },
                { icon: LayoutDashboard, title: "Visão 360°", desc: "Acompanhe o progresso de múltiplos heróis em um só lugar." },
                { icon: TrendingUp, title: "Análise de Dados", desc: "Gráficos de evolução para acompanhamento profissional." }
              ].map((item, i) => (
                <FadeInWhenVisible key={i} delay={i * 0.1}>
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                        <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-black uppercase italic text-sm">{item.title}</h4>
                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>

          <FadeInWhenVisible delay={0.3}>
            <div className="relative">
                <div className="absolute -inset-10 bg-primary/30 blur-[120px] rounded-full opacity-30 animate-pulse" />
                <div className="bg-[#1e293b] rounded-[48px] p-4 border border-white/10 shadow-2xl overflow-hidden">
                    <div className="bg-[#020617] rounded-[36px] aspect-square lg:aspect-[4/3] relative flex items-center justify-center">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.05, 1],
                                rotate: [0, 1, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="text-center space-y-6 px-10"
                        >
                            <LayoutDashboard className="w-24 h-24 text-primary/20 mx-auto" />
                            <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20">Control Station Preview</p>
                            <div className="flex gap-2 justify-center">
                                {[1, 2, 3].map(i => <div key={i} className="w-12 h-2 bg-white/5 rounded-full" />)}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Pricing Section - REVAMPED */}
      <section className="py-40 px-6 relative" id="pricing">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24 space-y-6">
            <FadeInWhenVisible>
                <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
                    {t.lp_price_title}
                </h2>
                <p className="text-xl text-white/40 uppercase tracking-widest font-black">Investimento na educação do futuro</p>
            </FadeInWhenVisible>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Monthly */}
            <FadeInWhenVisible>
                <div className="group relative p-12 bg-white/[0.03] border border-white/10 rounded-[56px] hover:bg-white/[0.06] transition-all h-full flex flex-col">
                <div className="space-y-4 mb-10">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-6 transition-transform">
                        <MousePointer2 className="w-7 h-7 text-white/40" />
                    </div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t.lp_plan_monthly}</h3>
                    <p className="text-white/40 text-sm font-medium">Ideal para começar a jornada e ver os primeiros resultados.</p>
                </div>
                
                <div className="flex items-baseline gap-2 mb-12">
                    <span className="text-6xl font-black italic tracking-tighter">R$ 29</span>
                    <span className="text-2xl text-white/30 uppercase font-black tracking-tighter">/mês</span>
                </div>

                <div className="space-y-5 flex-1 mb-12">
                    {[
                    "1 Perfil de Herói Ativo",
                    "Acesso a todos os Planetas",
                    "Dashboard do Mentor Básico",
                    "Suporte via E-mail"
                    ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-white/60">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span className="font-bold text-sm">{item}</span>
                    </div>
                    ))}
                </div>

                <button onClick={onStart} className="w-full py-6 bg-white/5 border border-white/10 rounded-3xl font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-all active:scale-95">
                    {t.lp_subscribe}
                </button>
                </div>
            </FadeInWhenVisible>

            {/* Annual */}
            <FadeInWhenVisible delay={0.2}>
                <div className="group relative p-12 bg-primary/10 border-2 border-primary rounded-[56px] hover:shadow-[0_0_80px_-20px_rgba(45,212,191,0.3)] transition-all h-full flex flex-col overflow-hidden">
                <div className="absolute top-8 right-8 bg-primary text-black text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-widest animate-bounce">
                    {t.lp_save_30}
                </div>
                
                <div className="space-y-4 mb-10">
                    <div className="w-14 h-14 bg-primary text-black rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-primary">{t.lp_plan_annual}</h3>
                    <p className="text-primary/60 text-sm font-medium">A experiência completa para a evolução máxima da família.</p>
                </div>
                
                <div className="flex items-baseline gap-2 mb-12">
                    <span className="text-7xl font-black italic tracking-tighter text-white">R$ 249</span>
                    <span className="text-2xl text-primary/40 uppercase font-black tracking-tighter">/ano</span>
                </div>

                <div className="space-y-5 flex-1 mb-12">
                    {[
                    "Até 3 Perfis de Heróis",
                    "Relatórios Clínicos PDF ilimitados",
                    "Histórico Completo de Missões",
                    "Selo Comandante Fundador",
                    "Suporte Prioritário 24/7"
                    ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-white">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span className="font-bold text-sm">{item}</span>
                    </div>
                    ))}
                </div>

                <button onClick={onStart} className="w-full py-7 bg-primary text-black rounded-3xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">
                    {t.lp_subscribe}
                </button>
                </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6">
        <FadeInWhenVisible>
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent p-16 md:p-24 rounded-[64px] border border-white/10 text-center space-y-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
                <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] relative z-10">
                    Pronto para a <br /><span className="text-primary">Decolagem?</span>
                </h2>
                <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto relative z-10">
                    Junte-se a milhares de famílias que transformaram a rotina em um legado de responsabilidade.
                </p>
                <button onClick={onStart} className="px-16 py-8 bg-primary text-black font-black uppercase tracking-widest rounded-[32px] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-4 text-xl relative z-10">
                    {t.lp_cta_start} <Rocket className="w-7 h-7" />
                </button>
            </div>
        </FadeInWhenVisible>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                    <Rocket className="w-4 h-4 text-primary" />
                </div>
                <span className="font-black italic uppercase tracking-tighter text-lg">
                Desafio das <span className="text-primary">Estrelas</span>
                </span>
            </div>
            <p className="text-xs text-white/20 leading-relaxed max-w-xs font-medium">
                Uma iniciativa do Instituto Kamaleon para transformar a educação infantil através da tecnologia e psicologia positiva.
            </p>
          </div>
          
          <div className="flex justify-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
            <a href="#" className="hover:text-primary transition-colors">Contato</a>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 cursor-pointer transition-all">
                        <Lock className="w-4 h-4 text-white/20" />
                    </div>
                ))}
            </div>
            <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">
                © 2026 KAMALEON • TODOS OS DIREITOS RESERVADOS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
