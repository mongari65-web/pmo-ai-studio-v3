import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("user_id")

    const projectCounts: Record<string, number> = {}
    projects?.forEach((p: any) => {
      projectCounts[p.user_id] = (projectCounts[p.user_id] ?? 0) + 1
    })

    const users = (profiles ?? []).map((u: any) => ({
      ...u,
      project_count: projectCounts[u.id] ?? 0
    }))

    return NextResponse.json({ users })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
