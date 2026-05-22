"use client";

import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  CheckCircle2,
  Settings,
  Lock,
  Unlock,
  Plus,
  ShoppingBag,
  Trophy,
  Clock,
  AlertCircle,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Gamepad2,
  Baby,
  Gift,
  ChevronRight,
  ChevronLeft,
  Trash,
  CreditCard,
  ShieldCheck,
  Brain,
  Camera,
  RefreshCw,
  Mail,
  User,
  Zap,
  History,
  LogOut,
  Rocket,
  Milestone,
  Lightbulb,
  Share2,
  Instagram,
  Facebook,
  MessageCircle,
  Copy,
  Heart
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/supabase/roles";
import confetti from "canvas-confetti";
import clsx from "clsx";

import { AVATARS, StarField, SpaceShipVideo, HeroCharacter, DailyConquestCelebration } from "@/components/desafio/HeroElements";
import { MissionList } from "@/components/desafio/MissionList";
import { RewardShop } from "@/components/desafio/RewardShop";
import { CognitiveBreathing } from "@/components/desafio/CognitiveBreathing";
import { ParentDashboard } from "@/components/desafio/ParentDashboard";
import type { ChildData, Stage, Task, Reward, TaskRecurrence, Planet } from "@/types/desafio";
import { translations, type Language } from "@/lib/translations";
import AuthStage from "@/components/auth/AuthStage";
import CheckoutStage from "@/components/auth/CheckoutStage";
import CognitiveLab from "@/components/desafio/CognitiveLab";
import { SearchingSignal } from "@/components/auth/SearchingSignal";
import SetupChildStage from "@/components/desafio/SetupChildStage";
import { LandingPage } from "@/components/landing/LandingPage";
import { OrbitalPlanet } from "@/components/desafio/OrbitalPlanet";
import { SetupPlanetsStage } from "@/components/desafio/SetupPlanetsStage";
import { SetupTasksStage } from "@/components/desafio/SetupTasksStage";
import { SetupRewardsStage } from "@/components/desafio/SetupRewardsStage";
import { RocketLaunchStage } from "@/components/desafio/RocketLaunchStage";
import { useAppInitializer } from "@/hooks/useAppInitializer";
import { AppHeader } from "@/components/shared/AppHeader";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ProfessionalDashboard } from "@/components/professional/ProfessionalDashboard";
import { Footer } from "@/components/Footer";
import { YEARLY_PRICE_IDS } from "@/lib/constants";
import { useCloudSync } from "@/hooks/useCloudSync";

const orbitalTransitionVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.1, 
    rotate: 120, 
    x: 300, 
    y: -100 
  },
  animate: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0, 
    x: 0, 
    y: 0,
    transition: { 
      type: "spring" as const,
      stiffness: 50,
      damping: 14
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.1, 
    rotate: -120, 
    x: -300, 
    y: 100,
    transition: { 
      duration: 0.8,
      ease: "easeInOut" as const
    }
  }
} as const;

const ClockDisplay = memo(({ language }: { language: string }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden md:flex flex-col items-end">
      <div className="text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-4 py-1 rounded-full border border-white/10 mb-1">
        {currentTime.toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
      <div className="text-xl font-black italic tracking-tighter text-white">
        {currentTime.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
});
ClockDisplay.displayName = 'ClockDisplay';


export default function DesafioEstrelas() {
  const getPlanName = () => {
    if (!isPremium) return 'Sem Plano';
    if (subscriptionPriceId && YEARLY_PRICE_IDS.has(subscriptionPriceId)) {
      return 'Comandante Estelar';
    }
    return 'Cadete Espacial';
  };

  const [supabase] = useState(() => createClient());
  const [stage, setStage] = useState<Stage>('landing');
  const [resetPassword, setResetPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [language, setLanguage] = useState<Language>('pt-BR');
  const t = useMemo(() => translations[language], [language]);

  // Novos Estados para Múltiplas Crianças
  const [children, setChildren] = useState<ChildData[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  // Estado Temporário para Criação
  const [newChild, setNewChild] = useState<Partial<ChildData>>({ 
    name: "", 
    avatar: "3d_sunglasses",
    gender: 'boy',
    age: 7,
    schoolGrade: "1º Ano"
  });

  // Estados para Customização
  const [customTask, setCustomTask] = useState<{ title: string, stars: number, recurrence: TaskRecurrence, planetId?: string }>({ title: "", stars: 5, recurrence: 'daily', planetId: "" });
  const [customReward, setCustomReward] = useState({ title: "", cost: 50 });

  const [view, setView] = useState<'child' | 'parent' | 'admin' | 'professional'>('child');
  const [parentSubView, setParentSubView] = useState<'approvals' | 'behavior' | 'history' | 'missions' | 'ranking' | 'settings' | 'fleet'>('approvals');
  const [parentPin, setParentPin] = useState("1234");
  const [fleetId, setFleetId] = useState("");
  const [fleetChildren, setFleetChildren] = useState<ChildData[]>([]);
  const [showPin, setShowPin] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showCognitiveLab, setShowCognitiveLab] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [copyRecruitSuccess, setCopyRecruitSuccess] = useState(false);
  const [pin, setPin] = useState("");
  const [laserTarget, setLaserTarget] = useState<{ x: number, y: number, taskId: string } | null>(null);
  const [animatingStar, setAnimatingStar] = useState<{ x: number, y: number } | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isSad, setIsSad] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionPriceId, setSubscriptionPriceId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  
  const [impersonatedPatientId, setImpersonatedPatientId] = useState<string | null>(null);
  const [isProfessionalViewer, setIsProfessionalViewer] = useState(false);

  // Hook de Nuvem (Estado Global)
  const { isSyncing, loadFromCloud, saveToCloud } = useCloudSync({
    supabase,
    setIsPremium,
    setSubscriptionPriceId,
    impersonatedPatientId
  });

  const loadFleetRanking = async () => {
    if (!fleetId) {
      setFleetChildren([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_fleet_ranking', { p_fleet_id: fleetId });

      if (error) throw error;

      if (data) {
        const allChildren: ChildData[] = [];
        data.forEach((row: any) => {
          // Filtra para não duplicar os próprios filhos na lista da frota
          const isOwnData = children.some(own => own.id === row.child_id);
          if (!isOwnData) {
            allChildren.push({
              id: row.child_id,
              name: row.name,
              avatar: row.avatar,
              stars: row.stars,
              dailyStars: 0,
              gender: 'boy', // Default para ranking de frota se não houver no banco
              tasks: [],
              rewards: [],
              history: [],
              badges: [],
              planets: []
            });
          }
        });
        setFleetChildren(allChildren);
      }
    } catch (e) {
      console.error("Erro ao carregar frota:", e);
    }
  };

  useEffect(() => {
    if (stage === 'adventure' || parentSubView === 'ranking') {
      loadFleetRanking();
    }
  }, [fleetId, stage, parentSubView]); // M8: 'children' removido — evita re-fetch a cada tarefa completada

  const BADGES = [
    { id: 'first_star', icon: '⭐', label: 'Primeiro Brilho', description: 'Ganhou sua primeira estrela', condition: (c: ChildData) => c.stars > 0 },
    { id: 'collector_10', icon: '💎', label: 'Explorador', description: 'Acumulou 10 estrelas', condition: (c: ChildData) => c.stars >= 10 },
    { id: 'collector_50', icon: '🏆', label: 'Comandante', description: 'Acumulou 50 estrelas', condition: (c: ChildData) => c.stars >= 50 },
    { id: 'collector_100', icon: '👑', label: 'Lenda Galáctica', description: 'Acumulou 100 estrelas', condition: (c: ChildData) => c.stars >= 100 },
    { id: 'mission_master', icon: '🔥', label: 'Incansável', description: 'Completou 5 missões', condition: (c: ChildData) => c.history.filter(h => h.type === 'gain').length >= 5 },
  ];



  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentName, setParentName] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [authRole, setAuthRole] = useState<'patient' | 'professional'>('patient');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accessCode, setAccessCode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Helpers para o Filho Ativo
  const activeChild = children.find((c: ChildData) => c.id === activeChildId);
  const tasks = activeChild?.tasks || [];
  const rewards = activeChild?.rewards || [];
  const stars = activeChild?.stars || 0;
  const history = activeChild?.history || [];

  // O relógio em tempo real foi isolado no componente ClockDisplay para evitar re-renderizações a cada segundo.

  useEffect(() => {
    // Sincronização inteligente de assinatura em background
    const syncSubscription = async () => {
      try {
        const res = await fetch('/api/subscription-sync', { method: 'POST' });
        const data = await res.json();
        if (data.priceId) {
          setSubscriptionPriceId(data.priceId);
        }
        if (data.status === 'active') {
          setIsPremium(true);
          // Se estava bloqueado na tela de assinatura, libera o acesso automaticamente em tempo real!
          if (stage === 'no_subscription') {
            const cloudData = await loadFromCloud();
            if (cloudData && cloudData.children) {
              setChildren(cloudData.children);
              setActiveChildId(cloudData.activeChildId || null);
            }
            setStage('select_child');
          }
        } else {
          setIsPremium(false);
        }
      } catch (err) {
        console.error("Erro ao sincronizar assinatura:", err);
      }
    };

    if (stage === 'adventure' || stage === 'select_child' || stage === 'no_subscription') {
      syncSubscription();
    }
  }, [stage]);

  useAppInitializer({
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
  });

  useEffect(() => {
    const dataToSave = { children, activeChildId, stage, parentPin, fleetId, language };
    localStorage.setItem('desafio_estrelas_v2', JSON.stringify(dataToSave));

    // Debounce cloud sync
    const timer = setTimeout(() => {
      saveToCloud(dataToSave);
    }, 2000);

    return () => clearTimeout(timer);
  }, [children, activeChildId, stage, parentPin, fleetId, language]);

  const checkAndResetTasks = (currentChildren: ChildData[]): ChildData[] | null => {
    let hasChanges = false;
    const today = new Date();

    const getMostRecentMonday = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const diff = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diff);
      return d;
    };

    const getFirstOfCurrentMonth = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(1);
      return d;
    };

    const updatedChildren = currentChildren.map(child => {
      let childHasChanges = false;

      const updatedTasks = child.tasks.map(task => {
        if (task.status !== 'done' || !task.lastCompleted) return task;

        const lastCompletedDate = new Date(task.lastCompleted);
        let shouldReset = false;

        if (task.recurrence === 'daily') {
          shouldReset = today.getFullYear() !== lastCompletedDate.getFullYear() ||
                       today.getMonth() !== lastCompletedDate.getMonth() ||
                       today.getDate() !== lastCompletedDate.getDate();
        } else if (task.recurrence === 'weekly') {
          const monday = getMostRecentMonday(today);
          shouldReset = lastCompletedDate < monday;
        } else if (task.recurrence === 'monthly') {
          const firstOfMonth = getFirstOfCurrentMonth(today);
          shouldReset = lastCompletedDate < firstOfMonth;
        }

        if (shouldReset) {
          hasChanges = true;
          childHasChanges = true;
          return { ...task, status: 'available' as const };
        }

        return task;
      });

      if (childHasChanges) {
        return { ...child, tasks: updatedTasks };
      }

      return child;
    });

    return hasChanges ? updatedChildren : null;
  };

  // Ref para o valor mais recente de children — evita closure stale e reinício
  // desnecessário do intervalo de polling a cada tarefa completada (I2)
  const childrenRef = useRef(children);
  useEffect(() => {
    childrenRef.current = children;
  }, [children]);

  // Efeito de inicialização e mudança de herói
  useEffect(() => {
    if (children.length === 0) return;
    const updated = checkAndResetTasks(children);
    if (updated) {
      setChildren(updated);
    }
  }, [activeChildId]);

  // Efeito de polling de background (60s) — intervalo estável, não reinicia a cada tarefa
  useEffect(() => {
    const interval = setInterval(() => {
      if (childrenRef.current.length === 0) return;
      const updated = checkAndResetTasks(childrenRef.current);
      if (updated) {
        setChildren(updated);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []); // Sem dependências: o intervalo vive durante toda a sessão ativa

  const updateActiveChild = useCallback((updates: Partial<ChildData> | ((prevChild: ChildData) => Partial<ChildData>)) => {
    setChildren((prev: ChildData[]) => prev.map(c => {
      if (c.id === activeChildId) {
        const newUpdates = typeof updates === 'function' ? updates(c) : updates;
        return { ...c, ...newUpdates };
      }
      return c;
    }));
  }, [activeChildId]);

  const handleAwardStars = (amount: number, gameTitle: string, scoreText?: string, playTime?: number) => {
    if (!activeChildId) return;

    const newHistoryItem = {
      id: Date.now().toString(),
      type: 'gain' as const,
      title: gameTitle,
      amount: amount,
      date: new Date().toISOString(),
      scoreText,
      playTime
    };

    setChildren((prev: ChildData[]) => prev.map(child => {
      if (child.id === activeChildId) {
        return {
          ...child,
          stars: child.stars + amount,
          history: [newHistoryItem, ...(child.history || [])]
        };
      }
      return child;
    }));
  };

  const removeChild = async (id: string) => {
    const remaining = children.filter(c => c.id !== id);
    setChildren(remaining);
    
    // Explicitly save the deletion to cloud to overwrite even if it becomes empty
    let nextActiveId = activeChildId;
    let nextStage = stage;
    let nextView = view;
    
    if (activeChildId === id) {
      if (remaining.length > 0) {
        nextActiveId = remaining[0].id;
        setActiveChildId(nextActiveId);
        nextView = 'child';
        setView(nextView);
      } else {
        nextActiveId = null;
        setActiveChildId(null);
        nextStage = 'select_child';
        setStage(nextStage);
      }
    }
    
    saveToCloud({ children: remaining, activeChildId: nextActiveId, stage: nextStage, parentPin, fleetId, language }, true);

    // Também remover o perfil da tabela fleet_rankings
    try {
      await supabase.from('fleet_rankings').delete().eq('child_id', id);
    } catch (err) {
      console.error("Erro ao remover criança do fleet_rankings:", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    // ENTRAR NO MODO BUSCANDO SINAL DO TRANSMISSOR E SALVAR TIMESTAMP IMEDIATAMENTE (UX MÁXIMA)
    setStage('searching_signal');
    const startTime = Date.now();

    try {
      let user = null;

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error("❌ Erro no signIn:", error);
          throw error;
        }
        user = data.user;
      } else {
        if (!parentName) throw new Error("Por favor, digite seu nome.");

        // Validação de código de acesso para pacientes, se fornecido
        let validInvite: any = null;
        if (authRole === 'patient' && accessCode.trim()) {
           const { data: invite, error: inviteError } = await supabase
             .from('professional_invites')
             .select('id, professional_id, status')
             .eq('access_code', accessCode.trim())
             .single();
           
           if (inviteError || !invite || invite.status !== 'pending') {
              throw new Error("Código de acesso inválido ou já utilizado.");
           }
           validInvite = invite;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: parentName, role: authRole, source: 'desafio_estrelas' } }
        });

        if (signUpError) throw signUpError;
        user = signUpData.user;

        // O trigger padrão do banco pode colocar como 'lead'. 
        // A correção é feita em checkAndLoadData lendo o user_metadata.

        // Se o cadastro foi de paciente com convite válido, vincula
        if (user && validInvite) {
           await supabase.from('profiles').update({ linked_professional_id: validInvite.professional_id, subscription_status: 'active' }).eq('id', user.id);
           await supabase.from('professional_invites').update({ status: 'used', used_at: new Date().toISOString() }).eq('id', validInvite.id);
           
           // Atualiza contagem
           const { data: sub } = await supabase.from('professional_subscriptions').select('id, used_invites').eq('professional_id', validInvite.professional_id).single();
           if (sub) {
              await supabase.from('professional_subscriptions').update({ used_invites: (sub.used_invites || 0) + 1 }).eq('id', sub.id);
           }
        }

        if (signUpData.user && !signUpData.session) {
          setAuthError("Confirme seu e-mail para continuar.");
          setStage('auth');
          setAuthLoading(false);
          return;
        }

        // I4: Guard explícito — só envia welcome-email se o user.id existir
        if (user?.id) {
          fetch("/api/auth/welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id, full_name: parentName, source: 'desafio_estrelas' })
          }).catch(err => console.error("Erro e-mail:", err));
        }
      }

      if (!user) throw new Error("Usuário não retornado pelo servidor.");

      // FUNÇÃO AUXILIAR PARA CONSULTAS DO BANCO EM SEGUNDO PLANO
      const checkAndLoadData = async () => {
        // 1. Busca o status de assinatura
        const { data: profileData } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_price_id, role, linked_professional_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          let effectiveRole = profileData.role;
          if (effectiveRole !== 'professional' && user.user_metadata?.role === 'professional') {
            effectiveRole = 'professional';
            // Dispara chamada para a API admin para corrigir o banco em segundo plano (ignora RLS)
            fetch('/api/auth/update-role', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, role: 'professional' }) 
            }).catch(console.error);
          }
          profileData.role = effectiveRole;
        }

        if (profileData?.subscription_status !== 'active') {
          return { active: false, profileData };
        }

        // 2. Busca o estado do jogo na nuvem
        const { data, error } = await supabase
          .from('patient_gamification')
          .select('state')
          .eq('profile_id', user.id)
          .maybeSingle();

        return { active: true, profileData, cloudData: data?.state, error };
      };

      // Executa as buscas em background
      const result = await checkAndLoadData();

      // Garante que o radar galáctico apareça por pelo menos 3.0 segundos (UX / Conforto visual)
      const elapsed = Date.now() - startTime;
      const minDelay = 3000;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }

      // BYPASS MESTRE DE SEGURANÇA: Se for e-mail de admin global
      if (isAdminEmail(user.email)) {
        setIsPremium(true);
        setView('admin');
        setStage('adventure');
        setAuthLoading(false);
        const cloudData = result.cloudData;
        if (cloudData && cloudData.children) {
          setChildren(cloudData.children);
          setActiveChildId(cloudData.activeChildId || null);
          if (cloudData.parentPin) setParentPin(cloudData.parentPin);
          if (cloudData.fleetId) setFleetId(cloudData.fleetId);
          if (cloudData.language) setLanguage(cloudData.language);
        }
        return;
      }

      // Define o userProfile logo cedo, para que as telas (como no_subscription) saibam o role
      if (result.profileData) {
        setUserProfile(result.profileData);
      }

      if (!result.active) {
        setIsPremium(false);
        setSubscriptionPriceId(null);
        // Se o usuário veio de um plano escolhido na LP, vai direto pro checkout transparente
        if (selectedPlan) {
          setStage('checkout');
        } else {
          setStage('no_subscription');
        }
        setAuthLoading(false);
        return;
      }

      // Removido bypass de professional aqui, pois agora eles precisam pagar também
      // A transição para o ProfessionalDashboard ocorrerá após o pagamento, ou
      // se já tiver status active, ele cai no mesmo if abaixo que usa o userProfile
      
      setIsPremium(true);

      if (result.profileData?.subscription_price_id) {
        setSubscriptionPriceId(result.profileData.subscription_price_id);
      }

      const cloudData = result.cloudData;

      if (cloudData) {
        // TRAVA DE SEGURANÇA: Só atualiza se houver a propriedade children na nuvem
        // Se a nuvem tiver um array vazio (herói deletado), ele deve sobrescrever o cache local
        if (cloudData.children) {
          setChildren(cloudData.children);
          setActiveChildId(cloudData.activeChildId || null);
          if (cloudData.parentPin) setParentPin(cloudData.parentPin);
          if (cloudData.fleetId) setFleetId(cloudData.fleetId);
          if (cloudData.language) setLanguage(cloudData.language);

        if (result.profileData?.role === 'professional') {
          setView('professional');
          setStage('adventure'); // Aqui a gente manda pro adventure, mas como a view é professional, vai renderizar o painel
        } else {
          if (cloudData.children.length === 0) {
            setStage('setup_child');
          } else {
            const nextStage = (cloudData.stage === 'auth' || !cloudData.stage) ? 'select_child' : cloudData.stage;
            setStage(nextStage);
            if (nextStage === 'adventure') setView('child');
          }
        }
        } else {
          setStage(children.length > 0 ? 'select_child' : 'setup_child');
        }
      } else {
        if (result.profileData?.role === 'professional') {
          setView('professional');
          setStage('adventure');
        } else {
          setStage(children.length > 0 ? 'select_child' : 'setup_child');
        }
      }

    } catch (err: any) {
      console.error("💥 Falha total no handleAuth:", err);
      let errorMessage = err.message || "Erro desconhecido ao conectar.";
      if (errorMessage.includes("already registered")) errorMessage = "Este e-mail já está cadastrado. Tente fazer login.";
      else if (errorMessage.includes("Password should be at least")) errorMessage = "Sua senha deve ter pelo menos 6 caracteres.";
      else if (errorMessage.includes("Invalid login credentials")) errorMessage = "E-mail ou senha incorretos.";
      else if (errorMessage.includes("Email not confirmed")) errorMessage = "Confirme seu e-mail para continuar.";
      
      setAuthError(errorMessage);
      setStage('auth'); // Devolve para tela de login em caso de falha de autenticação
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setAuthError("Digite seu e-mail para receber o código.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setAuthSuccess("Código enviado! Verifique seu e-mail.");
      setStage('enter_code');
    } catch (err: any) {
      setAuthError(err.message || "Erro ao enviar código.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryCode.length < 6) {
      setAuthError("O código deve ter pelo menos 6 dígitos.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: recoveryCode,
        type: 'recovery'
      });
      if (error) throw error;
      setStage('reset_password');
    } catch (err: any) {
      setAuthError("Código inválido ou expirado. Tente novamente.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateChild = () => {
    const id = Date.now().toString();
    const child: ChildData = {
      id,
      name: newChild.name || "Herói",
      avatar: newChild.avatar || "3d_sunglasses",
      gender: (newChild.gender as any) || 'boy',
      age: newChild.age,
      birthDate: newChild.birthDate,
      schoolGrade: newChild.schoolGrade,
      stars: 10,
      dailyStars: 0,
      tasks: [],
      rewards: [],
      badges: [],
      history: [],
      planets: []
    };
    setChildren([...children, child]);
    setActiveChildId(id);
    setStage('setup_planets');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword.length < 6) {
      setAuthError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.updateUser({ password: resetPassword });
      if (error) throw error;
      
      // CARREGAR DADOS IMEDIATAMENTE APÓS RECOVERY
      const cloudData = await loadFromCloud();
      if (cloudData && cloudData.children) {
        setChildren(cloudData.children);
        setActiveChildId(cloudData.activeChildId || null);
        if (cloudData.parentPin) setParentPin(cloudData.parentPin);
        if (cloudData.fleetId) setFleetId(cloudData.fleetId);
      }

      setAuthSuccess("Senha atualizada! Missão recuperada.");
      setTimeout(() => setStage('select_child'), 2000);
    } catch (err: any) {
      setAuthError(err.message || "Erro ao atualizar senha.");
    } finally {
      setAuthLoading(false);
    }
  };
  const handleStartAdventure = () => {
    if (tasks.length === 0 || rewards.length === 0) { alert("Configure o universo primeiro!"); return; }
    setStage('rocket_launch');
  };

  const handleCompleteTask = (task: Task, e: React.MouseEvent) => {
    if (task.status !== 'available') return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setLaserTarget({ x, y, taskId: task.id });

    setTimeout(() => {
      setAnimatingStar({ x: e.clientX, y: e.clientY });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#4ade80', '#22c55e', '#f59e0b'] });

      updateActiveChild({
        tasks: tasks.map((t: Task) => t.id === task.id ? { ...t, status: 'pending' } : t)
      });
      setLaserTarget(null);
    }, 600);
  };
  const handleApprove = (taskId: string) => {
    const task = tasks.find((t: Task) => t.id === taskId);
    if (task && activeChild) {
      const newStars = activeChild.stars + task.stars;
      const newHistory = [{ id: Date.now().toString(), title: task.title, type: 'gain' as const, amount: task.stars, date: new Date().toLocaleString() }, ...history].slice(0, 20);
      const completedAt = new Date().toISOString();

      // Acumula o log de conclusões (mantém histórico entre ciclos de tarefas recorrentes)
      const updatedTask = (t: Task) => t.id === taskId
        ? { ...t, status: 'done' as const, lastCompleted: completedAt, completionLog: [...(t.completionLog || []), completedAt] }
        : t;

      // Checar Badges
      const currentBadges = activeChild.badges || [];
      const unlockedNow = BADGES.filter(b => !currentBadges.includes(b.id) && b.condition({ ...activeChild, stars: newStars, history: newHistory } as ChildData));

      if (unlockedNow.length > 0) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.3 }, colors: ['#2dd4bf', '#ffffff', '#fbbf24'] });
        updateActiveChild({
          stars: newStars,
          dailyStars: activeChild.dailyStars + task.stars,
          tasks: tasks.map(updatedTask),
          history: newHistory,
          badges: [...currentBadges, ...unlockedNow.map(b => b.id)]
        });
      } else {
        updateActiveChild({
          stars: newStars,
          dailyStars: activeChild.dailyStars + task.stars,
          tasks: tasks.map(updatedTask),
          history: newHistory
        });
      }

      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 2000);
    }
  };


  const handleDeductStars = (amount: number, reason: string) => {
    if (stars === 0 || !activeChild) return;
    updateActiveChild({
      stars: Math.max(0, activeChild.stars - amount),
      history: [{ id: Date.now().toString(), title: reason, type: 'loss' as const, amount: amount, date: new Date().toLocaleString() }, ...history].slice(0, 20)
    });
    setIsSad(true);
    setTimeout(() => setIsSad(false), 3000);
  };

  const handleLogout = async () => {
    if (isProfessionalViewer) {
      setIsProfessionalViewer(false);
      setImpersonatedPatientId(null);
      setChildren([]); 
      setActiveChildId(null);
      setView('professional');
      return;
    }
    
    setAuthLoading(true);
    // Força a sincronização dos dados atuais antes de deslogar (bypass do debounce de 2s)
    if (children.length > 0) {
      const currentState = { children, activeChildId, stage, parentPin, fleetId, language };
      await saveToCloud(currentState);
    }

    // Reseta estados locais de interface para garantir logout limpo em qualquer view
    setShowPin(false);
    setPin('');
    setView('child');

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("❌ Erro ao invalidar sessão na API do Supabase:", err);
    } finally {
      // Preserva a preferência de idioma antes de limpar tudo
      let savedLanguage: string | null = null;
      try {
        const stored = localStorage.getItem('desafio_estrelas_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          savedLanguage = parsed.language || null;
        }
      } catch {}
      localStorage.clear();
      if (savedLanguage) {
        localStorage.setItem('desafio_estrelas_v2', JSON.stringify({ language: savedLanguage }));
      }
      
      if (typeof document !== 'undefined') {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
      
      setActiveChildId(null);
      setStage('welcome');
      window.location.reload();
    }
  };

  const handleRedeemReward = (reward: Reward) => {
    if (!activeChild || activeChild.stars < reward.cost) return;

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#ffffff']
    });

    updateActiveChild({
      stars: activeChild.stars - reward.cost,
      history: [{
        id: Date.now().toString(),
        title: `Resgate: ${reward.title}`,
        type: 'redeem' as const,
        amount: reward.cost,
        date: new Date().toLocaleString()
      }, ...history].slice(0, 20)
    });

    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 3000);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === parentPin) {
      setView(view === 'child' ? 'parent' : 'child');
      setShowPin(false);
      setPin("");
    } else {
      alert("PIN Incorreto! Tente novamente.");
      setPin("");
    }
  };

  const addTask = useCallback((title: string, starCount: number, recurrence: TaskRecurrence = 'daily', planetId?: string) => {
    const newTask: Task = { id: Date.now().toString(), title, stars: starCount, recurrence, status: 'available', planetId };
    updateActiveChild(child => ({ tasks: [...child.tasks, newTask] }));
  }, [updateActiveChild]);

  const removeTask = useCallback((id: string) => {
    updateActiveChild(child => ({ tasks: child.tasks.filter(t => t.id !== id) }));
  }, [updateActiveChild]);

  const addReward = useCallback((title: string, cost: number) => {
    const newReward: Reward = { id: Date.now().toString(), title, cost };
    updateActiveChild(child => ({ rewards: [...child.rewards, newReward] }));
  }, [updateActiveChild]);

  const removeReward = useCallback((id: string) => {
    updateActiveChild(child => ({ rewards: child.rewards.filter(r => r.id !== id) }));
  }, [updateActiveChild]);

  const taskPresets = t.taskPresets;
  const rewardPresets = t.rewardPresets;
  const planetPresets = t.planetPresets;

  const [customPlanet, setCustomPlanet] = useState({ title: "", icon: "🪐" });

  const addPlanet = useCallback((title: string, icon: string) => {
    const newPlanet: Planet = { id: Date.now().toString(), title, icon, achieved: false };
    updateActiveChild(child => ({ planets: [...(child.planets || []), newPlanet] }));
  }, [updateActiveChild]);

  const removePlanet = useCallback((id: string) => {
    updateActiveChild(child => ({ planets: (child.planets || []).filter(p => p.id !== id) }));
  }, [updateActiveChild]);

  const handleSaveNote = (content: string) => {
    if (!activeChild || !content.trim()) return;
    updateActiveChild({
      history: [{
        id: Date.now().toString(),
        title: `Observação do Mentor`,
        type: 'note' as const,
        amount: 0,
        date: new Date().toISOString(),
        content: content.trim()
      }, ...(activeChild.history || [])].slice(0, 100)
    });
  };

  const getHeaderActions = () => {
    let onBack: (() => void) | undefined = undefined;
    let onLogout: (() => void) | undefined = undefined;

    switch (stage) {
      case 'auth':
        if (!isLogin) {
          onBack = () => setIsLogin(true);
        } else {
          onBack = () => setStage('landing');
        }
        break;
      case 'enter_code':
      case 'reset_password':
        onBack = () => setStage('auth');
        break;
      case 'select_child':
        onLogout = handleLogout;
        break;
      case 'setup_child':
        if (children.length > 0) {
          onBack = () => setStage('select_child');
        } else {
          onLogout = handleLogout;
        }
        break;
      case 'setup_avatar':
        onBack = () => setStage('setup_child');
        break;
      case 'setup_planets':
        onBack = () => setStage('setup_avatar');
        break;
      case 'setup_tasks':
        onBack = () => setStage('setup_planets');
        break;
      case 'setup_rewards':
        onBack = () => setStage('setup_tasks');
        break;
      case 'no_subscription':
        onLogout = handleLogout;
        break;
      case 'welcome':
        onBack = () => setStage('landing');
        break;
      default:
        break;
    }

    return { onBack, onLogout };
  };

  return (
    <div className={clsx("min-h-screen text-white font-sans selection:bg-primary/20 overflow-x-hidden relative flex flex-col", stage !== 'landing' && stage !== 'searching_signal' && stage !== 'adventure' && "pt-24")}>
      <StarField />

      {stage !== 'landing' && stage !== 'searching_signal' && stage !== 'adventure' && (
        <AppHeader
          stage={stage}
          {...getHeaderActions()}
        />
      )}

      <AnimatePresence mode="wait">

        {/* --- STAGE: LANDING --- */}
        {stage === 'landing' && (
        <LandingPage 
            language={language} 
            onLanguageChange={setLanguage} 
            onStart={() => setStage('auth')} 
            onSubscribe={async (plan) => {
              const { data: { user } } = await supabase.auth.getUser();
              setSelectedPlan(plan);
              if (user) {
                // Já logado → vai direto pro checkout transparente
                setStage('checkout');
              } else {
                // Não logado → manda pro cadastro, checkout vem depois do login
                setStage('auth');
              }
            }}
            deferredPrompt={deferredPrompt}
            onInstall={handleInstall}
          />
        )}

        {/* --- STAGE: WELCOME --- */}
        {stage === 'welcome' && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-12">
            <div className="absolute top-8 left-8 opacity-60 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Instituto Kamaleon</p>
            </div>

            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-10 bg-gradient-to-tr from-primary/20 via-purple-500/20 to-transparent blur-3xl rounded-full" />
              <motion.div initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="relative w-56 h-56 flex items-center justify-center mb-8">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                  <defs>
                    <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M50 5 L61 35 L95 35 L68 55 L78 85 L50 65 L22 85 L32 55 L5 35 L39 35 Z"
                    fill="url(#starGradient)"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <circle cx="35" cy="45" r="3" fill="#000" />
                  <circle cx="65" cy="45" r="3" fill="#000" />
                  <path d="M40 60 Q50 65 60 60" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                  <motion.path
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    d="M20 20 L25 25 M20 25 L25 20"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <motion.path
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    d="M80 20 L85 25 M80 25 L85 20"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </svg>
              </motion.div>
            </div>

            <div className="space-y-6 max-w-4xl">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                Desafio das <br /><span className="text-primary not-italic drop-shadow-[0_0_20px_rgba(45,212,191,0.5)]">Estrelas</span>
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[40px] text-left space-y-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center"><Brain className="w-6 h-6 text-primary" /></div>
                  <h3 className="font-black uppercase italic tracking-tighter text-lg">A Ciência por Trás</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium">Baseado na **Economia de Fichas (ABA)**, o app transforma obrigações em reforço positivo, criando caminhos neurais de prazer associados à responsabilidade.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[40px] text-left space-y-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center"><Milestone className="w-6 h-6 text-purple-400" /></div>
                  <h3 className="font-black uppercase italic tracking-tighter text-lg">Autonomia Real</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium">Ao gerenciar suas próprias estrelas, a criança desenvolve **autocontrole e paciência**, aprendendo que grandes prêmios exigem constância.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[40px] text-left space-y-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center"><Lightbulb className="w-6 h-6 text-blue-400" /></div>
                  <h3 className="font-black uppercase italic tracking-tighter text-lg">Vínculo Familiar</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium">O Desafio retira o foco do "não" e coloca no **reconhecimento**. O pai deixa de ser o cobrador e passa a ser o mentor da jornada.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <button onClick={() => setStage('auth')} className="group px-16 py-8 bg-primary text-black font-black uppercase tracking-widest rounded-[32px] hover:scale-105 transition-all flex items-center gap-4 text-xl shadow-[0_20px_50px_rgba(45,212,191,0.3)]">
                {t.startChallenge.replace('!', '')} <Rocket className="w-6 h-6 group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform" />
              </button>

              {deferredPrompt && (
                <button onClick={handleInstall} className="group px-10 py-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-[32px] hover:bg-white/10 transition-all flex items-center gap-3 text-sm">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" /> Instalar App
                </button>
              )}
            </div>
          </motion.div>
        )}

        {stage === 'auth' && (
          <AuthStage
            t={t}
            language={language}
            setLanguage={setLanguage}
            setStage={setStage}
            isLogin={isLogin}
            setIsLogin={setIsLogin}
            handleAuth={handleAuth}
            authLoading={authLoading}
            authError={authError}
            authSuccess={authSuccess}
            parentName={parentName}
            setParentName={setParentName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleForgotPassword={handleForgotPassword}
            authRole={authRole}
            setAuthRole={setAuthRole}
            accessCode={accessCode}
            setAccessCode={setAccessCode}
          />
        )}

        {stage === 'searching_signal' && (
          <SearchingSignal language={language} />
        )}

        {/* --- STAGE: ENTER CODE (OTP) --- */}
        {stage === 'enter_code' && (
          <motion.div key="enter_code" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
            <div className="space-y-2 text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t.authCodeTitle}</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center">{t.authCodeInstruction} <br/> <span className="text-white">{email}</span></p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[50px] space-y-6 shadow-2xl">
              <form onSubmit={handleVerifyCode} className="space-y-4">
                {authError && <div className="p-4 bg-red-500/20 text-red-200 text-[10px] font-bold rounded-2xl border border-red-500/30 text-center">{authError}</div>}
                <div className="space-y-4">
                  <input
                    required
                    autoFocus
                    type="text"
                    maxLength={10}
                    value={recoveryCode}
                    onChange={e => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-3xl md:text-4xl font-black tracking-[0.2em] md:tracking-[0.5em] outline-none focus:border-primary transition-all"
                  />
                  <p className="text-[9px] text-center text-white/20 font-bold uppercase italic">{t.authCodeFooter}</p>
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className={clsx(
                    "w-full py-5 font-black uppercase tracking-widest rounded-2xl shadow-xl mt-4 transition-all flex items-center justify-center gap-3",
                    authLoading ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-primary text-black hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  {authLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : t.validateCode}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* --- STAGE: RESET PASSWORD --- */}
        {stage === 'reset_password' && (
          <motion.div key="reset_password" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
            <div className="space-y-2 text-center">
              <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t.newPassword}</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{t.newPasswordDesc}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[50px] space-y-6 shadow-2xl">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {authError && <div className="p-4 bg-red-500/20 text-red-200 text-[10px] font-bold rounded-2xl border border-red-500/30 text-center">{authError}</div>}
                {authSuccess && <div className="p-4 bg-emerald-500/20 text-emerald-200 text-[10px] font-bold rounded-2xl border border-emerald-500/30 text-center">{authSuccess}</div>}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.newPasswordLabel}</label>
                  <input required type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder={t.minChars} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary transition-colors text-center text-2xl" />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className={clsx(
                    "w-full py-5 font-black uppercase tracking-widest rounded-2xl shadow-xl mt-4 transition-all flex items-center justify-center gap-3",
                    authLoading ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-primary text-black hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  {authLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : t.updatePassword}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* --- STAGE: NO SUBSCRIPTION (TELA DE BLOQUEIO DE ASSINATURA) --- */}
        {stage === 'no_subscription' && (
          <motion.div key="no_subscription" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-3xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8 text-center">
            <div className="absolute top-8 right-8">
              <button onClick={() => {
                const lang = localStorage.getItem('app_language');
                localStorage.clear(); 
                if (lang) localStorage.setItem('app_language', lang);
                window.location.reload(); 
              }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                <LogOut className="w-4 h-4" /> {t.logout}
              </button>
            </div>

            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-4xl animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                ⚠️
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                {t.noSubscriptionTitle}
              </h2>
              <p className="text-red-400 font-black uppercase tracking-widest text-[10px] md:text-xs">
                {t.noSubscriptionSubtitle}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[40px] space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
              
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                {t.noSubscriptionDesc}
              </p>

              {userProfile?.role === 'professional' ? (
                <div className="pt-4 space-y-6">
                  <div className="text-center mb-8 space-y-3 bg-white/5 p-4 rounded-2xl border border-primary/20 inline-block mx-auto w-full">
                    <h3 className="text-xl font-black italic text-primary uppercase">Escolha a capacidade do seu plano:</h3>
                    <p className="text-xs md:text-sm text-white/80">
                      <strong className="text-white">O que é uma licença?</strong><br/>
                      1 Licença = <strong className="text-primary">1 Pai/Mentor</strong>, que poderá cadastrar <strong className="text-primary">até 4 crianças</strong> na plataforma.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { 
                        limit: 1, monthly: "19,90", yearly: "199,00", 
                        name: "Pioneiro", 
                        desc: "Para pequenos acompanhamentos",
                        icon: "🚀", 
                        color: "from-blue-500/20 to-blue-900/20",
                        borderColor: "hover:border-blue-500/50"
                      },
                      { 
                        limit: 4, monthly: "59,70", yearly: "597,00", 
                        name: "Esquadrão", 
                        desc: "Forme sua equipe de exploradores",
                        icon: "🛸", 
                        color: "from-emerald-500/20 to-emerald-900/20",
                        borderColor: "hover:border-emerald-500/50",
                        popular: true
                      },
                      { 
                        limit: 9, monthly: "139,90", yearly: "1390,00", 
                        name: "Frota Estelar", 
                        desc: "Para grandes grupos clínicos",
                        icon: "🛰️", 
                        color: "from-purple-500/20 to-purple-900/20",
                        borderColor: "hover:border-purple-500/50"
                      },
                      { 
                        limit: 15, monthly: "199,90", yearly: "1900,00", 
                        name: "Aliança", 
                        desc: "Alcance máximo intergaláctico",
                        icon: "🌌", 
                        color: "from-amber-500/20 to-amber-900/20",
                        borderColor: "hover:border-amber-500/50"
                      }
                    ].map(plan => (
                      <div key={plan.limit} className={`bg-gradient-to-b ${plan.color} bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col justify-between space-y-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${plan.borderColor} relative overflow-hidden group`}>
                        {plan.popular && (
                          <div className="absolute top-0 inset-x-0 bg-primary text-black text-[9px] font-black uppercase tracking-widest py-1 text-center">
                            Mais Escolhido
                          </div>
                        )}
                        <div className="text-center space-y-2 mt-2">
                          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{plan.icon}</div>
                          <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">{plan.name}</h4>
                          <p className="text-[10px] text-white/60 uppercase tracking-widest">{plan.desc}</p>
                        </div>

                        <div className="flex flex-col items-center justify-center py-4 border-y border-white/10">
                          <span className="text-5xl font-black italic text-white drop-shadow-lg">{plan.limit}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/50 mt-1">Licenças</span>
                        </div>
                        
                        <div className="w-full space-y-3 mt-4">
                          <button onClick={() => { setSelectedPlan(`pro_${plan.limit}_monthly` as any); setStage('checkout'); }} className="w-full py-3 bg-white/5 hover:bg-white/15 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:border-white/30">
                            Mensal: R$ {plan.monthly}
                          </button>
                          <button onClick={() => { setSelectedPlan(`pro_${plan.limit}_yearly` as any); setStage('checkout'); }} className="w-full py-3.5 bg-primary hover:bg-teal-300 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)]">
                            Anual: R$ {plan.yearly}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Plano Mensal */}
                  <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl flex flex-col justify-between hover:border-white/30 transition-all hover:scale-[1.02] group">
                    <div className="space-y-2 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.planMonthlyLabel}</span>
                      <h3 className="text-xl font-black uppercase italic tracking-tight text-white group-hover:text-primary transition-colors">{t.planMonthlyName}</h3>
                      <p className="text-3xl font-black italic text-white">{t.planMonthlyPrice}<span className="text-xs font-normal text-white/40">{t.planMonthlyPeriod}</span></p>
                      <p className="text-[10px] text-white/50">{t.planMonthlyDesc}</p>
                    </div>
                    <button
                      onClick={() => {
                        const win = window as any;
                        if (!win.__mercadopago_initialized__ && process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
                          import('@mercadopago/sdk-react').then(({ initMercadoPago }) => {
                            initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, { locale: 'pt-BR' });
                            win.__mercadopago_initialized__ = true;
                          });
                        }
                        setSelectedPlan('monthly'); setStage('checkout');
                      }}
                      className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                    >
                      {t.planMonthlyActivate}
                    </button>
                  </div>

                  {/* Plano Anual */}
                  <div className="bg-primary/5 border-2 border-primary/20 p-6 md:p-8 rounded-3xl flex flex-col justify-between hover:border-primary/40 transition-all hover:scale-[1.02] relative overflow-hidden group shadow-lg shadow-primary/5">
                    <div className="absolute top-3 right-3 bg-primary text-black font-black text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                      {t.planAnnualSave}
                    </div>
                    <div className="space-y-2 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t.planAnnualLabel}</span>
                      <h3 className="text-xl font-black uppercase italic tracking-tight text-white group-hover:text-primary transition-colors">{t.planAnnualName}</h3>
                      <p className="text-3xl font-black italic text-white">{t.planAnnualPrice}<span className="text-xs font-normal text-white/40">{t.planAnnualPeriod}</span></p>
                      <p className="text-[10px] text-white/50">{t.planAnnualDesc}</p>
                    </div>
                    <button
                      onClick={() => {
                        const win = window as any;
                        if (!win.__mercadopago_initialized__ && process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
                          import('@mercadopago/sdk-react').then(({ initMercadoPago }) => {
                            initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, { locale: 'pt-BR' });
                            win.__mercadopago_initialized__ = true;
                          });
                        }
                        setSelectedPlan('yearly'); setStage('checkout');
                      }}
                      className="w-full mt-6 py-4 bg-primary text-black hover:bg-teal-300 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-lg shadow-primary/10"
                    >
                      {t.planAnnualActivate}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- STAGE: CHECKOUT TRANSPARENTE --- */}
        {stage === 'checkout' && (
          <CheckoutStage
            selectedPlan={selectedPlan || 'monthly'}
            onBack={() => setStage('no_subscription')}
            onSuccess={async () => {
              setIsPremium(true);
              setSubscriptionPriceId(selectedPlan);
              const cloudData = await loadFromCloud();
              if (cloudData?.children) {
                setChildren(cloudData.children);
                setActiveChildId(cloudData.activeChildId || null);
              }
              
              if (userProfile?.role === 'professional') {
                setView('professional');
                setStage('adventure');
              } else {
                setStage(children.length > 0 ? 'select_child' : 'setup_child');
              }
            }}
          />
        )}

        {/* --- STAGE: SELECT CHILD --- */}
        {stage === 'select_child' && (
          <motion.div key="select_child" className="relative z-10 w-full max-w-4xl mx-auto flex-1 flex flex-col justify-start md:justify-center p-6 py-12 md:py-6 space-y-8 md:space-y-12">

            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter">{t.whoIsTraveling}</h2>
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm">{t.selectProfile}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {children.map(c => {
                const avatar = AVATARS.find(a => a.id === c.avatar) || AVATARS[0];
                return (
                  <motion.button
                    key={c.id}
                    whileHover={{ scale: 1.05, y: -10 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setActiveChildId(c.id); setStage('adventure'); }}
                    className="flex flex-col items-center gap-4 group"
                  >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-zinc-800 border-4 border-white/10 group-hover:border-primary flex items-center justify-center text-5xl shadow-2xl transition-all overflow-hidden p-1">
                      {avatar.image ? (
                        <img src={avatar.image} alt={avatar.label} className="w-full h-full object-cover scale-110" />
                      ) : (
                        <div className="text-5xl">{(avatar as any).emoji}</div>
                      )}
                    </div>
                    <span className="text-xl font-black uppercase italic group-hover:text-primary transition-colors">{c.name}</span>
                    <div className="flex items-center gap-1 text-yellow-400 font-black">
                      <Star className="w-4 h-4 fill-yellow-400" /> {c.stars}
                    </div>
                  </motion.button>
                );
              })}

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => { setNewChild({ name: "", avatar: "ast1" }); setStage('setup_child'); }}
                className="flex flex-col items-center gap-4 group"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center text-white/20 group-hover:border-primary group-hover:text-primary transition-all">
                  <Plus className="w-12 h-12" />
                </div>
                <span className="text-xl font-black uppercase italic text-white/20 group-hover:text-primary">{t.newHero}</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {stage === 'setup_child' && (
          <SetupChildStage
            newChild={newChild}
            setNewChild={setNewChild}
            setStage={setStage}
            handleCreateChild={handleCreateChild}
            hasChildren={children.length > 0}
            t={t}
            handleLogout={handleLogout}
          />
        )}
        {stage === 'setup_avatar' && (
          <motion.div 
            key="setup_avatar" 
            variants={orbitalTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 w-full max-w-2xl mx-auto flex-1 flex flex-col justify-start md:justify-center px-4 py-8 md:p-6 space-y-8 text-center"
          >
            <div className="absolute top-8 left-8 z-[100]">
              <button 
                onClick={() => setStage('setup_child')}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all backdrop-blur-md border border-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <OrbitalPlanet type="purple" title="Nebula X" subtitle="Setor Nebulosa" />
            <div className="relative z-10 space-y-8 flex flex-col justify-center">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t.chooseAvatar}</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-6 bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-10 rounded-3xl md:rounded-[50px] shadow-2xl overflow-y-auto max-h-[50vh] md:max-h-none">
                {AVATARS.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setNewChild({ ...newChild, avatar: a.id })}
                    className={clsx(
                      "w-full aspect-square rounded-2xl md:rounded-3xl flex items-center justify-center transition-all border-2 overflow-hidden bg-zinc-800",
                      newChild.avatar === a.id ? "border-primary scale-105 shadow-[0_0_20px_rgba(45,212,191,0.3)]" : "border-white/10 hover:border-white/30"
                    )}
                  >
                    {a.image ? (
                      <img src={a.image} alt={a.label} className="w-full h-full object-cover scale-110" />
                    ) : (
                      <div className="text-3xl md:text-4xl text-white/60">{(a as any).emoji}</div>
                    )}
                  </button>
                ))}
              </div>
              <button onClick={handleCreateChild} className="w-full py-6 bg-primary text-black font-black uppercase rounded-[28px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">{t.confirmHero}</button>
            </div>
          </motion.div>
        )}

        {/* --- STAGE: SETUP PLANETS --- */}
        {stage === 'setup_planets' && (
          <SetupPlanetsStage
            orbitalTransitionVariants={orbitalTransitionVariants}
            t={t}
            customPlanet={customPlanet}
            setCustomPlanet={setCustomPlanet}
            addPlanet={addPlanet}
            planetPresets={t.planetPresets}
            activeChild={activeChild}
            removePlanet={removePlanet}
            setStage={setStage}
          />
        )}

        {/* --- STAGE: SETUP TASKS --- */}
        {stage === 'setup_tasks' && (
          <SetupTasksStage
            orbitalTransitionVariants={orbitalTransitionVariants}
            t={t}
            customTask={customTask}
            setCustomTask={setCustomTask}
            addTask={addTask}
            taskPresets={t.taskPresets}
            activeChild={activeChild}
            tasks={tasks}
            removeTask={removeTask}
            setStage={setStage}
          />
        )}

        {/* --- STAGE: SETUP REWARDS --- */}
        {stage === 'setup_rewards' && (
          <SetupRewardsStage
            orbitalTransitionVariants={orbitalTransitionVariants}
            t={t}
            customReward={customReward}
            setCustomReward={setCustomReward}
            addReward={addReward}
            rewardPresets={t.rewardPresets}
            rewards={rewards}
            removeReward={removeReward}
            handleStartAdventure={handleStartAdventure}
          />
        )}
        
        {/* --- STAGE: ROCKET LAUNCH --- */}
        {stage === 'rocket_launch' && (
          <RocketLaunchStage 
            onLaunchComplete={() => {
              setStage('adventure');
              setView('child');
            }} 
          />
        )}

        {/* --- DASHBOARD ADVENTURE --- */}
        {stage === 'adventure' && (
          <motion.div key="adventure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 pb-32">
          <DailyConquestCelebration tasks={tasks} t={t} onAwardStars={handleAwardStars} />

            <header className="sticky top-0 z-50 bg-[#16213e]/80 backdrop-blur-xl border-b border-white/10 p-3 md:p-6 flex justify-between items-center md:grid md:grid-cols-3 shadow-2xl">
              {/* Coluna 1: Esquerda - Avatar e Status da Criança */}
              <div className="flex items-center gap-3 md:gap-4 justify-start max-w-[60%] md:max-w-none">
                <div onClick={() => {
                  if (view === 'child') {
                    setShowPin(true);
                  } else {
                    setShowPin(false); // Fecha qualquer popup de PIN residual ao entrar na view child
                    setView('child');
                  }
                }} className="cursor-pointer group relative shrink-0">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-primary p-0.5 bg-zinc-900 shadow-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-xl md:text-2xl overflow-hidden">
                    {(() => {
                      const a = AVATARS.find(a => a.id === activeChild?.avatar);
                      if (!a) return null;
                      return a.image ? (
                        <img src={a.image} alt={a.label} className="w-full h-full object-cover scale-110" />
                      ) : (
                        <span>{(a as any).emoji}</span>
                      );
                    })()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-black w-4.5 h-4.5 md:w-5 md:h-5 rounded-full flex items-center justify-center border border-white">
                    {view === 'child' ? <Lock className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <Settings className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                  </div>
                </div>
                
                <div className="cursor-pointer min-w-0" onClick={() => setStage('select_child')}>
                  <h1 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/40 flex items-center gap-1.5 md:gap-2 flex-wrap truncate">
                    <span className="hidden md:inline">{t.mentor}: {parentName || 'Comandante Galáctico'}</span>
                    <span className="hidden md:inline text-white/20">•</span>
                    <span className="text-white font-bold">{activeChild?.name}</span>
                    <RefreshCw className="w-2.5 h-2.5 md:w-3 md:h-3 text-white/40 shrink-0" />
                  </h1>
                  
                  <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1 flex-wrap">
                    <p className="text-xs md:text-sm md:text-lg font-black italic uppercase tracking-tighter text-white/90 truncate">
                      {view === 'child' ? t.commandStation : t.controlRoom}
                    </p>
                    <span className={clsx(
                      "hidden sm:inline-block text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0",
                      isPremium 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    )}>
                      {getPlanName()}
                    </span>
                    <span className={clsx(
                      "hidden sm:inline-block text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0",
                      isPremium
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {isPremium ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Centro - Título Temático e Neon "Desafio das Estrelas" */}
              <div className="hidden md:flex items-center justify-center">
                <span className="font-black italic uppercase tracking-tighter text-xs sm:text-sm md:text-xl lg:text-2xl text-center select-none bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                  Desafio das <span className="text-primary not-italic drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]">Estrelas</span>
                </span>
              </div>

              {/* Coluna 3: Direita - Ações, Relógio, Estrelas e Logout */}
              <div className="flex gap-3 md:gap-6 items-center justify-end shrink-0">
                {/* Relógio e Data Isolados */}
                <ClockDisplay language={language} />

                 <div className="flex gap-2 relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRankingModal(true)}
                    className="bg-white/5 border border-white/10 rounded-[20px] md:rounded-[28px] px-3 py-1.5 md:px-6 md:py-3 flex items-center gap-1.5 md:gap-3 shadow-lg relative cursor-pointer hover:bg-white/10 transition-all"
                  >
                    {isSyncing && (
                      <div className="absolute -top-1 -right-1">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary rounded-full blur-md animate-pulse" />
                          <RefreshCw className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary animate-spin relative z-10" />
                        </div>
                      </div>
                    )}
                    <div className="relative shrink-0">
                      <Star id="total-stars-icon" className="w-4 h-4 md:w-6 md:h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                      <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5 border border-zinc-900">
                        <Trophy className="w-1.5 h-1.5 md:w-2 md:h-2 text-black" />
                      </div>
                    </div>
                    <span className="text-sm md:text-2xl font-black italic tracking-tighter text-white">{stars}</span>
                  </motion.div>

                  {/* Star Flight Animation — pointer-events-none para nunca bloquear cliques */}
                  <AnimatePresence>
                    {animatingStar && (
                      <motion.div
                        initial={{ x: animatingStar.x - 20, y: animatingStar.y - 20, opacity: 1, scale: 2 }}
                        animate={{
                          x: typeof window !== 'undefined' ? window.innerWidth - 100 : 0,
                          y: 40,
                          opacity: 0,
                          scale: 0.5,
                          rotate: 360
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "backIn" }}
                        className="fixed z-[100] pointer-events-none"
                      >
                        <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 shadow-[0_0_20px_white]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Botão de Logout — isolado em elemento próprio com z-index elevado,
                    sempre clicável independente de view, overlay ou animações ativas */}
                <button
                  onClick={handleLogout}
                  className="relative z-[80] bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 md:p-3 rounded-full hover:bg-red-500/20 active:scale-95 transition-all shadow-lg cursor-pointer shrink-0"
                  title={t.exitChallenge}
                >
                  <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </header>

            {/* Banner da Aliança Galáctica — Estilo Lilás */}
            {fleetId && (
              <div className="w-full bg-purple-500/10 backdrop-blur-md border-b border-purple-500/20 py-2 md:py-3 flex flex-col md:flex-row justify-center items-center gap-1 md:gap-12 overflow-hidden relative shadow-lg">
                <motion.div
                  animate={{ x: [-100, 100, -100] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent pointer-events-none"
                />
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-purple-400 rounded-full animate-pulse" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-purple-400/60">{t.galacticFleet}</span>
                  <div className="md:hidden w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
                </div>
                <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-[0.15em] md:tracking-[0.25em] text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] relative z-10 px-4 text-center">
                  {fleetId}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="md:hidden w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-purple-400/60">{t.activeSector}</span>
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-purple-400 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            <main className="p-6 max-w-7xl mx-auto pt-10 relative">
              {view === 'child' ? (
                <div className="flex flex-col lg:flex-row gap-12 items-start relative z-10">

                  {/* Herói Cartoon Lateral */}
                  <div className="lg:w-1/3 flex flex-col items-center lg:sticky lg:top-40 pt-4 md:pt-10">
                    <HeroCharacter
                      avatar={activeChild?.avatar || 'ast1'}
                      name={activeChild?.name || ''}
                      isFiring={!!laserTarget}
                      t={t}
                      onFlightComplete={() => setShowBreathingModal(true)}
                    />

                    <div className="mt-8 w-full max-w-xs space-y-6">
                      {/* Botão de Convite Temático */}
                      <button
                        onClick={() => setShowRecruitModal(true)}
                        className="w-full py-4 bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 hover:border-primary text-primary rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-primary/5 hover:scale-105 active:scale-95 group shrink-0"
                      >
                        <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Convocar Recruta 🛰️</span>
                      </button>

                      {/* Botão de Decolagem para o Laboratório Cognitivo */}
                      <button
                        onClick={() => setShowCognitiveLab(true)}
                        className="w-full py-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 hover:text-black border-2 border-indigo-500/30 hover:border-indigo-400 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 group text-primary hover:text-black shrink-0"
                      >
                        <Rocket className="w-4.5 h-4.5 animate-pulse group-hover:scale-110 transition-transform" />
                        <span>Academia de Pilotos 🚀</span>
                      </button>

                      {/* Seção de Medalhas */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-center flex items-center justify-center gap-2">
                          <Trophy className="w-3 h-3" /> {t.honorMedals}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {BADGES.map((badge: any) => {
                            const isUnlocked = activeChild?.badges?.includes(badge.id);
                            return (
                              <motion.div
                                key={badge.id}
                                initial={isUnlocked ? { scale: 1 } : { scale: 0.8, opacity: 0.3 }}
                                animate={isUnlocked ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.3 }}
                                className={clsx(
                                  "w-10 h-10 rounded-full flex items-center justify-center text-lg relative group transition-all",
                                  isUnlocked ? "bg-primary/20 border-2 border-primary shadow-[0_0_15px_rgba(45,212,191,0.3)]" : "bg-white/5 border border-white/10 grayscale"
                                )}
                              >
                                {badge.icon}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/20 px-2 py-1 rounded text-[8px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                  {badge.label}: {badge.description}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-center">{t.latestAchievements}</p>
                        {history.slice(0, 2).map((h: any) => (
                          <div key={h.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                            <span className="text-[10px] font-bold text-white/60 truncate max-w-[120px]">{h.title}</span>
                            <span className={clsx("text-xs font-black", h.type === 'gain' ? "text-primary" : "text-red-400")}>
                              {h.type === 'gain' ? `+${h.amount}` : `-${h.amount}`}⭐
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Espaço limpo e focado no herói */}
                    </div>

                    {(children.length > 1 || fleetChildren.length > 0) && (
                      <div className="space-y-3 pt-6 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-center">{t.allianceRanking}</p>
                        <div className="flex justify-center gap-2">
                          {[...children, ...fleetChildren].sort((a, b) => b.stars - a.stars).slice(0, 3).map((c: ChildData, idx: number) => (
                            <div key={c.id} className={clsx(
                              "flex flex-col items-center p-2 rounded-xl border",
                              c.id === activeChild?.id ? "bg-primary/10 border-primary/40" : "bg-white/5 border-white/10 opacity-60"
                            )}>
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center mb-1">
                                {(() => {
                                  const a = AVATARS.find(a => a.id === c.avatar) || AVATARS[0];
                                  return a.image ? <img src={a.image} className="w-full h-full object-cover scale-110" /> : <span className="text-lg">{(a as any).emoji}</span>;
                                })()}
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-tighter truncate max-w-[50px]">{c.name}</span>
                              <span className="text-[10px] font-black text-yellow-400">{c.stars}⭐</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:w-2/3 space-y-12 w-full">
                    <MissionList
                      tasks={tasks}
                      activeChildAvatar={activeChild?.avatar || 'ast1'}
                      handleCompleteTask={handleCompleteTask}
                      planets={activeChild?.planets || []}
                      t={t}
                    />
                    <RewardShop
                      rewards={rewards}
                      stars={stars}
                      handleRedeemReward={handleRedeemReward}
                      t={t}
                    />
                  </div>
                </div>
              ) : view === 'parent' ? (
                <ParentDashboard
                  parentSubView={parentSubView}
                  setParentSubView={setParentSubView}
                  children={children}
                  activeChild={activeChild}
                  activeChildId={activeChildId}
                  setActiveChildId={setActiveChildId}
                  tasks={tasks}
                  rewards={rewards}
                  history={history}
                  setStage={setStage}
                  setView={setView}
                  isPremium={isPremium}
                  subscriptionPriceId={subscriptionPriceId}
                  handleLogout={handleLogout}
                  setNewChild={setNewChild}
                  setStageSetupChild={() => { setStage('setup_child'); setNewChild({ name: "", avatar: "ast1" }); }}
                  handleApprove={handleApprove}
                  updateActiveChild={updateActiveChild}
                  addTask={addTask}
                  customTask={customTask}
                  setCustomTask={setCustomTask}
                  addReward={addReward}
                  customReward={customReward}
                  setCustomReward={setCustomReward}
                  removeTask={removeTask}
                  removeReward={removeReward}
                  taskPresets={taskPresets}
                  rewardPresets={rewardPresets}
                  fleetChildren={fleetChildren}
                  parentPin={parentPin}
                  setParentPin={setParentPin}
                  fleetId={fleetId}
                  setFleetId={setFleetId}
                  loadFleetRanking={loadFleetRanking}
                  handleDeductStars={handleDeductStars}
                  handleSaveNote={handleSaveNote}
                  removeChild={removeChild}
                  language={language}
                  setLanguage={setLanguage}
                  t={t}
                  parentName={parentName}
                  linkedProfessionalId={isProfessionalViewer ? null : (userProfile?.linked_professional_id || null)}
                />
              ) : view === 'professional' ? (
                <ProfessionalDashboard 
                  handleLogout={handleLogout}
                  setStage={setStage}
                  handleViewPatient={async (patientId) => {
                    setAuthLoading(true);
                    try {
                      const { data } = await supabase.from('patient_gamification').select('state').eq('profile_id', patientId).maybeSingle();
                      if (data?.state) {
                        const cloudData = data.state;
                        if (cloudData.children) {
                          setChildren(cloudData.children);
                          setActiveChildId(cloudData.activeChildId || null);
                          if (cloudData.parentPin) setParentPin(cloudData.parentPin);
                          if (cloudData.fleetId) setFleetId(cloudData.fleetId);
                          if (cloudData.language) setLanguage(cloudData.language);
                        }
                        setIsProfessionalViewer(true);
                        setImpersonatedPatientId(patientId);
                        setView('parent');
                        setParentSubView('approvals');
                      } else {
                        alert("Este paciente ainda não possui progresso salvo.");
                      }
                    } catch (e) {
                      console.error("Erro ao carregar paciente:", e);
                    }
                    setAuthLoading(false);
                  }}
                />
              ) : (
                <AdminDashboard setView={setView} language={language} t={t} handleLogout={handleLogout} />
              )}
            </main>

            {/* Rodapé Institucional Padronizado com Suporte e CRP */}
            {(view !== 'child' && ['landing', 'auth', 'no_subscription', 'select_child', 'adventure'].includes(stage)) && (
              <Footer language={language} />
            )}

            {/* Modal de Ranking Galáctico para a Criança */}
            <AnimatePresence>
              {showRankingModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/90 backdrop-blur-xl"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-lg bg-[#16213e] border-2 border-primary/20 rounded-[40px] shadow-2xl overflow-hidden"
                  >
                    <div className="p-8 border-b border-white/10 flex justify-between items-center bg-primary/5">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-400" />
                        <div>
                          <h2 className="text-2xl font-black uppercase italic tracking-tighter">{t.hallOfFame}</h2>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.heroesAllianceDesc}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowRankingModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {[...children, ...fleetChildren].sort((a, b) => b.stars - a.stars).map((c: ChildData, idx: number) => {
                        const avatar = AVATARS.find(av => av.id === c.avatar) || AVATARS[0];
                        const isMe = c.id === activeChild?.id;
                        return (
                          <div
                            key={c.id}
                            className={clsx(
                              "p-4 rounded-2xl border-2 flex items-center justify-between transition-all",
                              idx === 0 ? "bg-yellow-400/10 border-yellow-400/30" :
                                isMe ? "bg-primary/10 border-primary/30" : "bg-white/5 border-white/5"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <span className={clsx("text-lg font-black w-6 text-center", idx === 0 ? "text-yellow-400" : "text-white/20")}>{idx + 1}º</span>
                              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl border border-white/10 overflow-hidden">
                                {avatar.image ? <img src={avatar.image} className="w-full h-full object-cover scale-110" /> : <span>{(avatar as any).emoji}</span>}
                              </div>
                              <div>
                                <h3 className={clsx("text-sm font-black uppercase italic", isMe ? "text-primary" : "text-white")}>{c.name}</h3>
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20">{isMe ? t.you : t.allyHero}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black italic">{c.stars}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-6 bg-zinc-900/50">
                      <button onClick={() => setShowRankingModal(false)} className="w-full py-4 bg-primary text-black font-black uppercase rounded-2xl shadow-xl hover:scale-[1.02] transition-all">{t.backToMission}</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modal do Laboratório Cognitivo */}
            <AnimatePresence>
              {showCognitiveLab && (
                <CognitiveLab
                  onClose={() => setShowCognitiveLab(false)}
                  onAwardStars={handleAwardStars}
                  language={language}
                />
              )}
            </AnimatePresence>

            {/* Modal do Exercício de Respiração Estelar */}
            <AnimatePresence>
              {showBreathingModal && (
                <CognitiveBreathing
                  onClose={() => setShowBreathingModal(false)}
                  onAwardStars={handleAwardStars}
                  language={language}
                />
              )}
            </AnimatePresence>

            {/* Modal de Convocação de Recrutas */}
            <AnimatePresence>
              {showRecruitModal && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-2xl">
                  <div className="w-full max-w-md bg-[#0c1020] border-2 border-primary/20 rounded-[40px] shadow-2xl overflow-hidden text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                    
                    <div className="p-8 border-b border-white/10 flex justify-between items-center bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Share2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black uppercase italic tracking-tighter">Convocar Recrutas 🛰️</h2>
                          <p className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none mt-1">Indicar o Desafio das Estrelas</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setShowRecruitModal(false); setCopyRecruitSuccess(false); }} 
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer text-white border border-white/5"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="p-8 space-y-6">
                      <p className="text-white/60 text-xs md:text-sm leading-relaxed font-medium">
                        Sua convocação ajuda a espalhar o brilho do Desafio das Estrelas! Selecione uma plataforma para enviar ou copie o link pronto.
                      </p>

                      {/* Botões de Redes Sociais */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* WhatsApp */}
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            "Olá! Gostaria de recomendar o Desafio das Estrelas (https://www.desafioestrelas.com), uma ferramenta maravilhosa de gamificação galáctica e neurociência que auxilia pais e mentores no desenvolvimento de comportamentos positivos, rotinas saudáveis e treino cognitivo infantil de forma muito afetiva. Vale muito a pena conhecer!"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:scale-[1.03] transition-all text-xs font-black uppercase tracking-wider text-emerald-400 cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 shrink-0" /> WhatsApp
                        </a>

                        {/* Facebook */}
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.desafioestrelas.com')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:scale-[1.03] transition-all text-xs font-black uppercase tracking-wider text-indigo-400 cursor-pointer"
                        >
                          <Facebook className="w-4 h-4 shrink-0" /> Facebook
                        </a>

                        {/* Instagram */}
                        <a
                          href="https://www.instagram.com/desafioestrelasapp/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold hover:scale-[1.03] transition-all text-xs uppercase tracking-wider cursor-pointer border-none"
                        >
                          <Instagram className="w-4 h-4 shrink-0 text-white" /> Instagram
                        </a>

                        {/* TikTok */}
                        <a
                          href="https://www.tiktok.com/@desafioestrelasapp"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-[#010101] border-2 border-cyan-400/30 hover:border-cyan-400 text-cyan-400 font-bold hover:scale-[1.03] transition-all text-xs uppercase tracking-wider cursor-pointer"
                        >
                          <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.15 2.27 1.93 3.73 2.18.01 1.29 0 2.58-.01 3.87-.94-.09-1.87-.33-2.73-.75-.82-.41-1.54-.99-2.11-1.72-.02 2.22 0 4.43-.01 6.65-.05 1.53-.45 3.05-1.19 4.37-.81 1.4-2.02 2.52-3.48 3.19-1.46.68-3.11.91-4.71.66-1.59-.22-3.09-.97-4.24-2.11-1.15-1.12-1.89-2.61-2.12-4.19-.24-1.58-.02-3.21.64-4.66.67-1.47 1.81-2.67 3.25-3.37.93-.45 1.95-.7 2.97-.73 0 1.34.01 2.69.01 4.03-.68.02-1.36.19-1.95.53-.6.34-1.07.86-1.34 1.49-.28.62-.35 1.32-.21 2 .13.68.49 1.29.98 1.76.51.49 1.17.78 1.86.85.7.07 1.4-.07 2-.42.6-.34 1.05-.88 1.27-1.52.12-.39.16-.8.16-1.21-.01-3.69-.01-7.37-.01-11.06z"/>
                          </svg> TikTok
                        </a>

                        {/* E-mail */}
                        <a
                          href={`mailto:?subject=${encodeURIComponent('Recomendação: Desafio das Estrelas')}&body=${encodeURIComponent(
                            "Olá!\n\nGostaria de recomendar o Desafio das Estrelas (https://www.desafioestrelas.com), um aplicativo incrível de gamificação galáctica e neurociência cognitiva para auxiliar no desenvolvimento infantil, ajudando pais e mentores a fortalecerem rotinas, hábitos e habilidades socioemocionais através do reforço positivo.\n\nTenho certeza de que será de grande valor!\n\nAbraços."
                          )}`}
                          className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:scale-[1.03] transition-all text-xs font-black uppercase tracking-wider text-rose-400 cursor-pointer col-span-2"
                        >
                          <Mail className="w-4 h-4 shrink-0" /> E-mail
                        </a>
                      </div>

                      {/* Mensagem Formatada Pronta para Copiar */}
                      <div className="space-y-3 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Texto de indicação</span>
                        <div className="relative">
                          <textarea
                            readOnly
                            value="Olá! Gostaria de recomendar o Desafio das Estrelas (https://www.desafioestrelas.com), uma ferramenta maravilhosa de gamificação galáctica e neurociência que auxilia pais e mentores no desenvolvimento de comportamentos positivos, rotinas saudáveis e treino cognitivo infantil de forma muito afetiva. Vale muito a pena conhecer!"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white/70 outline-none h-24 resize-none pr-12 leading-relaxed"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                "Olá! Gostaria de recomendar o Desafio das Estrelas (https://www.desafioestrelas.com), uma ferramenta maravilhosa de gamificação galáctica e neurociência que auxilia pais e mentores no desenvolvimento de comportamentos positivos, rotinas saudáveis e treino cognitivo infantil de forma muito afetiva. Vale muito a pena conhecer!"
                              );
                              setCopyRecruitSuccess(true);
                              setTimeout(() => setCopyRecruitSuccess(false), 2000);
                            }}
                            className="absolute right-3 top-3 p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all cursor-pointer"
                          >
                            {copyRecruitSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {laserTarget && (
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    zIndex: 200,
                  }}
                >
                  <svg className="w-full h-full">
                    <motion.line
                      x1={typeof window !== 'undefined' && window.innerWidth < 1024 ? window.innerWidth / 2 : 150}
                      y1={typeof window !== 'undefined' && window.innerWidth < 1024 ? 200 : 400}
                      x2={laserTarget.x}
                      y2={laserTarget.y}
                      stroke="#4ade80"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="10 10"
                      className="drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                      animate={{ strokeDashoffset: [-20, 0] }}
                      transition={{ repeat: Infinity, duration: 0.2 }}
                    />
                    <motion.circle
                      cx={laserTarget.x}
                      cy={laserTarget.y}
                      r={20}
                      fill="#4ade80"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 2, 0] }}
                      transition={{ delay: 0.4, duration: 0.2 }}
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Acesso Parental Flutuante (Oculto no Modo Mentor) */}
            {view === 'child' && (
              <div className="fixed bottom-8 right-8 z-[60]">
                <button onClick={() => setShowPin(!showPin)} className="w-20 h-20 rounded-[30px] flex items-center justify-center shadow-2xl transition-all border-2 bg-white/5 text-white/40 border-white/10 backdrop-blur-md">
                  <Lock className="w-8 h-8" />
                </button>
                <AnimatePresence>{showPin && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-24 right-0 bg-[#16213e] border border-white/20 p-8 rounded-[40px] shadow-2xl w-72"><h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-center text-white/40">{t.authCode}</h3><form onSubmit={handlePinSubmit} className="space-y-6"><input autoFocus type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-3xl font-black tracking-[0.5em] outline-none focus:border-primary" /><button type="submit" className="w-full py-4 bg-primary text-black font-black uppercase rounded-2xl shadow-xl">{t.confirm}</button></form></motion.div>}</AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
