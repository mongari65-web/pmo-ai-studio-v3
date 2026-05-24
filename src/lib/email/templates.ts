import { EMAIL_CONFIG } from './config'

const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
`

const headerStyle = `
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  padding: 32px 40px;
  text-align: center;
  border-radius: 12px 12px 0 0;
`

const bodyStyle = `
  padding: 32px 40px;
  color: #1f2937;
  line-height: 1.6;
`

const footerStyle = `
  background: #f9fafb;
  padding: 20px 40px;
  text-align: center;
  color: #6b7280;
  font-size: 12px;
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #e5e7eb;
`

const btnStyle = `
  display: inline-block;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: #ffffff !important;
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  margin: 16px 0;
`

function baseLayout(content: string, preheader = '') {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${EMAIL_CONFIG.appName}</title>
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin:0;padding:20px;background:#f3f4f6;">
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
        📊 ${EMAIL_CONFIG.appName}
      </h1>
      <p style="color:#bfdbfe;margin:6px 0 0;font-size:13px;">La plateforme PMO intelligente</p>
    </div>
    <div style="${bodyStyle}">${content}</div>
    <div style="${footerStyle}">
      <p style="margin:0 0 4px;">© ${new Date().getFullYear()} ${EMAIL_CONFIG.appName} — Tous droits réservés</p>
      <p style="margin:0;">
        <a href="${EMAIL_CONFIG.appUrl}" style="color:#3b82f6;text-decoration:none;">${EMAIL_CONFIG.appUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

// ── 1. WELCOME ───────────────────────────────────────────────
export function welcomeEmail(params: { name: string; email: string }) {
  const content = `
    <h2 style="color:#1e40af;margin:0 0 8px;">Bienvenue ${params.name} ! 🎉</h2>
    <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">Votre compte a été créé avec succès</p>
    <p>Vous avez maintenant accès à <strong>PMO AI Studio</strong> — votre plateforme de gestion de projets alimentée par l'IA.</p>
    <p>Avec votre compte <strong>Free</strong>, vous pouvez :</p>
    <ul style="color:#374151;padding-left:20px;">
      <li>Créer jusqu'à <strong>3 projets</strong></li>
      <li>Utiliser les outils PMO (WBS, Gantt, RAID, PERT...)</li>
      <li>Générer <strong>20 analyses IA</strong> par mois</li>
      <li>Accéder au simulateur PMP (50 questions)</li>
    </ul>
    <div style="text-align:center;margin:24px 0;">
      <a href="${EMAIL_CONFIG.appUrl}/dashboard" style="${btnStyle}">
        Accéder à mon tableau de bord →
      </a>
    </div>
    <p style="font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:16px;margin-top:24px;">
      Besoin d'aide ? Répondez à cet email ou consultez notre 
      <a href="${EMAIL_CONFIG.appUrl}/guide" style="color:#3b82f6;">guide de démarrage</a>.
    </p>
  `
  return {
    subject: `Bienvenue sur ${EMAIL_CONFIG.appName} ! 🚀`,
    html: baseLayout(content, `Bienvenue ${params.name}, votre compte est prêt !`),
  }
}

// ── 2. PROJECT CREATED ───────────────────────────────────────
export function projectCreatedEmail(params: {
  name: string
  projectName: string
  projectId: string
  description?: string
}) {
  const content = `
    <h2 style="color:#1e40af;margin:0 0 8px;">Nouveau projet créé ! 📁</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Votre projet est prêt à être géré</p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0 0 6px;font-size:13px;color:#0369a1;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Projet</p>
      <p style="margin:0;font-size:20px;font-weight:700;color:#0c4a6e;">${params.projectName}</p>
      ${params.description ? `<p style="margin:8px 0 0;font-size:13px;color:#374151;">${params.description}</p>` : ''}
    </div>
    <p>Commencez à structurer votre projet avec les outils PMO :</p>
    <table style="width:100%;border-collapse:collapse;margin:12px 0;">
      <tr>
        <td style="padding:8px;font-size:13px;">📋 <strong>WBS</strong> — Structure de découpage</td>
        <td style="padding:8px;font-size:13px;">📅 <strong>Gantt</strong> — Planning visuel</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:8px;font-size:13px;">⚠️ <strong>RAID</strong> — Risques & actions</td>
        <td style="padding:8px;font-size:13px;">💰 <strong>EVM</strong> — Suivi budgétaire</td>
      </tr>
    </table>
    <div style="text-align:center;margin:24px 0;">
      <a href="${EMAIL_CONFIG.appUrl}/projects/${params.projectId}" style="${btnStyle}">
        Ouvrir le projet →
      </a>
    </div>
  `
  return {
    subject: `Projet "${params.projectName}" créé avec succès ✅`,
    html: baseLayout(content, `Votre projet ${params.projectName} est prêt !`),
  }
}

// ── 3. UPGRADE PRO ───────────────────────────────────────────
export function upgradeProEmail(params: {
  name: string
  plan: 'pro' | 'team'
  amount: number
  invoiceUrl?: string
}) {
  const planLabel = params.plan === 'team' ? 'Team' : 'Pro'
  const content = `
    <h2 style="color:#1e40af;margin:0 0 8px;">Bienvenue dans le plan ${planLabel} ! ⭐</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Votre abonnement est actif</p>
    <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:8px;padding:20px;color:#fff;margin:0 0 20px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;opacity:0.85;">Plan actif</p>
      <p style="margin:0;font-size:28px;font-weight:700;">${planLabel}</p>
      <p style="margin:6px 0 0;font-size:15px;opacity:0.9;">${params.amount}€/mois</p>
    </div>
    <p>Vous avez maintenant accès à <strong>toutes les fonctionnalités</strong> :</p>
    <ul style="color:#374151;padding-left:20px;">
      <li>Projets <strong>illimités</strong></li>
      <li><strong>500 appels IA</strong>/mois (Sonnet premium)</li>
      <li>Templates Excel Pro (EVM, Dashboard, RAID, WBS, RACI)</li>
      <li>Simulateur PMP <strong>225 questions</strong> complètes</li>
      ${params.plan === 'team' ? '<li>Collaboration équipe temps réel</li>' : ''}
      <li>Export PDF professionnel illimité</li>
    </ul>
    ${params.invoiceUrl ? `
    <div style="text-align:center;margin:24px 0;">
      <a href="${params.invoiceUrl}" style="${btnStyle}">
        Télécharger ma facture →
      </a>
    </div>` : ''}
    <p style="font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:16px;">
      Pour gérer votre abonnement : 
      <a href="${EMAIL_CONFIG.appUrl}/billing" style="color:#3b82f6;">Mon espace facturation</a>
    </p>
  `
  return {
    subject: `🎉 Votre plan ${planLabel} est activé !`,
    html: baseLayout(content, `Plan ${planLabel} actif — accès complet débloqué`),
  }
}

// ── 4. RESET MOT DE PASSE ────────────────────────────────────
export function passwordResetEmail(params: { name: string; resetUrl: string }) {
  const content = `
    <h2 style="color:#1e40af;margin:0 0 8px;">Réinitialisation de mot de passe 🔐</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Une demande a été effectuée pour votre compte</p>
    <p>Bonjour <strong>${params.name}</strong>,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${params.resetUrl}" style="${btnStyle}">
        Réinitialiser mon mot de passe →
      </a>
    </div>
    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        ⚠️ Ce lien est valable <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email — votre compte reste sécurisé.
      </p>
    </div>
    <p style="font-size:13px;color:#6b7280;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
      <span style="color:#3b82f6;word-break:break-all;">${params.resetUrl}</span>
    </p>
  `
  return {
    subject: `Réinitialisation de votre mot de passe ${EMAIL_CONFIG.appName}`,
    html: baseLayout(content, 'Lien de réinitialisation de mot de passe'),
  }
}

// ── 5. PROJECT SHARED ────────────────────────────────────────
export function projectSharedEmail(params: {
  recipientName: string
  senderName: string
  projectName: string
  projectId: string
  role: string
}) {
  const content = `
    <h2 style="color:#1e40af;margin:0 0 8px;">Projet partagé avec vous 🤝</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">${params.senderName} vous invite à collaborer</p>
    <p>Bonjour <strong>${params.recipientName}</strong>,</p>
    <p><strong>${params.senderName}</strong> vous a donné accès au projet suivant :</p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0 0 4px;font-size:13px;color:#0369a1;">Projet</p>
      <p style="margin:0;font-size:18px;font-weight:700;color:#0c4a6e;">${params.projectName}</p>
      <p style="margin:6px 0 0;font-size:13px;color:#374151;">Rôle : <strong>${params.role}</strong></p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${EMAIL_CONFIG.appUrl}/projects/${params.projectId}" style="${btnStyle}">
        Accéder au projet →
      </a>
    </div>
  `
  return {
    subject: `${params.senderName} vous partage le projet "${params.projectName}"`,
    html: baseLayout(content, `Invitation à collaborer sur ${params.projectName}`),
  }
}

// ── 6. ALERT EMAIL ───────────────────────────────────────────
export function alertEmail(params: {
  email?: string
  projectName?: string
  alertType?: string
  message?: string
  actionLink?: string
}) {
  const title  = params.alertType || 'Alerte projet'
  const content = `
    <h2 style="color:#dc2626;margin:0 0 8px;">⚠️ ${title}</h2>
    ${params.projectName ? `<p style="color:#6b7280;font-size:14px;margin:0 0 16px;">Projet : <strong>${params.projectName}</strong></p>` : ''}
    <p style="color:#374151;line-height:1.6;">${params.message || 'Une alerte a été déclenchée sur votre projet.'}</p>
    ${params.actionLink ? `
    <div style="text-align:center;margin:24px 0;">
      <a href="${params.actionLink}" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        Voir l'alerte →
      </a>
    </div>` : ''}
  `
  return {
    subject: `⚠️ Alerte : ${title}${params.projectName ? ` — ${params.projectName}` : ''}`,
    html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
<div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:24px;text-align:center;">
  <h1 style="color:#fff;margin:0;font-size:20px;">📊 ${EMAIL_CONFIG.appName}</h1>
</div>
<div style="padding:28px;">${content}</div>
<div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;">
  © ${new Date().getFullYear()} ${EMAIL_CONFIG.appName}
</div>
</div>
</body></html>`,
  }
}

// ── 7. DOCUMENT EMAIL ────────────────────────────────────────
export function documentEmail(params: {
  email?: string
  name?: string
  docType?: string
  projectName?: string
  downloadLink?: string
}) {
  const content = `
    <h2 style="color:#1e40af;margin:0 0 8px;">📄 Document disponible</h2>
    ${params.name ? `<p>Bonjour <strong>${params.name}</strong>,</p>` : ''}
    <p>Un document${params.docType ? ` <strong>${params.docType}</strong>` : ''} est disponible${params.projectName ? ` pour le projet <strong>${params.projectName}</strong>` : ''} :</p>
    ${params.downloadLink ? `
    <div style="text-align:center;margin:24px 0;">
      <a href="${params.downloadLink}" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        Télécharger le document →
      </a>
    </div>` : ''}
  `
  return {
    subject: `📄 Document disponible${params.projectName ? ` — ${params.projectName}` : ''}`,
    html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
<div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:24px;text-align:center;">
  <h1 style="color:#fff;margin:0;font-size:20px;">📊 ${EMAIL_CONFIG.appName}</h1>
</div>
<div style="padding:28px;">${content}</div>
<div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;">
  © ${new Date().getFullYear()} ${EMAIL_CONFIG.appName}
</div>
</div>
</body></html>`,
  }
}

// ── 8. NEW PROJECT EMAIL (alias) ─────────────────────────────
export function newProjectEmail(params: {
  email?: string
  name?: string
  projectName?: string
  scenario?: string
}) {
  return projectCreatedEmail({
    name:        params.name || 'Utilisateur',
    projectName: params.projectName || 'Nouveau projet',
    projectId:   '',
    description: params.scenario,
  })
}
