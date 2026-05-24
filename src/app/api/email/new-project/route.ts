import { NextRequest, NextResponse } from 'next/server'
import { newProjectEmail } from '@/lib/email/templates'
import { sendEmail } from '@/lib/email/send'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      email: string
      name?: string
      projectName?: string
      scenario?: string
    }
    if (!body.email) return NextResponse.json({ error: 'email requis' }, { status: 400 })

    const template = newProjectEmail(body)
    const result   = await sendEmail({ to: body.email, subject: template.subject, html: template.html })
    return NextResponse.json({ success: result.success, messageId: result.messageId })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 })
  }
}
