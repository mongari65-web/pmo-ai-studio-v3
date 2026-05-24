// ── Email Config ─────────────────────────────────────────────
export const EMAIL_CONFIG = {
  from: 'PMO AI Studio <noreply@pmo-ai-studio.com>',
  replyTo: 'support@pmo-ai-studio.com',
  appName: 'PMO AI Studio',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://pmo-ai-studio.vercel.app',
}

export type EmailType =
  | 'welcome'
  | 'project_created'
  | 'upgrade_pro'
  | 'password_reset'
  | 'project_shared'
  | 'weekly_digest'
