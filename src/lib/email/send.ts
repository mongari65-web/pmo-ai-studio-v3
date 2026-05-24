import { Resend } from 'resend'
import { EMAIL_CONFIG } from './config'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendEmail(params: SendEmailParams): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('[Email] RESEND_API_KEY manquante')
      return { success: false, error: 'RESEND_API_KEY non configurée' }
    }

    const { data, error } = await resend.emails.send({
      from:     EMAIL_CONFIG.from,
      to:       Array.isArray(params.to) ? params.to : [params.to],
      subject:  params.subject,
      html:     params.html,
      text:     params.text,
      reply_to: params.replyTo || EMAIL_CONFIG.replyTo,
      tags:     params.tags,
    })

    if (error) {
      console.error('[Email] Erreur Resend:', error)
      return { success: false, error: error.message }
    }

    console.log('[Email] ✅ Envoyé:', data?.id, '→', params.to)
    return { success: true, messageId: data?.id }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[Email] Exception:', message)
    return { success: false, error: message }
  }
}

export async function logEmailEvent(
  supabase: SupabaseClient,
  params: {
    userId?: string
    type: string
    to: string
    subject: string
    success: boolean
    messageId?: string
    error?: string
  }
) {
  try {
    await supabase.from('email_logs').insert({
      user_id:       params.userId,
      email_type:    params.type,
      recipient:     params.to,
      subject:       params.subject,
      status:        params.success ? 'sent' : 'failed',
      resend_id:     params.messageId,
      error_message: params.error,
      sent_at:       new Date().toISOString(),
    })
  } catch (e) {
    console.error('[Email] Impossible de logger:', e)
  }
}
