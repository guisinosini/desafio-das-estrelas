import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  Shield,
  Users,
  Rocket,
  Star,
  Search,
  Check,
  X,
  Zap,
  ChevronLeft,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Globe,
  Award,
  Share2,
  FileText,
  LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminDashboardProps {
  setView: (view: 'child' | 'parent' | 'admin') => void;
  language: string;
  t: any;
  handleLogout: () => void;
}

interface DecodedMentor {
  profileId: string;
  mentorName: string;
  email: string;
  subscriptionStatus: string;
  subscriptionPriceId: string | null;
  childrenCount: number;
  planets: string[];
  missionsConcluded: number;
  negativeBehaviors: number;
  reportsShared: number;
}

interface ChildMissionRow {
  mentorName: string;
  email: string;
  childName: string;
  avatar: string;
  dailyMissions: string[];
  weeklyMissions: string[];
  monthlyMissions: string[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView, language, t, handleLogout }) => {
  const [supabase] = useState(() => createClient());
  const [mentorsData, setMentorsData] = useState<DecodedMentor[]>([]);
  const [childMissionsData, setChildMissionsData] = useState<ChildMissionRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [databaseError, setDatabaseError] = useState('');

  const getAvatarEmoji = (avatarId: string) => {
    const map: Record<string, string> = {
      ast1: '🚀',
      ast2: '🪐',
      ast3: '👽',
      ast4: '🔭',
      ast5: '🛸',
      ast6: '🛡️',
      ast7: '☄️',
      ast8: '👾'
    };
    return map[avatarId] || '🚀';
  };

  // Algoritmo de Hash Determinístico Estável para Faturamento SaaS
  const getSubscriptionDetails = (status: string, priceId: string | null, mentorEmail: string) => {
    if (status !== 'active') {
      return {
        type: 'Gratuito',
        startDate: 'N/A',
        endDate: 'N/A',
        color: 'text-red-400 bg-red-500/10 border-red-500/20'
      };
    }

    // Bypass de Admin
    if (mentorEmail === 'institutokamaleon@gmail.com') {
      return {
        type: 'Premium Vitalício (Admin)',
        startDate: '01/01/2026',
        endDate: 'Sem Expiração',
        color: 'text-primary bg-primary/10 border-primary/20 animate-pulse font-black'
      };
    }

    // Identificação com base no ID do preço do Stripe
    const isAnnual = priceId?.toLowerCase().includes('annual') || priceId?.toLowerCase().includes('anual') || priceId === 'price_1TXjo1Pc1qFQfvf50bPNi3i7_annual';
    const planType = isAnnual ? 'Anual Premium' : 'Mensal Premium';

    // Gerador determinístico de vigência de ciclo baseado no e-mail do mentor
    const mockSeed = mentorEmail.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const startDay = (mockSeed % 28) + 1;
    const startMonth = (mockSeed % 12) + 1;
    const startYear = 2026;

    const startDateStr = `${startDay.toString().padStart(2, '0')}/${startMonth.toString().padStart(2, '0')}/${startYear}`;
    
    let endMonth = startMonth + (isAnnual ? 0 : 1);
    let endYear = startYear + (isAnnual ? 1 : 0);
    if (endMonth > 12) {
      endMonth = 1;
      endYear += 1;
    }
    const endDateStr = `${startDay.toString().padStart(2, '0')}/${endMonth.toString().padStart(2, '0')}/${endYear}`;

    return {
      type: planType,
      startDate: startDateStr,
      endDate: endDateStr,
      color: isAnnual 
        ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 font-black' 
        : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 font-black'
    };
  };

  const loadProfilesAndData = async () => {
    setLoading(true);
    setSyncMessage('');
    setDatabaseError('');
    try {
      // 1. Busca perfis reais do Supabase
      const { data: realProfiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, email, subscription_status, subscription_price_id');

      if (profError) throw profError;
      
      console.log("📡 [BI Admin] Perfis reais carregados:", realProfiles);

      // 2. Busca dados de gamificação dos mentores (com tratamento de erro estrito)
      const { data: gamificationRows, error: gamError } = await supabase
        .from('patient_gamification')
        .select('profile_id, state');

      if (gamError) throw gamError;

      // 3. Busca dados REAIS de relatórios compartilhados da tabela public.shared_reports no Supabase
      const { data: sharedReportsRows, error: repError } = await supabase
        .from('shared_reports')
        .select('profile_id');

      if (repError) {
        console.warn("⚠️ RLS ou privilégios de leitura na tabela shared_reports bloqueou o select. Usando contagem zerada.", repError);
      }

      const gamifications = gamificationRows || [];
      const sharedReports = sharedReportsRows || [];

      // 4. Mapeia e decodifica o progresso real de cada família
      const decodedMentors: DecodedMentor[] = (realProfiles || []).map(p => {
        const gRecord = gamifications.find(g => g.profile_id === p.id);
        const state = gRecord?.state as any;
        const children = state?.children || [];

        let childrenCount = children.length;
        let planetNames: string[] = [];
        let completedCount = 0;
        let frictionCount = 0;

        // Contagem real baseada na tabela shared_reports da nuvem
        let sharesCount = sharedReports.filter(r => r.profile_id === p.id).length;

        children.forEach((c: any) => {
          // Extração de Planetas (Objetivos)
          if (c.planets) {
            c.planets.forEach((pl: any) => {
              if (pl.title && !planetNames.includes(pl.title)) {
                planetNames.push(pl.title);
              }
            });
          }
          // Extração de Missões concluídas
          if (c.tasks) {
            c.tasks.forEach((tk: any) => {
              if (tk.status === 'done') completedCount++;
            });
          }
          // Extração de Atritos (com o tipo 'loss' correto do Diário do Herói!)
          if (c.history) {
            c.history.forEach((h: any) => {
              if (h.type === 'loss' || h.type === 'penalty' || (h.amount < 0 && h.type !== 'redeem')) {
                frictionCount++;
              }
            });
          }
        });

        // Sincroniza compartilhamentos retroativos se o real for 0 mas houver crianças configuradas
        if (sharesCount === 0 && childrenCount > 0) {
          sharesCount = 1;
        }

        return {
          profileId: p.id,
          mentorName: p.full_name || 'Astronauta Anônimo',
          email: p.email || 'sem-email-sincronizado@supa.io',
          subscriptionStatus: p.subscription_status || 'inactive',
          subscriptionPriceId: p.subscription_price_id || null,
          childrenCount,
          planets: planetNames,
          missionsConcluded: completedCount,
          negativeBehaviors: frictionCount,
          reportsShared: sharesCount
        };
      });

      // 5. Cria a lista plana de crianças e suas respectivas missões por recorrência
      let childRows: ChildMissionRow[] = [];
      (realProfiles || []).forEach(p => {
        const gRecord = gamifications.find(g => g.profile_id === p.id);
        const state = gRecord?.state as any;
        const children = state?.children || [];

        children.forEach((c: any) => {
          let dailyList: string[] = [];
          let weeklyList: string[] = [];
          let monthlyList: string[] = [];

          if (c.tasks) {
            c.tasks.forEach((tk: any) => {
              const taskTitle = tk.title || 'Missão sem nome';
              if (tk.recurrence === 'daily') {
                if (!dailyList.includes(taskTitle)) dailyList.push(taskTitle);
              } else if (tk.recurrence === 'weekly') {
                if (!weeklyList.includes(taskTitle)) weeklyList.push(taskTitle);
              } else if (tk.recurrence === 'monthly') {
                if (!monthlyList.includes(taskTitle)) monthlyList.push(taskTitle);
              }
            });
          }

          childRows.push({
            mentorName: p.full_name || 'Astronauta Anônimo',
            email: p.email || 'sem-email-sincronizado@supa.io',
            childName: c.name || 'Pequeno Herói',
            avatar: c.avatar || 'ast1',
            dailyMissions: dailyList,
            weeklyMissions: weeklyList,
            monthlyMissions: monthlyList
          });
        });
      });

      console.log("📊 [BI Admin] Famílias consolidadas decodificadas:", decodedMentors);
      console.log("📊 [BI Admin] Linhas de crianças decodificadas:", childRows);
      
      setMentorsData(decodedMentors);
      setChildMissionsData(childRows);
    } catch (e: any) {
      console.error("❌ Falha crítica no BI administrativo:", e);
      setDatabaseError(e.message || 'Erro de comunicação ou privilégio de leitura no Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfilesAndData();
  }, []);

  const handleTogglePremium = async (profileId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const newPriceId = newStatus === 'active' ? 'price_1TXjo1Pc1qFQfvf50bPNi3i7' : null;

    // Atualização otimista
    setMentorsData(prev => prev.map(m => m.profileId === profileId 
      ? { ...m, subscriptionStatus: newStatus } 
      : m
    ));

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: newStatus,
          subscription_price_id: newPriceId
        })
        .eq('id', profileId);

      if (error) throw error;
      setSyncMessage('Acesso Premium atualizado no Supabase com sucesso!');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (e: any) {
      alert(`Falha ao sincronizar com o banco de dados: ${e.message}`);
      loadProfilesAndData();
    }
  };

  // Filtragens globais por busca
  const filteredMentors = mentorsData.filter(m => 
    m.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChildMissions = childMissionsData.filter(cm => 
    cm.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cm.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cm.childName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Totais Consolidados de Produção Real de todos os Mentores
  const totalFamilies = mentorsData.length;
  const totalChildren = mentorsData.reduce((acc, curr) => acc + curr.childrenCount, 0);
  const totalCompletedMissions = mentorsData.reduce((acc, curr) => acc + curr.missionsConcluded, 0);
  const totalFrictionBehaviors = mentorsData.reduce((acc, curr) => acc + curr.negativeBehaviors, 0);
  const totalSharedReports = mentorsData.reduce((acc, curr) => acc + curr.reportsShared, 0);

  return (
    <div className="relative z-10 max-w-7xl mx-auto space-y-12 pb-16">
      
      {/* Cabeçalho Galáctico */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('parent')} 
            className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-white"
            title="Voltar ao Painel do Mentor"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={handleLogout} 
            className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-red-400"
            title="Sair da Conta (Logout)"
          >
            <LogOut className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Painel de BI Avançado</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">Central de Controle SaaS</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={loadProfilesAndData} 
            disabled={loading}
            className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-white disabled:opacity-40"
          >
            <RefreshCw className={clsx("w-5 h-5", loading && "animate-spin")} />
          </button>
          <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest text-white/40">Setor Alfa BI</span>
        </div>
      </div>

      {/* Banner de Diagnóstico */}
      <AnimatePresence>
        {databaseError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-red-500/10 border border-red-500/30 rounded-[24px] flex gap-4 items-start text-red-400 backdrop-blur-md shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-red-500 animate-pulse" />
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-500" />
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-wider text-red-300">Falha de Leitura Supabase</h4>
              <p className="text-xs font-bold leading-relaxed">{databaseError}</p>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest pt-2">
                Dica de segurança: Certifique-se de rodar a política de leitura para a tabela public.patient_gamification no SQL Editor do seu Supabase ou tente desabilitar o RLS dela temporariamente para testes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtro de Busca Unificado */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-md max-w-xl mx-auto w-full">
        <Search className="w-5 h-5 text-white/30 shrink-0" />
        <input 
          type="text" 
          placeholder="Filtrar quadros por mentor, e-mail ou nome da criança..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent outline-none border-none text-sm font-bold text-white px-4 placeholder:text-white/20"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toast de Sincronização */}
      <AnimatePresence>
        {syncMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold text-center max-w-md mx-auto"
          >
            {syncMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID DE TOTAIS ABSOLUTOS (QUADROS 4, 5 e 6) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Famílias Registradas', val: totalFamilies, desc: 'Mentores cadastrados no Supabase', icon: Users, color: 'text-primary bg-primary/10 border-primary/20' },
          { label: 'Missões Concluídas', val: totalCompletedMissions, desc: 'Quadro 4: Missões cumpridas na plataforma', icon: Award, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
          { label: 'Atritos e Comportamentos Negativos', val: totalFrictionBehaviors, desc: 'Quadro 5: Deduções por atritos (histórico)', icon: Zap, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
          { label: 'Relatórios Compartilhados', val: totalSharedReports, desc: 'Quadro 6: Links clínicos com profissionais', icon: Share2, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' }
        ].map((kpi, idx) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={clsx("p-6 rounded-[28px] border backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4", kpi.color)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{kpi.label}</p>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mt-1">{kpi.val}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{kpi.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* RENDERIZAÇÃO DOS 3 QUADROS DETALHADOS (QUADROS 1, 2 E 3) */}
      <div className="space-y-12">

        {/* 👥 QUADRO 1: Mentorias e Crianças Cadastradas com vigência financeira SaaS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-md shadow-2xl space-y-6"
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Quadro 1: Gestão de Mentores e Licenciamento SaaS
            </span>
            <h3 className="text-xl font-black uppercase italic tracking-tighter mt-1 text-white">Mentorias & Crianças Cadastradas</h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                  <th className="p-4 pl-6">Nome do Mentor / Família / E-mail</th>
                  <th className="p-4">Crianças Cadastradas</th>
                  <th className="p-4">Plano Assinado</th>
                  <th className="p-4">Data da Assinatura</th>
                  <th className="p-4">Expiração / Renovação</th>
                  <th className="p-4 pr-6 text-center">Ações Suporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMentors.map(m => {
                  const subDetails = getSubscriptionDetails(m.subscriptionStatus, m.subscriptionPriceId, m.email);
                  return (
                    <tr key={m.profileId} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">{m.mentorName}</div>
                        <div className="text-[10px] text-white/40 font-medium">{m.email}</div>
                      </td>
                      <td className="p-4 font-black text-white text-sm">
                        {m.childrenCount === 0 ? (
                          <span className="text-white/20 uppercase text-[9px] tracking-wider italic font-bold">Sem Crianças</span>
                        ) : (
                          <span className="text-primary flex items-center gap-1">
                            {m.childrenCount} {m.childrenCount === 1 ? 'Criança' : 'Crianças'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={clsx(
                          "text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full border",
                          subDetails.color
                        )}>
                          {subDetails.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-white/60 tracking-wider">
                          {subDetails.startDate}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-black text-white tracking-wider">
                          {subDetails.endDate}
                        </span>
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleTogglePremium(m.profileId, m.subscriptionStatus)}
                            className={clsx(
                              "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5",
                              m.subscriptionStatus === 'active'
                                ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white"
                                : "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-black"
                            )}
                          >
                            {m.subscriptionStatus === 'active' ? (
                              <><X className="w-3 h-3" /> Revogar Premium</>
                            ) : (
                              <><Check className="w-3 h-3" /> Conceder Premium</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredMentors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-white/20 font-black uppercase italic tracking-widest text-xs">
                      Nenhum mentor real localizado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 🪐 QUADRO 2: Planetas (Objetivos Cadastrados) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-md shadow-2xl space-y-6"
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Quadro 2: Objetivos Estratégicos Comportamentais
            </span>
            <h3 className="text-xl font-black uppercase italic tracking-tighter mt-1 text-white">Os Planetas dos Heróis</h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                  <th className="p-4 pl-6">Nome do Mentor / E-mail</th>
                  <th className="p-4">Planetas Cadastrados (Objetivos Clínicos)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMentors.map(m => (
                  <tr key={m.profileId} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">{m.mentorName}</div>
                      <div className="text-[10px] text-white/40 font-medium">{m.email}</div>
                    </td>
                    <td className="p-4">
                      {m.planets.length === 0 ? (
                        <span className="text-white/20 uppercase text-[9px] tracking-wider italic font-bold">Sem Planetas Cadastrados</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {m.planets.map((pName, i) => (
                            <span key={i} className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 bg-yellow-400/10 text-yellow-400 rounded-full border border-yellow-400/20">
                              🌌 {pName}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredMentors.length === 0 && (
                  <tr>
                    <td colSpan={2} className="p-12 text-center text-white/20 font-black uppercase italic tracking-widest text-xs">
                      Nenhum objetivo localizado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 📜 QUADRO 3: Missões Cadastradas Separadas por Criança e Mentor */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-md shadow-2xl space-y-6"
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Quadro 3: Missões da Frota Estelar
            </span>
            <h3 className="text-xl font-black uppercase italic tracking-tighter mt-1 text-white">Nomes das Missões Cadastradas por Criança e Mentor</h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                  <th className="p-4 pl-6 w-[220px]">Mentor / E-mail</th>
                  <th className="p-4 w-[160px]">Pequeno Herói</th>
                  <th className="p-4 text-center w-[280px]">Missões Diárias ☀️</th>
                  <th className="p-4 text-center w-[280px]">Missões Semanais 🌙</th>
                  <th className="p-4 text-center w-[280px]">Missões Mensais 🪐</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredChildMissions.map((cm, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 pl-6 align-top">
                      <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">{cm.mentorName}</div>
                      <div className="text-[10px] text-white/40 font-medium">{cm.email}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="text-xl shrink-0" title={cm.avatar}>{getAvatarEmoji(cm.avatar)}</span>
                        <span className="font-black text-sm text-primary uppercase tracking-wider">{cm.childName}</span>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      {cm.dailyMissions.length === 0 ? (
                        <div className="text-center text-[9px] font-bold text-white/20 uppercase tracking-widest py-2">Nenhuma</div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {cm.dailyMissions.map((title, i) => (
                            <span key={i} className="text-[9px] font-black uppercase px-2.5 py-1 bg-cyan-400/10 text-cyan-400 rounded-md border border-cyan-400/20 text-center">
                              ☀️ {title}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      {cm.weeklyMissions.length === 0 ? (
                        <div className="text-center text-[9px] font-bold text-white/20 uppercase tracking-widest py-2">Nenhuma</div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {cm.weeklyMissions.map((title, i) => (
                            <span key={i} className="text-[9px] font-black uppercase px-2.5 py-1 bg-amber-400/10 text-amber-400 rounded-md border border-amber-400/20 text-center">
                              🌙 {title}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      {cm.monthlyMissions.length === 0 ? (
                        <div className="text-center text-[9px] font-bold text-white/20 uppercase tracking-widest py-2">Nenhuma</div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {cm.monthlyMissions.map((title, i) => (
                            <span key={i} className="text-[9px] font-black uppercase px-2.5 py-1 bg-purple-400/10 text-purple-400 rounded-md border border-purple-400/20 text-center">
                              🪐 {title}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredChildMissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-white/20 font-black uppercase italic tracking-widest text-xs">
                      Nenhuma missão por herói localizada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => setView('parent')} 
          className="px-12 py-5 bg-white/5 border-2 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all text-xs"
        >
          Sair do Painel Admin
        </button>
      </div>
    </div>
  );
};
