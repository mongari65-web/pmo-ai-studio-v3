import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import {
  welcomeEmail,
  projectCreatedEmail,
  upgradeProEmail,
  passwordResetEmail,
  projectSharedEmail,
} from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Vérifier admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
    }

    const body = await req.json()
    const { type, to } = body

    const testTo = to || user.email!
    const testName = 'Hafid (Test)'
    const fakeProjectId = 'test-project-123'

    let template: { subject: string; html: string }

    switch (type) {
      case 'welcome':
        template = welcomeEmail({ name: testName, email: testTo })
        break
      case 'project_created':
        template = projectCreatedEmail({
          name: testName,
          projectName: 'Projet Test PRA/PCA CNAM',
          projectId: fakeProjectId,
          description: 'Migration infrastructure critique',
        })
        break
      case 'upgrade_pro':
        template = upgradeProEmail({ name: testName, plan: 'pro', amount: 29 })
        break
      case 'password_reset':
        template = passwordResetEmail({
          name: testName,
          resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=test123`,
        })
        break
      case 'project_shared':
        template = projectSharedEmail({
          recipientName: testName,
          senderName: 'Admin PMO',
          projectName: 'Projet Test',
          projectId: fakeProjectId,
          role: 'Éditeur',
        })
        break
      default:
        return NextResponse.json({ error: 'Type invalide. Valeurs: welcome, project_created, upgrade_pro, password_reset, project_shared' }, { status: 400 })
    }

    const result = await sendEmail({ to: testTo, subject: `[TEST] ${template.subject}`, html: template.html })
    return NextResponse.json({ success: result.success, messageId: result.messageId, to: testTo, type })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
