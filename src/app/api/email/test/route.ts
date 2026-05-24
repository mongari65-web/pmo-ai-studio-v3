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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Vérif admin : is_admin = true OU plan premium/pro
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, plan')
      .eq('id', user.id)
      .single()

    const isAdmin = (profile as { is_admin?: boolean; plan?: string } | null)?.is_admin === true
      || ['premium', 'pro'].includes((profile as { is_admin?: boolean; plan?: string } | null)?.plan ?? '')

    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
    }

    const body    = await req.json() as { type: string; to?: string }
    const testTo  = body.to || user.email!
    const appUrl  = process.env.NEXT_PUBLIC_APP_URL || 'https://pmo-ai-studio.vercel.app'

    type T = { subject: string; html: string }
    let template: T

    switch (body.type) {
      case 'welcome':
        template = welcomeEmail({ name: 'Hafid (Test)', email: testTo }); break
      case 'project_created':
        template = projectCreatedEmail({ name: 'Hafid (Test)', projectName: 'Projet Test PRA/PCA CNAM', projectId: 'test-123', description: 'Migration infrastructure' }); break
      case 'upgrade_pro':
        template = upgradeProEmail({ name: 'Hafid (Test)', plan: 'pro', amount: 29 }); break
      case 'password_reset':
        template = passwordResetEmail({ name: 'Hafid (Test)', resetUrl: `${appUrl}/reset-password?token=test123` }); break
      case 'project_shared':
        template = projectSharedEmail({ recipientName: 'Hafid (Test)', senderName: 'Admin PMO', projectName: 'Projet Test', projectId: 'test-123', role: 'Éditeur' }); break
      default:
        return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
    }

    const result = await sendEmail({ to: testTo, subject: `[TEST] ${template.subject}`, html: template.html })
    return NextResponse.json({ success: result.success, messageId: result.messageId, to: testTo })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 })
  }
}
