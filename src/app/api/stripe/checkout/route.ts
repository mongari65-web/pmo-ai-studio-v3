import { NextRequest, NextResponse } from "next/server"

const PRICE_IDS: Record<string, string> = {
  pro_monthly:  process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  pro_yearly:   process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
  team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY ?? "",
  team_yearly:  process.env.STRIPE_PRICE_TEAM_YEARLY ?? "",
}

export async function POST(req: NextRequest) {
  try {
    const { planId, billing } = await req.json()
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey || stripeKey.includes("your_")) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY manquante dans .env.local" }, { status: 500 })
    }
    const priceKey = `${planId}_${billing}`
    const priceId = PRICE_IDS[priceKey]
    if (!priceId || priceId.includes("your_")) {
      return NextResponse.json({ error: `Configurez STRIPE_PRICE_${priceKey.toUpperCase()} dans .env.local` }, { status: 400 })
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "mode": "subscription",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "success_url": `${appUrl}/dashboard?success=1`,
        "cancel_url": `${appUrl}/pricing?canceled=1`,
        "allow_promotion_codes": "true",
      }),
    })
    const session = await response.json()
    if (!response.ok) throw new Error(session.error?.message ?? "Erreur Stripe")
    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
