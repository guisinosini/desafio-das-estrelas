"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, 
  Calendar, 
  Clock, 
  Video, 
  Settings, 
  LogOut,
  LayoutDashboard,
  Box,
  MessageSquare,
  Menu,
  X,
  User,
  Gift,
  Bot
} from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/professional" },
  { icon: Calendar, label: "Minha Agenda", href: "/professional/appointments" },
  { icon: Clock, label: "Disponibilidade", href: "/professional/availability" },
  { icon: Users, label: "Meus Pacientes", href: "/professional/patients" },
  { icon: MessageSquare, label: "Mensagens", href: "/professional/messages" },
  { icon: Video, label: "Sessão Online", href: "/professional/session" },
  { icon: Gift, label: "Benefícios", href: "/professional/benefits" },
  { icon: Bot, label: "Copiloto IA", href: "/professional/copilot" },
];

export function ProfessionalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: prof } = await supabase
        .from("professionals")
        .select("id")
        .eq("profile_id", user.id)
        .single();
        
      if (prof) {
        const { count } = await supabase
          .from("patient_messages")
          .select("*, patient:patients!inner(id)", { count: "exact", head: true })
          .eq("professional_id", prof.id)
          .neq("sender", "professional")
          .eq("read", false);
          
        if (count !== null) setUnreadCount(count);
      }
    };

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();
      
      if (profileData) setProfile(profileData);
    };
    
    fetchUnread();
    fetchProfile();
    
    window.addEventListener('refreshUnread', fetchUnread);
    return () => {
      window.removeEventListener('refreshUnread', fetchUnread);
    };
  }, [pathname, supabase]);

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
                "flex items-center justify-between px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 group relative overflow-hidden",
                isActive 
                  ? "bg-primary text-black shadow-[0_10px_30px_rgba(212,175,55,0.3)]" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}
              <div className="flex items-center gap-3">
                <Icon className={clsx("w-4 h-4 transition-all duration-500", isActive ? "text-black" : "text-white/20 group-hover:text-primary group-hover:scale-110")} />
                <span className="truncate">{item.label}</span>
              </div>
              
              {item.href === "/professional/messages" && unreadCount > 0 && (
                <span className={clsx(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                  isActive ? "bg-black text-primary" : "bg-primary text-black"
                )}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5 bg-black/20">
        <div className="p-2 space-y-1">
          <Link 
            href="/professional/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group/profile"
          >
             <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover/profile:border-primary/50 transition-all shadow-lg">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white/20 group-hover/profile:text-primary transition-all" />
                )}
             </div>
             <div className="min-w-0">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] truncate group-hover/profile:text-primary transition-colors italic">Meu Perfil</p>
                <p className="text-[8px] text-white/20 uppercase font-black tracking-[0.3em] mt-0.5">Configurações</p>
             </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-4 w-full rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all duration-500 group"
          >
            <LogOut className="w-4 h-4 text-white/20 group-hover:text-red-500 group-hover:rotate-12 transition-all duration-500" />
            Sair
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}
