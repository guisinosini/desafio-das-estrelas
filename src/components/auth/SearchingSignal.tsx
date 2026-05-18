"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Loader2 } from "lucide-react";

export function SearchingSignal({ language }: { language: string }) {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = {
    "pt-BR": [
      "Estabelecendo link com a rede estelar...",
      "Autenticando sinal do transponder...",
      "Decodificando licença de voo do Mentor...",
      "Sincronizando coordenadas com a nave-mãe...",
      "Verificando status de energia dos propulsores..."
    ],
    "pt-PT": [
      "A estabelecer ligação com a rede estelar...",
      "A autenticar sinal do transponder...",
      "A decodificar licença de voo do Mentor...",
      "A sincronizar coordenadas com a nave-mãe...",
      "A verificar estado de energia dos propulsores..."
    ],
    en: [
      "Establishing link with the stellar network...",
      "Authenticating transponder signal...",
      "Decoding Mentor's flight license...",
      "Synchronizing coordinates with the mothership...",
      "Verifying thrusters energy status..."
    ],
    es: [
      "Estableciendo enlace con la red estelar...",
      "Autenticando señal del transpondedor...",
      "Decodificando licencia de vuelo del Mentor...",
      "Sincronizando coordenadas con la nave nodriza...",
      "Verificando estado de energía de los propulsores..."
    ],
    fr: [
      "Établissement du lien avec le réseau stellaire...",
      "Authentification du signal du transpondeur...",
      "Décodage de la licence de vol du Mentor...",
      "Synchronisation des coordonnées avec le vaisseau mère...",
      "Vérification de l'état d'énergie des propulseurs..."
    ],
    it: [
      "Stabilizzazione del collegamento con la rete stellare...",
      "Autenticazione del segnale del transponder...",
      "Decodifica della licenza di volo del Mentore...",
      "Sincronizzazione delle coordinate con la nave madre...",
      "Verifica dello stato energetico dei propulsori..."
    ],
    zh: [
      "正在与星际网络建立链接...",
      "正在认证应答器信号...",
      "正在解码导师的飞行许可...",
      "正在与母舰同步坐标...",
      "正在验证推进器能量状态..."
    ]
  };

  const currentLang = (messages[language as keyof typeof messages] ? language : "pt-BR") as keyof typeof messages;
  const currentMessages = messages[currentLang];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % currentMessages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [currentMessages.length]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#051210] overflow-hidden">
      {/* Estrelas de Fundo Pulsantes */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Radar holográfico central */}
      <div className="relative flex items-center justify-center w-80 h-80">
        {/* Anéis de Radar Pulsantes (Acelerados por hardware: scale e opacity) */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.4, opacity: 0.8 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full border-2 border-[#2dd4bf]/20 pointer-events-none"
          />
        ))}

        {/* Círculo do Radar central */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-56 h-56 rounded-full border border-dashed border-[#2dd4bf]/30 flex items-center justify-center"
        >
          {/* Varredura do radar visual */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#2dd4bf]/5 via-transparent to-transparent rounded-full" />
        </motion.div>

        {/* Núcleo do Radar / Ícone da Antena */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 20px rgba(45,212,191,0.2)",
              "0 0 40px rgba(45,212,191,0.4)",
              "0 0 20px rgba(45,212,191,0.2)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 w-28 h-28 rounded-full bg-[#0b2824]/90 border-2 border-[#2dd4bf] flex items-center justify-center"
        >
          <Radio className="w-12 h-12 text-[#2dd4bf] animate-pulse" />
        </motion.div>
      </div>

      {/* Textos Informativos Dinâmicos */}
      <div className="mt-12 text-center space-y-3 px-6 relative z-10 max-w-md">
        <h3 className="text-[#2dd4bf] font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#2dd4bf]" />
          Buscando Sinal Galáctico
        </h3>
        
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-white/60 font-bold uppercase tracking-widest text-[10px] md:text-xs text-center"
            >
              {currentMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Linha decorativa de varredura */}
        <div className="w-48 h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#2dd4bf]/30 to-transparent rounded-full overflow-hidden relative mt-4">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2dd4bf] to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
