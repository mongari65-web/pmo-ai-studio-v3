import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import stripe, { PLANS, isStripeConfigured, type PlanKey } from "@/lib/stripe-server"

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local" }, { status: 503 })
  }
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const { planKey, billingInterval = "monthly" } = await req.json()
    const key = `${planKey}_${billingInterval}` as PlanKey
    const plan = PLANS[key]
    if (!plan?.priceId) return NextResponse.json({ error: `Plan invalide : ${key}` }, { status: 400 })

    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id, email, full_name").eq("id", user.id).single()
    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email ?? "", name: profile?.full_name ?? "", metadata: { supabase_user_id: user.id } })
      customerId = customer.id
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pmo-ai-studio-v3.vercel.app"
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card", "sepa_debit", "klarna"],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: { metadata: { supabase_user_id: user.id, plan: plan.plan }, trial_period_days: 7 },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      success_url: `${appUrl}/dashboard?upgrade=success&plan=${plan.plan}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: { supabase_user_id: user.id, plan: plan.plan },
      locale: "fr",
    })
    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
