import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Retourner la liste des membres inscrits + leurs projets
  try {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, plan, created_at")
      .order("full_name")
    return NextResponse.json({ members: profiles ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { targetUserId, projectIds, role, invitedBy } = await req.json()
    if (!targetUserId || !projectIds?.length || !role)
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })

    // Récupérer email du membre cible
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("id", targetUserId)
      .single()

    // Récupérer infos des projets
    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("id, name")
      .in("id", projectIds)

    // Insérer dans project_members (upsert pour éviter doublons)
    const inserts = projectIds.map((pid: string) => ({
      project_id: pid,
      email: targetProfile?.email,
      role,
      status: "accepted",
      invited_by: invitedBy,
    }))

    const { error } = await supabaseAdmin
      .from("project_members")
      .upsert(inserts, { onConflict: "project_id,email" })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Envoyer email de notification
    if (targetProfile?.email) {
      const projectNames = projects?.map((p: any) => p.name).join(", ") ?? ""
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: targetProfile.email,
          subject: `Projets partagés avec vous | PMO AI Studio`,
          message: `Bonjour ${targetProfile.full_name ?? ""},\n\nLes projets suivants ont été partagés avec vous en tant que "${role}" :\n\n${projects?.map((p:any)=>"• "+p.name).join("\n")}\n\nConnectez-vous sur PMO AI Studio pour y accéder.\n\nCordialement`,
          toolType: "share",
          projectName: projectNames,
        })
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, count: projectIds.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
