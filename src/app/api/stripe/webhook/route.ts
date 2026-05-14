import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import stripe from "@/lib/stripe-server"
import type Stripe from "stripe"

// Important : désactiver le body parsing Next.js pour Stripe
export const runtime = "nodejs"

const PLAN_FROM_PRICE: Record<string, string> = {
  [process.env.STRIPE_PRICE_PRO_MONTHLY  ?? ""]: "pro",
  [process.env.STRIPE_PRICE_PRO_YEARLY   ?? ""]: "pro",
  [process.env.STRIPE_PRICE_TEAM_MONTHLY ?? ""]: "team",
  [process.env.STRIPE_PRICE_TEAM_YEARLY  ?? ""]: "team",
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get("stripe-signature") ?? ""
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ""

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (e: any) {
    console.error("Webhook signature error:", e.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createClient()

  // Idempotence : vérifier si l'événement a déjà été traité
  const { data: existing } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("event_id", event.id)
    .single()

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  // Enregistrer l'événement
  await supabase.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
    payload: event.data.object as any,
  })

  try {
    switch (event.type) {

      // ── Checkout terminé ─────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId  = session.metadata?.supabase_user_id
        const plan    = session.metadata?.plan ?? "pro"
        if (!userId || !session.subscription) break

        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = sub.items.data[0]?.price.id ?? ""

        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          stripe_price_id: priceId,
          plan: PLAN_FROM_PRICE[priceId] ?? plan,
          status: sub.status,
          current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
          current_period_end:   new Date((sub as any).current_period_end   * 1000).toISOString(),
          trial_end: (sub as any).trial_end
            ? new Date((sub as any).trial_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_subscription_id" })
        break
      }

      // ── Abonnement mis à jour ─────────────────────────────
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub    = event.data.object as Stripe.Subscription
        const priceId = sub.items.data[0]?.price.id ?? ""

        // Retrouver l'user depuis le customer
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

      // ── Paiement réussi ──────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        if ((invoice as any).subscription) {
          const sub = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
          const priceId = sub.items.data[0]?.price.id ?? ""
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", sub.customer as string)
            .single()
          if (profile) {
            await supabase.from("subscriptions")
              .update({
                status: "active",
                plan: PLAN_FROM_PRICE[priceId] ?? "pro",
                current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_subscription_id", sub.id)
          }
        }
        break
      }

      // ── Paiement échoué ──────────────────────────────────
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

    // Marquer comme traité
    await supabase.from("stripe_webhook_events")
      .update({ processed: true })
      .eq("event_id", event.id)

    return NextResponse.json({ received: true })
  } catch (e: any) {
    console.error("Webhook processing error:", e)
    return NextResponse.json({ error: "Processing error" }, { status: 500 })
  }
}
