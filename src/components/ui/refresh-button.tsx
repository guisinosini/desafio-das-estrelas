"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";

export function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    router.refresh();
    // Small delay to show animation
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="p-3 bg-zinc-900 border border-zinc-700/50 rounded-2xl text-zinc-400 hover:text-white transition-all disabled:opacity-50 group shadow-lg"
      title="Atualizar Painel"
    >
      <RefreshCw className={clsx("w-4 h-4 group-hover:rotate-180 transition-all duration-500", loading && "animate-spin text-primary")} />
    </button>
  );
}
