import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, logEmailEvent } from '@/lib/email/send'
import { projectCreatedEmail } from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, projectName, description } = body

    if (!projectId || !projectName) {
      return NextResponse.json({ error: 'projectId et projectName requis' }, { status: 400 })
    }

    // Récupérer le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email_notifications')
      .eq('id', user.id)
      .single()

    // Vérifier les préférences de notif
    if (profile?.email_notifications === false) {
      return NextResponse.json({ success: true, skipped: 'notifications désactivées' })
    }

    const name = profile?.full_name || user.email?.split('@')[0] || 'Utilisateur'
    const template = projectCreatedEmail({ name, projectName, projectId, description })

    const result = await sendEmail({
      to: user.email!,
      subject: template.subject,
      html: template.html,
      tags: [{ name: 'type', value: 'project_created' }],
    })

    await logEmailEvent(supabase, {
      userId: user.id,
      type: 'project_created',
      to: user.email!,
      subject: template.subject,
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    })

    return NextResponse.json({ success: result.success, messageId: result.messageId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
