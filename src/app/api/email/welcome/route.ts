import { NextRequest, NextResponse } from "next/server"
import { welcomeEmail } from "@/lib/email/templates"

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) return NextResponse.json({ success: true, simulated: true })
    const { Resend } = await import("resend")
    const resend = new Resend(resendKey)
    const { error } = await resend.emails.send({
      from: "PMO AI Studio <onboarding@resend.dev>",
      to: email,
      subject: "Bienvenue sur PMO AI Studio !",
      html: welcomeEmail(name),
    })
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}