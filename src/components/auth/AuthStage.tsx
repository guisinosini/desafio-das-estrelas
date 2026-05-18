import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RefreshCw, Eye, EyeOff, ShieldCheck, X, FileText, Lock } from 'lucide-react';
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
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{isLogin ? t.login : 'CADASTRO DE MENTOR'}</span>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">{isLogin ? t.mentorIdentification : 'Crie sua Conta Galáctica'}</h2>
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
                  Li e concordo com os{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-primary hover:underline font-black uppercase tracking-wider transition-all"
                  >
                    Termos de Uso
                  </button>{' '}
                  e{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-primary hover:underline font-black uppercase tracking-wider transition-all"
                  >
                    Políticas de Privacidade
                  </button>{' '}
                  do Desafio das Estrelas.
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
                isLogin ? t.continue : 'Cadastrar e decolar 🚀'
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
                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Termos de Uso e Privacidade</h2>
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Contrato de Licenciamento SaaS do Mentor</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTermsModal(false)} 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Conteúdo Legal Rolável */}
              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar text-zinc-300 text-xs md:text-sm leading-relaxed font-medium">
                
                <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400">
                  <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Chancela e Responsabilidade Técnica</h4>
                    <p className="text-[11px] font-bold">
                      O aplicativo **Desafio das Estrelas** e seus algoritmos de incentivo comportamental são supervisionados pelo Responsável Técnico: **Guilherme Carvalho Sinosini (CRP 06/181084)**.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">1. Termos de Uso (Terms of Service) e Licenciamento SaaS</h3>
                  <p>
                    O **Desafio das Estrelas** concede ao mentor uma licença de uso individual, revogável e não exclusiva de nossa plataforma SaaS (Software as a Service) educacional. 
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
                    <li>**Disponibilidade e SLA:** Nossa infraestrutura tecnológica é integrada aos servidores em nuvem do **Supabase**, usufruindo de acordos de SLA (Service Level Agreement) de disponibilidade padrão de mercado de **99,9%**, com backups redundantes e proteção de integridade.</li>
                    <li>**Limites da Licença:** O acesso às ferramentas administrativas de mentoria (Quadro de Missões, Emissão de Relatórios Compartilhados e Diário de Bordo) é concedido sob o regime de assinatura via **Stripe**. Os limites de crianças cadastradas e recursos de BI seguem estritamente o plano ativo escolhido.</li>
                    <li>**Cancelamento:** A assinatura pode ser revogada ou alterada a qualquer momento, sem taxas de cancelamento, diretamente no Portal de Faturamento do Cliente fornecido pelo Stripe.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">2. Política de Privacidade (Privacy Policy) e Proteção de Dados</h3>
                  <p>
                    Respeitamos e protegemos a integridade física, moral e digital dos menores de idade de acordo com a **Lei Geral de Proteção de Dados (LGPD)** e legislações internacionais:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
                    <li>**Anonimização e Segurança:** Os dados da criança (estruturados em `ChildData`, Logs de Tarefas Concluídas e Registros de Comportamento) são protegidos por criptografia SSL/TLS em repouso e em trânsito. O aplicativo não requer sobrenomes, documentos ou informações de identificação direta da criança.</li>
                    <li>**Uso Restrito e Não Comercialização:** Todas as informações comportamentais e missões cadastradas servem exclusivamente para o monitoramento pedagógico da própria família. O aplicativo **não monitora, não rastreia, não vende e não compartilha** dados ou históricos comportamentais das crianças com nenhuma plataforma de publicidade ou terceiros.</li>
                    <li>**Relatórios Clínicos:** O compartilhamento de dados com psicólogos, pediatras ou profissionais de saúde é feito única e exclusivamente sob demanda ativa do mentor, gerando chaves temporárias criptografadas de leitura na tabela `shared_reports`.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">3. Política de Cookies</h3>
                  <p>
                    Para garantir conformidade com a **LGPD (Lei Geral de Proteção de Dados)** no Brasil e a **GDPR (General Data Protection Regulation)** na União Europeia, declaramos que:
                  </p>
                  <p className="text-zinc-400">
                    O aplicativo utiliza cookies e tecnologias de armazenamento local (localStorage) **estritamente necessários** para o funcionamento técnico da plataforma. Estes recursos servem apenas para gerenciar a persistência segura da sessão de login do Supabase, autenticação e preferências de idioma, **não sendo utilizados** para fins de rastreamento comportamental, remarketing ou fins publicitários.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">4. Isenção de Responsabilidade Médica (Medical Disclaimer)</h3>
                  <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl text-yellow-400 font-bold">
                    ⚠️ "O Desafio das Estrelas é uma ferramenta de suporte ao desenvolvimento comportamental. Os dados gerados não substituem avaliações neurológicas, diagnósticos psiquiátricos ou psicoterapias formais."
                  </div>
                  <p className="text-zinc-400">
                    O aplicativo atua como facilitador de rotina familiar baseado na ciência de reforço positivo. A interpretação de dados de BI e históricos deve ser feita com fins pedagógicos de incentivo, devendo qualquer desconfiança clínica ou neurológica ser avaliada por profissional habilitado em consulta médica.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">5. Disposições Finais</h3>
                  <p>
                    Ao criar a sua conta e utilizar o Desafio das Estrelas, o mentor atesta que é o responsável legal do menor cadastrado e aceita de forma irrevogável todas as regras e políticas descritas neste instrumento.
                  </p>
                </div>
              </div>

              {/* Rodapé do Modal com Ação de Aceite */}
              <div className="p-6 border-t border-white/10 bg-zinc-900/50 flex flex-col sm:flex-row justify-end items-center gap-4 shrink-0">
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Fechar Termos
                </button>
                <button 
                  onClick={handleAcceptTermsInModal}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary text-black font-black uppercase rounded-2xl text-[10px] tracking-widest transition-all hover:scale-[1.02] shadow-lg shadow-primary/15 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Entendi e Aceito
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
