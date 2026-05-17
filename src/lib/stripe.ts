import Stripe from 'stripe';

const rawStripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
// Sanitiza possíveis aspas e espaços extras que venham do .env.local
const stripeSecretKey = rawStripeSecretKey.trim().replace(/^["']|["']$/g, '');

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ STRIPE_SECRET_KEY is missing. Stripe functionality will be disabled.');
}

export const stripe = new Stripe(stripeSecretKey, {
  appInfo: {
    name: 'Desafio das Estrelas',
    version: '1.0.0',
  },
});
