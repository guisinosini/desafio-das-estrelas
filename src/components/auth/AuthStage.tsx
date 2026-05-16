import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import type { Language } from '@/lib/translations';

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

  return (
    <motion.div key="auth" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
      <button onClick={() => setStage('welcome')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> {t.back}</button>
      
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t.login}</span>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t.mentorIdentification}</h2>
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
              <input required type="text" value={parentName} onChange={e => setParentName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary transition-colors" />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.email}</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.password}</label>
            <div className="relative group/pass">
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary transition-colors pr-12" 
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

          <button
            type="submit"
            disabled={authLoading}
            className={clsx(
              "w-full py-5 font-black uppercase tracking-widest rounded-2xl shadow-xl mt-4 transition-all flex items-center justify-center gap-3",
              authLoading ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-primary text-black hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {authLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> {t.processing}
              </>
            ) : (
              t.continue
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
  );
});

AuthStage.displayName = 'AuthStage';

export default AuthStage;
