"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play } from "lucide-react";

interface Props {
  nextApptStartTime: string;           // ISO string
  nextApptProfessionalName?: string;
  nextApptProfessionalInitial?: string;
  activeSessionId?: string | null;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function SessionCountdown({
  nextApptStartTime,
  nextApptProfessionalName,
  nextApptProfessionalInitial,
  activeSessionId,
}: Props) {
  const [days, setDays]    = useState(0);
  const [hours, setHours]  = useState(0);
  const [mins, setMins]    = useState(0);
  const [secs, setSecs]    = useState(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const target = new Date(nextApptStartTime).getTime();

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setDays(0); setHours(0); setMins(0); setSecs(0);
        return;
      }
      setDays(Math.floor(diff / 86_400_000));
      setHours(Math.floor((diff % 86_400_000) / 3_600_000));
      setMins(Math.floor((diff % 3_600_000) / 60_000));
      setSecs(Math.floor((diff % 60_000) / 1_000));
    };

    tick(); // run immediately
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [nextApptStartTime]);

  const formattedDate = new Date(nextApptStartTime).toLocaleDateString("pt-BR", {
    month: "long",
    day: "numeric",
  });
  const formattedTime = new Date(nextApptStartTime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8">
      {/* Countdown */}
      <div className="flex flex-col items-center justify-center py-6 border-y border-zinc-800/50">
        {expired ? (
          <p className="text-sm font-black text-emerald-400 uppercase tracking-widest animate-pulse">
            Sessão iniciando...
          </p>
        ) : (
          <>
            <div className="flex gap-4 items-end mb-2">
              <span className="text-5xl font-black text-white tracking-tighter">{pad(days)}</span>
              <span className="text-zinc-100 font-bold mb-2">:</span>
              <span className="text-5xl font-black text-white tracking-tighter">{pad(hours)}</span>
              <span className="text-zinc-100 font-bold mb-2">:</span>
              <span className="text-5xl font-black text-white tracking-tighter">{pad(mins)}</span>
              <span className="text-zinc-100 font-bold mb-2">:</span>
              <span className="text-5xl font-black text-white tracking-tighter tabular-nums">{pad(secs)}</span>
            </div>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-100">
              <span>Dias</span>
              <span>Hrs</span>
              <span>Min</span>
              <span>Seg</span>
            </div>
          </>
        )}
      </div>

      {/* Professional info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500 font-bold">
          {nextApptProfessionalInitial}
        </div>
        <div>
          <p className="text-sm font-bold text-white">com {nextApptProfessionalName}</p>
          <p className="text-xs text-zinc-100">{formattedDate} @ {formattedTime}</p>
        </div>
      </div>

      {/* CTA Button */}
      <Link
        href={activeSessionId ? `/patient/session?id=${activeSessionId}` : "#"}
        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${
          activeSessionId
            ? "bg-emerald-500 text-black hover:bg-white"
            : "bg-zinc-900 text-zinc-300 border border-zinc-800 cursor-not-allowed"
        }`}
      >
        {activeSessionId ? "Entrar na Sessão" : "Aguardando Início"}
        <Play className={`w-4 h-4 ${activeSessionId ? "fill-current" : ""}`} />
      </Link>
    </div>
  );
}
