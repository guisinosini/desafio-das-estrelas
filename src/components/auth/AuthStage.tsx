import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RefreshCw, Eye, EyeOff, ShieldCheck, X, FileText, Lock } from 'lucide-react';
import clsx from 'clsx';
import type { Language } from '@/lib/translations';
import { TermsContent, getConsentText1, getConsentText2, getConsentText3, getPrivacyLink, getTermsLink, getTermsModalTitle, getTermsModalSubtitle } from './TermsContent';
interface AuthStageProps {
  t: any;
  language: Language;
  setLanguage: (lang: Language) => void;
  setStage: (stage: any) => void;
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  handleAuth: (e: React.FormEvent) => void;
  authLoading: boolean;
  authError: string;
  authSuccess: string;
  parentName: string;
  setParentName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleForgotPassword: () => void;
  authRole: 'patient' | 'professional';
  setAuthRole: (role: 'patient' | 'professional') => void;
  accessCode: string;
  setAccessCode: (code: string) => void;
}

const AuthStage = memo(({
  t,
  language,
  setLanguage,
  setStage,
  isLogin,
  setIsLogin,
  handleAuth,
  authLoading,
  authError,
  authSuccess,
  parentName,
  setParentName,
  email,
  setEmail,
  password,
  setPassword,
  handleForgotPassword,
  authRole,
  setAuthRole,
  accessCode,
  setAccessCode
}: AuthStageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleAcceptTermsInModal = () => {
    setAgreed(true);
    setShowTermsModal(false);
  };

  return (
    <>
      <motion.div 
        key="auth" 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8"
      >
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* LADO ESQUERDO - Copy e Grafismos (Oculto em telas muito pequenas para focar no form) */}
          <div className="hidden md:flex flex-col space-y-8 lg:pr-10 relative">
            {/* Elementos Flutuantes 3D */}
            <motion.img 
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png"
              animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -left-12 w-24 h-24 lg:w-32 lg:h-32 opacity-80 blur-[1px]"
              alt="Foguete"
            />
            <motion.img 
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Glowing%20star/3D/glowing_star_3d.png"
              animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 right-0 w-16 h-16 lg:w-20 lg:h-20 opacity-60"
              alt="Estrela"
            />

            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Acesso Seguro
              </div>
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                {isLogin ? "Bem-vindo de volta, Comandante" : "O Universo Aguarda Seu Comando"}
              </h1>
              <p className="text-lg text-white/50 leading-relaxed max-w-md">
                {isLogin 
                  ? "Acesse o painel da sua frota e acompanhe a evolução diária dos seus pequenos heróis." 
                  : "Transforme a rotina em uma aventura épica. Crie sua conta pai/mãe e prepare-se para a decolagem."}
              </p>
            </div>

            {/* Social Proof / Benefícios */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 pt-6">
                {[
                  { icon: "🚀", title: "Missões Épicas", desc: "Rotina gamificada" },
                  { icon: "🏆", title: "Recompensas", desc: "Motivação diária" },
                  { icon: "🧠", title: "Treino Cognitivo", desc: "Jogos exclusivos" },
                  { icon: "📊", title: "Relatórios Clínicos", desc: "Visão 360º" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-colors">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase italic tracking-tight">{item.title}</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LADO DIREITO - Formulário Glassmorphism Premium */}
          <div className="w-full max-w-md mx-auto lg:ml-auto relative">
            <button onClick={() => setStage('welcome')} className="md:hidden flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-6"><ChevronLeft className="w-4 h-4" /> Voltar</button>

            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
              {/* Glow Dinâmico de Fundo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors duration-700" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] group-hover:bg-purple-500/20 transition-colors duration-700" />
              
              {/* Header Mobile (Visível apenas se a coluna esquerda estiver oculta) */}
              <div className="md:hidden space-y-2 mb-8 relative z-10 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{isLogin ? t.login : 'CADASTRO'}</span>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">{isLogin ? t.mentorIdentification : 'Crie sua Conta'}</h2>
              </div>

              {/* Seletor de Idiomas Minimalista */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 relative z-10">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                   <RefreshCw className="w-3 h-3 text-primary" /> {t.systemLanguage}
                </label>
                <div className="flex gap-2">
                  {(['pt-BR', 'en', 'es'] as Language[]).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm border transition-all",
                        language === lang ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(45,212,191,0.3)] scale-110" : "bg-white/5 border-white/10 hover:bg-white/10 opacity-50 hover:opacity-100"
                      )}
                    >
                      {lang === 'pt-BR' ? '🇧🇷' : lang === 'en' ? '🇺🇸' : '🇪🇸'}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-5 relative z-10">
                {authError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 text-red-300 text-[10px] font-bold rounded-2xl border border-red-500/20 flex items-start gap-2">
                    <X className="w-4 h-4 shrink-0 text-red-400" /> {authError}
                  </motion.div>
                )}
                
                {!isLogin && (
                  <div className="flex gap-2 mb-6">
                    <button type="button" onClick={() => setAuthRole('patient')} className={clsx("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", authRole === 'patient' ? "bg-primary text-black border-primary" : "bg-white/5 text-white/40 border-white/10")}>Pai / Mentor</button>
                    <button type="button" onClick={() => setAuthRole('professional')} className={clsx("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", authRole === 'professional' ? "bg-primary text-black border-primary" : "bg-white/5 text-white/40 border-white/10")}>Profissional</button>
                  </div>
                )}
                {!isLogin && (
                  <div className="space-y-2 group/input">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 group-focus-within/input:text-primary transition-colors ml-1">{authRole === 'patient' ? t.mentorName : 'Nome do Profissional'}</label>
                    <input required type="text" placeholder={authRole === 'patient' ? "Ex: Capitão Carlos" : "Ex: Dr. Carlos"} value={parentName} onChange={e => setParentName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary focus:bg-white/5 transition-all text-white placeholder-white/20 shadow-inner" />
                  </div>
                )}
                {!isLogin && authRole === 'patient' && (
                  <div className="space-y-2 group/input pt-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 group-focus-within/input:text-primary transition-colors ml-1 flex items-center justify-between">
                      Código de Acesso do Profissional
                      <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-white/50">Opcional</span>
                    </label>
                    <input type="text" placeholder="Deixe em branco caso não tenha código" value={accessCode} onChange={e => setAccessCode(e.target.value.toUpperCase())} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 font-bold tracking-widest outline-none focus:border-primary focus:bg-white/5 transition-all text-white placeholder-white/20 shadow-inner" />
                  </div>
                )}

                <div className="space-y-2 group/input">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40 group-focus-within/input:text-primary transition-colors ml-1">{t.email}</label>
                  <input required type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary focus:bg-white/5 transition-all text-white placeholder-white/20 shadow-inner" />
                </div>

                <div className="space-y-2 group/input">
                  <div className="flex justify-between items-end ml-1 mb-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 group-focus-within/input:text-primary transition-colors">{t.password}</label>
                    {isLogin && (
                      <button type="button" onClick={handleForgotPassword} className="text-[9px] font-black uppercase text-primary/60 hover:text-primary transition-colors hover:underline">
                        {t.forgotPassword}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      required 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary focus:bg-white/5 transition-all pr-12 text-white placeholder-white/20 shadow-inner tracking-widest" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="flex items-start gap-3 mt-6 select-none p-4 bg-black/20 border border-white/5 rounded-2xl">
                    <input
                      id="terms-checkbox"
                      type="checkbox"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      className="w-5 h-5 rounded border border-white/20 bg-black/40 text-primary focus:ring-0 cursor-pointer mt-0.5 accent-primary shrink-0"
                    />
                    <label htmlFor="terms-checkbox" className="text-[10px] text-white/50 font-bold leading-relaxed cursor-pointer">
                      {getConsentText1(language)}
                      <button type="button" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-primary hover:underline font-black uppercase mx-1">
                        {getTermsLink(language)}
                      </button>
                      {getConsentText2(language)}
                      <button type="button" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-primary hover:underline font-black uppercase mx-1">
                        {getPrivacyLink(language)}
                      </button>
                      {getConsentText3(language)}
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading || (!isLogin && !agreed)}
                  className={clsx(
                    "w-full py-5 font-black uppercase tracking-widest rounded-2xl shadow-xl mt-8 transition-all flex items-center justify-center gap-3 overflow-hidden relative group/btn",
                    (authLoading || (!isLogin && !agreed))
                      ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                      : "bg-primary text-black hover:scale-[1.02] active:scale-[0.98] shadow-primary/20"
                  )}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  {authLoading ? (
                    <><RefreshCw className="w-5 h-5 animate-spin relative z-10" /> <span className="relative z-10">{t.processing}</span></>
                  ) : (
                    <span className="relative z-10 flex items-center gap-2">
                      {isLogin ? t.continue : 'Criar Conta e Decolar 🚀'}
                    </span>
                  )}
                </button>
              </form>
              
              <div className="mt-8 text-center relative z-10">
                <span className="text-[10px] font-bold text-white/30 mr-2 uppercase tracking-wider">{isLogin ? "Novo na frota?" : "Já é um comandante?"}</span>
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-[10px] font-black uppercase text-white hover:text-primary transition-colors underline decoration-white/20 underline-offset-4"
                >
                  {isLogin ? "Criar Conta" : "Fazer Login"}
                </button>
              </div>
            </div>
            
            <button onClick={() => setStage('welcome')} className="hidden md:flex mx-auto mt-8 items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /> Voltar para o Início</button>
          </div>

        </div>
      </motion.div>

      {/* Modal Premium Glassmorphism de Termos de Uso e Política de Privacidade */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-2xl bg-[#0d1527] border-2 border-primary/20 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              {/* Header do Modal */}
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-primary/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">{getTermsModalTitle(language)}</h2>
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">{getTermsModalSubtitle(language)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTermsModal(false)} 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Conteúdo Legal Rolável Componentizado com Tradução */}
              <TermsContent language={language} />

              {/* Rodapé do Modal com Ação de Aceite */}
              <div className="p-6 border-t border-white/10 bg-zinc-900/50 flex flex-col sm:flex-row justify-end items-center gap-4 shrink-0">
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  {t.closeTerms || 'Fechar Termos'}
                </button>
                <button 
                  onClick={handleAcceptTermsInModal}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary text-black font-black uppercase rounded-2xl text-[10px] tracking-widest transition-all hover:scale-[1.02] shadow-lg shadow-primary/15 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> {t.understandAndAccept || 'Entendi e Aceito'}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

AuthStage.displayName = 'AuthStage';

export default AuthStage;
