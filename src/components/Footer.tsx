import React from 'react';
import { MessageSquare, ShieldCheck } from 'lucide-react';

interface FooterProps {
  language?: string;
}

export const Footer: React.FC<FooterProps> = () => {
  const getWhatsAppSupportLink = () => {
    const phoneNumber = "5519998347096"; // WhatsApp oficial de suporte do app
    const defaultMessage = "Olá, Equipe do Desafio das Estrelas! Preciso de ajuda de suporte com o aplicativo do meu Pequeno Herói. 🛸🪐";
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
  };

  return (
    <footer className="w-full py-8 px-6 mt-16 border-t border-white/10 bg-black/30 backdrop-blur-md relative z-10 text-center">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-6">
        
        {/* Direitos Autorais, Registro de Marca e Conselho Técnico */}
        <div className="flex flex-col items-center md:items-start text-left space-y-2 max-w-2xl">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 leading-relaxed">
            © 2026 DESAFIO DAS ESTRELAS. TODOS OS DIREITOS RESERVADOS. <span className="text-primary font-black">MARCA REGISTRADA</span>.
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-emerald-400/80 bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10 w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Responsável Técnico: Guilherme Carvalho Sinosini – CRP 06/181084</span>
          </div>
        </div>

        {/* Botão de Suporte via WhatsApp */}
        <a 
          href={getWhatsAppSupportLink()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-3.5 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/20 hover:border-primary rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-primary/20 hover:scale-105 shrink-0"
        >
          <MessageSquare className="w-4.5 h-4.5" /> 
          Suporte Espacial
        </a>

      </div>
    </footer>
  );
};

export default Footer;
