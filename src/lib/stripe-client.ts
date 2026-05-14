import { loadStripe } from "@stripe/stripe-js"

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.warn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquant")
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
)

export default stripePromise
