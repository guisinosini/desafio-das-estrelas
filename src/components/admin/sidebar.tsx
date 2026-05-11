"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, 
  UserSquare2, 
  Brain, 
  Package, 
  Calendar, 
  Settings, 
  LogOut,
  LayoutDashboard,
  Box,
  TrendingUp,
  MessageSquare,
  Star,
  Lightbulb,
  Menu,
  X,
  BookOpen,
  Gift,
  Link2,
  Target
} from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";
import React, { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Brain, label: "Especialistas", href: "/admin/professionals" },
  { icon: Target, label: "Leads (Funis)", href: "/admin/leads" },
  { icon: Users, label: "Pacientes", href: "/admin/patients" },
  { icon: Calendar, label: "Agendamentos", href: "/admin/appointments" },
  { icon: MessageSquare, label: "Mensagens", href: "/admin/messages" },
  { icon: Star, label: "Prova Social", href: "/admin/testimonials" },
  { icon: Lightbulb, label: "Pílulas", href: "/admin/pills" },
  { icon: BookOpen, label: "Conteúdos", href: "/admin/resources" },
  { icon: Link2, label: "Canais (Links)", href: "/admin/links" },
  { icon: ServiceIcon, label: "Serviços", href: "/admin/services" },
  { icon: Package, label: "Produtos", href: "/admin/products" },
  { icon: Gift, label: "Benefícios", href: "/admin/benefits" },
  { icon: TrendingUp, label: "Finanças", href: "/admin/finances" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
];

function ServiceIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20" />
      <path d="M2 12h20" />
      <path d="m4.93 4.93 14.14 14.14" />
      <path d="m4.93 19.07 14.14-14.14" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-zinc-800 rounded-md border border-zinc-700 text-white shadow-md focus:outline-none"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      <aside className={clsx(
        "w-64 h-screen bg-black/20 backdrop-blur-3xl border-white/5 border-r flex flex-col fixed left-0 top-0 z-50 text-white transition-transform duration-300 shadow-[20px_0_50px_rgba(0,0,0,0.3)]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      <div className="p-8 flex flex-col items-center justify-center border-b border-white/5">
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-700" />
          <Image 
            src="/LOGO.png" 
            alt="Instituto Kamaleon" 
            width={100} 
            height={37} 
            className="object-contain hover:scale-110 transition-transform mb-3 relative z-10"
          />
        </div>
        <div className="text-center relative z-10">
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] leading-tight">Instituto</p>
          <p className="text-base font-black text-white uppercase tracking-[0.1em] leading-none mt-1">Kamaleon</p>
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 group relative overflow-hidden",
                isActive 
                  ? "bg-primary text-black shadow-[0_10px_30px_rgba(212,175,55,0.3)]" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}
              <Icon className={clsx("w-4 h-4 transition-all duration-500", isActive ? "text-black" : "text-white/20 group-hover:text-primary group-hover:scale-110")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-white/5 bg-black/20">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-4 w-full rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all duration-500 group"
        >
          <LogOut className="w-4 h-4 text-white/20 group-hover:text-red-500 group-hover:rotate-12 transition-all duration-500" />
          Sair
        </button>
      </div>
      </aside>
    </>
  );
}
