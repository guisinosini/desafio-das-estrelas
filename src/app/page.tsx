"use client";

import { useState, useEffect, useRef } from "react";
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

// --- Constantes ---
const AVATARS = [
  { id: 'ast1', emoji: '👨‍🚀', label: 'Astronauta' },
  { id: 'ali1', emoji: '👽', label: 'Alienígena' },
  { id: 'rob1', emoji: '🤖', label: 'Robô' },
  { id: 'cat1', emoji: '🐱', label: 'Gato Espacial' },
  { id: 'dog1', emoji: '🐶', label: 'Cão Estelar' },
  { id: 'mon1', emoji: '🐵', label: 'Macaco Piloto' },
  { id: 'uni1', emoji: '🦄', label: 'Unicórnio' },
  { id: 'din1', emoji: '🦖', label: 'Dino' },
  { id: 'dra1', emoji: '🐉', label: 'Dragão' },
  { id: 'fox1', emoji: '🦊', label: 'Raposa' },
  { id: 'pan1', emoji: '🐼', label: 'Panda' },
  { id: 'leo1', emoji: '🦁', label: 'Leão' },
  { id: 'owl1', emoji: '🦉', label: 'Coruja' },
  { id: 'fai1', emoji: '🧚', label: 'Fada' },
  { id: 'sup1', emoji: '🦸', label: 'Herói' },
  { id: 'coa1', emoji: '🐨', label: 'Coala' },
  { id: 'tig1', emoji: '🐯', label: 'Tigre' },
  { id: 'mer1', emoji: '🧜', label: 'Sereia' },
];

// --- Tipos ---
type TaskRecurrence = 'daily' | 'weekly' | 'monthly' | 'once';
type Task = { id: string; title: string; stars: number; recurrence: TaskRecurrence; status: 'available' | 'pending' | 'done'; lastCompleted?: string; };
type Reward = { id: string; title: string; cost: number; };
type ChildData = {
  id: string;
  name: string;
  avatar: string;
  stars: number;
  dailyStars: number;
  tasks: Task[];
  rewards: Reward[];
  badges: string[];
  history: { id: string, title: string, type: 'gain' | 'loss' | 'redeem', amount: number, date: string }[];
};
type Stage = 'welcome' | 'auth' | 'enter_code' | 'reset_password' | 'select_child' | 'setup_child' | 'setup_avatar' | 'setup_tasks' | 'setup_rewards' | 'adventure';

// --- Componentes Visuais do Universo ---
// --- Otimização de Fundo (Mais Leve) ---
const StarField = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0f172a]">
    {/* Fundo Estático com Estrelas - Mais Visível */}
    <div className="absolute inset-0 opacity-30" style={{
      backgroundImage: 'radial-gradient(white 1px, transparent 0)',
      backgroundSize: '50px 50px'
    }} />

    {/* 1. Cometa Lento (Drifting) - Aumentado e mais visível */}
    <motion.div
      initial={{ x: "-10vw", y: "20vh", opacity: 0 }}
      animate={{
        x: "110vw",
        y: "50vh",
        opacity: [0, 0.6, 0.6, 0]
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: 3
      }}
      className="absolute w-[600px] h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent -rotate-12 blur-[1px]"
    />

    {/* 2. Lua Lenta (Oposta) - Aumentada significativamente */}
    <motion.div
      initial={{ x: "110vw", y: "60vh", opacity: 0, rotate: 0 }}
      animate={{
        x: "-20vw",
        y: "10vh",
        opacity: [0, 0.5, 0.5, 0],
        rotate: -60
      }}
      transition={{
        duration: 40,
        repeat: Infinity,
        ease: "linear",
        delay: 5,
        repeatDelay: 8
      }}
      className="absolute w-48 h-48 rounded-full bg-zinc-400/20 shadow-[inset_-15px_-15px_40px_rgba(0,0,0,0.6),0_0_50px_rgba(255,255,255,0.1)] flex items-center justify-center text-7xl grayscale opacity-60 blur-[0.5px]"
    >
      🌑
    </motion.div>

    {/* 4 Novos Planetas Passando */}
    <motion.div
      initial={{ x: "-20vw", y: "80vh", opacity: 0 }}
      animate={{ x: "120vw", y: "20vh", opacity: [0, 0.7, 0.7, 0], rotate: 360 }}
      transition={{ duration: 50, repeat: Infinity, ease: "linear", delay: 2 }}
      className="absolute text-6xl filter drop-shadow-[0_0_15px_rgba(255,165,0,0.3)]"
    >🪐</motion.div>

    <motion.div
      initial={{ x: "120vw", y: "15vh", opacity: 0 }}
      animate={{ x: "-30vw", y: "85vh", opacity: [0, 0.6, 0.6, 0], rotate: -360 }}
      transition={{ duration: 65, repeat: Infinity, ease: "linear", delay: 12 }}
      className="absolute text-5xl filter drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
    >🌍</motion.div>

    <motion.div
      initial={{ x: "60vw", y: "-20vh", opacity: 0 }}
      animate={{ x: "20vw", y: "120vh", opacity: [0, 0.5, 0.5, 0] }}
      transition={{ duration: 45, repeat: Infinity, ease: "linear", delay: 20 }}
      className="absolute text-4xl filter drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"
    >🔴</motion.div>

    <motion.div
      initial={{ x: "110vw", y: "100vh", opacity: 0 }}
      animate={{ x: "-10vw", y: "-10vh", opacity: [0, 0.6, 0.6, 0] }}
      transition={{ duration: 55, repeat: Infinity, ease: "linear", delay: 30 }}
      className="absolute text-7xl filter drop-shadow-[0_0_25px_rgba(168,85,247,0.3)]"
    >🔵</motion.div>

    {/* 3. Nebulosas Distantes (Pulsantes) */}
    <div className="absolute top-[10%] right-[15%] w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-[80px] animate-pulse" />
    <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-[100px]" />
    <div className="absolute top-[50%] left-[45%] w-32 h-32 bg-gradient-to-tl from-emerald-500/10 to-transparent rounded-full blur-[40px] animate-pulse" />

    {/* Estrelas Animadas (Pulsantes - Mais densas) */}
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0.1 }}
        animate={{ opacity: [0.1, 0.7, 0.1] }}
        transition={{ duration: 2 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        className="absolute bg-white rounded-full"
        style={{
          width: i % 5 === 0 ? '3px' : '1.5px',
          height: i % 5 === 0 ? '3px' : '1.5px',
          top: (5 + i * 13) % 100 + '%',
          left: (3 + i * 17) % 100 + '%',
          boxShadow: i % 5 === 0 ? '0 0 10px rgba(255,255,255,0.6)' : 'none'
        }}
      />
    ))}
  </div>
);

function SpaceShipVideo() {
  const [videoState, setVideoState] = useState<'expanded' | 'icon'>('expanded');
  const [playCount, setPlayCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnded = () => {
    const nextCount = playCount + 1;
    if (nextCount >= 2) {
      setVideoState('icon');
      setPlayCount(0);
    } else {
      setPlayCount(nextCount);
      videoRef.current?.play();
    }
  };

  const handleIconClick = () => {
    setVideoState('expanded');
    setPlayCount(0);
    // Timeout para garantir que o elemento vídeo exista se houver condicional, 
    // mas aqui vamos apenas controlar a visibilidade via animação.
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.play();
      }
    }, 100);
  };

  return (
    <div className="fixed bottom-4 md:bottom-10 left-4 md:left-10 z-[100]">
      <AnimatePresence mode="wait">
        {videoState === 'expanded' ? (
          <motion.div
            key="ship"
            initial={{ opacity: 0, x: -100, scale: 0.5 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0, rotate: -20 }}
            onClick={() => setVideoState('icon')}
            whileHover={{ scale: 1.02 }}
            className="relative w-28 h-28 md:w-56 md:h-56 cursor-pointer"
          >
            {/* Luzes Piscantes */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_red]" />
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-75 shadow-[0_0_15px_blue]" />

            {/* Corpo da Nave (Círculo Metálico) */}
            <div className="w-full h-full rounded-full border-[8px] border-zinc-400 bg-zinc-900 shadow-2xl overflow-hidden relative">
              <video
                ref={videoRef}
                src="/boa.mp4"
                autoPlay
                onEnded={handleEnded}
                playsInline
                className="w-full h-full object-cover scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
            </div>

            {/* Detalhes de Antena */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-1 h-12 bg-zinc-500 rounded-full" />
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-ping" />
          </motion.div>
        ) : (
          <motion.button
            key="icon"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleIconClick}
            className="w-16 h-16 bg-primary text-black rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 border-4 border-white/20 animate-bounce"
          >
            <Rocket className="w-8 h-8" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeroCharacter({ avatar, name, isCelebrating = false, isSad = false, isFiring = false }: { avatar: string, name: string, isCelebrating?: boolean, isSad?: boolean, isFiring?: boolean }) {
  const selectedAvatar = AVATARS.find(a => a.id === avatar) || AVATARS[0];
  const [isFlying, setIsFlying] = useState(false);

  const handleFlight = () => {
    if (isFlying) return;
    setIsFlying(true);
    setTimeout(() => setIsFlying(false), 4000);
  };

  return (
    <motion.div
      onClick={handleFlight}
      initial={false}
      animate={
        isFlying ? {
          x: [0, 100, 400, 200, -200, -400, 0],
          y: [0, -150, -50, 400, 300, -100, 0],
          scale: [1, 1.4, 1.8, 0.5, 0.7, 1.2, 1],
          rotate: [0, 15, 45, 180, 210, 345, 360],
          zIndex: [10, 20, 50, 0, 0, 50, 10]
        } :
          isFiring ? { rotateY: 45, x: 10, scale: 1.05 } :
            isCelebrating ? { y: [0, -40, 0], scale: [1, 1.2, 1] } :
              isSad ? { x: [-5, 5, -5, 5, 0] } :
                { y: [0, -20, 0], rotate: [0, 2, -2, 0] }
      }
      transition={
        isFlying ? {
          duration: 4,
          ease: [0.45, 0, 0.55, 1],
          times: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1]
        } :
          isCelebrating ? { duration: 0.5, repeat: 2 } :
            { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }
      className="relative w-32 h-56 md:w-48 md:h-80 flex flex-col items-center justify-end z-10 cursor-pointer"
    >
      <AnimatePresence>
        {isSad && (
          <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -20 }} exit={{ opacity: 0 }} className="absolute -top-16 text-4xl">😢</motion.div>
        )}
      </AnimatePresence>

      {/* Balão de Fala */}
      <motion.div
        animate={isFlying ? { opacity: 0 } : { opacity: 1, x: isFiring ? 40 : 0 }}
        className="absolute -top-14 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-xl z-20 pointer-events-none"
      >
        <p className="text-[8px] md:text-[10px] font-black uppercase italic tracking-tighter text-white">
          {isFlying ? "UHUUUUUU!" : isFiring ? "FOGO NO ALVO!" : isSad ? "Houston, temos um problema..." : isCelebrating ? "MISSÃO CUMPRIDA!" : `Pronto, ${name}?`}
        </p>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#16213e] border-r border-b border-white/20 rotate-45" />
      </motion.div>

      {/* Braço Esquerdo (Atrás) */}
      <motion.div
        animate={isFiring ? { rotate: 20, x: -5 } : { rotate: -10 }}
        className="absolute top-[45%] left-4 md:left-8 w-6 md:w-10 h-16 md:h-24 bg-zinc-300 rounded-full border-2 border-zinc-400 -z-10 origin-top"
      />

      {/* Cabeça do Astronauta (Emoji) */}
      <div className="relative w-24 h-24 md:w-36 md:h-36 z-10">
        {/* Visor do Capacete */}
        <div className={clsx("w-full h-full rounded-full border-4 shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden bg-zinc-900 transition-colors relative p-1 flex items-center justify-center", isSad ? "border-red-500" : isFiring ? "border-green-400 shadow-[0_0_20px_#4ade80]" : "border-white/80")}>
          <div className="text-4xl md:text-6xl select-none">{selectedAvatar.emoji}</div>
          {/* Reflexo do Visor */}
          <div className="absolute top-2 left-4 w-12 h-6 bg-white/10 rounded-full rotate-[-45deg]" />
          {isFiring && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              className="absolute inset-0 bg-green-400/20 z-0"
            />
          )}
        </div>

        {/* Detalhes do Capacete */}
        <div className="absolute -bottom-1 -left-2 w-8 h-8 bg-zinc-200 rounded-full border-4 border-zinc-400 shadow-lg" />
        <div className="absolute -bottom-1 -right-2 w-8 h-8 bg-zinc-200 rounded-full border-4 border-zinc-400 shadow-lg" />
      </div>

      {/* Corpo do Astronauta */}
      <div className="relative -mt-8 flex flex-col items-center">
        {/* Mochila de Oxigênio (PLSS) */}
        <div className="absolute top-4 w-20 md:w-28 h-28 md:h-36 bg-zinc-300 rounded-[20px] md:rounded-[24px] border-2 border-zinc-400 -z-10 shadow-lg" />

        {/* Traje (Corpo) */}
        <div className="w-16 md:w-24 h-24 md:h-32 bg-white rounded-[24px] md:rounded-[40px] border-2 md:border-4 border-zinc-200 shadow-xl flex flex-col items-center justify-start p-2 md:p-4 relative overflow-hidden">
          {/* Faixa do Peito */}
          <div className="w-full h-4 bg-primary/20 rounded-full mb-4 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
          <Rocket className={clsx("w-10 h-10 transition-colors", isSad ? "text-zinc-300" : "text-primary")} />

          {/* Painel de Controle no Peito */}
          <div className="mt-4 flex gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
        </div>

        {/* Braço Direito (Frente/Arma) */}
        <motion.div
          animate={isFiring ? {
            rotate: -90,
            x: 40,
            y: -40,
            scaleX: 1.1
          } : { rotate: 15 }}
          className="absolute top-4 -right-4 w-6 md:w-10 h-16 md:h-24 bg-white rounded-full border-2 border-zinc-200 z-20 origin-top shadow-md"
        >
          {/* Arma Galáctica */}
          {isFiring && (
            <motion.div
              initial={{ scale: 0, x: 20 }}
              animate={{ scale: 1, x: 0 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-14 h-8 bg-zinc-800 rounded-xl flex items-center justify-center border-2 border-zinc-600 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <div className="w-6 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_15px_#4ade80]" />
              <div className="absolute -right-3 w-6 h-4 bg-zinc-700 rounded-full border border-zinc-500" />
              <div className="absolute -top-1 left-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            </motion.div>
          )}
        </motion.div>

        {/* Pernas do Traje */}
        <div className="flex gap-4 -mt-2">
          <div className="w-8 h-12 bg-white rounded-b-2xl border-x-4 border-b-4 border-zinc-200 shadow-lg" />
          <div className="w-8 h-12 bg-white rounded-b-2xl border-x-4 border-b-4 border-zinc-200 shadow-lg" />
        </div>

        {/* Propulsores (se estiver celebrando) */}
        {isCelebrating && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-10 flex gap-10"
          >
            <div className="w-4 h-10 bg-gradient-to-t from-transparent via-primary to-white blur-sm animate-bounce" />
            <div className="w-4 h-10 bg-gradient-to-t from-transparent via-primary to-white blur-sm animate-bounce delay-100" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}


export default function DesafioEstrelas() {
  const [supabase] = useState(() => createClient());
  const [stage, setStage] = useState<Stage>('welcome');
  const [resetPassword, setResetPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");

  // Novos Estados para Múltiplas Crianças
  const [children, setChildren] = useState<ChildData[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  // Estado Temporário para Criação
  const [newChild, setNewChild] = useState<Partial<ChildData>>({ name: "", avatar: "ast1" });

  // Estados para Customização
  const [customTask, setCustomTask] = useState<{ title: string, stars: number, recurrence: TaskRecurrence }>({ title: "", stars: 5, recurrence: 'daily' });
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
        .from('patient_gamification')
        .select('state')
        .eq('fleet_id', fleetId);

      if (error) throw error;

      if (data) {
        const allChildren: ChildData[] = [];
        data.forEach((row: any) => {
          if (row.state?.children) {
            // Filtra para não duplicar os próprios filhos na lista da frota
            const isOwnData = row.state.children.some((c: ChildData) => children.some(own => own.id === c.id));
            if (!isOwnData) {
              allChildren.push(...row.state.children);
            }
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

  const loadFromCloud = async (existingUser?: any) => {
    console.log("☁️ Tentando carregar dados da nuvem...");
    const user = existingUser || (await supabase.auth.getUser()).data.user;
    if (!user) {
      console.log("⚠️ Nenhum usuário logado para carregar nuvem.");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('patient_gamification')
        .select('state')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ Erro na consulta ao banco:", error);
        return null;
      }

      if (data?.state) {
        console.log("📦 Dados encontrados na nuvem!");
        return data.state;
      }
      console.log("📂 Nenhuma configuração anterior encontrada na nuvem.");
    } catch (e) {
      console.error("💥 Erro fatal ao carregar nuvem:", e);
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

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initData = async () => {
      // 1. Tentar carregar da Nuvem primeiro se estiver logado
      const cloudData = await loadFromCloud();

      // 2. Fallback para LocalStorage se não houver nuvem ou erro
      const saved = localStorage.getItem('desafio_estrelas_v2');
      let finalData = null;

      if (cloudData) {
        finalData = cloudData;
      } else if (saved) {
        finalData = JSON.parse(saved);
      }

      if (finalData) {
        const savedChildren: ChildData[] = finalData.children || [];

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

    // Verificação dupla: via evento do Supabase e via URL direta
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Evento Auth:", event);
      if (event === 'PASSWORD_RECOVERY') {
        setStage('reset_password');
      }
      if (event === 'SIGNED_IN') {
        // Recarregar dados sempre que logar
        const cloudData = await loadFromCloud(session?.user);
        if (cloudData && cloudData.children) {
          setChildren(cloudData.children);
          setActiveChildId(cloudData.activeChildId || null);
          if (cloudData.parentPin) setParentPin(cloudData.parentPin);
          if (cloudData.fleetId) setFleetId(cloudData.fleetId);
        }
      }
    });

    // Forçar detecção se houver recovery na URL
    if (window.location.hash.includes('type=recovery')) {
      setStage('reset_password');
    }

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const dataToSave = { children, activeChildId, stage, parentPin, fleetId };
    localStorage.setItem('desafio_estrelas_v2', JSON.stringify(dataToSave));

    // Debounce cloud sync
    const timer = setTimeout(() => {
      saveToCloud(dataToSave);
    }, 2000);

    return () => clearTimeout(timer);
  }, [children, activeChildId, stage]);

  const updateActiveChild = (updates: Partial<ChildData>) => {
    setChildren((prev: ChildData[]) => prev.map(c => c.id === activeChildId ? { ...c, ...updates } : c));
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
      stars: 10,
      dailyStars: 0,
      tasks: [],
      rewards: [],
      badges: [],
      history: []
    };
    setChildren([...children, child]);
    setActiveChildId(id);
    setStage('setup_tasks');
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

      // Checar Badges
      const currentBadges = activeChild.badges || [];
      const unlockedNow = BADGES.filter(b => !currentBadges.includes(b.id) && b.condition({ ...activeChild, stars: newStars, history: newHistory } as ChildData));

      if (unlockedNow.length > 0) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.3 }, colors: ['#2dd4bf', '#ffffff', '#fbbf24'] });
        updateActiveChild({
          stars: newStars,
          dailyStars: activeChild.dailyStars + task.stars,
          tasks: tasks.map((t: Task) => t.id === taskId ? { ...t, status: 'done', lastCompleted: new Date().toISOString() } : t),
          history: newHistory,
          badges: [...currentBadges, ...unlockedNow.map(b => b.id)]
        });
      } else {
        updateActiveChild({
          stars: newStars,
          dailyStars: activeChild.dailyStars + task.stars,
          tasks: tasks.map((t: Task) => t.id === taskId ? { ...t, status: 'done', lastCompleted: new Date().toISOString() } : t),
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

  const addTask = (title: string, starCount: number, recurrence: TaskRecurrence = 'daily') => {
    const newTask: Task = { id: Date.now().toString(), title, stars: starCount, recurrence, status: 'available' };
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

  const taskPresets = [
    { title: "Escovar os dentes", stars: 1 },
    { title: "Arrumar a cama", stars: 2 },
    { title: "Comer vegetais", stars: 2 },
    { title: "Lição de casa", stars: 3 },
    { title: "Guardar brinquedos", stars: 2 },
  ];

  const rewardPresets = [
    { title: "Escolher o filme", cost: 10 },
    { title: "30 min de Game", cost: 15 },
    { title: "Sobremesa Especial", cost: 20 },
    { title: "Passeio no Parque", cost: 50 },
    { title: "Brinquedo Novo", cost: 100 },
  ];

  return (
    <div className="min-h-screen text-white font-sans selection:bg-primary/20 overflow-x-hidden relative">
      <StarField />

      <AnimatePresence mode="wait">

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
                Decolar Agora <Rocket className="w-6 h-6 group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform" />
              </button>

              {deferredPrompt && (
                <button onClick={handleInstall} className="group px-10 py-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-[32px] hover:bg-white/10 transition-all flex items-center gap-3 text-sm">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" /> Instalar App
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* --- STAGE: AUTH (Lead) --- */}
        {stage === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
            <button onClick={() => setStage('welcome')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> Voltar</button>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Estação de Login</span>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Identificação do Mentor</h2>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[50px] space-y-6 shadow-2xl">
              <form onSubmit={handleAuth} className="space-y-4">
                {authError && <div className="p-4 bg-red-500/20 text-red-200 text-[10px] font-bold rounded-2xl border border-red-500/30 text-center">{authError}</div>}
                {authSuccess && <div className="p-4 bg-emerald-500/20 text-emerald-200 text-[10px] font-bold rounded-2xl border border-emerald-500/30 text-center">{authSuccess}</div>}
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nome Completo</label>
                    <input required type="text" value={parentName} onChange={e => setParentName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary transition-colors" />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">E-mail</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Senha Especial</label>
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
                    "Continuar Viagem"
                  )}
                </button>
              </form>
              <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-[10px] font-black uppercase text-white/30">{isLogin ? "Criar nova tripulação" : "Já tenho acesso"}</button>
            </div>
          </motion.div>
        )}

        {/* --- STAGE: ENTER CODE (OTP) --- */}
        {stage === 'enter_code' && (
          <motion.div key="enter_code" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
            <button onClick={() => setStage('auth')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> Voltar</button>
            <div className="space-y-2 text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Código de Acesso</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center">Digite o código de 6 dígitos enviado para <br/> <span className="text-white">{email}</span></p>
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
                  <p className="text-[9px] text-center text-white/20 font-bold uppercase italic">Digite os dígitos enviados para o seu e-mail.</p>
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className={clsx(
                    "w-full py-5 font-black uppercase tracking-widest rounded-2xl shadow-xl mt-4 transition-all flex items-center justify-center gap-3",
                    authLoading ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-primary text-black hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  {authLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Validar Código"}
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
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Nova Senha</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Defina sua nova credencial de acesso</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[50px] space-y-6 shadow-2xl">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {authError && <div className="p-4 bg-red-500/20 text-red-200 text-[10px] font-bold rounded-2xl border border-red-500/30 text-center">{authError}</div>}
                {authSuccess && <div className="p-4 bg-emerald-500/20 text-emerald-200 text-[10px] font-bold rounded-2xl border border-emerald-500/30 text-center">{authSuccess}</div>}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nova Senha Galáctica</label>
                  <input required type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary transition-colors text-center text-2xl" />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className={clsx(
                    "w-full py-5 font-black uppercase tracking-widest rounded-2xl shadow-xl mt-4 transition-all flex items-center justify-center gap-3",
                    authLoading ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-primary text-black hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  {authLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Atualizar Senha"}
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
              <h2 className="text-5xl font-black italic uppercase tracking-tighter">Quem vai viajar hoje?</h2>
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Selecione seu perfil de astronauta</p>
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
                <span className="text-xl font-black uppercase italic text-white/20 group-hover:text-primary">Novo Herói</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* --- STAGE: SETUP CHILD --- */}
        {stage === 'setup_child' && (
          <motion.div key="setup_child" className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
            <button onClick={() => setStage(children.length > 0 ? 'select_child' : 'auth')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> Voltar</button>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-center">Quem é o Heroi da Missão?</h2>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[50px] space-y-8 shadow-2xl">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-2 border-primary/20 animate-pulse">
                <Baby className="w-16 h-16 text-primary" />
              </div>
              <input
                autoFocus
                value={newChild.name}
                onChange={e => setNewChild({ ...newChild, name: e.target.value })}
                type="text"
                placeholder="Nome do Pequeno Herói..."
                className="w-full bg-transparent border-b-2 border-white/20 p-5 text-3xl font-black text-center outline-none focus:border-primary transition-colors"
              />
              <button
                disabled={!newChild.name}
                onClick={() => setStage('setup_avatar')}
                className="w-full py-6 bg-primary text-black font-black uppercase tracking-widest rounded-[28px] shadow-lg shadow-primary/20"
              >
                Próximo Passo
              </button>
            </div>
          </motion.div>
        )}

        {/* --- STAGE: SETUP AVATAR --- */}
        {stage === 'setup_avatar' && (
          <motion.div key="setup_avatar" className="relative z-10 max-w-2xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8 text-center">
            <button onClick={() => setStage('setup_child')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> Voltar</button>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Escolha seu Avatar</h2>
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
            <button onClick={handleCreateChild} className="w-full py-6 bg-primary text-black font-black uppercase rounded-[28px] shadow-lg shadow-primary/20">Confirmar Herói</button>
          </motion.div>
        )}

        {/* --- STAGE: SETUP TASKS --- */}
        {stage === 'setup_tasks' && (
          <motion.div key="setup_tasks" className="relative z-10 max-w-2xl mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
            <button onClick={() => setStage('setup_avatar')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> Voltar</button>
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Missões da Jornada</h2>
              <p className="text-white/40 text-sm">Quais desafios o {activeChild?.name} deve superar para ganhar estrelas?</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] space-y-6 shadow-2xl">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Criar Nova Missão:</p>
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
                          {rec === 'daily' ? 'Diária' : rec === 'weekly' ? 'Semanal' : rec === 'monthly' ? 'Mensal' : 'Única'}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={!customTask.title}
                      onClick={() => { addTask(customTask.title, customTask.stars, customTask.recurrence); setCustomTask({ title: "", stars: 5, recurrence: 'daily' }); }}
                      className="flex-1 py-3 bg-primary text-black font-black uppercase text-[10px] rounded-xl hover:scale-105 transition-all"
                    >
                      Adicionar Missão
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Sugestões Rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {taskPresets.map(p => (
                    <button key={p.title} onClick={() => addTask(p.title, p.stars)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
                      + {p.title} ({p.stars}⭐)
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">{t.stars}</div>
                      <span className="font-bold uppercase tracking-tight italic">{t.title}</span>
                    </div>
                    <button onClick={() => removeTask(t.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-5 h-5" /></button>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-center py-8 text-white/20 font-black uppercase italic tracking-widest">Nenhuma missão adicionada</p>}
              </div>

              <button disabled={tasks.length === 0} onClick={() => setStage('setup_rewards')} className="w-full py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">Configurar Prêmios</button>
            </div>
          </motion.div>
        )}

        {/* --- STAGE: SETUP REWARDS --- */}
        {stage === 'setup_rewards' && (
          <motion.div key="setup_rewards" className="relative z-10 max-w-2xl mx-auto min-h-screen flex flex-col justify-col justify-center p-6 space-y-8">
            <button onClick={() => setStage('setup_tasks')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit"><ChevronLeft className="w-4 h-4" /> Voltar</button>
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Tesouros Galácticos</h2>
              <p className="text-white/40 text-sm">O que o {activeChild?.name} poderá resgatar com suas estrelas?</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] space-y-6 shadow-2xl">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Criar Novo Tesouro:</p>
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
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Sugestões Rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {rewardPresets.map(p => (
                    <button key={p.title} onClick={() => addReward(p.title, p.cost)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all">
                      + {p.title} ({p.cost}⭐)
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {rewards.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center text-yellow-400 font-black">{r.cost}</div>
                      <span className="font-bold uppercase tracking-tight italic">{r.title}</span>
                    </div>
                    <button onClick={() => removeReward(r.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash className="w-5 h-5" /></button>
                  </div>
                ))}
                {rewards.length === 0 && <p className="text-center py-8 text-white/20 font-black uppercase italic tracking-widest">Nenhum prêmio adicionado</p>}
              </div>

              <button disabled={rewards.length === 0} onClick={handleStartAdventure} className="w-full py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">Começar Desafio!</button>
            </div>
          </motion.div>
        )}

        {/* --- DASHBOARD ADVENTURE --- */}
        {stage === 'adventure' && (
          <motion.div key="adventure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 pb-32">
            <SpaceShipVideo />

            {/* Banner da Aliança Galáctica */}
            {fleetId && (
              <div className="w-full bg-primary/20 backdrop-blur-md border-b border-primary/30 py-2 md:py-3 flex flex-col md:flex-row justify-center items-center gap-1 md:gap-12 overflow-hidden relative">
                <motion.div
                  animate={{ x: [-100, 100, -100] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none"
                />
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Frota Galáctica</span>
                  <div className="md:hidden w-1 h-1 bg-primary rounded-full animate-pulse" />
                </div>
                <h2 className="text-xl md:text-4xl font-black uppercase italic tracking-[0.15em] md:tracking-[0.25em] text-white drop-shadow-[0_0_20px_rgba(45,212,191,0.8)] relative z-10 px-4 text-center">
                  {fleetId}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="md:hidden w-1 h-1 bg-primary rounded-full animate-pulse" />
                  <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Setor Ativo</span>
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full animate-pulse" />
                </div>
              </div>
            )}

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
                  <h1 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">{activeChild?.name} <RefreshCw className="w-3 h-3" /></h1>
                  <p className="text-sm md:text-lg font-black italic uppercase tracking-tighter text-white">{view === 'child' ? "Estação de Comando" : "Modo Mentor"}</p>
                </div>
              </div>


              <div className="flex gap-6 items-center">
                {/* Relógio e Data */}
                <div className="hidden md:flex flex-col items-end">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-4 py-1 rounded-full border border-white/10 mb-1">
                    {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="text-xl font-black italic tracking-tighter text-white">
                    {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

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
                  <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-full hover:bg-red-500/20 transition-all shadow-lg" title="Sair do Desafio">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto pt-10">
              {view === 'child' ? (
                <div className="flex flex-col lg:flex-row gap-12 items-start">

                  {/* Herói Cartoon Lateral */}
                  <div className="lg:w-1/3 flex flex-col items-center lg:sticky lg:top-40 pt-4 md:pt-10">
                    <HeroCharacter
                      avatar={activeChild?.avatar || 'ast1'}
                      name={activeChild?.name || ''}
                      isCelebrating={isCelebrating}
                      isSad={isSad}
                      isFiring={!!laserTarget}
                    />

                    <div className="mt-8 w-full max-w-xs space-y-6">
                      {/* Seção de Medalhas */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-center flex items-center justify-center gap-2">
                          <Trophy className="w-3 h-3" /> Medalhas de Honra
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
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-center">Últimas Conquistas</p>
                        {history.slice(0, 2).map((h: any) => (
                          <div key={h.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                            <span className="text-[10px] font-bold text-white/60 truncate max-w-[120px]">{h.title}</span>
                            <span className={clsx("text-xs font-black", h.type === 'gain' ? "text-primary" : "text-red-400")}>
                              {h.type === 'gain' ? `+${h.amount}` : `-${h.amount}`}⭐
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(children.length > 1 || fleetChildren.length > 0) && (
                      <div className="space-y-3 pt-6 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-center">Ranking da Aliança (Top 3)</p>
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
                    <section className="space-y-12">
                      {[
                        { title: '📍 Missões do Dia', key: 'daily', icon: Rocket, color: 'text-primary' },
                        { title: '🗓️ Missões da Semana', key: 'weekly', icon: Clock, color: 'text-purple-400' },
                        { title: '🪐 Grandes Objetivos', key: ['monthly', 'once'], icon: Zap, color: 'text-yellow-400' }
                      ].map((group: any) => {
                        const filteredTasks = tasks.filter((t: Task) =>
                          Array.isArray(group.key) ? group.key.includes(t.recurrence) : t.recurrence === group.key
                        );

                        if (filteredTasks.length === 0) return null;

                        return (
                          <div key={Array.isArray(group.key) ? group.key.join('-') : group.key} className="space-y-4">
                            <h2 className={clsx("text-sm font-black uppercase italic tracking-tighter flex items-center gap-2 opacity-80", group.color)}>
                              <group.icon className="w-4 h-4" /> {group.title}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                              {filteredTasks.map((task: Task, idx: number) => (
                                <motion.button
                                  key={task.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: idx * 0.05 }}
                                  whileHover={task.status === 'available' ? { scale: 1.02, y: -2 } : {}}
                                  whileTap={task.status === 'available' ? { scale: 0.95 } : {}}
                                  onClick={(e) => task.status === 'available' && handleCompleteTask(task, e)}
                                  disabled={task.status !== 'available'}
                                  className={clsx(
                                    "relative group p-4 rounded-[24px] border-2 transition-all flex flex-col items-center text-center gap-2 overflow-hidden min-h-[120px] justify-center",
                                    task.status === 'pending' ? "bg-white/5 border-white/5 opacity-60" :
                                      task.status === 'done' ? "bg-emerald-500/10 border-emerald-500/50" :
                                        "bg-white/5 border-white/10 hover:border-primary/40 shadow-xl backdrop-blur-md"
                                  )}
                                >
                                  <div className="flex gap-0.5">
                                    {[...Array(Math.min(task.stars, 3))].map((_, i: number) => (
                                      <Star key={i} className={clsx("w-2 h-2", task.status === 'done' ? "text-emerald-400 fill-emerald-400" : "text-yellow-400 fill-yellow-400")} />
                                    ))}
                                    {task.stars > 3 && <span className="text-[8px] text-yellow-400 font-black">+{task.stars - 3}</span>}
                                  </div>
                                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden relative text-xl">
                                    {task.status === 'done' ? "✅" : AVATARS.find(a => a.id === activeChild?.avatar)?.emoji}
                                  </div>
                                  <h3 className={clsx("text-[9px] md:text-xs font-black uppercase italic tracking-tighter leading-tight", task.status === 'done' ? "text-emerald-400" : "text-white")}>
                                    {task.title}
                                  </h3>

                                  {task.status === 'pending' && (
                                    <div className="absolute inset-0 bg-[#16213e]/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
                                      <RefreshCw className="w-5 h-5 text-primary animate-spin mb-1" />
                                      <p className="text-[7px] font-black uppercase tracking-widest">Validando...</p>
                                    </div>
                                  )}

                                  {task.status === 'done' && (
                                    <div className="absolute top-2 right-4">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                    </div>
                                  )}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </section>

                    <section className="space-y-6">
                      <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3"><ShoppingBag className="w-5 h-5 text-[#f59e0b]" /> Loja Galáctica</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
                        {rewards.map((reward: Reward) => {
                          const progress = Math.min((stars / reward.cost) * 100, 100);
                          const canRedeem = stars >= reward.cost;
                          return (
                            <motion.button
                              key={reward.id}
                              whileHover={canRedeem ? { scale: 1.02 } : {}}
                              whileTap={canRedeem ? { scale: 0.98 } : {}}
                              onClick={() => canRedeem && handleRedeemReward(reward)}
                              disabled={!canRedeem}
                              className={clsx(
                                "p-4 md:p-6 border rounded-2xl md:rounded-[32px] flex flex-col gap-3 md:gap-4 relative overflow-hidden shadow-2xl backdrop-blur-md transition-all text-left w-full",
                                canRedeem ? "bg-white/10 border-primary/40 cursor-pointer" : "bg-white/5 border-white/10 cursor-default opacity-80"
                              )}
                            >
                              <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-1">
                                  <h3 className={clsx("text-sm md:text-lg font-black uppercase italic tracking-tighter transition-colors", canRedeem ? "text-primary" : "text-white")}>{reward.title}</h3>
                                  <div className="flex items-center gap-2">
                                    <Star className={clsx("w-3 h-3 md:w-4 md:h-4", canRedeem ? "text-yellow-400 fill-yellow-400" : "text-white/20")} />
                                    <span className="text-[10px] md:text-xs font-black text-white/40">{reward.cost}</span>
                                  </div>
                                </div>
                                {canRedeem && (
                                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                    <Gift className="w-8 h-8 md:w-12 md:h-12 text-primary drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                                  </motion.div>
                                )}
                              </div>

                              <div className="space-y-3 relative z-10">
                                <div className="h-4 bg-white/5 rounded-full border border-white/10 p-1 shadow-inner">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={clsx("h-full rounded-full transition-colors", canRedeem ? "bg-primary animate-pulse" : "bg-purple-500")} />
                                </div>
                                <div className="flex justify-between items-center">
                                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40">
                                    {canRedeem ? "VOCÊ CONSEGUIU!" : `FALTAM ${reward.cost - stars} ESTRELAS`}
                                  </p>
                                  {canRedeem && (
                                    <span className="bg-primary text-black px-3 py-1 rounded-full text-[8px] font-black uppercase animate-bounce">
                                      Resgatar Agora
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Efeito de Brilho se puder resgatar */}
                              {canRedeem && <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none animate-pulse" />}
                            </motion.button>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                /* --- PAINEL PARENTAL UNIVERSO --- */
                <div className="flex flex-col lg:flex-row gap-8 md:gap-12 relative z-10">
                  <div className="lg:w-64 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide snap-x">
                    {[
                      { id: 'approvals', label: 'Validações', icon: CheckCircle2 },
                      { id: 'missions', label: 'Sala de Controle', icon: Rocket },
                      { id: 'ranking', label: 'Ranking', icon: Trophy },
                      { id: 'fleet', label: 'Aliança', icon: Zap },
                      { id: 'behavior', label: 'Comportamento', icon: AlertCircle },
                      { id: 'settings', label: 'Ajustes Perfil', icon: Settings },
                      { id: 'history', label: 'Histórico', icon: History },
                    ].map(item => (
                      <button key={item.id} onClick={() => setParentSubView(item.id as any)} className={clsx("flex-none lg:w-full flex items-center gap-3 px-6 lg:px-8 py-4 lg:py-5 rounded-2xl lg:rounded-[28px] text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl snap-center", parentSubView === item.id ? "bg-primary text-black" : "bg-white/5 text-white/40 hover:bg-white/10")}>
                        <item.icon className="w-4 h-4" /> {item.label}
                      </button>
                    ))}
                    <button
                      onClick={() => { setStage('setup_child'); setNewChild({ name: "", avatar: "ast1" }); }}
                      className="flex-none lg:w-full flex items-center gap-3 px-6 lg:px-8 py-4 lg:py-5 rounded-2xl lg:rounded-[28px] text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all snap-center"
                    >
                      <Plus className="w-4 h-4" /> Novo Herói
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o perfil de ${activeChild?.name}?`)) {
                          const remaining = children.filter(c => c.id !== activeChildId);
                          setChildren(remaining);
                          if (remaining.length > 0) {
                            setActiveChildId(remaining[0].id);
                          } else {
                            setStage('setup_child');
                          }
                        }
                      }}
                      className="w-full flex items-center gap-3 px-8 py-5 mt-4 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                    >
                      <Trash className="w-4 h-4" /> Excluir Perfil
                    </button>

                    <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full flex items-center gap-3 px-8 py-5 mt-8 md:mt-20 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"><LogOut className="w-4 h-4" /> Resetar Tudo</button>
                  </div>

                  <div className="flex-1 space-y-8">
                    {parentSubView === 'approvals' && (
                      <div className="space-y-6">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Relatórios Pendentes</h2>
                        <div className="grid grid-cols-1 gap-4">
                          {tasks.filter((t: Task) => t.status === 'pending').map((t: Task) => (
                            <div key={t.id} className="p-4 md:p-8 bg-white/5 border border-white/10 rounded-3xl md:rounded-[40px] flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md">
                              <div className="flex items-center gap-4 md:gap-6"><div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white/5 flex items-center justify-center border-2 border-primary/20 text-2xl md:text-4xl">{AVATARS.find(a => a.id === activeChild?.avatar)?.emoji}</div><div><p className="text-lg md:text-xl font-black uppercase italic text-white">{t.title}</p><p className="text-xs md:text-sm text-primary font-black uppercase">{t.stars} estrelas em jogo</p></div></div>
                              <div className="flex gap-3 w-full sm:w-auto"><button onClick={() => handleApprove(t.id)} className="flex-1 sm:w-16 h-14 md:h-16 bg-primary text-black rounded-2xl flex items-center justify-center hover:scale-105 transition-all"><Check className="w-6 h-6 md:w-8 md:h-8" /></button><button onClick={() => updateActiveChild({ tasks: tasks.map((tk: Task) => tk.id === t.id ? { ...tk, status: 'available' } : tk) })} className="flex-1 sm:w-16 h-14 md:h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-red-500 transition-all"><X className="w-6 h-6 md:w-8 md:h-8" /></button></div>
                            </div>
                          ))}
                          {tasks.filter(t => t.status === 'pending').length === 0 && <div className="p-24 border-4 border-dashed border-white/5 rounded-[60px] text-center text-white/10 font-black uppercase italic tracking-widest text-xl">Tudo em Órbita!</div>}
                        </div>
                      </div>
                    )}

                    {parentSubView === 'missions' && (
                      <div className="space-y-8">
                        <div className="flex justify-between items-end">
                          <div className="space-y-2">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Sala de Controle</h2>
                            <p className="text-white/40">Edite as missões e recompensas do universo.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2"><Zap className="w-4 h-4" /> Missões Atuais</h3>

                            {/* Input Manual no Painel */}
                            <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-2xl space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Lançar Nova Missão:</p>
                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Nome..."
                                    value={customTask.title}
                                    onChange={e => setCustomTask({ ...customTask, title: e.target.value })}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                                  />
                                  <input
                                    type="number"
                                    value={customTask.stars}
                                    onChange={e => setCustomTask({ ...customTask, stars: parseInt(e.target.value) || 0 })}
                                    className="w-14 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-center outline-none"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={customTask.recurrence}
                                    onChange={e => setCustomTask({ ...customTask, recurrence: e.target.value as TaskRecurrence })}
                                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none text-white/60"
                                  >
                                    <option value="daily">Diária</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensal</option>
                                    <option value="once">Única</option>
                                  </select>
                                  <button
                                    disabled={!customTask.title}
                                    onClick={() => { addTask(customTask.title, customTask.stars, customTask.recurrence); setCustomTask({ title: "", stars: 5, recurrence: 'daily' }); }}
                                    className="flex-1 py-2 bg-primary text-black rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase"
                                  >
                                    <Plus className="w-3 h-3" /> Adicionar
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {tasks.map((t: Task) => (
                                <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group">
                                  <span className="font-bold text-sm uppercase italic">{t.title}</span>
                                  <div className="flex items-center gap-4">
                                    <span className="text-primary font-black">{t.stars}⭐</span>
                                    <button onClick={() => removeTask(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400"><Trash className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              ))}
                              <div className="p-2 border border-dashed border-white/10 rounded-2xl opacity-40 hover:opacity-100 transition-opacity">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2">Sugestões:</p>
                                <div className="flex flex-wrap gap-1">
                                  {taskPresets.map((p: any) => (
                                    <button key={p.title} onClick={() => addTask(p.title, p.stars)} className="px-2 py-1 bg-white/5 rounded-md text-[8px] font-bold uppercase hover:bg-primary hover:text-black transition-all">+{p.title}</button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-yellow-400 flex items-center gap-2"><Gift className="w-4 h-4" /> Recompensas Ativas</h3>

                            {/* Input Manual no Painel */}
                            <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-2xl space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Criar Novo Tesouro:</p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Nome..."
                                  value={customReward.title}
                                  onChange={e => setCustomReward({ ...customReward, title: e.target.value })}
                                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-yellow-400"
                                />
                                <input
                                  type="number"
                                  value={customReward.cost}
                                  onChange={e => setCustomReward({ ...customReward, cost: parseInt(e.target.value) || 0 })}
                                  className="w-14 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-center outline-none"
                                />
                                <button
                                  disabled={!customReward.title}
                                  onClick={() => { addReward(customReward.title, customReward.cost); setCustomReward({ title: "", cost: 50 }); }}
                                  className="p-2 bg-yellow-400 text-black rounded-xl hover:scale-105 transition-all"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {rewards.map((r: Reward) => (
                                <div key={r.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group">
                                  <span className="font-bold text-sm uppercase italic">{r.title}</span>
                                  <div className="flex items-center gap-4">
                                    <span className="text-yellow-400 font-black">{r.cost}⭐</span>
                                    <button onClick={() => removeReward(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400"><Trash className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              ))}
                              <div className="p-2 border border-dashed border-white/10 rounded-2xl opacity-40 hover:opacity-100 transition-opacity">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2">Sugestões:</p>
                                <div className="flex flex-wrap gap-1">
                                  {rewardPresets.map((p: any) => (
                                    <button key={p.title} onClick={() => addReward(p.title, p.cost)} className="px-2 py-1 bg-white/5 rounded-md text-[8px] font-bold uppercase hover:bg-yellow-400 hover:text-black transition-all">+{p.title}</button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {parentSubView === 'ranking' && (
                      <div className="space-y-8">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Ranking Galáctico</h2>
                          <p className="text-white/40">Classificação dos heróis por total de estrelas.</p>
                        </div>

                        <div className="space-y-4">
                          {[...children, ...fleetChildren].sort((a, b) => b.stars - a.stars).map((c: ChildData, idx: number) => {
                            const avatar = AVATARS.find(av => av.id === c.avatar) || AVATARS[0];
                            const isOwn = children.some(own => own.id === c.id);
                            return (
                              <motion.div
                                key={c.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={clsx(
                                  "p-6 rounded-[30px] border-2 flex items-center justify-between backdrop-blur-md transition-all",
                                  idx === 0 ? "bg-yellow-400/10 border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.2)]" :
                                    isOwn ? "bg-primary/5 border-primary/20" : "bg-white/5 border-white/10"
                                )}
                              >
                                <div className="flex items-center gap-6">
                                  <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl">
                                      {avatar.emoji}
                                    </div>
                                    <div className={clsx(
                                      "absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2",
                                      idx === 0 ? "bg-yellow-400 text-black border-white" :
                                        idx === 1 ? "bg-zinc-300 text-black border-white" :
                                          idx === 2 ? "bg-orange-400 text-black border-white" : "bg-zinc-800 text-white border-white/20"
                                    )}>
                                      {idx + 1}º
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter">{c.name} {!isOwn && <span className="text-[10px] lowercase text-white/20">(aliado)</span>}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{isOwn ? "Da sua frota" : "Frota Aliada"}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                                  <span className="text-2xl font-black italic tracking-tighter">{c.stars}</span>
                                </div>
                              </motion.div>
                            );
                          })}
                          {fleetId && fleetChildren.length === 0 && (
                            <p className="text-center py-8 text-white/20 font-black uppercase italic tracking-widest text-xs">Nenhum aliado na frota {fleetId} ainda...</p>
                          )}
                        </div>
                      </div>
                    )}

                    {parentSubView === 'settings' && (
                      <div className="space-y-8">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Ajustes do Perfil</h2>
                          <p className="text-white/40">Personalize a identidade do herói nesta missão.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-8 backdrop-blur-md">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nome do Herói</label>
                            <input
                              type="text"
                              value={activeChild?.name}
                              onChange={e => updateActiveChild({ name: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black text-xl outline-none focus:border-primary transition-colors"
                            />
                          </div>

                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Escolher Novo Avatar</label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
                              {AVATARS.map((a: any) => (
                                <button
                                  key={a.id}
                                  onClick={() => updateActiveChild({ avatar: a.id })}
                                  className={clsx(
                                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all border-2",
                                    activeChild?.avatar === a.id ? "bg-primary/20 border-primary scale-110" : "bg-white/5 border-white/10 hover:border-white/30"
                                  )}
                                >
                                  {a.emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-white/10 space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                              <Lock className="w-3 h-3" /> Alterar Código PIN de Acesso
                            </label>
                            <div className="flex gap-4">
                              <input
                                type="password"
                                maxLength={4}
                                placeholder="Novo PIN (4 dígitos)"
                                value={parentPin}
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  setParentPin(val);
                                }}
                                className="w-40 bg-white/5 border border-white/10 rounded-2xl p-4 font-black text-center text-xl outline-none focus:border-primary"
                              />
                              <p className="text-[10px] text-white/40 leading-tight flex-1 flex items-center">
                                Este código será solicitado sempre que você tentar acessar a área de gestão ou validação de missões.
                              </p>
                            </div>
                          </div>

                        </div>

                        <div className="flex justify-center">
                          <button onClick={() => setView('child')} className="px-10 py-4 bg-primary text-black font-black uppercase rounded-2xl shadow-xl hover:scale-105 transition-all">Ver Alterações no Dashboard</button>
                        </div>
                      </div>
                    )}

                    {parentSubView === 'fleet' && (
                      <div className="space-y-8">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-purple-400 flex items-center gap-3">
                            <Zap className="w-8 h-8" /> Aliança Galáctica
                          </h2>
                          <p className="text-white/40">Conecte o universo do {activeChild?.name} com outras frotas (primos e amigos).</p>
                        </div>
                        
                        <div className="p-4 md:p-8 bg-white/5 border border-purple-500/30 rounded-3xl md:rounded-[40px] space-y-6 backdrop-blur-md">
                          <label className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                            Código da Aliança Compartilhada
                          </label>
                          <div className="flex flex-col md:flex-row gap-4">
                            <input
                              type="text"
                              placeholder="Ex: FAMILIA-SILVA"
                              value={fleetId}
                              onChange={e => setFleetId(e.target.value.toUpperCase().replace(/\s/g, '-'))}
                              className="flex-1 bg-white/10 border border-white/20 rounded-2xl p-4 font-black text-xl md:text-2xl outline-none focus:border-purple-500 transition-all text-white"
                            />
                            <button onClick={() => loadFleetRanking()} className="px-8 py-4 bg-purple-500 text-white font-black uppercase rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                              <RefreshCw className="w-5 h-5" /> Sincronizar
                            </button>
                          </div>
                          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex gap-4">
                            <AlertCircle className="w-6 h-6 text-purple-400 shrink-0" />
                            <p className="text-sm text-purple-200/80 leading-relaxed font-medium">
                              Compartilhe o código acima com os pais dos amigos. Quando eles inserirem o mesmo código nos aplicativos deles, as crianças vão competir no mesmo <strong>Ranking Intergaláctico</strong>!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {parentSubView === 'behavior' && (
                      <div className="space-y-8">
                        <div className="space-y-2"><h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-400">Ponte de Comportamento</h2><p className="text-white/40">Deduza estrelas do {activeChild?.name} para alinhar a rota comportamental.</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: "Birra / Malcriação", stars: 2 },
                            { label: "Não obedeceu", stars: 3 },
                            { label: "Agressividade", stars: 5 },
                          ].map((punish: any, i: number) => (
                            <button key={i} onClick={() => handleDeductStars(punish.stars, punish.label)} className="p-4 md:p-8 bg-white/5 border border-white/10 rounded-3xl md:rounded-[40px] flex items-center justify-between hover:bg-red-500/10 hover:border-red-500 transition-all group text-left">
                              <div className="flex items-center gap-3 md:gap-4"><div className="w-10 h-10 md:w-14 md:h-14 bg-red-500/20 rounded-xl md:rounded-2xl flex items-center justify-center"><AlertCircle className="w-5 h-5 md:w-8 md:h-8 text-red-500" /></div><span className="font-black uppercase text-xs md:text-base text-white/80">{punish.label}</span></div>
                              <span className="text-lg md:text-xl font-black text-red-500">-{punish.stars}⭐</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {parentSubView === 'history' && (
                      <div className="space-y-6">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                          <History className="w-8 h-8 text-white/20" /> Log de Navegação
                        </h2>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          {history.map((h: any) => (
                            <div key={h.id} className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-[30px] flex justify-between items-center backdrop-blur-sm group hover:bg-white/10 transition-all">
                              <div className="flex items-center gap-4">
                                <div className={clsx(
                                  "w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg",
                                  h.type === 'gain' ? "bg-primary/20 text-primary" : h.type === 'redeem' ? "bg-yellow-400/20 text-yellow-400" : "bg-red-500/20 text-red-500"
                                )}>
                                  {h.type === 'gain' ? <Plus className="w-5 h-5 md:w-6 md:h-6" /> : h.type === 'redeem' ? <Gift className="w-5 h-5 md:w-6 md:h-6" /> : <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />}
                                </div>
                                <div>
                                  <p className="text-sm md:text-lg font-black uppercase italic text-white/80">{h.title}</p>
                                  <p className="text-[8px] md:text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">{h.date}</p>
                                </div>
                              </div>
                              <span className={clsx(
                                "text-xl md:text-2xl font-black italic drop-shadow-sm",
                                h.type === 'gain' ? "text-primary" : h.type === 'redeem' ? "text-yellow-400" : "text-red-400"
                              )}>
                                {h.type === 'gain' ? `+${h.amount}` : `-${h.amount}`}⭐
                              </span>
                            </div>
                          ))}
                          {history.length === 0 && (
                            <div className="p-24 border-4 border-dashed border-white/5 rounded-[60px] text-center text-white/10 font-black uppercase italic tracking-widest text-xl">
                              Sem registros no radar
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Hall da Fama</h2>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Os Maiores Heróis da Aliança</p>
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
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20">{isMe ? "Você!" : "Herói Aliado"}</p>
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
                      <button onClick={() => setShowRankingModal(false)} className="w-full py-4 bg-primary text-black font-black uppercase rounded-2xl shadow-xl hover:scale-[1.02] transition-all">Voltar para a Missão</button>
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
                <AnimatePresence>{showPin && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-24 right-0 bg-[#16213e] border border-white/20 p-8 rounded-[40px] shadow-2xl w-72"><h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-center text-white/40">Código de Autorização</h3><form onSubmit={handlePinSubmit} className="space-y-6"><input autoFocus type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-3xl font-black tracking-[0.5em] outline-none focus:border-primary" /><button type="submit" className="w-full py-4 bg-primary text-black font-black uppercase rounded-2xl shadow-xl">Confirmar</button></form></motion.div>}</AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
