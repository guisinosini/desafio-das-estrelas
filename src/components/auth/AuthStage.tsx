import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, RefreshCw } from 'lucide-react';
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
  return (
    <motion.div key="auth" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
      <button onClick={() => setStage('welcome')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> {t.back}</button>
      
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t.login}</span>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t.mentorName}</h2>
        </div>
        <div className="flex gap-2 mb-1">
          {(['pt-BR', 'en', 'es'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm border transition-all",
                language === lang ? "bg-primary border-primary text-black scale-110" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
              )}
            >
              {lang === 'pt-BR' ? '🇧🇷' : lang === 'en' ? '🇺🇸' : '🇪🇸'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[50px] space-y-6 shadow-2xl">
        <form onSubmit={handleAuth} className="space-y-4">
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
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary transition-colors" />
            {isLogin && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[9px] font-black uppercase text-primary/60 hover:text-primary transition-colors mt-1 ml-2"
              >
                Esqueci minha senha
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
                <RefreshCw className="w-5 h-5 animate-spin" /> Processando...
              </>
            ) : (
              t.continue
            )}
          </button>
        </form>
        
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="w-full text-center text-[10px] font-black uppercase text-white/30"
        >
          {isLogin ? "Criar nova tripulação" : "Já tenho acesso"}
        </button>
      </div>
    </motion.div>
  );
});

AuthStage.displayName = 'AuthStage';

export default AuthStage;
