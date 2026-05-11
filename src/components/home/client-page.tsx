"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Brain, Target, Users, Sparkles, ChevronDown, Star, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BreathingBackground } from "@/components/ui/breathing-background";

const Nav = () => (
  <nav className="fixed top-0 w-full z-50 glass border-b border-border h-20 flex items-center justify-between px-4 md:px-8 lg:px-20">
    <div className="flex items-center gap-2">
       <Image 
        src="/LOGO.png" 
        alt="Logo" 
        width={70} 
        height={22} 
        className="object-contain"
        style={{ height: 'auto' }}
        priority
      />
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
      <Link href="#features" className="hover:text-primary transition-colors text-white">Nosso Método</Link>
      <Link href="#pricing" className="hover:text-primary transition-colors text-white">Serviços</Link>
      <Link href="/login" className="hover:text-primary transition-colors text-white">Entrar</Link>
      <Link href="/signup" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all font-bold">Começar Jornada</Link>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative pt-32 pb-20 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
    <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/30 border border-primary/20 text-xs font-medium text-primary mb-12">
          <Sparkles className="w-3 h-3" />
          Excelência em Neuropsicologia e Personal Growth
        </div>
        
        <div className="flex justify-center mb-10 w-full px-4 sm:px-0">
          <Image 
            src="/capa.png" 
            alt="Instituto Kamaleon Capa" 
            width={1200} 
            height={600} 
            className="w-full max-w-4xl h-auto object-cover rounded-[32px] drop-shadow-[0_0_40px_rgba(212,175,55,0.15)] border border-white/5"
            priority
          />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
           Sua Evolução Começa no <span className="text-gradient">Instituto Kamaleon</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 mb-10 leading-relaxed">
          Desenvolva sua melhor versão através de abordagens científicas e humanas. Especialistas em Psicoterapia, Neuropsicologia e Personal Growth de alta performance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup"
            className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)] mx-auto lg:mx-0"
          >
            Iniciar Minha Evolução
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/instituto" className="w-full sm:w-auto px-8 py-4 glass text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#001A14]/5 transition-all">
            Conhecer Instituto
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-8 rounded-3xl glass flex flex-col items-start gap-4 h-full"
  >
    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-zinc-500 leading-relaxed">{desc}</p>
  </motion.div>
);

const Features = () => {
  const features = [
    { icon: Brain, title: "Neuropsicologia", desc: "Avaliação cognitiva detalhada e reabilitação personalizada para otimizar seu funcionamento cerebral." },
    { icon: Users, title: "Psicoterapia", desc: "Suporte emocional ético e acolhedor para lidar com ansiedade, depressão e autoconhecimento profundo." },
    { icon: Target, title: "Personal Growth", desc: "Metodologias de alta performance para atingir seus objetivos pessoais e profissionais com propósito." },
    { icon: Shield, title: "Ética e Sigilo", desc: "Seus dados e sessões protegidos por criptografia de ponta a ponta e total conformidade ética." }
  ];

  return (
    <section className="py-24 max-w-7xl mx-auto px-6" id="features">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>
    </section>
  );
};

const TestimonialCard = ({ name, role, text, rating = 5 }: { name: string; role: string; text: string; rating?: number }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-8 rounded-[32px] glass flex flex-col gap-6 relative group overflow-hidden border border-zinc-900/50 hover:border-primary/30 transition-all shadow-xl h-full"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-16 -translate-y-16 blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
    
    <div className="flex text-primary gap-1 relative z-10">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
      ))}
    </div>
    
    <blockquote className="text-zinc-300 leading-relaxed font-medium flex-1 relative z-10">
      "{text}"
    </blockquote>
    
    <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/5 relative z-10">
      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
        {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
      </div>
      <div>
        <p className="font-bold text-white tracking-tight">{name}</p>
        <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">{role}</p>
      </div>
    </div>
  </motion.div>
);

const Testimonials = ({ testimonials }: { testimonials: any[] }) => {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden" id="testimonials">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/30 border border-primary/20 text-xs font-medium text-primary mb-6">
            <Star className="w-3 h-3 fill-primary" />
            Prova Social
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter mb-4">
            Histórias de <span className="text-primary not-italic">Evolução</span>
          </h2>
          <p className="text-zinc-500 text-sm sm:text-base font-medium max-w-2xl mx-auto">
            O resultado da nossa methodology clínica reflete diretamente na transformação e performance diária das pessoas que confiam no Instituto Kamaleon.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} name={t.name} role={t.role} text={t.content} rating={t.rating} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border/50 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between text-left gap-4 hover:text-primary transition-colors outline-none"
      >
        <span className="font-bold text-lg">{question}</span>
        <ChevronDown className={cn("w-5 h-5 transition-transform duration-300 flex-shrink-0 text-primary", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-zinc-400 leading-relaxed font-medium">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "Como funciona o agendamento de sessões?",
      answer: "Você pode criar sua conta no nosso sistema, selecionar o profissional, escolher o serviço desejado (como Psicoterapia ou Neuropsicologia) e visualizar os horários disponíveis em tempo real. O agendamento só é confirmado após o pagamento seguro na plataforma."
    },
    {
      question: "Quais são as formas de pagamento aceitas?",
      answer: "Aceitamos pagamento via PIX (com aprovação instantânea via QR Code) e Cartão de Crédito. No cartão, você pode parcelar seus pacotes de sessões em até 12x (sendo até 3x sem juros) para facilitar seu investimento em saúde."
    },
    {
      question: "Como funcionam as sessões de Avaliação Neuropsicológica?",
      answer: "A avaliação é composta por um pacote de sessões (geralmente entre 5 e 8 encontros). Envolve anamnese, aplicação de testes padronizados, observação clínica e devolução dos resultados com um laudo detalhado."
    },
    {
      question: "Os atendimentos são online ou presenciais?",
      answer: "O Instituto Kamaleon oferece as duas modalidades. No momento de realizar o agendamento pela plataforma, você poderá verificar a disponibilidade e o formato de atendimento de cada profissional."
    },
    {
      question: "Vocês atendem por plano de saúde?",
      answer: "No momento, nossos atendimentos são estritamente particulares para garantir exclusividade e flexibilidade metodológica. Porém, emitimos nota fiscal e recibos detalhados em PDF que podem ser usados para solicitar reembolso no seu convênio."
    }
  ];

  return (
    <section className="py-24 max-w-4xl mx-auto px-6" id="faq">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter mb-4">
          Perguntas <span className="text-primary not-italic">Frequentes</span>
        </h2>
        <p className="text-zinc-500 text-sm sm:text-base font-medium">Tudo o que você precisa saber sobre o Instituto Kamaleon.</p>
      </div>
      <div className="glass rounded-[32px] p-8 md:p-12 border border-zinc-900/50 shadow-2xl">
        <div className="flex flex-col gap-2">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default function ClientHome({ testimonials }: { testimonials: any[] }) {
  return (
    <main className="min-h-screen bg-[#051210] selection:bg-primary selection:text-white w-full overflow-x-hidden relative">
      <BreathingBackground animated={true} />

      <div className="relative z-10">
        <Nav />
        <Hero />
        <Features />
        <Testimonials testimonials={testimonials} />
        <FAQ />
        
        {/* Footer */}
        <footer className="py-12 border-t border-border mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-6 text-center text-zinc-500 text-sm">
            &copy; 2026 Instituto Kamaleon - Psicoterapia e Personal Growth. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </main>
  );
}
