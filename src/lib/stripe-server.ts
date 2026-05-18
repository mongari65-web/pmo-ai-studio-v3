import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY ?? ""

const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: "2026-04-22.dahlia" })
  : null as unknown as Stripe

export default stripe

export const PLANS = {
  starter_monthly: { priceId: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "", plan: "starter", label: "Starter Mensuel",  amount: 900,   interval: "month" },
  starter_yearly:  { priceId: process.env.STRIPE_PRICE_STARTER_YEARLY  ?? "", plan: "starter", label: "Starter Annuel",   amount: 8400,  interval: "year"  },
  pro_monthly:     { priceId: process.env.STRIPE_PRICE_PRO_MONTHLY     ?? "", plan: "pro",     label: "Pro Mensuel",      amount: 1700,  interval: "month" },
  pro_yearly:      { priceId: process.env.STRIPE_PRICE_PRO_YEARLY      ?? "", plan: "pro",     label: "Pro Annuel",       amount: 16800, interval: "year"  },
  premium_monthly: { priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "", plan: "premium", label: "Premium Mensuel",  amount: 2300,  interval: "month" },
  premium_yearly:  { priceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY  ?? "", plan: "premium", label: "Premium Annuel",   amount: 21600, interval: "year"  },
} as const

export type PlanKey = keyof typeof PLANS

export function isStripeConfigured(): boolean {
  return !!stripeKey
}
