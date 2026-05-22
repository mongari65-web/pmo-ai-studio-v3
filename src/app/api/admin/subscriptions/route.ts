import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .neq("plan", "free")
      .order("created_at", { ascending: false })

    const subs = (profiles ?? []).map((p: any) => ({
      id: p.id,
      user_id: p.id,
      email: p.email,
      full_name: p.full_name,
      plan: p.plan ?? "free",
      plan_id: p.plan_id,
      subscription_status: p.subscription_status ?? "active",
      stripe_subscription_id: p.stripe_subscription_id ?? null,
      stripe_customer_id: p.stripe_customer_id ?? null,
      current_period_end: p.plan_expires_at ?? null,
      plan_started_at: p.plan_started_at ?? p.created_at,
      amount: p.plan === "premium" ? 23 : p.plan === "pro" ? 17 : p.plan === "starter" ? 9 : 0,
    }))

    const total = subs.length
    const active = subs.filter((s: any) => s.subscription_status === "active").length
    const trial = subs.filter((s: any) => s.subscription_status === "trialing").length
    const pastDue = subs.filter((s: any) => s.subscription_status === "past_due").length
    const mrr = subs.reduce((s: number, sub: any) => s + sub.amount, 0)

    return NextResponse.json({ subscriptions: subs, total, active, trial, pastDue, mrr })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
