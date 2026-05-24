import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, logEmailEvent } from '@/lib/email/send'
import { upgradeProEmail } from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()
    const { userId, email, name, plan, amount, invoiceUrl } = body

    const template = upgradeProEmail({ name: name || 'Utilisateur', plan, amount, invoiceUrl })

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      tags: [{ name: 'type', value: 'upgrade_pro' }],
    })

    await logEmailEvent(supabase, {
      userId,
      type: 'upgrade_pro',
      to: email,
      subject: template.subject,
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    })

    return NextResponse.json({ success: result.success })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
