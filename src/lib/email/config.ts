// ── Email Config ─────────────────────────────────────────────
export const EMAIL_CONFIG = {
  from:    process.env.EMAIL_FROM || 'PMO AI Studio <onboarding@resend.dev>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@pmo-ai-studio.com',
  appName: 'PMO AI Studio',
  appUrl:  process.env.NEXT_PUBLIC_APP_URL || 'https://pmo-ai-studio.vercel.app',
}

export type EmailType =
  | 'welcome'
  | 'project_created'
  | 'upgrade_pro'
  | 'password_reset'
  | 'project_shared'
  | 'alert'
  | 'document'
  | 'weekly_digest'
