import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { projectSharedEmail } from "@/lib/email/templates"
import { sendEmail } from "@/lib/email/send"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const { email, role, projectId, projectName } = await req.json()

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ success: true, simulated: true })
    }

    const { Resend } = await import("resend")
    const resend = new Resend(resendKey)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pmoai.studio"
    const inviteLink = appUrl + "/auth/login?redirect=/projects/" + projectId
    const senderName = user.user_metadata?.full_name ?? user.email ?? "Un chef de projet"
    const roleLabel = role === "editor" ? "Éditeur" : "Lecteur"

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "PMO AI Studio <noreply@pmoai.studio>",
      to: email,
      subject: "Invitation : rejoignez " + projectName + " sur PMO AI Studio",
      html: "<p>" + senderName + " vous invite sur le projet <b>" + projectName + "</b> en tant que <b>" + roleLabel + "</b>.</p><p><a href='" + inviteLink + "'>Accéder au projet</a></p>",
    })

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
