import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/send"
import { welcomeEmail, projectCreatedEmail, upgradeProEmail, passwordResetEmail, projectSharedEmail } from "@/lib/email/templates"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if ((profile as { role?: string } | null)?.role !== "admin") {
      return NextResponse.json({ error: "Accès admin requis" }, { status: 403 })
    }

    const body = await req.json() as { type: string; to?: string }
    const testTo   = body.to || user.email!
    const testName = "Hafid (Test)"
    const appUrl   = process.env.NEXT_PUBLIC_APP_URL || "https://pmo-ai-studio.vercel.app"

    type EmailTemplate = { subject: string; html: string }
    let template: EmailTemplate

    switch (body.type) {
      case "welcome":
        template = welcomeEmail({ name: testName, email: testTo }); break
      case "project_created":
        template = projectCreatedEmail({ name: testName, projectName: "Projet Test PRA/PCA CNAM", projectId: "test-123", description: "Migration infrastructure" }); break
      case "upgrade_pro":
        template = upgradeProEmail({ name: testName, plan: "pro", amount: 29 }); break
      case "password_reset":
        template = passwordResetEmail({ name: testName, resetUrl: `${appUrl}/reset-password?token=test123` }); break
      case "project_shared":
        template = projectSharedEmail({ recipientName: testName, senderName: "Admin PMO", projectName: "Projet Test", projectId: "test-123", role: "Éditeur" }); break
      default:
        return NextResponse.json({ error: "Type invalide: welcome | project_created | upgrade_pro | password_reset | project_shared" }, { status: 400 })
    }

    const result = await sendEmail({ to: testTo, subject: `[TEST] ${template.subject}`, html: template.html })
    return NextResponse.json({ success: result.success, messageId: result.messageId, to: testTo, type: body.type })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur" }, { status: 500 })
  }
}
