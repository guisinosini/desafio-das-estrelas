'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { initMercadoPago, Payment as MPPayment } from '@mercadopago/sdk-react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Sparkles, Rocket, CheckCircle2, RefreshCw, Lock } from 'lucide-react';
import clsx from 'clsx';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Inicializa o SDK do Mercado Pago de forma segura evitando chamadas repetidas devido ao Hot Reload (HMR) do Next.js
const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';
if (MP_PUBLIC_KEY && typeof window !== 'undefined') {
  const win = window as any;
  if (!win.__mercadopago_initialized__) {
    initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
    win.__mercadopago_initialized__ = true;
  }
}

// Inicializa a Stripe de forma preguiçosa para evitar erros de compilação estática
let stripePromise: any = null;
if (typeof window !== 'undefined') {
  stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
}

interface CheckoutStageProps {
  onBack: () => void;
  onSuccess: () => void;
  selectedPlan: string;
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

// Componente do Formulário Transparente da Stripe
function StripeForm({
  clientSecret,
  planAmount,
  planCurrency,
  selectedPlan,
  onSuccess,
  setErrorMessage,
  setStatus,
}: {
  clientSecret: string;
  planAmount: number;
  planCurrency: string;
  selectedPlan: string;
  onSuccess: () => void;
  setErrorMessage: (msg: string) => void;
  setStatus: (status: any) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setStatus('processing');
    setErrorMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      console.error('Stripe Elements Confirm Error:', error);
      setErrorMessage(error.message || 'Falha ao processar pagamento.');
      setStatus('idle');
      setLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        const res = await fetch('/api/checkout/stripe-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            selectedPlan,
          }),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } catch (err: any) {
        setErrorMessage(err.message || 'Erro ao ativar sua licença galáctica.');
        setStatus('error');
        setLoading(false);
      }
    } else {
      setErrorMessage('Pagamento não autorizado. Tente outro cartão.');
      setStatus('error');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative z-10 mt-4">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3.5 sm:py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-6 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.3)] text-xs sm:text-sm"
      >
        {loading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Processando Pagamento...
          </>
        ) : (
          `Ativar Licença Galáctica (${planCurrency === 'EUR' ? '€' : '$'} ${planAmount})`
        )}
      </button>
    </form>
  );
}

export default function CheckoutStage({ onBack, onSuccess, selectedPlan }: CheckoutStageProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'awaiting_pix'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isBrickReady, setIsBrickReady] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null);
  
  // Proteção contra duplo clique no Brick do Mercado Pago
  const isSubmittingRef = React.useRef(false);

  // Stripe States
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [stripeCurrency, setStripeCurrency] = useState('USD');
  const [stripeAmount, setStripeAmount] = useState(0);
  const [loadingStripeIntent, setLoadingStripeIntent] = useState(false);

  // Detecção Automática de Idioma
  const language = useMemo((): string => {
    if (typeof window === 'undefined') return 'pt-BR';
    const saved = localStorage.getItem('desafio_estrelas_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.language) return parsed.language;
      } catch (e) {}
    }
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang.startsWith('pt')) return browserLang.includes('PT') ? 'pt-PT' : 'pt-BR';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('it')) return 'it';
    if (browserLang.startsWith('zh')) return 'zh';
    return 'en';
  }, []);

  const isInternational = language !== 'pt-BR' && language !== 'pt-PT';

  // Buscar Intenção da Stripe se for internacional
  useEffect(() => {
    if (!isInternational) return;
    
    let isMounted = true;

    const fetchStripeIntent = async () => {
      setLoadingStripeIntent(true);
      setErrorMessage('');
      try {
        const res = await fetch('/api/checkout/stripe-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedPlan, language }),
        });
        const data = await res.json();
        
        if (data.requireAuth) {
          throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
        }
        
        if (data.error) throw new Error(data.error);
        if (!data.clientSecret) throw new Error('A API não retornou o token da Stripe (clientSecret).');

        if (isMounted && data.clientSecret) {
          setStripeClientSecret(data.clientSecret);
          if (data.amount) setStripeAmount(data.amount);
          if (data.currency) setStripeCurrency(data.currency);
        }
      } catch (err: any) {
        console.error('Erro ao buscar Stripe Intent:', err);
        if (isMounted) {
            const baseMsg = language === 'zh' ? '加载 Stripe 支付失败。' : 'Failed to load Stripe payment gateway.';
            setErrorMessage(`${baseMsg} Detalhes: ${err.message}`);
        }
      } finally {
        if (isMounted) setLoadingStripeIntent(false);
      }
    };

    fetchStripeIntent();
    
    return () => { isMounted = false; };
  }, [isInternational, selectedPlan, language]);

  // Plano traduzido dinamicamente de acordo com o idioma do usuário
  const plan = useMemo(() => {
    // Verifica se é um plano de profissional
    if (selectedPlan.startsWith('pro_')) {
      const parts = selectedPlan.split('_');
      const limit = parseInt(parts[1], 10);
      const isYearly = parts[2] === 'yearly';
      
      const symbol = stripeCurrency === 'EUR' ? '€' : 'R$';
      let amount = 0;
      let priceStr = '';
      let titleName = '';
      if (limit === 1) { titleName = 'Pioneiro'; amount = isYearly ? 199.00 : 19.90; priceStr = isYearly ? '199,00' : '19,90'; }
      if (limit === 4) { titleName = 'Esquadrão'; amount = isYearly ? 597.00 : 59.70; priceStr = isYearly ? '597,00' : '59,70'; }
      if (limit === 9) { titleName = 'Frota Estelar'; amount = isYearly ? 1390.00 : 139.90; priceStr = isYearly ? '1390,00' : '139,90'; }
      if (limit === 15) { titleName = 'Aliança'; amount = isYearly ? 1900.00 : 199.90; priceStr = isYearly ? '1900,00' : '199,90'; }

      if (isInternational) {
         // Valores fictícios para intl, caso precise
         amount = isYearly ? amount / 5 : amount / 5;
         priceStr = amount.toFixed(2);
      }

      return {
        title: `Plano ${titleName} (${limit} Licenças)`,
        subtitle: isYearly ? 'Anual • B2B' : 'Mensal • B2B',
        price: `${symbol} ${priceStr}`,
        period: isYearly ? '/ano' : '/mês',
        description: isYearly ? 'Faturamento anual único.' : 'Cobrado automaticamente todo mês.',
        features: ['Gerenciamento de pacientes', 'Relatórios clínicos detalhados', 'Visualização do painel dos pais', `Até ${limit} convites ativos`],
        badge: isYearly ? '🚀 Anual' : null,
        amount: amount,
      };
    }

    if (!isInternational) {
      return (PLANS as any)[selectedPlan] || PLANS['monthly'];
    }

    const symbol = stripeCurrency === 'EUR' ? '€' : '$';

    if (selectedPlan === 'yearly') {
      return {
        title: language === 'zh' ? '星际指挥官计划' : (language === 'es' ? 'Plan Comandante' : (language === 'fr' ? 'Plan Commandant' : (language === 'it' ? 'Piano Comandante' : 'Commander Plan'))),
        subtitle: language === 'zh' ? '年费 • 最划算' : (language === 'es' ? 'Anual • Mejor valor' : (language === 'fr' ? 'Annuel • Meilleur rapport' : (language === 'it' ? 'Annuale • Miglior valore' : 'Annual • Best value'))),
        price: `${symbol} 99.00`,
        period: language === 'zh' ? '/年' : (language === 'es' ? '/año' : (language === 'fr' ? '/an' : (language === 'it' ? '/anno' : '/year'))),
        description: language === 'zh'
          ? `按年计费。相当于每月 ${symbol} 8.25。节省 17%！`
          : (language === 'es' ? `Facturado una vez al año. Equivalente a ${symbol} 8.25/mes. ¡Ahorra 17%!` : (language === 'fr' ? `Facturé une fois par an. Équivaut à ${symbol} 8.25/mois. Économisez 17%!` : `Billed once a year. Equivalent to ${symbol} 8.25/month. Save 17%!`)),
        features: language === 'zh'
          ? ['包含所有小兵特权', '赠送2个月免费使用', '优先体验新功能', '专属指挥官勋章']
          : (language === 'es'
            ? ['Todo lo del Plan Cadete', '2 meses gratis incluidos', 'Acceso anticipado a novedades', 'Medalla exclusiva de Comandante']
            : (language === 'fr'
              ? ['Tout du Plan Cadet', '2 mois gratuits inclus', 'Accès anticipé aux nouveautés', 'Badge exclusif de Commandant']
              : ['All Cadet features', '2 free months included', 'Early access to new features', 'Exclusive Commander badge'])),
        badge: language === 'zh' ? '🚀 节省 17%' : (language === 'es' ? '🚀 Ahorra 17%' : (language === 'fr' ? '🚀 Économisez 17%' : '🚀 Save 17%')),
        amount: 99.00,
      };
    } else {
      return {
        title: language === 'zh' ? '星际小兵计划' : (language === 'es' ? 'Plan Cadete' : (language === 'fr' ? 'Plan Cadet' : (language === 'it' ? 'Piano Cadetto' : 'Cadet Plan'))),
        subtitle: language === 'zh' ? '月费 • 自动续订' : (language === 'es' ? 'Mensual • Recurrente automático' : 'Monthly • Automatic recurring'),
        price: `${symbol} 9.90`,
        period: language === 'zh' ? '/月' : (language === 'es' ? '/mes' : (language === 'fr' ? '/mois' : (language === 'it' ? '/mese' : '/month'))),
        description: language === 'zh'
          ? '每月自动计费。随时取消。'
          : (language === 'es' ? 'Facturado automáticamente cada mes. Cancela cuando quieras.' : (language === 'fr' ? 'Facturé mensuellement. Annulez à tout moment.' : 'Billed automatically monthly. Cancel anytime.')),
        features: language === 'zh'
          ? ['无限个孩子档案', '所有任务和星球', '共享临床报告', '完整的导师面板', '优先技术支持']
          : (language === 'es'
            ? ['Niños ilimitados', 'Todas las misiones y planetas', 'Informes clínicos compartidos', 'Dashboard completo de mentor', 'Soporte prioritario']
            : (language === 'fr'
              ? ['Enfants illimités', 'Toutes les missions & planètes', 'Rapports cliniques partagés', 'Dashboard complet du mentor', 'Support prioritaire']
              : ['Unlimited children', 'All missions & planets', 'Shared clinical reports', 'Full mentor dashboard', 'Priority support'])),
        badge: null,
        amount: 9.90,
      };
    }
  }, [isInternational, selectedPlan, stripeCurrency, language]);

  const handleSubmitMercadoPago = async (param: any) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    
    setStatus('processing');
    setErrorMessage('');
    try {
      console.log('[Mercado Pago Submit] Raw param:', param);
      
      // O Payment Brick retorna { formData, additionalData, ... }
      const data = param.formData || param;
      
      // Alguns métodos (como saldo MP) podem enviar a string do método em outro lugar
      const resolvedPaymentMethodId = data.payment_method_id || param.selectedPaymentMethod || 'pix';

      const payload = {
        interval: selectedPlan,
        cardTokenId: data.token,
        paymentMethodId: resolvedPaymentMethodId,
        issuerId: data.issuer_id,
        installments: data.installments,
        identificationType: data.payer?.identification?.type,
        identificationNumber: data.payer?.identification?.number,
      };
      
      console.log('[Mercado Pago Submit] Payload sent to backend:', payload);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (responseData.error) throw new Error(responseData.error);

      // Pagamento rejeitado explicitamente pelo MP
      if (responseData.status === 'rejected') {
        setErrorMessage('Pagamento recusado pela operadora. Verifique os dados do cartão ou tente outro.');
        setStatus('error');
        return;
      }

      // Backend confirmou falha na ativação mesmo com pagamento aprovado
      if (!responseData.success) {
        setErrorMessage(responseData.status
          ? `Pagamento com status "${responseData.status}" — aguarde ou contate o suporte.`
          : 'Falha ao confirmar ativação. Contate o suporte.'
        );
        setStatus('error');
        return;
      }

      // Se foi gerado um PIX, vai exibir a tela com QR Code e não ativar ainda
      if (responseData.paymentMethodId === 'pix' && responseData.qrCodeBase64) {
        setPixData({ qrCode: responseData.qrCode, qrCodeBase64: responseData.qrCodeBase64 });
        setStatus('awaiting_pix');
        isSubmittingRef.current = false;
        return;
      }

      setStatus('success');
      setTimeout(() => {
        onSuccess();
        isSubmittingRef.current = false;
      }, 2000);
    } catch (err: any) {
      console.error('Erro no checkout transparente:', err);
      setErrorMessage(err.message || 'Não foi possível processar o pagamento. Tente novamente.');
      setStatus('error');
      isSubmittingRef.current = false;
    }
  };

  const customizationMercadoPago: any = {
    visual: {
      style: {
        theme: 'dark',
      }
    },
    paymentMethods: {
      maxInstallments: selectedPlan === 'yearly' ? 12 : 1,
      creditCard: 'all',
      mercadoPago: 'all',
      bankTransfer: 'all', 
    }
  };

  // Configuração Estética Premium da Stripe
  const stripeOptions = useMemo(() => {
    return {
      clientSecret: stripeClientSecret,
      appearance: {
        theme: 'night' as const,
        variables: {
          colorPrimary: '#d4af37', // Ouro Kamaleon
          colorBackground: '#111827', // Gray 900
          colorText: '#ffffff',
          colorDanger: '#f87171',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '16px',
        },
        rules: {
          '.Input': {
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            transition: 'border 0.2s, box-shadow 0.2s',
          },
          '.Input:focus': {
            border: '1px solid #d4af37',
            boxShadow: '0 0 12px rgba(212, 175, 55, 0.25)',
          },
          '.Label': {
            fontWeight: '600',
            fontSize: '11px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.1em',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '6px',
          }
        }
      }
    };
  }, [stripeClientSecret]);

  return (
    <motion.div
      key="checkout"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative z-10 max-w-5xl mx-auto min-h-screen flex flex-col justify-center p-4 py-8 sm:p-6 sm:py-12 md:p-8"
    >
      {/* Botão voltar */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors w-fit mb-6 sm:mb-8 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> {language === 'zh' ? '返回选择计划' : (language === 'es' ? 'Elegir otro plan' : (language === 'fr' ? 'Choisir un autre plan' : 'Escolher outro plano'))}
      </button>

      <div className="space-y-2 mb-6 sm:mb-8">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
          {language === 'zh' ? '安全结账' : (language === 'es' ? 'Pago Seguro' : (language === 'fr' ? 'Paiement Sécurisé' : 'Checkout Seguro'))}
        </span>
        <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter">
          {language === 'zh' ? '激活您的' : (language === 'es' ? 'Activa tu' : (language === 'fr' ? 'Activez votre' : 'Ativar sua'))}{' '}
          <span className="text-primary">{language === 'zh' ? '星际授权' : (language === 'es' ? 'Licencia Galáctica' : (language === 'fr' ? 'Licence Galactique' : 'Licença Galáctica'))}</span>
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">

        {/* ——— Coluna Esquerda: Resumo do Plano ——— */}
        <div className="space-y-4 sm:space-y-6">
          <div className={clsx(
            "bg-white/5 backdrop-blur-xl border rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 relative overflow-hidden",
            selectedPlan === 'yearly' ? "border-primary/40 shadow-[0_0_40px_-10px_rgba(212,175,55,0.3)]" : "border-white/10"
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
                <span className="text-3xl sm:text-4xl font-black italic text-primary">{plan.price}</span>
                <span className="text-white/40 font-bold text-xs sm:text-sm">{plan.period}</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed pt-1">{plan.description}</p>
            </div>

            <div className="space-y-3 relative z-10">
              {plan.features.map((feat: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-bold text-white/80">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selos de segurança */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-white/60">
                {language === 'zh' ? '加密数据' : (language === 'es' ? 'Datos Encriptados' : (language === 'fr' ? 'Données Chiffrées' : 'Dados Criptografados'))}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-white/60">
                {isInternational ? 'Stripe Secure' : 'Mercado Pago Seguro'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
              <Rocket className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-white/60">
                {language === 'zh' ? '随时取消' : (language === 'es' ? 'Cancela cuando quieras' : (language === 'fr' ? 'Annuler à tout moment' : 'Cancele Quando Quiser'))}
              </span>
            </div>
          </div>
        </div>

        {/* ——— Coluna Direita: Formulário de Pagamento ——— */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 relative overflow-hidden">
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/5 rounded-full blur-[80px]" />

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 sm:py-16 gap-6 text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-emerald-400">
                  {language === 'zh' ? '发射许可授权！' : (language === 'es' ? '¡Despegue Autorizado!' : (language === 'fr' ? 'Décollage Autorisé !' : 'Decolagem Autorizada!'))}
                </h3>
                <p className="text-white/60 text-xs sm:text-sm mt-2">
                  {language === 'zh' ? '您的订阅已激活。正在准备控制台...' : (language === 'es' ? 'Tu suscripción ha sido activada. Preparando el panel...' : (language === 'fr' ? 'Votre abonnement a été activé. Préparation du panneau...' : 'Sua assinatura foi ativada com sucesso. Preparando o painel...'))}
                </p>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  {language === 'zh' ? '正在解锁访问权限...' : (language === 'es' ? 'Liberando acceso...' : (language === 'fr' ? 'Libération de l\'accès...' : 'Liberando acesso...'))}
                </span>
              </div>
            </motion.div>
          ) : status === 'awaiting_pix' && pixData ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-6 sm:py-8 gap-6 text-center relative z-10"
            >
              <div>
                <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-emerald-400">Pague com PIX</h3>
                <p className="text-white/60 text-xs sm:text-sm mt-2 max-w-sm mx-auto">
                  Escaneie o QR Code abaixo com o aplicativo do seu banco ou copie o código PIX Copia e Cola. O acesso será liberado em segundos após o pagamento.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-3xl inline-block shadow-[0_0_40px_rgba(45,212,191,0.2)]">
                <img src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`} alt="QR Code PIX" className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl" />
              </div>

              <div className="w-full max-w-sm space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 text-left">PIX Copia e Cola</p>
                <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden p-1">
                  <input type="text" readOnly value={pixData.qrCode} className="bg-transparent text-white/80 text-xs px-3 py-2 w-full outline-none font-mono" />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.qrCode);
                      alert('Código PIX copiado!');
                    }}
                    className="bg-primary text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase whitespace-nowrap hover:bg-primary/80 transition-colors cursor-pointer"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setStatus('processing');
                  setTimeout(() => onSuccess(), 4000); // Simulador para fallback, mas idealmente o webhook ativa e o usuário clica quando pago.
                }}
                className="w-full max-w-sm py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer mt-4"
              >
                Já paguei (Verificar)
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-6 sm:mb-8 relative z-10 bg-black/20 p-4 sm:p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-inner">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> 
                    {language === 'zh' ? '安全结账' : (language === 'es' ? 'Pago 100% Seguro' : (language === 'fr' ? 'Paiement 100% Sécurisé' : 'Pagamento 100% Seguro'))}
                  </span>
                  <h3 className="text-[11px] sm:text-xs font-bold text-white/60 leading-relaxed max-w-xs">
                    {language === 'zh' ? '您的财务数据受到最高级别军事加密保护。' : (language === 'es' ? 'Tus datos financieros están protegidos con encriptación de grado militar.' : (language === 'fr' ? 'Vos données financières sont protégées par un cryptage de niveau militaire.' : 'Seus dados financeiros são protegidos com criptografia de ponta a ponta.'))}
                  </h3>
                </div>
                
                <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 w-full sm:w-auto justify-center">
                  {isInternational ? (
                    <span className="text-[#635BFF] font-black text-xl tracking-tighter">stripe</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-[#009EE3] rounded-full flex items-center justify-center">
                        <span className="text-white font-black text-[10px] italic">mp</span>
                      </div>
                      <span className="text-[#009EE3] font-black text-base tracking-tighter">mercado pago</span>
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl relative z-10">
                  <p className="text-red-400 text-[11px] font-bold">{errorMessage}</p>
                </div>
              )}

              {/* ROTEADOR DE GATEWAY: INTERNACIONAL -> STRIPE // BRASIL -> MERCADO PAGO */}
              {isInternational ? (
                // —————— INTERFACE STRIPE ELEMENTS ——————
                loadingStripeIntent ? (
                  <div className="space-y-4 animate-pulse relative z-10 py-12 text-center flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                      {language === 'zh' ? '正在链接安全网关...' : (language === 'es' ? 'Conectando con Stripe...' : (language === 'fr' ? 'Connexion à Stripe...' : 'Conectando com a Stripe...'))}
                    </p>
                  </div>
                ) : stripeClientSecret ? (
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <StripeForm
                      clientSecret={stripeClientSecret}
                      planAmount={stripeAmount}
                      planCurrency={stripeCurrency}
                      selectedPlan={selectedPlan}
                      onSuccess={onSuccess}
                      setErrorMessage={setErrorMessage}
                      setStatus={setStatus}
                    />
                  </Elements>
                ) : (
                  <div className="p-6 text-center text-white/40 text-xs">
                    {language === 'zh' ? '无法初始化安全网关。' : 'Unable to initialize secure gateway.'}
                  </div>
                )
              ) : (
                // —————— INTERFACE MERCADO PAGO BRICKS ——————
                MP_PUBLIC_KEY ? (
                  <>
                    {/* Esqueleto de carregamento premium com pulso cósmico */}
                    {!isBrickReady && (
                      <div className="space-y-4 animate-pulse relative z-10">
                        {/* Campo Número do Cartão */}
                        <div className="space-y-2">
                          <div className="h-3 w-28 bg-white/10 rounded-full" />
                          <div className="h-11 bg-white/5 border border-white/10 rounded-xl" />
                        </div>
                        {/* Grid Vencimento e CVV */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="h-3 w-20 bg-white/10 rounded-full" />
                            <div className="h-11 bg-white/5 border border-white/10 rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 w-16 bg-white/10 rounded-full" />
                            <div className="h-11 bg-white/5 border border-white/10 rounded-xl" />
                          </div>
                        </div>
                        {/* Nome do Titular */}
                        <div className="space-y-2">
                          <div className="h-3 w-32 bg-white/10 rounded-full" />
                          <div className="h-11 bg-white/5 border border-white/10 rounded-xl" />
                        </div>
                        {/* CPF/CNPJ */}
                        <div className="space-y-2">
                          <div className="h-3 w-24 bg-white/10 rounded-full" />
                          <div className="h-11 bg-white/5 border border-white/10 rounded-xl" />
                        </div>
                        {/* Botão de Pagar */}
                        <div className="h-12 bg-primary/20 border border-primary/30 rounded-xl mt-6 flex items-center justify-center">
                          <div className="h-3 w-28 bg-primary/30 rounded-full" />
                        </div>
                      </div>
                    )}

                    <div className={clsx("relative z-10 transition-opacity duration-300", !isBrickReady ? "opacity-0 absolute inset-0 pointer-events-none" : "opacity-100")}>
                      <MPPayment
                        initialization={{ amount: plan.amount }}
                        customization={customizationMercadoPago}
                        onSubmit={handleSubmitMercadoPago}
                        onReady={() => setIsBrickReady(true)}
                        onError={(err) => {
                          console.error('Erro no formulário MP:', err);
                          setErrorMessage('Erro ao processar o formulário. Verifique os dados inseridos.');
                          setStatus('error');
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-6 sm:p-8 bg-red-500/10 border border-red-500/20 rounded-[20px] sm:rounded-[24px] text-center space-y-4 relative z-10 my-4 sm:my-6">
                    <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto" />
                    <h4 className="text-white font-black uppercase tracking-wider text-xs sm:text-sm">Chave Galáctica Indisponível</h4>
                    <p className="text-white/60 text-[11px] sm:text-xs leading-relaxed max-w-sm mx-auto">
                      A chave pública <code className="bg-black/40 px-1.5 py-0.5 rounded text-primary font-mono text-[9px] sm:text-[10px]">NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY</code> não está configurada no seu painel da Vercel.
                    </p>
                    <p className="text-white/40 text-[9px] sm:text-[10px] leading-relaxed max-w-xs mx-auto">
                      Adicione essa variável nas configurações de ambiente do seu projeto Vercel para liberar o formulário do cartão.
                    </p>
                  </div>
                )
              )}

              {status === 'processing' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-[24px] sm:rounded-[32px] flex flex-col items-center justify-center gap-4 z-20">
                  <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
                  <p className="text-white font-black uppercase tracking-widest text-xs sm:text-sm">
                    {language === 'zh' ? '正在处理付款...' : (language === 'es' ? 'Procesando pago...' : (language === 'fr' ? 'Traitement du paiement...' : 'Processando pagamento...'))}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
