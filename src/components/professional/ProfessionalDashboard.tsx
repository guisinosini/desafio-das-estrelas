import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Link as LinkIcon, RefreshCw, CheckCircle2, ShieldCheck, Plus, Trash, Copy } from 'lucide-react';
import clsx from 'clsx';
import { createClient } from '@/lib/supabase/client';
import { YEARLY_PRICE_IDS } from '@/lib/constants';

export const ProfessionalDashboard = ({
  handleLogout,
  setStage,
  handleViewPatient
}: {
  handleLogout: () => void;
  setStage: (stage: any) => void;
  handleViewPatient: (patientId: string) => void;
}) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'invites' | 'patients' | 'profile' | 'subscription'>('invites');
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(false);

  // Profile Form
  const [specialty, setSpecialty] = useState(profile?.specialty || '');
  const [council, setCouncil] = useState(profile?.council_registration || '');
  const [company, setCompany] = useState(profile?.company || '');

  // Invites
  const [invites, setInvites] = useState<any[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  
  // Subscription
  const [subscription, setSubscription] = useState<any>(null);

  // Patients
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !currentUser) throw new Error("Não autenticado");
      setUser(currentUser);

      const { data: profData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
      if (profData) {
         setProfile(profData);
         setSpecialty(profData.specialty || '');
         setCouncil(profData.council_registration || '');
         setCompany(profData.company || '');
      }

      // Load Subscription
      const { data: subData } = await supabase
        .from('professional_subscriptions')
        .select('*')
        .eq('professional_id', currentUser.id)
        .single();
      
      if (subData) {
        setSubscription(subData);
      } else {
        // Se não tem subscription, cria um plano padrão (ex: limit 4)
        const { data: newSub } = await supabase.from('professional_subscriptions').insert({
          professional_id: currentUser.id,
          plan_limit: 4,
          status: 'active'
        }).select().single();
        setSubscription(newSub);
      }

      // Load Invites
      const { data: invData } = await supabase
        .from('professional_invites')
        .select('*')
        .eq('professional_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (invData) setInvites(invData);

      // Load Patients (Profiles linked to this professional)
      const { data: patData } = await supabase
        .from('profiles')
        .select('id, full_name, role, subscription_status')
        .eq('linked_professional_id', currentUser.id);
      if (patData) setPatients(patData);

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('profiles').update({
        specialty,
        council_registration: council,
        company
      }).eq('id', user?.id);
      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar perfil.');
    }
    setLoading(false);
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription) return;
    if (subscription.used_invites >= subscription.plan_limit) {
      alert('Limite de convites atingido. Faça upgrade do seu plano.');
      return;
    }

    setLoading(true);
    try {
      // Generate a random 6 char code
      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error } = await supabase.from('professional_invites').insert({
        professional_id: user?.id,
        parent_email: newInviteEmail,
        access_code: accessCode
      });
      if (error) throw error;
      
      // Enviar email simulado (ideal via API)
      await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newInviteEmail, code: accessCode })
      }).catch(e => console.error("API falhou, mas convite salvo no DB."));
      
      alert(`Convite gerado! O código é: ${accessCode}`);
      setNewInviteEmail('');
      loadData();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Portal B2B2C</span>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-4">Painel do Profissional</h1>
            <p className="text-white/40 font-medium mt-1">Bem-vindo, {profile?.full_name || 'Comandante'}</p>
          </div>
          <button onClick={handleLogout} className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
            Sair da Conta
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 space-y-2 flex-shrink-0">
            {[
              { id: 'invites', label: 'Convites', icon: LinkIcon },
              { id: 'patients', label: 'Meus Pacientes', icon: Users },
              { id: 'subscription', label: 'Assinatura', icon: ShieldCheck },
              { id: 'profile', label: 'Meu Perfil', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id ? "bg-primary text-black" : "bg-white/5 text-white/40 hover:bg-white/10"
                )}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-md min-h-[500px]">
            
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Dados Profissionais</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Especialidade</label>
                    <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 outline-none focus:border-primary text-sm" placeholder="Ex: Psicólogo Infantil" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Registro no Conselho</label>
                    <input type="text" value={council} onChange={e => setCouncil(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 outline-none focus:border-primary text-sm" placeholder="Ex: CRP 00/00000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Empresa / Clínica</label>
                    <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 outline-none focus:border-primary text-sm" placeholder="Nome da Clínica" />
                  </div>
                </div>
                <button disabled={loading} type="submit" className="px-8 py-4 bg-primary text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Salvar Alterações
                </button>
              </form>
            )}

            {activeTab === 'invites' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Gerar Convites</h2>
                    <p className="text-white/40 text-sm mt-1">Convide pais e responsáveis para acessar o app.</p>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 px-6 py-4 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Uso do Plano</span>
                    <span className="text-xl font-black text-primary">{subscription?.used_invites || 0} / {subscription?.plan_limit || 0}</span>
                  </div>
                </div>

                <form onSubmit={handleCreateInvite} className="flex flex-col md:flex-row gap-4">
                  <input
                    type="email"
                    required
                    value={newInviteEmail}
                    onChange={e => setNewInviteEmail(e.target.value)}
                    placeholder="E-mail do pai/responsável"
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl p-4 outline-none focus:border-primary text-sm"
                  />
                  <button disabled={loading} type="submit" className="px-8 py-4 bg-primary text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Gerar Código
                  </button>
                </form>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Convites Enviados</h3>
                  {invites.length === 0 && <p className="text-white/20 text-sm italic">Nenhum convite gerado ainda.</p>}
                  {invites.map(inv => (
                    <div key={inv.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/20 border border-white/5 p-4 rounded-xl gap-4">
                      <div>
                        <p className="text-sm font-bold">{inv.parent_email}</p>
                        <p className="text-[10px] text-white/40">{new Date(inv.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                          <span className="text-lg font-black tracking-widest font-mono text-primary">{inv.access_code}</span>
                          <button onClick={() => {
                            navigator.clipboard.writeText(`https://app.desafiodasestrelas.com.br?code=${inv.access_code}&email=${inv.parent_email}`);
                            alert('Link copiado!');
                          }} className="text-white/40 hover:text-white"><Copy className="w-4 h-4" /></button>
                        </div>
                        <span className={clsx(
                          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                          inv.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'
                        )}>
                          {inv.status === 'pending' ? 'Pendente' : 'Usado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'patients' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Meus Pacientes</h2>
                {patients.length === 0 && <p className="text-white/20 text-sm italic">Nenhum paciente vinculado ainda.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patients.map(p => (
                    <div key={p.id} className="bg-black/20 border border-white/5 p-6 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{p.full_name}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Conta Familiar</p>
                      </div>
                      <button onClick={() => handleViewPatient(p.id)} className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                        <Users className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Meu Plano</h2>
                <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 p-8 rounded-3xl relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Plano Atual</p>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter">{subscription?.plan_limit || 0} Pacientes</h3>
                    <p className="text-white/60 mt-4 text-sm max-w-md">Você pode convidar até {subscription?.plan_limit} famílias para o Desafio das Estrelas, acompanhando o progresso e relatórios de todos em um só lugar.</p>
                    <button className="mt-8 px-8 py-4 bg-primary text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                      Fazer Upgrade de Plano
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
