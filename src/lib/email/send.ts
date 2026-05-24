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
  const apiKey = process.env.RESEND_API_KEY
  console.log('[Email] API key présente:', !!apiKey, '| longueur:', apiKey?.length ?? 0)

  if (!apiKey) {
    console.error('[Email] RESEND_API_KEY manquante')
    return { success: false, error: 'RESEND_API_KEY non configurée' }
  }

  try {
    const payload = {
      from:    EMAIL_CONFIG.from,
      to:      Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html:    params.html,
      ...(params.text    && { text:    params.text }),
      ...(params.replyTo && { replyTo: params.replyTo }),
      ...(params.tags    && { tags:    params.tags }),
    }

    console.log('[Email] Envoi vers:', payload.to, '| sujet:', payload.subject)

    const { data, error } = await resend.emails.send(payload)

    if (error) {
      const errMsg = typeof error === 'object'
        ? (error as { message?: string; name?: string }).message
          || (error as { name?: string }).name
          || JSON.stringify(error)
        : String(error)
      console.error('[Email] Erreur Resend:', errMsg)
      return { success: false, error: errMsg }
    }

    console.log('[Email] ✅ Succès ID:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (err: unknown) {
    const message = err instanceof Error
      ? err.message
      : typeof err === 'object'
        ? JSON.stringify(err)
        : String(err)
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
    console.error('[Email] Log failed:', e)
  }
}
