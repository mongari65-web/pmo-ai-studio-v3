import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, logEmailEvent } from "@/lib/email/send"
import { upgradeProEmail } from "@/lib/email/templates"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json() as { userId: string; email: string; name?: string; plan: "starter" | "pro" | "premium"; amount: number; invoiceUrl?: string }

    const template = upgradeProEmail({ name: body.name || "Utilisateur", plan: body.plan, amount: body.amount, invoiceUrl: body.invoiceUrl })
    const result   = await sendEmail({ to: body.email, subject: template.subject, html: template.html, tags: [{ name: "type", value: "upgrade_pro" }] })

    await logEmailEvent(supabase, {
      userId: body.userId, type: "upgrade_pro", to: body.email,
      subject: template.subject, success: result.success,
      messageId: result.messageId, error: result.error,
    })

    return NextResponse.json({ success: result.success })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur" }, { status: 500 })
  }
}
