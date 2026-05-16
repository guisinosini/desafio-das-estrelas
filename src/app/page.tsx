"use client";

import { useState, useEffect, useRef, memo, useMemo } from "react";
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
  Lightbulb
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import confetti from "canvas-confetti";
import clsx from "clsx";

import { AVATARS, StarField, SpaceShipVideo, HeroCharacter, DailyConquestCelebration } from "@/components/desafio/HeroElements";
import { MissionList } from "@/components/desafio/MissionList";
import { RewardShop } from "@/components/desafio/RewardShop";
import { ParentDashboard } from "@/components/desafio/ParentDashboard";
import type { ChildData, Stage, Task, Reward, TaskRecurrence, Planet } from "@/types/desafio";
import { translations, type Language } from "@/lib/translations";
import AuthStage from "@/components/auth/AuthStage";
import SetupChildStage from "@/components/desafio/SetupChildStage";
import { LandingPage } from "@/components/landing/LandingPage";

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
    avatar: "ast1",
    gender: 'boy',
    age: 7,
    schoolGrade: "1º Ano"
  });

  // Estados para Customização
  const [customTask, setCustomTask] = useState<{ title: string, stars: number, recurrence: TaskRecurrence, planetId?: string }>({ title: "", stars: 5, recurrence: 'daily', planetId: "" });
  const [customReward, setCustomReward] = useState({ title: "", cost: 50 });

  const [view, setView] = useState<'child' | 'parent'>('child');
  const [parentSubView, setParentSubView] = useState<'approvals' | 'behavior' | 'history' | 'missions' | 'ranking' | 'settings' | 'fleet'>('approvals');
  const [parentPin, setParentPin] = useState("1234");
  const [fleetId, setFleetId] = useState("");
  const [fleetChildren, setFleetChildren] = useState<ChildData[]>([]);
  const [showPin, setShowPin] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [pin, setPin] = useState("");
  const [laserTarget, setLaserTarget] = useState<{ x: number, y: number, taskId: string } | null>(null);
  const [animatingStar, setAnimatingStar] = useState<{ x: number, y: number } | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isSad, setIsSad] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const saveToCloud = async (state: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // TRAVA DE SEGURANÇA: Não salva se a lista de filhos estiver vazia 
    // e o usuário acabou de logar (isso evita sobrescrever dados da nuvem com um estado inicial vazio)
    if (state.children.length === 0) {
      console.log("Sincronização abortada: lista de heróis vazia para evitar perda de dados.");
      return;
    }

    setIsSyncing(true);
    try {
      const payload: any = {
        profile_id: user.id,
        state: state,
        updated_at: new Date().toISOString()
      };

      if (state.fleetId) {
        payload.fleet_id = state.fleetId;
      }

      const { error } = await supabase
        .from('patient_gamification')
        .upsert(payload);

      if (error) {
        if (error.message.includes('fleet_id')) {
          delete payload.fleet_id;
          await supabase.from('patient_gamification').upsert(payload);
        }
      }
    } catch (e) {
      console.error("Erro na sincronização:", e);
    } finally {
      setIsSyncing(false);
    }
  };

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
  }, [fleetId, stage, parentSubView, children]);

  const BADGES = [
    { id: 'first_star', icon: '⭐', label: 'Primeiro Brilho', description: 'Ganhou sua primeira estrela', condition: (c: ChildData) => c.stars > 0 },
    { id: 'collector_10', icon: '💎', label: 'Explorador', description: 'Acumulou 10 estrelas', condition: (c: ChildData) => c.stars >= 10 },
    { id: 'collector_50', icon: '🏆', label: 'Comandante', description: 'Acumulou 50 estrelas', condition: (c: ChildData) => c.stars >= 50 },
    { id: 'collector_100', icon: '👑', label: 'Lenda Galáctica', description: 'Acumulou 100 estrelas', condition: (c: ChildData) => c.stars >= 100 },
    { id: 'mission_master', icon: '🔥', label: 'Incansável', description: 'Completou 5 missões', condition: (c: ChildData) => c.history.filter(h => h.type === 'gain').length >= 5 },
  ];

  const [isPremium, setIsPremium] = useState(false);

  const loadFromCloud = async (existingUser?: any) => {
    console.log("☁️ Tentando carregar dados da nuvem...");
    const user = existingUser || (await supabase.auth.getUser()).data.user;
    if (!user) {
      console.log("⚠️ Nenhum usuário logado para carregar nuvem.");
      return null;
    }

    try {
      // Busca o estado do jogo E o status da assinatura simultaneamente
      const [gamificationRes, profileRes] = await Promise.all([
        supabase.from('patient_gamification').select('state').eq('profile_id', user.id).maybeSingle(),
        supabase.from('profiles').select('subscription_status').eq('id', user.id).maybeSingle()
      ]);

      if (profileRes.data?.subscription_status === 'active') {
        setIsPremium(true);
      } else {
        setIsPremium(false);
      }

      if (gamificationRes.data?.state) {
        console.log("📦 Dados encontrados na nuvem!");
        return gamificationRes.data.state;
      }
    } catch (e) {
      console.error("💥 Erro ao carregar dados:", e);
    }
    return null;
  };

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
    // Detecção Automática de Idioma e Região
    const detectUserLanguage = () => {
      // 1. Tentar pegar do LocalStorage (preferência salva anteriormente)
      const saved = localStorage.getItem('desafio_estrelas_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language) return parsed.language;
      }

      // 2. Tentar detectar pelo navegador
      const browserLang = navigator.language || (navigator as any).userLanguage;
      console.log("🌐 Idioma detectado no navegador:", browserLang);

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
    setLanguage(initialLang);

    const initData = async () => {
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
        if (finalData.stage) setStage(finalData.stage);
      }
    };

    initData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Evento Auth:", event);
      if (event === 'PASSWORD_RECOVERY') setStage('reset_password');
      if (event === 'SIGNED_IN') {
        if (session?.user?.user_metadata?.full_name) setParentName(session.user.user_metadata.full_name);
        const cloudData = await loadFromCloud(session?.user);
        if (cloudData && cloudData.children) {
          setChildren(cloudData.children);
          setActiveChildId(cloudData.activeChildId || null);
          if (cloudData.fleetId) setFleetId(cloudData.fleetId);
          if (cloudData.language) setLanguage(cloudData.language);
        }
      }
    });

    if (window.location.hash.includes('type=recovery')) setStage('reset_password');

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const dataToSave = { children, activeChildId, stage, parentPin, fleetId, language };
    localStorage.setItem('desafio_estrelas_v2', JSON.stringify(dataToSave));

    // Debounce cloud sync
    const timer = setTimeout(() => {
      saveToCloud(dataToSave);
    }, 2000);

    return () => clearTimeout(timer);
  }, [children, activeChildId, stage, parentPin, fleetId, language]);

  const updateActiveChild = (updates: Partial<ChildData>) => {
    setChildren((prev: ChildData[]) => prev.map(c => c.id === activeChildId ? { ...c, ...updates } : c));
  };

  const removeChild = (id: string) => {
    const remaining = children.filter(c => c.id !== id);
    setChildren(remaining);
    if (activeChildId === id) {
      if (remaining.length > 0) {
        setActiveChildId(remaining[0].id);
        setView('child');
      } else {
        setActiveChildId(null);
        setStage('select_child');
      }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Iniciando handleAuth...");
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      let user = null;

      if (isLogin) {
        console.log("🔑 Tentando login para:", email);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error("❌ Erro no signIn:", error);
          throw error;
        }
        user = data.user;
      } else {
        console.log("📝 Tentando cadastro para:", email);
        if (!parentName) throw new Error("Por favor, digite seu nome.");

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: parentName, role: 'lead', source: 'desafio_estrelas' } }
        });

        if (signUpError) throw signUpError;
        user = signUpData.user;

        if (signUpData.user && !signUpData.session) {
          setAuthError("Confirme seu e-mail para continuar.");
          setAuthLoading(false);
          return;
        }

        fetch("/api/auth/welcome-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user?.id, full_name: parentName, source: 'desafio_estrelas' })
        }).catch(err => console.error("Erro e-mail:", err));
      }

      if (!user) throw new Error("Usuário não retornado pelo servidor.");

      console.log("✅ Autenticado com sucesso, carregando dados para:", user.id);
      const { data, error } = await supabase
        .from('patient_gamification')
        .select('state')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ Erro ao buscar nuvem no login:", error);
      }

      if (data && data.state) {
        const cloudData = data.state;

        // TRAVA DE SEGURANÇA: Só atualiza se houver dados reais na nuvem
        // Isso evita que um erro de RLS ou novo login limpe o progresso local
        if (cloudData.children && cloudData.children.length > 0) {
          console.log("Dados recuperados da nuvem com sucesso.");
          setChildren(cloudData.children);
          setActiveChildId(cloudData.activeChildId || null);
          if (cloudData.parentPin) setParentPin(cloudData.parentPin);
          if (cloudData.fleetId) setFleetId(cloudData.fleetId);
          if (cloudData.language) setLanguage(cloudData.language);

          const nextStage = (cloudData.stage === 'auth' || !cloudData.stage) ? 'select_child' : cloudData.stage;
          setStage(nextStage);
          if (nextStage === 'adventure') setView('child');
        } else {
          console.log("Nuvem vazia ou protegida. Mantendo dados locais para segurança.");
          setStage(children.length > 0 ? 'select_child' : 'setup_child');
        }
      } else {
        console.log("🆕 Novo usuário detectado, indo para setup...");
        setStage(children.length > 0 ? 'select_child' : 'setup_child');
      }

    } catch (err: any) {
      console.error("💥 Falha total no handleAuth:", err);
      setAuthError(err.message || "Erro desconhecido ao conectar.");
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
      avatar: newChild.avatar || "ast1",
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
    setStage('adventure'); setView('child');
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
    await supabase.auth.signOut();
    setStage('welcome');
    setActiveChildId(null);
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

  const addTask = (title: string, starCount: number, recurrence: TaskRecurrence = 'daily', planetId?: string) => {
    const newTask: Task = { id: Date.now().toString(), title, stars: starCount, recurrence, status: 'available', planetId };
    updateActiveChild({ tasks: [...tasks, newTask] });
  };

  const removeTask = (id: string) => {
    updateActiveChild({ tasks: tasks.filter(t => t.id !== id) });
  };

  const addReward = (title: string, cost: number) => {
    const newReward: Reward = { id: Date.now().toString(), title, cost };
    updateActiveChild({ rewards: [...rewards, newReward] });
  };

  const removeReward = (id: string) => {
    updateActiveChild({ rewards: rewards.filter(r => r.id !== id) });
  };

  const taskPresets = t.taskPresets;
  const rewardPresets = t.rewardPresets;
  const planetPresets = t.planetPresets;

  const [customPlanet, setCustomPlanet] = useState({ title: "", icon: "🪐" });

  const addPlanet = (title: string, icon: string) => {
    const newPlanet: Planet = { id: Date.now().toString(), title, icon, achieved: false };
    updateActiveChild({ planets: [...(activeChild?.planets || []), newPlanet] });
  };

  const removePlanet = (id: string) => {
    updateActiveChild({ planets: (activeChild?.planets || []).filter(p => p.id !== id) });
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-primary/20 overflow-x-hidden relative">
      <StarField />

      <AnimatePresence mode="wait">

        {/* --- STAGE: LANDING --- */}
        {stage === 'landing' && (
          <LandingPage 
            language={language} 
            onLanguageChange={setLanguage} 
            onStart={() => setStage('auth')} 
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
          />
        )}

        {/* --- STAGE: ENTER CODE (OTP) --- */}
        {stage === 'enter_code' && (
          <motion.div key="enter_code" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
            <button onClick={() => setStage('auth')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> Voltar</button>
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

        {/* --- STAGE: SELECT CHILD --- */}
        {stage === 'select_child' && (
          <motion.div key="select_child" className="relative z-10 max-w-4xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-12">
            <div className="absolute top-8 right-8">
              <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                <LogOut className="w-4 h-4" /> Sair da Conta
              </button>
            </div>

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
                    <div className="w-32 h-32 rounded-full bg-white/5 border-4 border-white/10 group-hover:border-primary flex items-center justify-center text-5xl shadow-2xl transition-all">
                      {avatar.emoji}
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
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center text-white/20 group-hover:border-primary group-hover:text-primary transition-all">
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
          />
        )}

        {/* --- STAGE: SETUP AVATAR --- */}
        {stage === 'setup_avatar' && (
          <motion.div key="setup_avatar" className="relative z-10 max-w-2xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8 text-center">
            <button onClick={() => setStage('setup_child')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> {t.back}</button>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t.chooseAvatar}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-6 bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-10 rounded-3xl md:rounded-[50px] shadow-2xl overflow-y-auto max-h-[50vh] md:max-h-none">
              {AVATARS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setNewChild({ ...newChild, avatar: a.id })}
                  className={clsx(
                    "w-full aspect-square rounded-2xl md:rounded-3xl flex items-center justify-center text-3xl md:text-4xl transition-all border-2",
                    newChild.avatar === a.id ? "bg-primary/20 border-primary scale-105 shadow-[0_0_20px_rgba(45,212,191,0.3)]" : "bg-white/5 border-white/10 hover:border-white/30"
                  )}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
            <button onClick={handleCreateChild} className="w-full py-6 bg-primary text-black font-black uppercase rounded-[28px] shadow-lg shadow-primary/20">{t.confirmHero}</button>
          </motion.div>
        )}

        {/* --- STAGE: SETUP PLANETS --- */}
        {stage === 'setup_planets' && (
          <motion.div key="setup_planets" className="relative z-10 max-w-2xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
            <button onClick={() => setStage('setup_avatar')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> {t.back}</button>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t.destinyPlanets}</h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg text-left" dangerouslySetInnerHTML={{ __html: t.planetExplainer }} />
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] space-y-6 shadow-2xl">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.createPlanet}</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Melhorar em Matemática"
                    value={customPlanet.title}
                    onChange={e => setCustomPlanet({ ...customPlanet, title: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-colors"
                  />
                  <input
                    type="text"
                    value={customPlanet.icon}
                    onChange={e => setCustomPlanet({ ...customPlanet, icon: e.target.value })}
                    className="w-16 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-center outline-none focus:border-primary"
                    placeholder="🪐"
                  />
                  <button
                    onClick={() => {
                      if (customPlanet.title) {
                        addPlanet(customPlanet.title, customPlanet.icon || "🪐");
                        setCustomPlanet({ title: "", icon: "🪐" });
                      }
                    }}
                    disabled={!customPlanet.title}
                    className="bg-primary/20 text-primary p-3 rounded-xl hover:bg-primary/30 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.quickSuggestions}:</p>
                <div className="flex flex-wrap gap-2">
                  {planetPresets.map((p: any) => (
                    <button
                      key={p.title}
                      onClick={() => addPlanet(p.title, p.icon)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:border-primary/50 transition-colors flex items-center gap-2"
                    >
                      <span>{p.icon}</span> {p.title} <Plus className="w-3 h-3 text-white/40" />
                    </button>
                  ))}
                </div>
              </div>

              {(activeChild?.planets?.length || 0) > 0 && (
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.chosenPlanets}</p>
                  <div className="space-y-2">
                    {activeChild?.planets?.map((p: Planet) => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{p.icon}</span>
                          <span className="font-bold text-sm">{p.title}</span>
                        </div>
                        <button onClick={() => removePlanet(p.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setStage('setup_tasks')}
                className="w-full py-5 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-xl mt-4"
              >
                {t.traceRoute}
              </button>
            </div>
          </motion.div>
        )}

        {/* --- STAGE: SETUP TASKS --- */}
        {stage === 'setup_tasks' && (
          <motion.div key="setup_tasks" className="relative z-10 max-w-2xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
            <button onClick={() => setStage('setup_planets')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> {t.back}</button>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t.journeyMissions}</h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg text-left" dangerouslySetInnerHTML={{ __html: t.taskExplainer }} />
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] space-y-6 shadow-2xl">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.createMission}:</p>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Lavar louça..."
                      value={customTask.title}
                      onChange={e => setCustomTask({ ...customTask, title: e.target.value })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-colors"
                    />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={customTask.stars}
                      onChange={e => setCustomTask({ ...customTask, stars: parseInt(e.target.value) || 0 })}
                      className="w-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-center outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.linkPlanet}</p>
                    <select
                      value={customTask.planetId || ''}
                      onChange={e => setCustomTask({ ...customTask, planetId: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-colors text-white/80 appearance-none cursor-pointer"
                    >
                      <option value="" className="text-black">{t.generalPlanetOption}</option>
                      {activeChild?.planets?.map((p: Planet) => (
                        <option key={p.id} value={p.id} className="text-black">{p.icon} {p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 flex-wrap gap-1">
                      {['daily', 'weekly', 'monthly', 'once'].map((rec) => (
                        <button
                          key={rec}
                          onClick={() => setCustomTask({ ...customTask, recurrence: rec as TaskRecurrence })}
                          className={clsx(
                            "px-3 py-2 text-[8px] md:text-[10px] font-black uppercase rounded-lg transition-all",
                            customTask.recurrence === rec ? "bg-primary text-black" : "text-white/40 hover:text-white"
                          )}
                        >
                          {rec === 'daily' ? t.daily : rec === 'weekly' ? t.weekly : rec === 'monthly' ? t.monthly : t.once}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={!customTask.title}
                      onClick={() => { addTask(customTask.title, customTask.stars, customTask.recurrence, customTask.planetId); setCustomTask({ title: "", stars: 5, recurrence: 'daily', planetId: "" }); }}
                      className="flex-1 py-3 bg-primary text-black font-black uppercase text-[10px] rounded-xl hover:scale-105 transition-all"
                    >
                      {t.addMissionBtn}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.quickSuggestions}:</p>
                <div className="flex flex-wrap gap-2">
                  {taskPresets.map((p: any) => (
                    <button key={p.title} onClick={() => addTask(p.title, p.stars)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
                      + {p.title} ({p.stars}⭐)
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.map((t: Task) => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">{t.stars}</div>
                      <span className="font-bold uppercase tracking-tight italic">{t.title}</span>
                    </div>
                    <button onClick={() => removeTask(t.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-5 h-5" /></button>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-center py-8 text-white/20 font-black uppercase italic tracking-widest">{t.radarEmpty}</p>}
              </div>

              <button disabled={tasks.length === 0} onClick={() => setStage('setup_rewards')} className="w-full py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">{t.continue}</button>
            </div>
          </motion.div>
        )}

        {/* --- STAGE: SETUP REWARDS --- */}
        {stage === 'setup_rewards' && (
          <motion.div key="setup_rewards" className="relative z-10 max-w-2xl mx-auto min-h-screen flex flex-col justify-col justify-center p-6 space-y-8">
            <button onClick={() => setStage('setup_tasks')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> {t.back}</button>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t.galacticTreasures}</h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg text-left" dangerouslySetInnerHTML={{ __html: t.rewardExplainer }} />
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] space-y-6 shadow-2xl">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.createTreasure}:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Cinema com pipoca..."
                    value={customReward.title}
                    onChange={e => setCustomReward({ ...customReward, title: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-yellow-400 transition-colors"
                  />
                  <input
                    type="number"
                    min="1"
                    value={customReward.cost}
                    onChange={e => setCustomReward({ ...customReward, cost: parseInt(e.target.value) || 0 })}
                    className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-center outline-none focus:border-yellow-400"
                  />
                  <button
                    disabled={!customReward.title}
                    onClick={() => { addReward(customReward.title, customReward.cost); setCustomReward({ title: "", cost: 50 }); }}
                    className="px-6 bg-yellow-400 text-black font-black uppercase text-[10px] rounded-xl hover:scale-105 transition-all shadow-lg shadow-yellow-400/20"
                  >
                    {t.add}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Sugestões Rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {rewardPresets.map((p: any) => (
                    <button key={p.title} onClick={() => addReward(p.title, p.cost)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all">
                      + {p.title} ({p.cost}⭐)
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {rewards.map((r: Reward) => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center text-yellow-400 font-black">{r.cost}</div>
                      <span className="font-bold uppercase tracking-tight italic">{r.title}</span>
                    </div>
                    <button onClick={() => removeReward(r.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-5 h-5" /></button>
                  </div>
                ))}
                {rewards.length === 0 && <p className="text-center py-8 text-white/20 font-black uppercase italic tracking-widest">{t.noRewardsAdded}</p>}
              </div>

              <button disabled={rewards.length === 0} onClick={handleStartAdventure} className="w-full py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">{t.startChallenge}</button>
            </div>
          </motion.div>
        )}

        {/* --- DASHBOARD ADVENTURE --- */}
        {stage === 'adventure' && (
          <motion.div key="adventure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 pb-32">
          <DailyConquestCelebration tasks={tasks} t={t} />

            <header className="sticky top-0 z-50 bg-[#16213e]/80 backdrop-blur-xl border-b border-white/10 p-4 md:p-6 flex justify-between items-center shadow-2xl">
              <div className="flex items-center gap-4">
                <div onClick={() => {
                  if (view === 'child') {
                    setShowPin(true);
                  } else {
                    setView('child');
                  }
                }} className="cursor-pointer group relative">
                  <div className="w-14 h-14 rounded-full border-2 border-primary p-0.5 bg-zinc-900 shadow-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-2xl">
                    {AVATARS.find(a => a.id === activeChild?.avatar)?.emoji}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                    {view === 'child' ? <Lock className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                  </div>
                </div>
                <div className="cursor-pointer" onClick={() => setStage('select_child')}>
                  <h1 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                    {parentName && `${t.mentor}: ${parentName} • `}{activeChild?.name} <RefreshCw className="w-3 h-3" />
                  </h1>
                  <p className="text-sm md:text-lg font-black italic uppercase tracking-tighter text-white">{view === 'child' ? t.commandStation : t.controlRoom}</p>
                </div>
              </div>


              <div className="flex gap-6 items-center">
                {/* Relógio e Data Isolados */}
                <ClockDisplay language={language} />

                <div className="flex gap-2 relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRankingModal(true)}
                    className="bg-white/5 border border-white/10 rounded-[28px] px-6 py-3 flex items-center gap-3 shadow-lg relative cursor-pointer hover:bg-white/10 transition-all"
                  >
                    {isSyncing && (
                      <div className="absolute -top-1 -right-1">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary rounded-full blur-md animate-pulse" />
                          <RefreshCw className="w-3 h-3 text-primary animate-spin relative z-10" />
                        </div>
                      </div>
                    )}
                    <div className="relative">
                      <Star id="total-stars-icon" className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                      <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5 border border-zinc-900">
                        <Trophy className="w-2 h-2 text-black" />
                      </div>
                    </div>
                    <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white">{stars}</span>
                  </motion.div>

                  {/* Star Flight Animation */}
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
                  <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-full hover:bg-red-500/20 transition-all shadow-lg" title={t.exitChallenge}>
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
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
                    />

                    <div className="mt-8 w-full max-w-xs space-y-6">
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

                      {/* Seção de Assinatura */}
                      <div className={clsx(
                        "p-4 rounded-2xl border flex flex-col gap-3 backdrop-blur-md",
                        isPremium ? "bg-primary/5 border-primary/20 shadow-[0_0_30px_-10px_rgba(45,212,191,0.2)]" : "bg-white/5 border-white/10"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            isPremium ? "bg-primary text-black" : "bg-white/10 text-white/40"
                          )}>
                            {isPremium ? <Sparkles className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{t.plan || 'Plano'}</p>
                            <p className={clsx("text-[10px] font-black uppercase tracking-tight italic", isPremium ? "text-primary" : "text-white")}>
                              {isPremium ? 'Comandante Estelar' : 'Cadete Espacial'}
                            </p>
                          </div>
                          {isPremium && (
                            <button
                              onClick={async () => {
                                const res = await fetch('/api/portal', { method: 'POST' });
                                const data = await res.json();
                                if (data.url) window.location.href = data.url;
                              }}
                              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                              title="Gerenciar Assinatura"
                            >
                              <Settings className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {!isPremium && (
                          <button
                            onClick={() => window.location.href = '/#pricing'}
                            className="w-full py-2 bg-primary/20 hover:bg-primary text-primary hover:text-black text-[9px] font-black uppercase rounded-lg transition-all border border-primary/20"
                          >
                            Seja Premium
                          </button>
                        )}
                      </div>
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
                              <span className="text-lg">{AVATARS.find(a => a.id === c.avatar)?.emoji}</span>
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
              ) : (













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
                  handleLogout={() => { 
                    const lang = localStorage.getItem('app_language');
                    localStorage.clear(); 
                    if (lang) localStorage.setItem('app_language', lang);
                    window.location.reload(); 
                  }}
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
                  removeChild={removeChild}
                  language={language}
                  setLanguage={setLanguage}
                  t={t}
                  parentName={parentName}
                />
              )}
            </main>

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
                              <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-2xl border border-white/10">
                                {avatar.emoji}
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
