"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Gift, ExternalLink, Tag, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "@/components/ui/toast";

// Cache simples em memória (Stale-While-Revalidate caseiro)
let cachedBenefits: any[] | null = null;
let cachedUsages: Record<string, number> | null = null;
let lastFetchUserId: string | null = null;

export function BenefitsList() {
  const [benefits, setBenefits] = useState<any[]>([]);
  const [usages, setUsages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Se não temos cache, mostramos loading inicial
    if (!cachedBenefits) setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    // Renderizar imediatamente usando cache se existir (SWR pattern)
    if (cachedBenefits && cachedUsages && lastFetchUserId === user.id) {
      setBenefits(cachedBenefits);
      setUsages(cachedUsages);
      setLoading(false);
      
      // Continua a execução abaixo para revalidar os dados em background
    }

    // Paralelizando requisições (Promise.all) para máxima performance
    const [benefitsResponse, usagesResponse] = await Promise.all([
      supabase
        .from("partners_benefits")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_benefit_usages")
        .select("benefit_id")
        .eq("user_id", user.id)
    ]);

    const benefitsData = benefitsResponse.data || [];
    const usagesData = usagesResponse.data || [];

    // Contar usos por benefício
    const usageCount: Record<string, number> = {};
    usagesData.forEach((u: any) => {
      usageCount[u.benefit_id] = (usageCount[u.benefit_id] || 0) + 1;
    });

    // Atualiza estado e cache
    cachedBenefits = benefitsData;
    cachedUsages = usageCount;
    lastFetchUserId = user.id;

    setBenefits(benefitsData);
    setUsages(usageCount);
    setLoading(false);
  };

  const handleRedeem = async (benefit: any) => {
    setProcessing(benefit.id);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast("Usuário não autenticado.", "error");
      setProcessing(null);
      return;
    }

    const currentUses = usages[benefit.id] || 0;
    
    if (currentUses >= benefit.max_uses_per_user) {
      toast("Você já atingiu o limite de usos para este cupom.", "error");
      setProcessing(null);
      return;
    }

    // Inserir novo uso
    const { error } = await supabase
      .from("user_benefit_usages")
      .insert({
        user_id: user.id,
        benefit_id: benefit.id
      });

    if (error) {
      toast("Erro ao resgatar cupom: " + error.message, "error");
    } else {
      toast("Cupom resgatado com sucesso!", "success");
      // Atualiza estado local
      setUsages({ ...usages, [benefit.id]: currentUses + 1 });
      setRevealed({ ...revealed, [benefit.id]: true });
    }
    
    setProcessing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (benefits.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5">
        <Gift className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <h3 className="text-white font-medium text-lg">Nenhum benefício disponível</h3>
        <p className="text-zinc-500 mt-2">Em breve teremos novos parceiros e benefícios por aqui.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {benefits.map((benefit) => {
        const usedCount = usages[benefit.id] || 0;
        const maxUses = benefit.max_uses_per_user;
        const isExhausted = usedCount >= maxUses;
        const isRevealed = revealed[benefit.id];

        return (
          <div key={benefit.id} className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col hover:border-primary/30 transition-colors group">
            {/* Imagem do Benefício */}
            <div className="h-48 bg-zinc-800 relative overflow-hidden">
              {benefit.image_url ? (
                <Image 
                  src={benefit.image_url} 
                  alt={benefit.company_name} 
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/10">
                  <Gift className="w-16 h-16" />
                </div>
              )}
              {isExhausted && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-red-500 text-white text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg rotate-12">
                    Cupom Esgotado
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{benefit.company_name}</h3>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/70">
                    <Tag className="w-3 h-3" />
                    {maxUses} Uso{maxUses !== 1 ? 's' : ''} Por Pessoa
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-400 mb-6 flex-1 leading-relaxed">
                {benefit.description}
              </p>

              {/* Progress Bar de Uso */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                  <span>Usos: {usedCount}/{maxUses}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={clsx("h-full transition-all duration-500", isExhausted ? "bg-red-500" : "bg-primary")}
                    style={{ width: `${Math.min((usedCount / maxUses) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Ação */}
              {isExhausted ? (
                <button disabled className="w-full py-3 rounded-xl bg-white/5 text-white/20 text-xs font-black uppercase tracking-widest cursor-not-allowed">
                  Esgotado
                </button>
              ) : isRevealed ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="p-4 bg-zinc-900/80 rounded-xl border border-white/5 space-y-3">
                    <p className="text-xs text-zinc-400 leading-relaxed text-center">
                      <strong className="text-white block mb-1">Instruções de Uso:</strong>
                      Acesse o link do parceiro abaixo. Se houver um código de desconto, copie e aplique no momento da compra ou informe no atendimento.
                    </p>
                    {benefit.coupon_code && benefit.coupon_code !== "-" && (
                      <div className="w-full py-2 px-4 bg-primary/10 border border-primary/30 rounded-lg text-center flex flex-col items-center gap-1 cursor-pointer hover:bg-primary/20 transition-colors"
                           onClick={() => {
                             navigator.clipboard.writeText(benefit.coupon_code);
                             toast("Código copiado!", "success");
                           }}
                           title="Clique para copiar o cupom"
                      >
                        <span className="text-primary font-mono text-lg font-black tracking-widest">{benefit.coupon_code}</span>
                        <span className="text-[10px] text-primary/70 uppercase font-bold tracking-wider">Copiar Código</span>
                      </div>
                    )}
                  </div>
                  {benefit.contact_link && benefit.contact_link !== "-" && (
                    <button 
                      onClick={() => {
                        let finalLink = benefit.contact_link;
                        
                        if (benefit.contact_type === 'whatsapp') {
                          const nomeCupom = (benefit.coupon_code && benefit.coupon_code !== "-") ? benefit.coupon_code : benefit.company_name;
                          const msg = `Olá acabei de ganhar um cupom (${nomeCupom}) do Instituto Kamaleon e gostaria de mais informações.`;
                          
                          let phoneOrLink = finalLink;
                          if (phoneOrLink.includes('wa.me') || phoneOrLink.includes('whatsapp.com')) {
                            if (!phoneOrLink.startsWith("http")) phoneOrLink = "https://" + phoneOrLink;
                            try {
                              const url = new URL(phoneOrLink);
                              url.searchParams.set("text", msg);
                              finalLink = url.toString();
                            } catch(e) {}
                          } else {
                            const cleanNumber = phoneOrLink.replace(/\D/g, '');
                            finalLink = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
                          }
                        } else if (benefit.contact_type === 'site' || !benefit.contact_type) {
                          if (!finalLink.startsWith("http")) finalLink = "https://" + finalLink;
                          if (benefit.coupon_code && benefit.coupon_code !== "-") {
                            navigator.clipboard.writeText(benefit.coupon_code);
                            toast("Cupom copiado! Redirecionando...", "success");
                            // Pequeno delay pra pessoa ver o toast
                            setTimeout(() => {
                              window.open(finalLink, '_blank', 'noopener,noreferrer');
                            }, 500);
                            return;
                          }
                        } else {
                          if (!finalLink.startsWith("http")) finalLink = "https://" + finalLink;
                        }

                        window.open(finalLink, '_blank', 'noopener,noreferrer');
                      }}
                      className="w-full py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      Acessar Benefício
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => handleRedeem(benefit)}
                  disabled={processing === benefit.id}
                  className="w-full py-3 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing === benefit.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Resgatar Cupom"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
