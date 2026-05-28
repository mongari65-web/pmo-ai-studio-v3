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
      <div style="display:inline-flex;align-items:center;gap:10px;justify-content:center;margin-bottom:8px;">
        <img src="https://pmoai.studio/logo-pmo.svg" alt="PMO AI Studio" width="40" height="40" style="border-radius:10px;" />
        <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${EMAIL_CONFIG.appName}</h1>
      </div>
      <p style="color:#bfdbfe;margin:4px 0 0;font-size:12px;">L'outil PMO qui transforme vos projets en succès — de débutant à expert</p>
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
    <p>Avec votre compte <strong>Gratuit</strong>, vous pouvez :</p>
    <ul style="color:#374151;padding-left:20px;">
      <li>Créer <strong>1 projet actif</strong></li>
      <li>WBS simplifié, RACI basique</li>
      <li>Export PDF (1 seul)</li>
      <li><strong>10 générations IA</strong> (Claude Haiku)</li>
    </ul>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin:16px 0;">
      <p style="margin:0;font-size:13px;color:#1d4ed8;">
        💡 <strong>Passez au plan Starter (19€/mois)</strong> pour 3 projets et 50 générations IA, 
        ou au plan Pro (39€/mois) pour accéder à tous les outils PMO.
      </p>
    </div>
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
  plan: 'starter' | 'pro' | 'premium'
  amount?: number
  invoiceUrl?: string
}) {
  const planConfig: Record<string, { label: string; color: string; projects: string; aiGen: string; features: string[] }> = {
    starter: {
      label: 'Starter', color: '#36B37E',
      projects: '3 projets en parallèle', aiGen: '50 générations IA/mois',
      features: [
        '3 projets en parallèle',
        '50 générations IA/mois (Claude Haiku)',
        'WBS, RACI, Gantt inclus',
        'Export PDF',
        'Support email',
      ],
    },
    pro: {
      label: 'Pro', color: '#7B5EFF',
      projects: '10 projets en parallèle', aiGen: '150 générations IA/mois',
      features: [
        '10 projets en parallèle',
        '150 générations IA/mois (Claude Sonnet)',
        'Tous les outils PMO (WBS, Gantt, RAID, EVM, RACI, PERT)',
        'Export Excel + PDF + Word',
        'Templates sectoriels inclus',
        'Support prioritaire',
      ],
    },
    premium: {
      label: 'Premium', color: '#FF8C00',
      projects: '25 projets + historique', aiGen: '300 générations IA/mois',
      features: [
        '25 projets + historique',
        '300 générations IA/mois (Claude Sonnet)',
        'Simulateur certifications 225 questions',
        'Export PowerPoint inclus',
        'Templates sectoriels complets',
        'Support prioritaire',
      ],
    },
  }
  const cfg = planConfig[params.plan] ?? planConfig.pro
  const featuresHtml = cfg.features.map(f => `<li style="margin-bottom:6px;">${f}</li>`).join("")
  const emailContent = `
    <h2 style="color:${cfg.color};margin:0 0 8px;">Bienvenue dans le plan ${cfg.label} ! ⭐</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Votre abonnement est actif</p>
    <div style="background:linear-gradient(135deg,${cfg.color},${cfg.color}cc);border-radius:12px;padding:24px;color:#fff;margin:0 0 24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;opacity:0.85;">Plan actif</p>
      <p style="margin:0;font-size:30px;font-weight:800;">${cfg.label}</p>
      <p style="margin:6px 0 0;font-size:16px;opacity:0.9;">${params.amount ?? 39}€/mois</p>
      <p style="margin:8px 0 0;font-size:12px;opacity:0.75;">${cfg.projects} · ${cfg.aiGen}</p>
    </div>
    <p style="margin:0 0 12px;">Bonjour <strong>${params.name}</strong>,</p>
    <p style="margin:0 0 16px;">Vous avez maintenant accès aux fonctionnalités suivantes :</p>
    <ul style="color:#374151;padding-left:20px;margin:0 0 20px;">${featuresHtml}</ul>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin:0 0 20px;">
      <p style="margin:0;font-size:13px;color:#166534;">
        💡 <strong>Rappel :</strong> Vos outils PMO (WBS, Gantt, RAID, EVM...) sont sauvegardés et modifiables à tout moment sans consommer votre quota IA. Le quota s'applique uniquement aux nouvelles générations.
      </p>
    </div>
    ${params.invoiceUrl ? `<div style="text-align:center;margin:24px 0;"><a href="${params.invoiceUrl}" style="${btnStyle}">📄 Télécharger ma facture →</a></div>` : ""}
    <p style="font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:16px;margin:0;">
      Gérer votre abonnement : <a href="${EMAIL_CONFIG.appUrl}/settings" style="color:#3b82f6;">Mon espace facturation</a>
      &nbsp;·&nbsp;<a href="${EMAIL_CONFIG.appUrl}/dashboard" style="color:#3b82f6;">Dashboard</a>
    </p>
  `
  return {
    subject: `✅ Plan ${cfg.label} activé — PMO AI Studio`,
    html: baseLayout(emailContent, `Plan ${cfg.label} actif — ${cfg.aiGen}`),
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

// ── BROADCAST TEMPLATES ──────────────────────────────────────

// 9. NOUVELLE FONCTIONNALITÉ
export function newFeatureEmail(params: {
  name?: string
  featureTitle: string
  featureDescription: string
  featureUrl?: string
  plan?: string
}) {
  const name = params.name || 'Cher utilisateur'
  const content = `
    <h2 style="color:#1e40af;margin:0 0 6px;">🚀 Nouvelle fonctionnalité disponible !</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Découvrez ce qui vient d'être ajouté à votre espace</p>
    <p>Bonjour <strong>${name}</strong>,</p>
    <p>Une nouvelle fonctionnalité vient d'être déployée sur <strong>PMO AI Studio</strong> :</p>
    <div style="background:linear-gradient(135deg,rgba(59,130,246,0.08),rgba(168,85,247,0.08));border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:20px 24px;margin:20px 0;">
      <h3 style="color:#1e40af;margin:0 0 8px;font-size:18px;">✨ ${params.featureTitle}</h3>
      <p style="color:#374151;margin:0;line-height:1.7;">${params.featureDescription}</p>
    </div>
    ${params.plan ? `<p style="font-size:13px;color:#6b7280;">Disponible sur votre plan <strong>${params.plan}</strong></p>` : ''}
    <div style="text-align:center;margin:28px 0;">
      <a href="${params.featureUrl || EMAIL_CONFIG.appUrl + '/dashboard'}"
        style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
        Découvrir maintenant →
      </a>
    </div>
  `
  return {
    subject: `🚀 Nouveau : ${params.featureTitle}`,
    html: baseLayout(content, `Nouvelle fonctionnalité : ${params.featureTitle}`),
  }
}

// 10. UPSELL FREE → PRO
export function upsellProEmail(params: { name?: string; currentPlan?: string }) {
  const name = params.name || 'Cher utilisateur'
  const content = `
    <h2 style="color:#7B5EFF;margin:0 0 6px;">⚡ Passez au niveau supérieur</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Débloquez tout le potentiel de PMO AI Studio</p>
    <p>Bonjour <strong>${name}</strong>,</p>
    <p>Vous utilisez actuellement le plan <strong>${params.currentPlan || 'Gratuit'}</strong>. Voici ce que vous manquez :</p>
    <div style="display:grid;gap:10px;margin:20px 0;">
      ${[
        ['10 projets en parallèle', 'vs 1 projet gratuit'],
        ['200 requêtes IA/mois avec Claude Sonnet', 'vs 5 requêtes Haiku'],
        ['Tous les outils PMO (10+)', 'WBS, Gantt, RAID, PERT, EVM...'],
        ['Export Excel, PDF, Word', 'vs PDF uniquement'],
        ['Templates sectoriels', 'IT, Construction, Finance...'],
      ].map(([feat, detail]) => `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(123,94,255,0.06);border:1px solid rgba(123,94,255,0.15);border-radius:8px;">
          <span style="color:#7B5EFF;font-size:18px;flex-shrink:0;">✓</span>
          <div>
            <p style="margin:0;font-weight:600;color:#1f2937;font-size:14px;">${feat}</p>
            <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">${detail}</p>
          </div>
        </div>`).join('')}
    </div>
    <div style="background:linear-gradient(135deg,#7B5EFF,#3b82f6);border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
      <p style="color:#fff;margin:0 0 4px;font-size:13px;opacity:0.9;">Plan Pro</p>
      <p style="color:#fff;margin:0;font-size:32px;font-weight:800;">17€<span style="font-size:16px;opacity:0.8;">/mois</span></p>
      <a href="${EMAIL_CONFIG.appUrl}/pricing"
        style="display:inline-block;background:#fff;color:#7B5EFF;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:14px;">
        Passer au Pro →
      </a>
    </div>
    <p style="font-size:12px;color:#9ca3af;text-align:center;">Annulation à tout moment · 7 jours d'essai gratuit</p>
  `
  return {
    subject: `⚡ ${name}, débloquez 10x plus de puissance PMO`,
    html: baseLayout(content, 'Passez au plan Pro — 7 jours gratuits'),
  }
}

// 11. RÉPONSE FEEDBACK
export function feedbackResponseEmail(params: {
  name?: string
  originalFeedback: string
  response: string
  senderName?: string
}) {
  const name = params.name || 'Cher utilisateur'
  const content = `
    <h2 style="color:#1e40af;margin:0 0 6px;">💬 Réponse à votre feedback</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">L'équipe PMO AI Studio vous répond</p>
    <p>Bonjour <strong>${name}</strong>,</p>
    <p>Merci pour votre retour ! Voici notre réponse :</p>
    <div style="background:#f9fafb;border-left:3px solid #d1d5db;border-radius:0 8px 8px 0;padding:14px 16px;margin:16px 0;">
      <p style="font-size:11px;color:#9ca3af;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em;">Votre feedback</p>
      <p style="color:#6b7280;font-size:13px;margin:0;font-style:italic;">"${params.originalFeedback}"</p>
    </div>
    <div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:8px;padding:16px;margin:16px 0;">
      <p style="font-size:11px;color:#16a34a;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Notre réponse</p>
      <p style="color:#374151;margin:0;line-height:1.7;">${params.response}</p>
      ${params.senderName ? `<p style="margin:12px 0 0;font-size:13px;color:#6b7280;">— <strong>${params.senderName}</strong>, équipe PMO AI Studio</p>` : ''}
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${EMAIL_CONFIG.appUrl}/dashboard"
        style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        Retourner sur l'app →
      </a>
    </div>
  `
  return {
    subject: `💬 Réponse à votre feedback — PMO AI Studio`,
    html: baseLayout(content, 'Réponse à votre feedback'),
  }
}

// 12. RÉPONSE RÉCLAMATION
export function complaintResponseEmail(params: {
  name?: string
  complaintSubject: string
  response: string
  resolution?: string
  senderName?: string
}) {
  const name = params.name || 'Cher utilisateur'
  const content = `
    <h2 style="color:#dc2626;margin:0 0 6px;">🔧 Traitement de votre réclamation</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Nous prenons votre retour très au sérieux</p>
    <p>Bonjour <strong>${name}</strong>,</p>
    <p>Nous avons bien reçu votre réclamation concernant : <strong>${params.complaintSubject}</strong></p>
    <div style="background:rgba(239,68,68,0.04);border:1px solid rgba(239,68,68,0.15);border-radius:8px;padding:16px;margin:16px 0;">
      <p style="font-size:11px;color:#dc2626;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Notre réponse</p>
      <p style="color:#374151;margin:0;line-height:1.7;">${params.response}</p>
    </div>
    ${params.resolution ? `
    <div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:8px;padding:16px;margin:16px 0;">
      <p style="font-size:11px;color:#16a34a;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">✅ Résolution</p>
      <p style="color:#374151;margin:0;line-height:1.7;">${params.resolution}</p>
    </div>` : ''}
    ${params.senderName ? `<p style="font-size:13px;color:#6b7280;">— <strong>${params.senderName}</strong>, équipe PMO AI Studio</p>` : ''}
    <div style="text-align:center;margin:24px 0;">
      <a href="mailto:support@pmoai.studio"
        style="display:inline-block;background:#f3f4f6;color:#374151;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;border:1px solid #e5e7eb;">
        Répondre à ce message
      </a>
    </div>
  `
  return {
    subject: `🔧 Réclamation traitée — ${params.complaintSubject}`,
    html: baseLayout(content, 'Traitement de votre réclamation'),
  }
}

// 13. DIGEST HEBDOMADAIRE
export function weeklyDigestEmail(params: {
  name?: string
  projectCount: number
  aiCallsUsed: number
  aiCallsLimit: number
  topProject?: string
  tips?: string[]
  plan?: string
}) {
  const name = params.name || 'Cher utilisateur'
  const usagePercent = Math.round(params.aiCallsUsed / params.aiCallsLimit * 100)
  const usageColor = usagePercent > 80 ? '#ef4444' : usagePercent > 60 ? '#f59e0b' : '#22c55e'
  const content = `
    <h2 style="color:#1e40af;margin:0 0 6px;">📊 Votre résumé de la semaine</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">${new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}</p>
    <p>Bonjour <strong>${name}</strong>, voici votre activité PMO cette semaine :</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0;">
      <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:16px;text-align:center;">
        <p style="font-size:32px;font-weight:800;color:#3b82f6;margin:0;">${params.projectCount}</p>
        <p style="font-size:12px;color:#6b7280;margin:4px 0 0;">Projets actifs</p>
      </div>
      <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);border-radius:10px;padding:16px;text-align:center;">
        <p style="font-size:32px;font-weight:800;color:#a855f7;margin:0;">${params.aiCallsUsed}</p>
        <p style="font-size:12px;color:#6b7280;margin:4px 0 0;">Requêtes IA utilisées</p>
      </div>
    </div>
    <div style="margin:16px 0;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-size:12px;color:#6b7280;">Quota IA mensuel</span>
        <span style="font-size:12px;font-weight:700;color:${usageColor};">${params.aiCallsUsed}/${params.aiCallsLimit} (${usagePercent}%)</span>
      </div>
      <div style="height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
        <div style="width:${usagePercent}%;height:100%;background:${usageColor};border-radius:4px;"></div>
      </div>
    </div>
    ${params.topProject ? `
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin:16px 0;">
      <p style="font-size:11px;color:#9ca3af;margin:0 0 4px;text-transform:uppercase;">Projet le plus actif</p>
      <p style="font-weight:700;color:#1f2937;margin:0;">📁 ${params.topProject}</p>
    </div>` : ''}
    ${params.tips && params.tips.length > 0 ? `
    <div style="margin:20px 0;">
      <p style="font-weight:700;color:#1f2937;margin:0 0 10px;">💡 Conseils de la semaine</p>
      ${params.tips.map(tip => `
        <div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #f3f4f6;">
          <span style="color:#3b82f6;flex-shrink:0;">→</span>
          <p style="margin:0;font-size:13px;color:#374151;">${tip}</p>
        </div>`).join('')}
    </div>` : ''}
    ${usagePercent > 80 ? `
    <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:14px;margin:16px 0;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#dc2626;">⚠️ Vous approchez de votre limite IA mensuelle</p>
      <a href="${EMAIL_CONFIG.appUrl}/pricing" style="display:inline-block;background:#dc2626;color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;">Augmenter mon quota</a>
    </div>` : ''}
    <div style="text-align:center;margin:24px 0;">
      <a href="${EMAIL_CONFIG.appUrl}/dashboard"
        style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        Accéder à mon dashboard →
      </a>
    </div>
  `
  return {
    subject: `📊 Votre résumé PMO — semaine du ${new Date().toLocaleDateString('fr-FR')}`,
    html: baseLayout(content, 'Résumé hebdomadaire PMO'),
  }
}
