import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ STRIPE_SECRET_KEY is missing. Stripe functionality will be disabled.');
}

export const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-01-27' as any,
  appInfo: {
    name: 'Desafio das Estrelas',
    version: '1.0.0',
  },
});
