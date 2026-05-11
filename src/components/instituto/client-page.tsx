"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Target, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  HeartPulse, 
  Award,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const servicesMeta: Record<string, { image: string; icon: any; category: string }> = {
  "Neuropsicologia": { image: "/images/services/neuro.png", icon: Brain, category: "Ciência Cognitiva" },
  "Psicoterapia": { image: "/images/services/psycho.png", icon: HeartPulse, category: "Saúde Mental" },
  "Personal Growth": { image: "/images/services/coach.png", icon: Target, category: "Alta Performance" },
};

export function ClientInstituto({ services }: { services: any[] }) {
  return (
    <div className="min-h-screen bg-[#00120E] text-white selection:bg-primary selection:text-white pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/20 h-20 flex items-center justify-between px-8 md:px-20 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/LOGO.png" 
              alt="Logo" 
              width={84} 
              height={26} 
              className="object-contain"
              priority
            />
        </Link>
        <Link href="/signup" className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-bold rounded-full hover:bg-white transition-all text-sm group">
          Reservar Consulta
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -ml-64 -mb-64" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">
              <Award className="w-3 h-3" />
              Referência em Bem-Estar e Performance
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-[0.9]">
              CIÊNCIA QUE <span className="text-primary not-italic">TRANSFORMA.</span><br />
              HUMANISMO QUE <span className="text-zinc-700">ACOLHE.</span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-zinc-400 font-medium leading-relaxed">
              O Instituto Kamaleon nasceu da necessidade de integrar a precisão da Neuropsicologia com a profundidade da Psicoterapia e a agilidade do Personal Growth. Somos o seu parceiro estratégico na jornada de autoconhecimento e evolução.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Corporate Philosophy */}
      <section className="py-24 bg-white/5 border-y border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <Cpu className="w-10 h-10 text-primary mx-auto md:mx-0" />
            <h3 className="text-xl font-bold italic tracking-tight">Tecnologia & Ciência</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">Protocolos validados internacionalmente e ferramentas digitais para acompanhamento métrico da evolução cognitiva.</p>
          </div>
          <div className="space-y-4 border-x border-white/5 md:px-12">
            <HeartPulse className="w-10 h-10 text-primary mx-auto md:mx-0" />
            <h3 className="text-xl font-bold italic tracking-tight">Acolhimento Premium</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">Ambiente desenhado para o máximo conforto e discrição, garantindo o sigilo ético absoluto em todas as etapas.</p>
          </div>
          <div className="space-y-4">
            <Sparkles className="w-10 h-10 text-primary mx-auto md:mx-0" />
            <h3 className="text-xl font-bold italic tracking-tight">Impacto Real</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">Nossa missão é gerar mudanças sustentáveis que reverbem na vida pessoal e profissional de cada indivíduo.</p>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-20 space-y-4">
          <h2 className="text-4xl font-black italic tracking-tighter">NOSSOS <span className="text-primary not-italic">SERVIÇOS</span></h2>
          <div className="w-20 h-1 bg-primary rounded-full" />
          <p className="text-zinc-500 max-w-2xl font-medium">Oferecemos soluções integradas que atendem desde a saúde clínica até o desenvolvimento de alta performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["Neuropsicologia", "Psicoterapia", "Personal Growth"].map((cat) => {
            const meta = servicesMeta[cat];
            const matchingServices = services.filter(s => s.name.includes(cat) || s.description?.includes(cat));
            
            return (
              <motion.div 
                key={cat}
                whileHover={{ y: -10 }}
                className="group relative rounded-[48px] overflow-hidden border border-white/5 glass shadow-2xl"
              >
                <div className="h-64 relative overflow-hidden">
                  <Image 
                    src={meta.image} 
                    alt={cat} 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00120E] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-6 right-6 p-4 rounded-3xl glass border border-white/10 backdrop-blur-md">
                    <meta.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">{meta.category}</span>
                    <h3 className="text-2xl font-bold mt-2 text-white italic">{cat}</h3>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {cat === "Neuropsicologia" && "Avaliações detalhadas para compreensão do funcionamento cerebral e suporte cognitivo especializado."}
                    {cat === "Psicoterapia" && "Suporte psicológico profundo para lidar com desafios emocionais e fortalecer o autoconhecimento."}
                    {cat === "Personal Growth" && "Estratégias assertivas para atingir metas audaciosas e transformar seu potencial em resultados."}
                  </p>
                  
                  <div className="space-y-3 pt-4">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Modalidades Disponíveis:</p>
                    {matchingServices.length > 0 ? (
                      matchingServices.slice(0, 3).map(s => (
                        <div key={s.id} className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {s.name}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Atendimento Personalizado
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="rounded-[64px] bg-gradient-to-br from-[#002B21] to-[#011A14] border border-primary/20 p-12 md:p-24 relative overflow-hidden text-center space-y-10 group">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-tight">
              PRONTO PARA <span className="text-primary not-italic">REINVENTAR-SE?</span>
            </h2>
            <p className="max-w-2xl mx-auto text-zinc-400 font-medium">Junte-se a centenas de pessoas que escolheram o Instituto Kamaleon como seu mentor na jornada de vida.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Link href="/signup" className="w-full sm:w-auto px-12 py-5 bg-primary text-black font-extrabold rounded-3xl hover:bg-white hover:scale-105 transition-all shadow-2xl shadow-primary/20 uppercase tracking-widest text-sm">
                Agendar Agora
              </Link>
              <Link href="/login" className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-primary transition-colors">
                Entrar no Portal →
              </Link>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">
        © 2025 Instituto Kamaleon | Excellence in Mental Health
      </footer>
    </div>
  );
}
