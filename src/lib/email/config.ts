export const EMAIL_CONFIG = {
  from:    process.env.EMAIL_FROM || 'PMO AI Studio <noreply@contact.pmoai.studio>',
  replyTo: 'support@pmoai.studio',
  appName: 'PMO AI Studio',
  appUrl:  process.env.NEXT_PUBLIC_APP_URL || 'https://www.pmoai.studio',
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
