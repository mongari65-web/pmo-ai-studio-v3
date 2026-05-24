import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, logEmailEvent } from "@/lib/email/send"
import { welcomeEmail } from "@/lib/email/templates"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json() as { userId: string; email: string; name?: string }
    if (!body.userId || !body.email) {
      return NextResponse.json({ error: "userId et email requis" }, { status: 400 })
    }

    const template = welcomeEmail({ name: body.name || body.email.split("@")[0], email: body.email })
    const result   = await sendEmail({ to: body.email, subject: template.subject, html: template.html, tags: [{ name: "type", value: "welcome" }] })

    await logEmailEvent(supabase, {
      userId: body.userId, type: "welcome", to: body.email,
      subject: template.subject, success: result.success,
      messageId: result.messageId, error: result.error,
    })

    return NextResponse.json({ success: result.success })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur" }, { status: 500 })
  }
}
