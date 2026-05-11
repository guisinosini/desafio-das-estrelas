"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, CreditCard, ShieldCheck, Download, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  digital_file_url?: string;
  is_digital?: boolean;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onSuccess: () => void;
}

export function CheckoutModal({ isOpen, onClose, items, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<"summary" | "processing" | "success">("summary");
  const { toast } = useToast();
  const supabase = createClient();
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePayment = async () => {
    setStep("processing");
    
    try {
      // 1. Get current patient
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!patient) throw new Error("Perfil de paciente não encontrado");

      // 2. Create Order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          patient_id: patient.id,
          status: "pago",
          total_amount: total
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Create Order Items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Redirect to Payment Page
      window.location.href = `/patient/store/payment?orderId=${order.id}`;

    } catch (error: any) {
      console.error("Payment error:", error);
      toast("Erro ao processar pedido: " + error.message, "error");
      setStep("summary");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const digitalItems = items.filter(i => i.is_digital && i.digital_file_url);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step !== "processing" ? onClose : undefined}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl"
          >
            {step === "summary" && (
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Finalizar Compra</h2>
                  <p className="text-zinc-400 text-sm">Revise seus itens antes de confirmar o pagamento.</p>
                </div>

                <div className="bg-zinc-800/50 rounded-[32px] border border-zinc-700/50 p-6 space-y-4">
                  <div className="max-h-40 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-zinc-300 font-medium">
                          {item.quantity}x <span className="text-white">{item.name}</span>
                        </span>
                        <span className="text-zinc-100 font-bold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-zinc-700 flex justify-between items-center">
                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Total a Pagar</span>
                    <span className="text-2xl font-black text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={handlePayment}
                    className="w-full bg-primary text-primary-foreground py-5 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
                  >
                    Confirmar Pagamento
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full text-zinc-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Voltar ao Carrinho
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest pt-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Ambiente Seguro & Criptografado
                </div>
              </div>
            )}

            {step === "processing" && (
              <div className="p-20 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <Loader2 className="w-20 h-20 text-primary animate-spin" />
                  <CreditCard className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-widest">Processando...</h2>
                  <p className="text-zinc-500 text-sm mt-2">Estamos validando sua transação com segurança.</p>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="p-8 space-y-8">
                <div className="text-center space-y-4">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Sucesso!</h2>
                    <p className="text-zinc-400 text-sm mt-2">Seu pedido foi processado e confirmado.</p>
                  </div>
                </div>

                {digitalItems.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest text-center">Seus Downloads Disponíveis</h3>
                    <div className="space-y-2">
                      {digitalItems.map((item) => (
                        <a
                          key={item.id}
                          href={item.digital_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-zinc-800/80 rounded-2xl border border-zinc-700/50 hover:bg-zinc-800 hover:border-primary/30 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">📄</span>
                            <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.name}</span>
                          </div>
                          <Download className="w-4 h-4 text-primary" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <button
                    onClick={onClose}
                    className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-bold hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                  >
                    Fechar e Voltar à Loja
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center font-bold uppercase tracking-widest">
                    Um recibo foi enviado para o seu e-mail cadastrado.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
