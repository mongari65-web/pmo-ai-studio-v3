import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("plans")
      .select("id, name, price_monthly, price_yearly, max_projects, features, stripe_price_monthly, stripe_price_yearly")
      .order("price_monthly", { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
