"use client";

import React, { useState, useEffect } from "react";
import { Video, ArrowRight, Clock } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

interface TodayAppointmentCardProps {
  appt: any;
}

export function TodayAppointmentCard({ appt }: TodayAppointmentCardProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isSoon, setIsSoon] = useState(false);
  const [isOngoing, setIsOngoing] = useState(false);

  const startTime = new Date(appt.start_time);
  const duration = appt.service?.duration_minutes || 50;
  const endTime = new Date(startTime.getTime() + duration * 60000);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diffMs = startTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);

      const tenMinsInMs = 10 * 60 * 1000;
      
      if (now >= startTime && now < endTime) {
        setIsOngoing(true);
        setIsSoon(true);
        setTimeLeft("Sessão em andamento");
      } else if (diffMs <= tenMinsInMs && diffMs > 0) {
        setIsSoon(true);
        setIsOngoing(false);
        const mins = Math.max(0, diffMins);
        const secs = Math.max(0, diffSecs);
        setTimeLeft(`Abre em ${mins}:${secs < 10 ? '0' : ''}${secs}`);
      } else if (diffMs > tenMinsInMs) {
        setIsSoon(false);
        setIsOngoing(false);
        // Se faltar muito, mostrar apenas "Hoje às HH:mm"
        setTimeLeft(`Inicia às ${startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
      } else {
        setIsSoon(false);
        setIsOngoing(false);
        setTimeLeft("Finalizada");
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [appt.start_time]);

  const isPending = appt.status === 'pending_payment';

  return (
    <div className={clsx(
      "p-6 rounded-[32px] border transition-all duration-500 relative overflow-hidden group flex flex-col h-full",
      isPending 
        ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" 
        : isOngoing
        ? "bg-primary/10 border-primary/30 shadow-2xl shadow-primary/10"
        : "bg-zinc-800/40 backdrop-blur-md border-zinc-700 hover:border-primary/30"
    )}>
      {isOngoing && <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />}
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={clsx(
          "px-3 py-1 rounded-xl border font-black text-xs tracking-tighter shadow-sm transition-colors",
          isOngoing ? "bg-primary text-black border-white/20" : "bg-zinc-900/80 border-zinc-700 text-primary"
        )}>
          {startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
        </div>
        
        {isPending ? (
          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest px-2 py-1 bg-amber-500/10 rounded-lg animate-pulse">Pagamento Pendente</span>
        ) : (
          <span className={clsx(
            "text-[9px] font-black uppercase tracking-widest",
            isOngoing ? "text-primary animate-pulse" : "text-zinc-500"
          )}>
            {isOngoing ? "● Ao Vivo" : appt.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4 relative z-10 mb-auto">
        <div className={clsx(
          "w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm font-bold transition-all",
          isOngoing ? "border-primary/50 text-primary" : "text-zinc-400 group-hover:text-primary"
        )}>
          {appt.professional?.full_name?.split(" ").map((n: string) => n[0]).join("")}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-100 truncate italic">{appt.professional?.full_name}</p>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate">{appt.service?.name}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3 relative z-10">
        {!isPending && !isOngoing && !isSoon && (
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 px-1">
            <Clock className="w-3 h-3" /> {timeLeft}
          </p>
        )}

        {isPending ? (
          <Link 
            href={`/patient/payment?appointmentId=${appt.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            Pagar Agora <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <button 
            disabled={!isSoon}
            onClick={() => isSoon && (window.location.href = `/patient/session?id=${appt.id}`)}
            className={clsx(
              "flex items-center justify-center gap-2 w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
              isSoon
                ? "bg-primary text-black shadow-[0_10px_20px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-95"
                : "bg-zinc-900/50 border border-zinc-800 text-zinc-600 cursor-not-allowed"
            )}
            title={isSoon ? "Entrar na Sala Virtual" : "Disponível 10 min antes"}
          >
            {isOngoing ? "Entrar na Sessão" : isSoon ? timeLeft : "Disponível em breve"} <Video className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
