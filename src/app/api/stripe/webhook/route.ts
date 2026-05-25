import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import stripe from "@/lib/stripe-server"
import type Stripe from "stripe"

export const runtime = "nodejs"

const PLAN_FROM_PRICE: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY ?? ""]: "starter",
  [process.env.STRIPE_PRICE_STARTER_YEARLY  ?? ""]: "starter",
  [process.env.STRIPE_PRICE_PRO_MONTHLY     ?? ""]: "pro",
  [process.env.STRIPE_PRICE_PRO_YEARLY      ?? ""]: "pro",
  [process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? ""]: "premium",
  [process.env.STRIPE_PRICE_PREMIUM_YEARLY  ?? ""]: "premium",
}

const AMOUNT_FROM_PRICE: Record<string, number> = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY ?? ""]: 9,
  [process.env.STRIPE_PRICE_STARTER_YEARLY  ?? ""]: 7,
  [process.env.STRIPE_PRICE_PRO_MONTHLY     ?? ""]: 29,
  [process.env.STRIPE_PRICE_PRO_YEARLY      ?? ""]: 23,
  [process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? ""]: 59,
  [process.env.STRIPE_PRICE_PREMIUM_YEARLY  ?? ""]: 47,
}

async function sendUpgradeEmail(appUrl: string, userId: string, email: string, name: string, plan: string, priceId: string) {
  try {
    await fetch(`${appUrl}/api/email/upgrade-pro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        email,
        name,
        plan,
        amount: AMOUNT_FROM_PRICE[priceId] ?? 29,
      }),
    })
  } catch (e) {
    console.error("[Webhook] upgrade email failed:", e)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get("stripe-signature") ?? ""
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ""
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.pmoai.studio"

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (e: any) {
    console.error("Webhook signature error:", e.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("event_id", event.id)
    .single()

  if (existing) return NextResponse.json({ received: true, duplicate: true })

  await supabase.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
    payload: event.data.object as any,
  })

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId  = session.metadata?.supabase_user_id
        const plan    = session.metadata?.plan ?? "starter"
        if (!userId || !session.subscription) break

        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = sub.items.data[0]?.price.id ?? ""
        const finalPlan = PLAN_FROM_PRICE[priceId] ?? plan

        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          stripe_price_id: priceId,
          plan: finalPlan,
          status: sub.status,
          current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
          current_period_end:   new Date((sub as any).current_period_end   * 1000).toISOString(),
          trial_end: (sub as any).trial_end
            ? new Date((sub as any).trial_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_subscription_id" })

        // ── Email upgrade ──────────────────────────────────────
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email_notifications")
          .eq("id", userId).single()
        const { data: authUser } = await supabase.auth.admin.getUserById(userId)
        const email = authUser?.user?.email
        if (email && (profile as any)?.email_notifications !== false) {
          const name = (profile as any)?.full_name || email.split("@")[0]
          await sendUpgradeEmail(appUrl, userId, email, name, finalPlan, priceId)
        }
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub     = event.data.object as Stripe.Subscription
        const priceId = sub.items.data[0]?.price.id ?? ""

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", sub.customer as string)
          .single()

        if (!profile) break

        await supabase.from("subscriptions").upsert({
          user_id: profile.id,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          stripe_price_id: priceId,
          plan: PLAN_FROM_PRICE[priceId] ?? "free",
          status: sub.status,
          current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
          current_period_end:   new Date((sub as any).current_period_end   * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          canceled_at: sub.canceled_at
            ? new Date(sub.canceled_at * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_subscription_id" })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        if ((invoice as any).subscription) {
          const sub = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
          const priceId = sub.items.data[0]?.price.id ?? ""
          const { data: profile } = await supabase
            .from("profiles").select("id")
            .eq("stripe_customer_id", sub.customer as string).single()
          if (profile) {
            await supabase.from("subscriptions").update({
              status: "active",
              plan: PLAN_FROM_PRICE[priceId] ?? "starter",
              current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            }).eq("stripe_subscription_id", sub.id)
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        if ((invoice as any).subscription) {
          await supabase.from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", (invoice as any).subscription as string)
        }
        break
      }
    }

    await supabase.from("stripe_webhook_events")
      .update({ processed: true })
      .eq("event_id", event.id)

    return NextResponse.json({ received: true })
  } catch (e: any) {
    console.error("Webhook processing error:", e)
    return NextResponse.json({ error: "Processing error" }, { status: 500 })
  }
}
