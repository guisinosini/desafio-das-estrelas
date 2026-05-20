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
  handleForgotPassword
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
      <motion.div key="auth" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
        <button onClick={() => setStage('welcome')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> {t.back}</button>
        
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{isLogin ? t.login : t.mentorRegistration || 'CADASTRO DE MENTOR'}</span>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">{isLogin ? t.mentorIdentification : t.createGalacticAccount || 'Crie sua Conta Galáctica'}</h2>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[40px] md:rounded-[50px] space-y-8 shadow-2xl relative overflow-hidden">
          {/* Glow de fundo sutil */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
          
          <div className="space-y-4 relative z-10">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
               <RefreshCw className="w-3 h-3 text-primary" /> {t.systemLanguage}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {(['pt-BR', 'pt-PT', 'en', 'es', 'fr', 'it', 'zh'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={clsx(
                    "w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border transition-all shadow-xl",
                    language === lang ? "bg-primary border-primary scale-110 rotate-2 shadow-primary/20" : "bg-white/5 border-white/10 hover:bg-white/10"
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

          <form onSubmit={handleAuth} className="space-y-5 relative z-10">
            {authError && <div className="p-4 bg-red-500/20 text-red-200 text-[10px] font-bold rounded-2xl border border-red-500/30 text-center">{authError}</div>}
            {authSuccess && <div className="p-4 bg-emerald-500/20 text-emerald-200 text-[10px] font-bold rounded-2xl border border-emerald-500/30 text-center">{authSuccess}</div>}
            
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.mentorName}</label>
                <input required type="text" value={parentName} onChange={e => setParentName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary transition-colors text-white" />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.email}</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary transition-colors text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.password}</label>
              <div className="relative group/pass">
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary transition-colors pr-12 text-white" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[9px] font-black uppercase text-primary/60 hover:text-primary transition-colors mt-1 ml-2"
                >
                  {t.forgotPassword}
                </button>
              )}
            </div>

            {/* Checkbox de Aceite dos Termos de Uso (Visível apenas no Cadastro) */}
            {!isLogin && (
              <div className="flex items-start gap-3 mt-4 select-none p-3.5 bg-white/5 border border-white/5 rounded-2xl">
                <input
                  id="terms-checkbox"
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="w-5 h-5 rounded border border-white/20 bg-black/40 text-primary focus:ring-0 cursor-pointer mt-0.5 accent-primary shrink-0"
                />
                <label htmlFor="terms-checkbox" className="text-[10px] text-white/60 font-bold leading-relaxed cursor-pointer">
                  {getConsentText1(language)}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-primary hover:underline font-black uppercase tracking-wider transition-all"
                  >
                    {getTermsLink(language)}
                  </button>
                  {getConsentText2(language)}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-primary hover:underline font-black uppercase tracking-wider transition-all"
                  >
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
                "w-full py-5 font-black uppercase tracking-widest rounded-2xl shadow-xl mt-4 transition-all flex items-center justify-center gap-3",
                (authLoading || (!isLogin && !agreed))
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
                  : "bg-primary text-black hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> {t.processing}
                </>
              ) : (
                isLogin ? t.continue : t.registerAndTakeoff || 'Cadastrar e decolar 🚀'
              )}
            </button>
          </form>
          
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="w-full text-center text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors"
          >
            {isLogin ? t.createAccount : t.alreadyHaveAccount}
          </button>
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
