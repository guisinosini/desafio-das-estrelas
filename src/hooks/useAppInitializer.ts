import { useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/supabase/roles';
import type { ChildData, Task } from '@/types/desafio';
import type { Language } from '@/lib/translations';

interface UseAppInitializerProps {
  supabase: SupabaseClient<any, "public", any>;
  setLanguage: (lang: Language) => void;
  setStage: (stage: any) => void;
  setIsLogin: (isLogin: boolean) => void;
  setIsPremium: (isPremium: boolean) => void;
  setView: (view: any) => void;
  loadFromCloud: (user?: any) => Promise<any>;
  setChildren: (children: ChildData[]) => void;
  setActiveChildId: (id: string | null) => void;
  setFleetId: (id: string) => void;
  setSubscriptionPriceId: (id: string | null) => void;
  setParentPin: (pin: string) => void;
  setParentName: (name: string) => void;
  setUserProfile: (profile: any) => void;
}

export function useAppInitializer({
  supabase,
  setLanguage,
  setStage,
  setIsLogin,
  setIsPremium,
  setView,
  loadFromCloud,
  setChildren,
  setActiveChildId,
  setFleetId,
  setSubscriptionPriceId,
  setParentPin,
  setParentName,
  setUserProfile
}: UseAppInitializerProps) {
  useEffect(() => {
    // Detecção Automática de Idioma e Região
    const detectUserLanguage = () => {
      // 1. Tentar pegar do LocalStorage
      const saved = localStorage.getItem('desafio_estrelas_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language) return parsed.language;
      }

      // 2. Tentar detectar pelo navegador
      const browserLang = navigator.language || (navigator as any).userLanguage;

      if (browserLang.startsWith('pt')) {
        return browserLang.includes('PT') ? 'pt-PT' : 'pt-BR';
      } else if (browserLang.startsWith('es')) {
        return 'es';
      } else if (browserLang.startsWith('fr')) {
        return 'fr';
      } else if (browserLang.startsWith('it')) {
        return 'it';
      } else if (browserLang.startsWith('zh')) {
        return 'zh';
      }

      return 'en'; // Fallback para Inglês
    };

    const initialLang = detectUserLanguage();
    setLanguage(initialLang as Language);

    const initData = async () => {
      // Captura o redirecionamento de cadastro vindo do Stripe
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlStage = params.get('stage');
        if (urlStage === 'register' || urlStage === 'auth') {
          setStage('auth');
          setIsLogin(false); // Força tela de cadastro
        }
      }

      let currentRole = 'patient';
      
      // Verifica primeiro se o usuário está logado e se tem assinatura ativa
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // BYPASS MESTRE DE SEGURANÇA E RECARREGAMENTO F5 DO ADMIN GLOBAL
        const isAdmin = isAdminEmail(user.email || '');
        
        if (isAdmin) {
          setIsPremium(true);
          setView('admin');
          setStage('adventure');
          
          const cloudData = await loadFromCloud(user);
          if (cloudData) {
            if (cloudData.children) setChildren(cloudData.children);
            if (cloudData.activeChildId) setActiveChildId(cloudData.activeChildId);
            if (cloudData.fleetId) setFleetId(cloudData.fleetId);
            if (cloudData.language) setLanguage(cloudData.language);
          }
          return; // Finaliza bypassando qualquer restrição
        }

        // Sincroniza preventivamente o e-mail no Supabase para garantir webhooks de alta precisão
        if (user.email) {
          try {
            await supabase
              .from('profiles')
              .update({ email: user.email })
              .eq('id', user.id)
              .is('email', null);
          } catch (e) {
            console.warn("Não foi possível atualizar o e-mail no perfil (possível falta de permissão ou coluna). Ignorando.", e);
          }
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_price_id, role, linked_professional_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          currentRole = profile.role;
          if (currentRole !== 'professional' && user.user_metadata?.role === 'professional') {
            currentRole = 'professional';
            fetch('/api/auth/update-role', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, role: 'professional' }) 
            }).catch(console.error);
          }
          profile.role = currentRole;
          setUserProfile(profile);
        }

        // SEMPRE faz a verificação dupla com Mercado Pago
        let syncStatus = profile?.subscription_status;
        let syncPriceId = profile?.subscription_price_id;

        try {
          const syncRes = await fetch('/api/subscription-sync', { method: 'POST' });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            syncStatus = syncData.status;
            syncPriceId = syncData.priceId;
          }
        } catch (syncErr) {
          console.error("Falha ao tentar sincronizar assinatura na inicialização:", syncErr);
        }

        if (syncStatus !== 'active' && !profile?.linked_professional_id) {
          setIsPremium(false);
          setSubscriptionPriceId(null);
          setStage('no_subscription');
          return; // Para a inicialização normal bloqueando o acesso
        } else {
          setIsPremium(true);
          if (syncPriceId) {
            setSubscriptionPriceId(syncPriceId);
          }
        }
      } else {
        // Se o usuário não estiver logado, não tenta restaurar progresso nem navegar para áreas restritas
        return;
      }
      const cloudData = await loadFromCloud();
      const saved = localStorage.getItem('desafio_estrelas_v2');
      let finalData = null;

      if (cloudData) {
        finalData = cloudData;
      } else if (saved) {
        finalData = JSON.parse(saved);
      }

      if (finalData) {
        const savedChildren: ChildData[] = finalData.children || [];
        if (finalData.language) setLanguage(finalData.language);

        const now = new Date();
        const todayStr = now.toLocaleDateString();

        const getWeekId = (date: Date) => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() + 4 - (d.getDay() || 7));
          const yearStart = new Date(d.getFullYear(), 0, 1);
          const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
          return `${d.getFullYear()}-${weekNo}`;
        };

        const currentWeekId = getWeekId(now);
        const currentMonthId = `${now.getFullYear()}-${now.getMonth()}`;

        const updatedChildren = savedChildren.map((child: ChildData) => ({
          ...child,
          tasks: (child.tasks || []).map((task: Task) => {
            if (task.status === 'done' && task.lastCompleted) {
              const completedDate = new Date(task.lastCompleted);
              const completedDateStr = completedDate.toLocaleDateString();
              const completedWeekId = getWeekId(completedDate);
              const completedMonthId = `${completedDate.getFullYear()}-${completedDate.getMonth()}`;

              if (task.recurrence === 'daily' && completedDateStr !== todayStr) return { ...task, status: 'available' as const };
              if (task.recurrence === 'weekly' && completedWeekId !== currentWeekId) return { ...task, status: 'available' as const };
              if (task.recurrence === 'monthly' && completedMonthId !== currentMonthId) return { ...task, status: 'available' as const };
            }
            return task;
          })
        }));

        setChildren(updatedChildren);
        setActiveChildId(finalData.activeChildId || null);
        if (finalData.parentPin) setParentPin(finalData.parentPin);
        if (finalData.fleetId) setFleetId(finalData.fleetId);
        
        if (currentRole === 'professional') {
          setView('professional');
          setStage('adventure');
        } else if (updatedChildren.length === 0) {
          setStage('setup_child');
        } else {
          // Stages proibidos de serem restaurados automaticamente:
          const BLOCKED_RESTORE_STAGES = ['checkout', 'no_subscription', 'welcome', 'auth'];
          if (finalData.stage && !BLOCKED_RESTORE_STAGES.includes(finalData.stage)) {
            setStage(finalData.stage);
          } else {
            setStage('select_child');
          }
        }
      } else if (user) {
        // Se o usuário está logado, é premium, mas não possui dados salvos (primeiro login)
        if (currentRole === 'professional') {
          setView('professional');
          setStage('adventure');
        } else {
          setStage('setup_child');
        }
      }
    };

    initData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') setStage('reset_password');
      if (event === 'SIGNED_IN' && session?.user) {
        if (session?.user?.user_metadata?.full_name) setParentName(session.user.user_metadata.full_name);
        
        // BYPASS MESTRE DE SEGURANÇA: Se for e-mail de admin global
        if (isAdminEmail(session.user.email || '')) {
          setIsPremium(true);
          setView('admin');
          setStage('adventure');
          const cloudData = await loadFromCloud(session.user);
          if (cloudData && cloudData.children) {
            setChildren(cloudData.children);
            setActiveChildId(cloudData.activeChildId || null);
            if (cloudData.fleetId) setFleetId(cloudData.fleetId);
            if (cloudData.language) setLanguage(cloudData.language);
          }
          return;
        }

        // Verifica a assinatura
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_price_id, role, linked_professional_id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          let effectiveRole = profile.role;
          if (effectiveRole !== 'professional' && session.user.user_metadata?.role === 'professional') {
            effectiveRole = 'professional';
            fetch('/api/auth/update-role', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: session.user.id, role: 'professional' }) 
            }).catch(console.error);
          }
          profile.role = effectiveRole;
          setUserProfile(profile);
        }

        // DUPLA VERIFICAÇÃO COM MERCADO PAGO NO LOGIN
        let syncStatus = profile?.subscription_status;
        let syncPriceId = profile?.subscription_price_id;

        try {
          const syncRes = await fetch('/api/subscription-sync', { method: 'POST' });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            syncStatus = syncData.status;
            syncPriceId = syncData.priceId;
          }
        } catch (syncErr) {
          console.error("Falha ao sincronizar assinatura no login:", syncErr);
        }

        if (syncStatus !== 'active' && !profile?.linked_professional_id) {
          setIsPremium(false);
          setSubscriptionPriceId(null);
          setStage('no_subscription');
        } else {
          setIsPremium(true);
          if (syncPriceId) {
            setSubscriptionPriceId(syncPriceId);
          }
          const cloudData = await loadFromCloud(session?.user);
          let onAuthRole = profile?.role || 'patient';
          if (onAuthRole !== 'professional' && session.user.user_metadata?.role === 'professional') {
             onAuthRole = 'professional';
          }

          if (cloudData && cloudData.children) {
            setChildren(cloudData.children);
            setActiveChildId(cloudData.activeChildId || null);
            if (cloudData.fleetId) setFleetId(cloudData.fleetId);
            if (cloudData.language) setLanguage(cloudData.language);
            
            if (onAuthRole === 'professional') {
              setView('professional');
              setStage('adventure');
            } else if (cloudData.children.length === 0) {
              setStage('setup_child');
            } else {
              const nextStage = (cloudData.stage === 'auth' || !cloudData.stage) ? 'select_child' : cloudData.stage;
              setStage(nextStage);
            }
          } else {
            setChildren([]);
            setActiveChildId(null);
            if (onAuthRole === 'professional') {
              setView('professional');
              setStage('adventure');
            } else {
              setStage('setup_child');
            }
          }
        }
      }
    });

    if (window.location.hash.includes('type=recovery')) setStage('reset_password');

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
