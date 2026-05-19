'use client';

import React, { useState } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Sparkles, Rocket, CheckCircle2, RefreshCw, Lock } from 'lucide-react';
import clsx from 'clsx';

// Inicializa o SDK do Mercado Pago com a Public Key (lado do cliente)
const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!;
initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });

interface CheckoutStageProps {
  onBack: () => void;
  onSuccess: () => void;
  selectedPlan: 'monthly' | 'yearly';
}

const PLANS = {
  monthly: {
    title: 'Plano Cadete Espacial',
    subtitle: 'Mensal • Recorrente automático',
    price: 'R$ 19,90',
    period: '/mês',
    description: 'Cobrado automaticamente todo mês. Cancele quando quiser.',
    features: ['Crianças ilimitadas', 'Todas as missões e planetas', 'Relatórios clínicos compartilhados', 'Dashboard completo do mentor', 'Suporte prioritário'],
    badge: null,
    amount: 19.90,
  },
  yearly: {
    title: 'Plano Comandante Estelar',
    subtitle: 'Anual • Melhor custo-benefício',
    price: 'R$ 199,00',
    period: '/ano',
    description: 'Cobrado uma vez por ano. Equivale a R$ 16,58/mês. Economize 17%!',
    features: ['Tudo do Plano Cadete', '2 meses grátis inclusos', 'Acesso antecipado a novidades', 'Badge exclusivo de Comandante'],
    badge: '🚀 Economize 17%',
    amount: 199.00,
  }
};

export default function CheckoutStage({ onBack, onSuccess, selectedPlan }: CheckoutStageProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const plan = PLANS[selectedPlan];

  const handleSubmit = async (cardFormData: any) => {
    setStatus('processing');
    setErrorMessage('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interval: selectedPlan,
          cardTokenId: cardFormData.token,
          paymentMethodId: cardFormData.payment_method_id,
          issuerId: cardFormData.issuer_id,
          installments: cardFormData.installments,
          identificationType: cardFormData.payer?.identification?.type,
          identificationNumber: cardFormData.payer?.identification?.number,
        }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setStatus('success');
      // Aguarda 2s para o usuário ver o sucesso e então chama onSuccess
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('Erro no checkout transparente:', err);
      setErrorMessage(err.message || 'Não foi possível processar o pagamento. Tente novamente.');
      setStatus('error');
    }
  };

  const customization: any = {
    visual: {
      style: {
        customVariables: {
          theme: 'dark',
          textPrimaryColor: '#ffffff',
          textSecondaryColor: 'rgba(255,255,255,0.5)',
          inputBackgroundColor: 'rgba(255,255,255,0.05)',
          inputBorderColor: 'rgba(255,255,255,0.1)',
          inputFocusedBorderColor: '#2dd4bf',
          buttonBackground: '#2dd4bf',
          buttonTextColor: '#000000',
        },
      },
    },
  };

  return (
    <motion.div
      key="checkout"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative z-10 max-w-5xl mx-auto min-h-screen flex flex-col justify-center p-6 py-12"
    >
      {/* Botão voltar */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit mb-8"
      >
        <ChevronLeft className="w-4 h-4" /> Escolher outro plano
      </button>

      <div className="space-y-2 mb-8">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Checkout Seguro</span>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">
          Ativar sua <span className="text-primary">Licença Galáctica</span>
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">

        {/* ——— Coluna Esquerda: Resumo do Plano ——— */}
        <div className="space-y-6">
          <div className={clsx(
            "bg-white/5 backdrop-blur-xl border rounded-[32px] p-8 relative overflow-hidden",
            selectedPlan === 'yearly' ? "border-primary/40 shadow-[0_0_40px_-10px_rgba(45,212,191,0.3)]" : "border-white/10"
          )}>
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />

            {plan.badge && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                {plan.badge}
              </div>
            )}

            <div className="space-y-1 mb-6 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{plan.subtitle}</span>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{plan.title}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black italic text-primary">{plan.price}</span>
                <span className="text-white/40 font-bold">{plan.period}</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed pt-1">{plan.description}</p>
            </div>

            <div className="space-y-3 relative z-10">
              {plan.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-bold text-white/80">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selos de segurança */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase text-white/60">Dados Criptografados</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
              <Lock className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase text-white/60">Mercado Pago Seguro</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase text-white/60">Cancele Quando Quiser</span>
            </div>
          </div>
        </div>

        {/* ——— Coluna Direita: Formulário de Pagamento ——— */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 relative overflow-hidden">
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/5 rounded-full blur-[80px]" />

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-6 text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-emerald-400">Decolagem Autorizada!</h3>
                <p className="text-white/60 text-sm mt-2">Sua assinatura foi ativada com sucesso. Preparando o painel...</p>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Liberando acesso...</span>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="space-y-1 mb-6 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Dados do Pagamento</span>
                <h3 className="text-lg font-black italic uppercase tracking-tight text-white">Cartão de Crédito ou Débito</h3>
              </div>

              {status === 'error' && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                  <p className="text-red-400 text-[11px] font-bold">{errorMessage}</p>
                </div>
              )}

              <div className="relative z-10 mp-checkout-wrapper">
                <CardPayment
                  initialization={{ amount: plan.amount }}
                  customization={customization}
                  onSubmit={handleSubmit}
                  onError={(err) => {
                    console.error('Erro no formulário MP:', err);
                    setErrorMessage('Erro ao processar o formulário. Verifique os dados do cartão.');
                    setStatus('error');
                  }}
                />
              </div>

              {status === 'processing' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-[32px] flex flex-col items-center justify-center gap-4 z-20">
                  <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-white font-black uppercase tracking-widest text-sm">Processando pagamento...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
