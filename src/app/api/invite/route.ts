import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { projectSharedEmail } from "@/lib/email/templates"
import { sendEmail } from "@/lib/email/send"

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { email, role, projectId, projectName, senderName } = await req.json()

    if (!email || !projectId) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    const roleLabel = role === "owner" ? "Propriétaire" : role === "editor" ? "Éditeur" : "Lecteur"

    const template = projectSharedEmail({
      recipientName: email.split("@")[0],
      senderName: senderName ?? "Un chef de projet",
      projectName: projectName ?? "Projet",
      projectId,
      role: roleLabel,
    })

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    })

    if (!result.success) throw new Error(result.error ?? "Erreur envoi email")

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch(e: any) {
    console.error("[Invite] Error:", e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
