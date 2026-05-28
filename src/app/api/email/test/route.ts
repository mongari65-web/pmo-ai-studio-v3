import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import {
  welcomeEmail, projectCreatedEmail, upgradeProEmail,
  passwordResetEmail, projectSharedEmail,
} from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()

    if (authErr || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, plan')
      .eq('id', user.id)
      .single()

    const p = profile as { is_admin?: boolean; plan?: string } | null
    const isAdmin = p?.is_admin === true || ['premium', 'pro'].includes(p?.plan ?? '')

    console.log('[Email Test] user:', user.email, '| is_admin:', p?.is_admin, '| plan:', p?.plan, '| isAdmin:', isAdmin)

    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
    }

    const body   = await req.json() as { type: string; to?: string }
    const testTo = body.to || user.email!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pmo-ai-studio.vercel.app'

    type T = { subject: string; html: string }
    let template: T

    switch (body.type) {
      case 'welcome':
        template = welcomeEmail({ name: 'Hafid (Test)', email: testTo }); break
      case 'project_created':
        template = projectCreatedEmail({
          name: 'Hafid (Test)', projectName: 'Projet Test PRA/PCA CNAM',
          projectId: 'test-123', description: 'Migration infrastructure',
        }); break
      case 'upgrade_pro':
        template = upgradeProEmail({ name: 'Hafid (Test)', plan: 'pro', amount: 39 }); break
      case 'password_reset':
        template = passwordResetEmail({
          name: 'Hafid (Test)',
          resetUrl: `${appUrl}/reset-password?token=test123`,
        }); break
      case 'project_shared':
        template = projectSharedEmail({
          recipientName: 'Hafid (Test)', senderName: 'Admin PMO',
          projectName: 'Projet Test', projectId: 'test-123', role: 'Éditeur',
        }); break
      default:
        return NextResponse.json({ error: `Type invalide: ${body.type}` }, { status: 400 })
    }

    console.log('[Email Test] Envoi type:', body.type, '→', testTo)
    const result = await sendEmail({
      to:      testTo,
      subject: `[TEST] ${template.subject}`,
      html:    template.html,
    })

    console.log('[Email Test] Résultat:', result)
    return NextResponse.json({
      success:   result.success,
      messageId: result.messageId,
      error:     result.error ?? null,
      to:        testTo,
      type:      body.type,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err)
    console.error('[Email Test] Exception:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
