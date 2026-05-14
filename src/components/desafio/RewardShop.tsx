import { motion } from "framer-motion";
import { Star, Gift, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import type { Reward } from "@/types/desafio";

interface RewardShopProps {
  rewards: Reward[];
  stars: number;
  handleRedeemReward: (reward: Reward) => void;
  t: any;
}

export function RewardShop({ rewards, stars, handleRedeemReward, t }: RewardShopProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
        <ShoppingBag className="w-5 h-5 text-[#f59e0b]" /> {t.galacticShop}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
        {rewards.map((reward: Reward) => {
          const progress = Math.min((stars / reward.cost) * 100, 100);
          const canRedeem = stars >= reward.cost;
          return (
            <motion.button
              key={reward.id}
              whileHover={canRedeem ? { scale: 1.02 } : {}}
              whileTap={canRedeem ? { scale: 0.98 } : {}}
              onClick={() => canRedeem && handleRedeemReward(reward)}
              disabled={!canRedeem}
              className={clsx(
                "p-4 md:p-6 border rounded-2xl md:rounded-[32px] flex flex-col gap-3 md:gap-4 relative overflow-hidden shadow-2xl backdrop-blur-md transition-all text-left w-full",
                canRedeem ? "bg-white/10 border-primary/40 cursor-pointer" : "bg-white/5 border-white/10 cursor-default opacity-80"
              )}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <h3 className={clsx("text-sm md:text-lg font-black uppercase italic tracking-tighter transition-colors", canRedeem ? "text-primary" : "text-white")}>{reward.title}</h3>
                  <div className="flex items-center gap-2">
                    <Star className={clsx("w-3 h-3 md:w-4 md:h-4", canRedeem ? "text-yellow-400 fill-yellow-400" : "text-white/20")} />
                    <span className="text-[10px] md:text-xs font-black text-white/40">{reward.cost}</span>
                  </div>
                </div>
                {canRedeem && (
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Gift className="w-8 h-8 md:w-12 md:h-12 text-primary drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                  </motion.div>
                )}
              </div>

              <div className="space-y-3 relative z-10">
                <div className="h-4 bg-white/5 rounded-full border border-white/10 p-1 shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={clsx("h-full rounded-full transition-colors", canRedeem ? "bg-primary animate-pulse" : "bg-purple-500")} />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40">
                    {canRedeem ? t.youGotIt : t.missingStars.replace('{count}', (reward.cost - stars).toString())}
                  </p>
                  {canRedeem && (
                    <span className="bg-primary text-black px-3 py-1 rounded-full text-[8px] font-black uppercase animate-bounce">
                      {t.redeemNow}
                    </span>
                  )}
                </div>
              </div>

              {canRedeem && <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none animate-pulse" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
