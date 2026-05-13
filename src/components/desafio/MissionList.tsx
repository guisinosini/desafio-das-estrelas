import { motion } from "framer-motion";
import { Star, CheckCircle2, RefreshCw, Rocket, Clock, Zap } from "lucide-react";
import clsx from "clsx";
import type { Task, Planet } from "@/types/desafio";
import { AVATARS } from "./HeroElements";

interface MissionListProps {
  tasks: Task[];
  activeChildAvatar: string;
  handleCompleteTask: (task: Task, e: any) => void;
  planets?: Planet[];
}

export function MissionList({ tasks, activeChildAvatar, handleCompleteTask, planets = [] }: MissionListProps) {
  const groups = [
    { title: '📍 Missões do Dia', key: 'daily', icon: Rocket, color: 'text-primary' },
    { title: '🗓️ Missões da Semana', key: 'weekly', icon: Clock, color: 'text-purple-400' },
    { title: '🪐 Grandes Objetivos', key: ['monthly', 'once'], icon: Zap, color: 'text-yellow-400' }
  ];

  return (
    <div className="space-y-12">
      {groups.map((group) => {
        const filteredTasks = tasks.filter((t) =>
          Array.isArray(group.key) ? group.key.includes(t.recurrence) : t.recurrence === group.key
        );

        if (filteredTasks.length === 0) return null;

        return (
          <div key={Array.isArray(group.key) ? group.key.join('-') : group.key} className="space-y-4">
            <h2 className={clsx("text-sm font-black uppercase italic tracking-tighter flex items-center gap-2 opacity-80", group.color)}>
              <group.icon className="w-4 h-4" /> {group.title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
              {filteredTasks.map((task: Task, idx: number) => (
                <motion.button
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={task.status === 'available' ? { scale: 1.02, y: -2 } : {}}
                  whileTap={task.status === 'available' ? { scale: 0.95 } : {}}
                  onClick={(e) => task.status === 'available' && handleCompleteTask(task, e)}
                  disabled={task.status !== 'available'}
                  className={clsx(
                    "relative group p-4 rounded-[24px] border-2 transition-all flex flex-col items-center text-center gap-2 overflow-hidden min-h-[120px] justify-center",
                    task.status === 'pending' ? "bg-white/5 border-white/5 opacity-60" :
                      task.status === 'done' ? "bg-emerald-500/10 border-emerald-500/50" :
                        "bg-white/5 border-white/10 hover:border-primary/40 shadow-xl backdrop-blur-md"
                  )}
                >
                  <div className="flex gap-0.5">
                    {[...Array(Math.min(task.stars, 3))].map((_, i) => (
                      <Star key={i} className={clsx("w-2 h-2", task.status === 'done' ? "text-emerald-400 fill-emerald-400" : "text-yellow-400 fill-yellow-400")} />
                    ))}
                    {task.stars > 3 && <span className="text-[8px] text-yellow-400 font-black">+{task.stars - 3}</span>}
                  </div>
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden relative text-xl">
                    {task.status === 'done' ? "✅" : AVATARS.find(a => a.id === activeChildAvatar)?.emoji}
                  </div>
                  <h3 className={clsx("text-[9px] md:text-xs font-black uppercase italic tracking-tighter leading-tight", task.status === 'done' ? "text-emerald-400" : "text-white")}>
                    {task.title}
                  </h3>

                  {(() => {
                    const planet = planets?.find(p => p.id === task.planetId);
                    if (!planet) return null;
                    return (
                      <div 
                        className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-1 shadow-sm z-10"
                        title={`Objetivo: ${planet.title}`}
                      >
                        <span className="text-xs">{planet.icon || "🪐"}</span>
                        <span className="text-[6px] font-black uppercase text-white/60 tracking-tighter truncate max-w-[40px] hidden sm:inline">{planet.title}</span>
                      </div>
                    );
                  })()}

                  {task.status === 'pending' && (
                    <div className="absolute inset-0 bg-[#16213e]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-20">
                      <RefreshCw className="w-5 h-5 text-primary animate-spin mb-1" />
                      <p className="text-[7px] font-black uppercase tracking-widest">Validando...</p>
                    </div>
                  )}

                  {task.status === 'done' && (
                    <div className="absolute top-2 right-4 z-10">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
