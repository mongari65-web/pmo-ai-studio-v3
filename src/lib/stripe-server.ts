import Stripe from "stripe"

// Stripe est optionnel — ne pas bloquer si la clé est absente
const stripeKey = process.env.STRIPE_SECRET_KEY ?? ""

const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: "2026-04-22.dahlia" })
  : null as unknown as Stripe

export default stripe

export const PLANS = {
  pro_monthly:  { priceId: process.env.STRIPE_PRICE_PRO_MONTHLY  ?? "", plan: "pro",  label: "Pro Mensuel",    amount: 2900,  interval: "month" },
  pro_yearly:   { priceId: process.env.STRIPE_PRICE_PRO_YEARLY   ?? "", plan: "pro",  label: "Pro Annuel",     amount: 27900, interval: "year"  },
  team_monthly: { priceId: process.env.STRIPE_PRICE_TEAM_MONTHLY ?? "", plan: "team", label: "Équipe Mensuel", amount: 7900,  interval: "month" },
  team_yearly:  { priceId: process.env.STRIPE_PRICE_TEAM_YEARLY  ?? "", plan: "team", label: "Équipe Annuel",  amount: 75900, interval: "year"  },
} as const

export type PlanKey = keyof typeof PLANS

export function isStripeConfigured(): boolean {
  return !!stripeKey
}
