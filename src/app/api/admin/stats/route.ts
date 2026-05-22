import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const today   = new Date(); today.setHours(0,0,0,0)
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7)

    const { data: profiles } = await supabaseAdmin.from("profiles").select("*")
    const { data: projects  } = await supabaseAdmin.from("projects").select("user_id")

    const all      = profiles ?? []
    const total    = all.length
    const free     = all.filter(u => !u.plan || u.plan === "free").length
    const starter  = all.filter(u => u.plan === "starter").length
    const pro      = all.filter(u => u.plan === "pro").length
    const premium  = all.filter(u => u.plan === "premium").length
    const banned   = all.filter(u => u.is_banned).length
    const newToday = all.filter(u => new Date(u.created_at) >= today).length
    const newWeek  = all.filter(u => new Date(u.created_at) >= weekAgo).length
    const aiTotal  = all.reduce((s, u) => s + (u.ai_calls_count ?? 0), 0)
    const projectsTotal = (projects ?? []).length

    return NextResponse.json({
      total, free, starter, pro, premium, banned,
      newToday, newWeek, aiTotal, projectsTotal,
      conversionRate: total > 0 ? Math.round((premium + pro + starter) / total * 100) : 0
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
