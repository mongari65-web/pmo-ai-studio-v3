import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, logEmailEvent } from "@/lib/email/send"
import { projectCreatedEmail } from "@/lib/email/templates"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await req.json() as { projectId: string; projectName: string; description?: string }
    if (!body.projectId || !body.projectName) {
      return NextResponse.json({ error: "projectId et projectName requis" }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email_notifications")
      .eq("id", user.id)
      .single()

    if ((profile as { email_notifications?: boolean } | null)?.email_notifications === false) {
      return NextResponse.json({ success: true, skipped: "notifications désactivées" })
    }

    const name     = (profile as { full_name?: string } | null)?.full_name || user.email?.split("@")[0] || "Utilisateur"
    const template = projectCreatedEmail({ name, projectName: body.projectName, projectId: body.projectId, description: body.description })

    const result = await sendEmail({
      to:      user.email!,
      subject: template.subject,
      html:    template.html,
      tags:    [{ name: "type", value: "project_created" }],
    })

    await logEmailEvent(supabase, {
      userId: user.id, type: "project_created", to: user.email!,
      subject: template.subject, success: result.success,
      messageId: result.messageId, error: result.error,
    })

    return NextResponse.json({ success: result.success, messageId: result.messageId })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur" }, { status: 500 })
  }
}
