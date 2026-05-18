"use client";

import React from "react";
import { motion } from "framer-motion";
import { Rocket, ChevronLeft, LogOut } from "lucide-react";
import { Stage } from "@/types/desafio";

interface AppHeaderProps {
  stage: Stage;
  onBack?: () => void;
  onLogout?: () => void;
  language?: string;
  parentName?: string;
  activeChildName?: string;
}

export function AppHeader({
  stage,
  onBack,
  onLogout,
}: AppHeaderProps) {
  // Não renderiza o Header se for a Landing Page ou se for a busca de sinal
  if (stage === "landing" || stage === "searching_signal") return null;

  return (
    <header className="fixed top-0 left-0 w-full z-[100] bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 p-4 md:px-12 grid grid-cols-3 items-center shadow-2xl">
      {/* Coluna 1: Esquerda (Voltar ou Logo Rocket) */}
      <div className="flex items-center gap-2 justify-start">
        {onBack ? (
          <motion.button
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all shadow-md cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#2dd4bf]" />
            <span>Voltar</span>
          </motion.button>
        ) : (
          <motion.div
            whileHover={{ scale: 1.1, rotate: -10 }}
            className="w-8 h-8 md:w-10 md:h-10 bg-[#2dd4bf]/20 rounded-xl flex items-center justify-center border border-[#2dd4bf]/30 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
          >
            <Rocket className="w-5 h-5 md:w-6 md:h-6 text-[#2dd4bf]" />
          </motion.div>
        )}
      </div>

      {/* Coluna 2: Centro (Título Temático "Desafio das Estrelas") */}
      <div className="flex items-center justify-center">
        <span className="font-black italic uppercase tracking-tighter text-xs sm:text-sm md:text-xl lg:text-2xl text-center select-none bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          Desafio das <span className="text-[#2dd4bf] not-italic drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]">Estrelas</span>
        </span>
      </div>

      {/* Coluna 3: Direita (Logout ou Contexto) */}
      <div className="flex items-center gap-2 md:gap-3 justify-end">
        {onLogout ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-4 py-2 rounded-full text-[9px] md:text-xs font-black uppercase tracking-widest text-red-400 transition-all shadow-md cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </motion.button>
        ) : (
          /* Elemento invisível ou decorativo para manter a simetria perfeita */
          <div className="w-16 h-8 opacity-0 pointer-events-none" />
        )}
      </div>
    </header>
  );
}
