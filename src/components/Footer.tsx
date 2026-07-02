import React from 'react';
import { MessageSquare, ShieldCheck, Instagram } from 'lucide-react';
import { translations, Language } from '@/lib/translations';

interface FooterProps {
  language?: string;
}

export const Footer: React.FC<FooterProps> = ({ language = 'pt-BR' }) => {
  const t = translations[language as Language] || translations['pt-BR'];

  const getWhatsAppSupportLink = () => {
    const phoneNumber = "5519998347096";
    const defaultMessage = t.reportWelcomePro
      ? `${t.reportWelcomePro.split('!')[0]}! Preciso de ajuda de suporte com o aplicativo. 🛸🪐`
      : "Olá, Equipe do Desafio das Estrelas! Preciso de ajuda de suporte com o aplicativo do meu Pequeno Herói. 🛸🪐";
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
  };

  return (
    <footer className="w-full py-8 px-6 mt-16 border-t border-white/10 bg-black/30 backdrop-blur-md relative z-10 text-center">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-6">
        
        {/* Direitos Autorais, Registro de Marca e Conselho Técnico */}
        <div className="flex flex-col items-center md:items-start text-left space-y-2 max-w-2xl">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 leading-relaxed">
            {t.footerRights} <span className="text-primary font-black">{t.footerTrademark}</span>.
          </div>
        </div>

        {/* Botões de Contato e Redes Sociais */}
        <div className="flex flex-wrap gap-3 justify-center md:justify-end">
          <a 
            href="https://www.instagram.com/desafioestrelasapp/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-pink-500/10 hover:bg-pink-500 text-pink-400 hover:text-white border border-pink-500/20 hover:border-pink-500 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-pink-500/20 hover:scale-105 shrink-0"
          >
            <Instagram className="w-4.5 h-4.5" /> 
            @desafioestrelasapp
          </a>

          <a 
            href={getWhatsAppSupportLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/20 hover:border-primary rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-primary/20 hover:scale-105 shrink-0"
          >
            <MessageSquare className="w-4.5 h-4.5" /> 
            {t.footerSupport}
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
