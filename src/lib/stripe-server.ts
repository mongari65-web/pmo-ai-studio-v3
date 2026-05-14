import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY manquant dans .env.local")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
})

export default stripe

// Plans et leurs Price IDs Stripe
export const PLANS = {
  pro_monthly: {
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    plan: "pro",
    label: "Pro Mensuel",
    amount: 2900,  // 29€ en centimes
    interval: "month",
  },
  pro_yearly: {
    priceId: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
    plan: "pro",
    label: "Pro Annuel",
    amount: 27900, // 279€ (20% de réduction)
    interval: "year",
  },
  team_monthly: {
    priceId: process.env.STRIPE_PRICE_TEAM_MONTHLY ?? "",
    plan: "team",
    label: "Équipe Mensuel",
    amount: 7900,  // 79€
    interval: "month",
  },
  team_yearly: {
    priceId: process.env.STRIPE_PRICE_TEAM_YEARLY ?? "",
    plan: "team",
    label: "Équipe Annuel",
    amount: 75900, // 759€ (20% de réduction)
    interval: "year",
  },
} as const

export type PlanKey = keyof typeof PLANS
