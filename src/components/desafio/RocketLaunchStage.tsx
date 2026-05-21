import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RocketLaunchStageProps {
  onLaunchComplete: () => void;
}

export const RocketLaunchStage: React.FC<RocketLaunchStageProps> = ({ onLaunchComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Tenta desmutar o vídeo assim que ele carregar (já que a interação anterior do clique no botão permite áudio)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(err => {
        console.warn("Autoplay com som bloqueado pelo navegador, tentando rodar mutado...", err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
        }
      });
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Botão de pular (caso a criança esteja impaciente ou já tenha visto) */}
      <button 
        onClick={onLaunchComplete}
        className="absolute top-6 right-6 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors"
      >
        Pular
      </button>

      {/* Container do Vídeo: 
          - Mobile (w-full h-full object-cover para preencher a tela)
          - Desktop (max-w-md w-full h-full object-contain para centralizar e manter o 9:16 sem cortar) 
      */}
      <div className="relative w-full h-full md:max-w-md mx-auto flex items-center justify-center bg-black shadow-[0_0_100px_rgba(0,0,0,1)]">
        <video
          ref={videoRef}
          src="/Lancamento.mp4"
          playsInline
          onEnded={onLaunchComplete}
          className="w-full h-full object-cover md:object-contain"
        />
      </div>
    </motion.div>
  );
};
