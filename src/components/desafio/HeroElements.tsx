"use client";

import { useState, useRef, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, X, Share2 } from "lucide-react";
import clsx from "clsx";
import type { Task } from "@/types/desafio";
import confetti from "canvas-confetti";

// --- Constantes ---
export const AVATARS = [
  // Robôs (Bottts) - Foco Sci-Fi
  { id: 'bot1', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=transparent', label: 'Robô Felix' },
  { id: 'bot2', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka&backgroundColor=transparent', label: 'Robô Aneka' },
  { id: 'bot3', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mimi&backgroundColor=transparent', label: 'Robô Mimi' },
  { id: 'bot4', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe&backgroundColor=transparent', label: 'Robô Zoe' },
  { id: 'bot5', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Orion&backgroundColor=transparent', label: 'Robô Orion' },
  { id: 'bot6', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=transparent', label: 'Robô Nova' },
  { id: 'bot7', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Spark&backgroundColor=transparent', label: 'Robô Spark' },
  { id: 'bot8', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Apollo&backgroundColor=transparent', label: 'Robô Apollo' },

  // Personagens Expressivos (Fun Emoji)
  { id: 'fun1', image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy&backgroundColor=transparent', label: 'Feliz' },
  { id: 'fun2', image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool&backgroundColor=transparent', label: 'Descolado' },
  { id: 'fun3', image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Wink&backgroundColor=transparent', label: 'Zigue' },
  { id: 'fun4', image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Star&backgroundColor=transparent', label: 'Estrela' },
  { id: 'fun5', image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Love&backgroundColor=transparent', label: 'Amor' },
  { id: 'fun6', image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Silly&backgroundColor=transparent', label: 'Divertido' },
  { id: 'fun7', image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sleepy&backgroundColor=transparent', label: 'Soneca' },
  { id: 'fun8', image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Nerd&backgroundColor=transparent', label: 'Gênio' },
  { id: 'fun9', image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Angel&backgroundColor=transparent', label: 'Anjinho' },
  { id: 'fun10', image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Party&backgroundColor=transparent', label: 'Festa' },

  // Aventureiros (Adventurer)
  { id: 'adv1', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack&backgroundColor=transparent', label: 'Jack' },
  { id: 'adv2', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasmine&backgroundColor=transparent', label: 'Jasmine' },
  { id: 'adv3', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=transparent', label: 'Leo' },
  { id: 'adv4', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mia&backgroundColor=transparent', label: 'Mia' },
  { id: 'adv5', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Finn&backgroundColor=transparent', label: 'Finn' },
  { id: 'adv6', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe&backgroundColor=transparent', label: 'Chloe' },
  { id: 'adv7', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Max&backgroundColor=transparent', label: 'Max' },
  { id: 'adv8', image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ruby&backgroundColor=transparent', label: 'Ruby' },

  // Estilosos (Lorelei)
  { id: 'lor1', image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Bella&backgroundColor=transparent', label: 'Bella' },
  { id: 'lor2', image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Max&backgroundColor=transparent', label: 'Max' },
  { id: 'lor3', image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Charlie&backgroundColor=transparent', label: 'Charlie' },
  { id: 'lor4', image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Luna&backgroundColor=transparent', label: 'Luna' },
  { id: 'lor5', image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Oliver&backgroundColor=transparent', label: 'Oliver' },
  { id: 'lor6', image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Stella&backgroundColor=transparent', label: 'Stella' },
  { id: 'lor7', image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Milo&backgroundColor=transparent', label: 'Milo' },
  { id: 'lor8', image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophie&backgroundColor=transparent', label: 'Sophie' },

  // Avataaars (Clássicos e Expressivos)
  { id: 'ava1', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=transparent', label: 'Sam' },
  { id: 'ava2', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasmine&backgroundColor=transparent', label: 'Jazz' },
  { id: 'ava3', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George&backgroundColor=transparent', label: 'George' },
  { id: 'ava4', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly&backgroundColor=transparent', label: 'Lilly' },
  { id: 'ava5', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar&backgroundColor=transparent', label: 'Oscar' },
  { id: 'ava6', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=transparent', label: 'Zoe' },
  { id: 'ava7', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=transparent', label: 'Felps' },
  { id: 'ava8', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&backgroundColor=transparent', label: 'Milo' },

  // Micah (Estilo Desenhado Premium)
  { id: 'mic1', image: 'https://api.dicebear.com/7.x/micah/svg?seed=Aiden&backgroundColor=transparent', label: 'Aiden' },
  { id: 'mic2', image: 'https://api.dicebear.com/7.x/micah/svg?seed=Caleb&backgroundColor=transparent', label: 'Caleb' },
  { id: 'mic3', image: 'https://api.dicebear.com/7.x/micah/svg?seed=Elijah&backgroundColor=transparent', label: 'Elijah' },
  { id: 'mic4', image: 'https://api.dicebear.com/7.x/micah/svg?seed=Hazel&backgroundColor=transparent', label: 'Hazel' },
  { id: 'mic5', image: 'https://api.dicebear.com/7.x/micah/svg?seed=Maya&backgroundColor=transparent', label: 'Maya' },
  { id: 'mic6', image: 'https://api.dicebear.com/7.x/micah/svg?seed=Noah&backgroundColor=transparent', label: 'Noah' },
  { id: 'mic7', image: 'https://api.dicebear.com/7.x/micah/svg?seed=Ruby&backgroundColor=transparent', label: 'Ruby' },
  { id: 'mic8', image: 'https://api.dicebear.com/7.x/micah/svg?seed=Sophia&backgroundColor=transparent', label: 'Sophia' },

  // Big Ears (Fofinhos)
  { id: 'big1', image: 'https://api.dicebear.com/7.x/big-ears/svg?seed=Coco&backgroundColor=transparent', label: 'Coco' },
  { id: 'big2', image: 'https://api.dicebear.com/7.x/big-ears/svg?seed=Daisy&backgroundColor=transparent', label: 'Daisy' },
  { id: 'big3', image: 'https://api.dicebear.com/7.x/big-ears/svg?seed=Ginger&backgroundColor=transparent', label: 'Ginger' },
  { id: 'big4', image: 'https://api.dicebear.com/7.x/big-ears/svg?seed=Jasper&backgroundColor=transparent', label: 'Jasper' },
  { id: 'big5', image: 'https://api.dicebear.com/7.x/big-ears/svg?seed=Lucky&backgroundColor=transparent', label: 'Lucky' },
  { id: 'big6', image: 'https://api.dicebear.com/7.x/big-ears/svg?seed=Oreo&backgroundColor=transparent', label: 'Oreo' },
  { id: 'big7', image: 'https://api.dicebear.com/7.x/big-ears/svg?seed=Peanut&backgroundColor=transparent', label: 'Peanut' },
  { id: 'big8', image: 'https://api.dicebear.com/7.x/big-ears/svg?seed=Simba&backgroundColor=transparent', label: 'Simba' },

  // Pixel Art (Retrô / Games)
  { id: 'pix1', image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Arthur&backgroundColor=transparent', label: 'Arthur' },
  { id: 'pix2', image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Bibi&backgroundColor=transparent', label: 'Bibi' },
  { id: 'pix3', image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Cody&backgroundColor=transparent', label: 'Cody' },
  { id: 'pix4', image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Dora&backgroundColor=transparent', label: 'Dora' },
  { id: 'pix5', image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Evan&backgroundColor=transparent', label: 'Evan' },
  { id: 'pix6', image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Fiona&backgroundColor=transparent', label: 'Fiona' },
  { id: 'pix7', image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Gus&backgroundColor=transparent', label: 'Gus' },
  { id: 'pix8', image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Hugo&backgroundColor=transparent', label: 'Hugo' },

  // Aventureiros Neutros (Adventurer Neutral)
  { id: 'adn1', image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alex&backgroundColor=transparent', label: 'Alex' },
  { id: 'adn2', image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Avery&backgroundColor=transparent', label: 'Avery' },
  { id: 'adn3', image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Riley&backgroundColor=transparent', label: 'Riley' },
  { id: 'adn4', image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Jordan&backgroundColor=transparent', label: 'Jordan' },
  { id: 'adn5', image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Casey&backgroundColor=transparent', label: 'Casey' },
  { id: 'adn6', image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Quinn&backgroundColor=transparent', label: 'Quinn' },
  { id: 'adn7', image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Taylor&backgroundColor=transparent', label: 'Taylor' },
  { id: 'adn8', image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Morgan&backgroundColor=transparent', label: 'Morgan' }
];

export const StarField = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0f172a]">
    <div className="absolute inset-0 opacity-30" style={{
      backgroundImage: 'radial-gradient(white 1px, transparent 0)',
      backgroundSize: '50px 50px'
    }} />

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
      className="absolute w-[600px] h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent -rotate-12"
      style={{ willChange: 'transform, opacity' }}
    />

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
      className="absolute w-48 h-48 rounded-full bg-zinc-400/20 shadow-[inset_-15px_-15px_40px_rgba(0,0,0,0.6)] flex items-center justify-center text-7xl grayscale opacity-60"
      style={{ willChange: 'transform, opacity' }}
    >
      🌑
    </motion.div>

    <motion.div
      initial={{ x: "-20vw", y: "80vh", opacity: 0 }}
      animate={{ x: "120vw", y: "20vh", opacity: [0, 0.7, 0.7, 0], rotate: 360 }}
      transition={{ duration: 50, repeat: Infinity, ease: "linear", delay: 2 }}
      className="absolute text-6xl"
      style={{ willChange: 'transform, opacity' }}
    >🪐</motion.div>

    <motion.div
      initial={{ x: "120vw", y: "15vh", opacity: 0 }}
      animate={{ x: "-30vw", y: "85vh", opacity: [0, 0.6, 0.6, 0], rotate: -360 }}
      transition={{ duration: 65, repeat: Infinity, ease: "linear", delay: 12 }}
      className="absolute text-5xl"
      style={{ willChange: 'transform, opacity' }}
    >🌍</motion.div>

    <motion.div
      initial={{ x: "60vw", y: "-20vh", opacity: 0 }}
      animate={{ x: "20vw", y: "120vh", opacity: [0, 0.5, 0.5, 0] }}
      transition={{ duration: 45, repeat: Infinity, ease: "linear", delay: 20 }}
      className="absolute text-4xl"
      style={{ willChange: 'transform, opacity' }}
    >🔴</motion.div>

    <motion.div
      initial={{ x: "110vw", y: "100vh", opacity: 0 }}
      animate={{ x: "-10vw", y: "-10vh", opacity: [0, 0.6, 0.6, 0] }}
      transition={{ duration: 55, repeat: Infinity, ease: "linear", delay: 30 }}
      className="absolute text-7xl"
      style={{ willChange: 'transform, opacity' }}
    >🔵</motion.div>

    {/* Omitindo os animate-pulse nos gradientes pesados para salvar o repaint da GPU */}
    <div className="absolute top-[10%] right-[15%] w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-[80px]" />
    <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-[100px]" />
    <div className="absolute top-[50%] left-[45%] w-32 h-32 bg-gradient-to-tl from-emerald-500/10 to-transparent rounded-full blur-[40px]" />

    {/* Estrelas com CSS Puro (sem Framer Motion = Custo Zero de CPU) */}
    {[...Array(25)].map((_, i) => {
      const isLarge = i % 5 === 0;
      return (
        <div
          key={i}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            width: isLarge ? '3px' : '1.5px',
            height: isLarge ? '3px' : '1.5px',
            top: (5 + i * 13) % 100 + '%',
            left: (3 + i * 17) % 100 + '%',
            boxShadow: isLarge ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
            animationDuration: `${2 + (i % 5)}s`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0.6,
            willChange: 'opacity'
          }}
        />
      );
    })}
  </div>
));
StarField.displayName = 'StarField';

export const SpaceShipVideo = memo(function SpaceShipVideo() {
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
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_red]" />
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-75 shadow-[0_0_15px_blue]" />

            <div className="w-full h-full rounded-full border-[8px] border-zinc-400 bg-white shadow-2xl overflow-hidden relative flex items-center justify-center">
              <video
                ref={videoRef}
                src="/boa.mp4"
                autoPlay
                onEnded={handleEnded}
                playsInline
                className="w-[70%] h-[70%] object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
            </div>

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
});

// ─── DailyConquestCelebration ──────────────────────────────────────────────
// Monitora as missões diárias. Quando todas ficam 'done', anima a nave
// voando para o centro da tela e reproduz o vídeo Conquista.mp4.
export const DailyConquestCelebration = memo(function DailyConquestCelebration({ tasks, t, onAwardStars }: { tasks: Task[], t: any, onAwardStars?: (amount: number, title: string) => void }) {
  const [shipState, setShipState] = useState<'corner' | 'flying' | 'center' | 'icon'>('corner');
  const [showCelebration, setShowCelebration] = useState(false);
  const [shipPlayCount, setShipPlayCount] = useState(0);
  const shipVideoRef = useRef<HTMLVideoElement>(null);
  const conquestVideoRef = useRef<HTMLVideoElement>(null);
  const celebratedRef = useRef(false);

  // Guards para não disparar a celebração no mount (missões já concluídas de antes)
  const isMountedRef = useRef(false);
  const prevAllDailyDoneRef = useRef(false);

  // Detecta quando TODAS as missões diárias são concluídas
  const dailyTasks = tasks.filter(t => t.recurrence === 'daily');
  const allDailyDone = dailyTasks.length > 0 && dailyTasks.every(t => t.status === 'done');

  useEffect(() => {
    // Na primeira renderização apenas registra o estado inicial — não celebra
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      prevAllDailyDoneRef.current = allDailyDone;
      return;
    }

    // Só celebra se houve TRANSIÇÃO de false → true nesta sessão
    if (allDailyDone && !prevAllDailyDoneRef.current && !celebratedRef.current) {
      celebratedRef.current = true;
      setTimeout(() => {
        setShipState('flying');
        setTimeout(() => {
          setShipState('center');
          setShowCelebration(true);
          // Confetti leve — disparado via rAF para não travar o frame de render
          setTimeout(() => {
            requestAnimationFrame(() => {
              confetti({ particleCount: 30, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: ['#2dd4bf', '#fbbf24', '#a78bfa', '#ffffff'], scalar: 0.9 });
              requestAnimationFrame(() => {
                confetti({ particleCount: 30, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: ['#2dd4bf', '#fbbf24', '#a78bfa', '#ffffff'], scalar: 0.9 });
              });
            });
          }, 300);
          setTimeout(() => { conquestVideoRef.current?.play(); }, 300);
        }, 1200);
      }, 800);
    }

    // Reseta quando missões voltam a available (novo ciclo do dia seguinte)
    if (!allDailyDone) {
      celebratedRef.current = false;
    }

    prevAllDailyDoneRef.current = allDailyDone;
  }, [allDailyDone]);

  const closeCelebration = () => {
    setShowCelebration(false);
    setShipState('icon');
    if (conquestVideoRef.current) {
      conquestVideoRef.current.pause();
      conquestVideoRef.current.currentTime = 0;
    }
  };

  const handleShare = () => {
    const inviteText = `🌟 Acabei de completar todas as minhas missões diárias no Desafio das Estrelas! Venha entrar para a frota galáctica e vencer comigo: https://www.desafioestrelas.com/`;
    
    const awardBonus = () => {
      if (onAwardStars) {
        onAwardStars(5, 'Bônus de Compartilhamento');
      }
    };

    if (navigator.share) {
      navigator.share({
        title: 'Vitória no Desafio das Estrelas',
        text: inviteText,
        url: 'https://www.desafioestrelas.com/',
      }).then(() => {
        awardBonus();
      }).catch(err => console.log('Erro ao compartilhar:', err));
    } else {
      navigator.clipboard.writeText(inviteText);
      alert('Vitória copiada para a área de transferência! Cole nas suas redes.');
      awardBonus();
    }
  };

  // Desmuta o boa.mp4 automaticamente após a primeira interação do usuário
  // (necessário: navegadores bloqueiam autoplay com som antes de qualquer interação)
  useEffect(() => {
    const unmute = () => {
      if (shipVideoRef.current) {
        shipVideoRef.current.muted = false;
        // Se estiver pausado (bloqueado pelo browser), retenta o play com som
        if (shipVideoRef.current.paused) {
          shipVideoRef.current.play().catch(() => { });
        }
      }
      document.removeEventListener('click', unmute);
      document.removeEventListener('touchstart', unmute);
    };
    document.addEventListener('click', unmute);
    document.addEventListener('touchstart', unmute);
    return () => {
      document.removeEventListener('click', unmute);
      document.removeEventListener('touchstart', unmute);
    };
  }, []);

  // Handlers da nave (boa.mp4) — só mostra a nave de canto quando NÃO está em celebração
  const handleShipEnded = () => {
    const next = shipPlayCount + 1;
    if (next >= 2) { setShipState('icon'); setShipPlayCount(0); }
    else { setShipPlayCount(next); shipVideoRef.current?.play(); }
  };
  const handleIconClick = () => {
    setShipState('corner');
    setShipPlayCount(0);
    setTimeout(() => {
      if (shipVideoRef.current) { shipVideoRef.current.muted = false; shipVideoRef.current.play(); }
    }, 100);
  };


  return (
    <>
      {/* Nave no canto inferior esquerdo */}
      {shipState !== 'center' && (
        <div className="fixed bottom-4 md:bottom-10 left-4 md:left-10 z-[100]">
          <AnimatePresence mode="wait">
            {shipState === 'icon' ? (
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
            ) : (
              <motion.div
                key="ship"
                initial={{ opacity: 0, x: -100, scale: 0.5 }}
                animate={
                  shipState === 'flying'
                    ? {
                      opacity: 1,
                      x: typeof window !== 'undefined' ? window.innerWidth / 2 - 112 : 300,
                      y: typeof window !== 'undefined' ? -(window.innerHeight / 2 - 112) : -300,
                      scale: 1.4,
                      rotate: [0, -15, 15, -10, 0],
                    }
                    : { opacity: 1, x: 0, scale: 1 }
                }
                transition={
                  shipState === 'flying'
                    ? { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
                    : { duration: 0.4 }
                }
                onClick={() => setShipState('icon')}
                whileHover={shipState === 'corner' ? { scale: 1.05 } : {}}
                className="relative w-28 h-28 md:w-56 md:h-56 cursor-pointer"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_red]" />
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-75 shadow-[0_0_15px_blue]" />
                {/* Círculo da nave — restaurado tamanho original */}
                <div className="w-full h-full rounded-full border-[8px] border-zinc-400 bg-white shadow-2xl overflow-hidden relative flex items-center justify-center">
                  <video
                    ref={shipVideoRef}
                    src="/boa.mp4"
                    autoPlay
                    muted
                    onEnded={handleShipEnded}
                    playsInline
                    className="w-[100%] h-[100%] object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                </div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-1 h-12 bg-zinc-500 rounded-full" />
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-ping" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de Celebração — Conquista.mp4 toca COM ÁUDIO dentro da nave */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl"
          >
            {/* Botão fechar */}
            <button
              onClick={closeCelebration}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Partículas de estrelas */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: (Math.cos((i / 20) * Math.PI * 2) * 180) + (Math.random() * 80 - 40),
                  y: (Math.sin((i / 20) * Math.PI * 2) * 180) + (Math.random() * 80 - 40),
                }}
                transition={{ duration: 1.5, delay: i * 0.06, ease: 'easeOut' }}
                className="absolute text-2xl pointer-events-none select-none"
              >
                {['⭐', '✨', '🌟', '💫'][i % 4]}
              </motion.div>
            ))}

            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mb-6 px-4"
            >
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-2">🚀 {t.missionAccomplished}</p>
              <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(45,212,191,0.6)]">
                {t.allMissionsDone}
              </h2>
            </motion.div>

            {/* Nave centralizada — toca Conquista.mp4 COM ÁUDIO dentro do círculo */}
            <motion.div
              initial={{ scale: 0.3, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-40 h-40 md:w-52 md:h-52 cursor-pointer"
              onClick={closeCelebration}
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_red]" />
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-75 shadow-[0_0_12px_blue]" />
              <div className="w-full h-full rounded-full border-[8px] border-primary/60 bg-white shadow-[0_0_80px_rgba(45,212,191,0.7)] overflow-hidden relative flex items-center justify-center">
                  <video
                    ref={conquestVideoRef}
                    src="/Conquista.mp4"
                    playsInline
                    className="w-[100%] h-[100%] object-contain"
                  />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
              </div>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-1 h-8 bg-zinc-500 rounded-full" />
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
              {/* Dica de toque */}
              <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-white/30 whitespace-nowrap">
                {t.tapToClose || 'Toque para fechar'}
              </p>
            </motion.div>

            <div className="mt-14 flex flex-col md:flex-row gap-4 items-center">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
                onClick={handleShare}
                className="px-8 py-4 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 border border-purple-500/50 transition-all text-xs md:text-sm flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                Compartilhar Vitória 🌟
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
                onClick={closeCelebration}
                className="px-10 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all text-xs md:text-sm"
              >
                {t.continue || 'Continuar a Missão'} 🚀
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

});
DailyConquestCelebration.displayName = 'DailyConquestCelebration';

export const HeroCharacter = memo(function HeroCharacter({ avatar, name, isCelebrating = false, isSad = false, isFiring = false, t, onFlightComplete }: { avatar: string, name: string, isCelebrating?: boolean, isSad?: boolean, isFiring?: boolean, t: any, onFlightComplete?: () => void }) {
  const selectedAvatar = AVATARS.find(a => a.id === avatar) || AVATARS[0];
  const [isFlying, setIsFlying] = useState(false);

  const handleFlight = () => {
    if (isFlying) return;
    setIsFlying(true);
    setTimeout(() => {
      setIsFlying(false);
      if (onFlightComplete) {
        onFlightComplete();
      }
    }, 4000);
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

      <motion.div
        animate={isFlying ? { opacity: 0 } : { opacity: 1, x: isFiring ? 40 : 0 }}
        className="absolute -top-14 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-xl z-20 pointer-events-none"
      >
        <p className="text-[8px] md:text-[10px] font-black uppercase italic tracking-tighter text-white">
          {isFlying ? "UHUUUUUU!" : isFiring ? t.fireOnTarget : isSad ? t.houstonProblem : isCelebrating ? t.missionAccomplished : t.readyHero.replace('{name}', name)}
        </p>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#16213e] border-r border-b border-white/20 rotate-45" />
      </motion.div>

      <motion.div
        animate={isFiring ? { rotate: 20, x: -5 } : { rotate: -10 }}
        className="absolute top-[45%] left-4 md:left-8 w-6 md:w-10 h-16 md:h-24 bg-zinc-300 rounded-full border-2 border-zinc-400 -z-10 origin-top"
      />

      <div className="relative w-24 h-24 md:w-36 md:h-36 z-10">
        <div className={clsx("w-full h-full rounded-full border-4 shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden bg-zinc-900 transition-colors relative p-0.5 md:p-1 flex items-center justify-center", isSad ? "border-red-500" : isFiring ? "border-green-400 shadow-[0_0_20px_#4ade80]" : "border-white/80")}>
          {selectedAvatar.image ? (
            <img src={selectedAvatar.image} alt={selectedAvatar.label} className="w-full h-full object-cover scale-110" />
          ) : (
            <div className="text-4xl md:text-6xl select-none">{(selectedAvatar as any).emoji}</div>
          )}
          <div className="absolute top-2 left-4 w-12 h-6 bg-white/10 rounded-full rotate-[-45deg]" />
          {isFiring && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              className="absolute inset-0 bg-green-400/20 z-0"
            />
          )}
        </div>

        <div className="absolute -bottom-1 -left-2 w-8 h-8 bg-zinc-200 rounded-full border-4 border-zinc-400 shadow-lg" />
        <div className="absolute -bottom-1 -right-2 w-8 h-8 bg-zinc-200 rounded-full border-4 border-zinc-400 shadow-lg" />
      </div>

      <div className="relative -mt-8 flex flex-col items-center">
        <div className="absolute top-4 w-20 md:w-28 h-28 md:h-36 bg-zinc-300 rounded-[20px] md:rounded-[24px] border-2 border-zinc-400 -z-10 shadow-lg" />

        <div className="w-16 md:w-24 h-24 md:h-32 bg-white rounded-[24px] md:rounded-[40px] border-2 md:border-4 border-zinc-200 shadow-xl flex flex-col items-center justify-start p-2 md:p-4 relative overflow-hidden">
          <div className="w-full h-4 bg-primary/20 rounded-full mb-4 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
          <Rocket className={clsx("w-10 h-10 transition-colors", isSad ? "text-zinc-300" : "text-primary")} />

          <div className="mt-4 flex gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
        </div>

        <motion.div
          animate={isFiring ? {
            rotate: -90,
            x: 40,
            y: -40,
            scaleX: 1.1
          } : { rotate: 15 }}
          className="absolute top-4 -right-4 w-6 md:w-10 h-16 md:h-24 bg-white rounded-full border-2 border-zinc-200 z-20 origin-top shadow-md"
        >
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

        <div className="flex gap-4 -mt-2">
          <div className="w-8 h-12 bg-white rounded-b-2xl border-x-4 border-b-4 border-zinc-200 shadow-lg" />
          <div className="w-8 h-12 bg-white rounded-b-2xl border-x-4 border-b-4 border-zinc-200 shadow-lg" />
        </div>

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
});
