import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, logEmailEvent } from '@/lib/email/send'
import {
  newFeatureEmail, upsellProEmail, feedbackResponseEmail,
  complaintResponseEmail, weeklyDigestEmail,
} from '@/lib/email/templates'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_admin, plan').eq('id', user.id).single()
    const p = profile as { is_admin?: boolean; plan?: string } | null
    const isAdmin = p?.is_admin === true || ['premium', 'pro'].includes(p?.plan ?? '')
    if (!isAdmin) return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })

    const body = await req.json() as {
      type: string
      targetPlans: string[]       // ['free','starter','pro','premium'] ou ['all']
      params: AnyObj
      preview?: boolean           // si true, envoie juste à l'admin
    }

    // Récupérer les destinataires selon le plan cible
    let query = supabase.from('profiles').select('id, full_name, email_notifications')
    if (!body.targetPlans.includes('all')) {
      query = query.in('plan', body.targetPlans)
    }
    const { data: targets } = await query

    // Récupérer les emails via auth.users (service role)
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const emailMap: Record<string, string> = {}
    authUsers?.users?.forEach((u: { id: string; email?: string }) => {
      if (u.email) emailMap[u.id] = u.email
    })

    if (body.preview) {
      // Envoyer seulement à l'admin pour prévisualisation
      const template = buildTemplate(body.type, { ...body.params, name: 'Prévisualisation Admin' })
      if (!template) return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
      const result = await sendEmail({ to: user.email!, subject: `[PREVIEW] ${template.subject}`, html: template.html })
      return NextResponse.json({ success: result.success, preview: true, to: user.email })
    }

    // Envoi en masse
    const results = { sent: 0, failed: 0, skipped: 0 }
    const recipients = targets ?? []

    for (const recipient of recipients) {
      const email = emailMap[recipient.id]
      if (!email) { results.skipped++; continue }
      if (recipient.email_notifications === false) { results.skipped++; continue }

      const template = buildTemplate(body.type, { ...body.params, name: (recipient.full_name as string) || email.split('@')[0] })
      if (!template) continue

      const result = await sendEmail({ to: email, subject: template.subject, html: template.html })
      await logEmailEvent(supabase, {
        userId: recipient.id, type: `broadcast_${body.type}`,
        to: email, subject: template.subject,
        success: result.success, messageId: result.messageId, error: result.error,
      })

      if (result.success) results.sent++
      else results.failed++

      // Rate limiting : pause 100ms entre chaque email
      await new Promise(r => setTimeout(r, 100))
    }

    return NextResponse.json({ success: true, results, total: recipients.length })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 })
  }
}

function buildTemplate(type: string, params: AnyObj): { subject: string; html: string } | null {
  switch (type) {
    case 'new_feature':
      return newFeatureEmail({ name: params.name, featureTitle: params.featureTitle, featureDescription: params.featureDescription, featureUrl: params.featureUrl, plan: params.plan })
    case 'upsell_pro':
      return upsellProEmail({ name: params.name, currentPlan: params.currentPlan })
    case 'feedback_response':
      return feedbackResponseEmail({ name: params.name, originalFeedback: params.originalFeedback, response: params.response, senderName: params.senderName })
    case 'complaint_response':
      return complaintResponseEmail({ name: params.name, complaintSubject: params.complaintSubject, response: params.response, resolution: params.resolution, senderName: params.senderName })
    case 'weekly_digest':
      return weeklyDigestEmail({ name: params.name, projectCount: params.projectCount || 0, aiCallsUsed: params.aiCallsUsed || 0, aiCallsLimit: params.aiCallsLimit || 100, topProject: params.topProject, tips: params.tips, plan: params.plan })
    default:
      return null
  }
}
