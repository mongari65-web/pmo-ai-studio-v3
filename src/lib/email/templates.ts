// src/lib/email/templates.ts
// Templates email PMO AI Studio — design pro avec logo

const LOGO_SVG = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="40" rx="10" fill="#1a1f3a"/>
  <circle cx="20" cy="10" r="3.5" fill="#22c55e"/>
  <circle cx="32" cy="18" r="3.5" fill="#f59e0b"/>
  <circle cx="32" cy="30" r="3.5" fill="#ef4444"/>
  <circle cx="20" cy="36" r="3.5" fill="#3b82f6"/>
  <circle cx="8" cy="30" r="3.5" fill="#a855f7"/>
  <circle cx="8" cy="18" r="3.5" fill="#06b6d4"/>
  <circle cx="20" cy="20" r="5" fill="#312e81" stroke="#7B5EFF" stroke-width="1.5"/>
  <text x="20" y="23" text-anchor="middle" fill="#B8A4FF" font-size="5" font-weight="bold" font-family="Arial">PMO</text>
  <line x1="20" y1="13.5" x2="20" y2="15" stroke="#22c55e" stroke-width="1.2"/>
  <line x1="28.5" y1="20.5" x2="25" y2="21.5" stroke="#f59e0b" stroke-width="1.2"/>
  <line x1="28.5" y1="28" x2="25" y2="26" stroke="#ef4444" stroke-width="1.2"/>
  <line x1="20" y1="31" x2="20" y2="26.5" stroke="#3b82f6" stroke-width="1.2"/>
  <line x1="11.5" y1="28" x2="15" y2="26" stroke="#a855f7" stroke-width="1.2"/>
  <line x1="11.5" y1="20.5" x2="15" y2="21.5" stroke="#06b6d4" stroke-width="1.2"/>
</svg>`

const baseLayout = (content: string, preheader = "") => `
<!DOCTYPE<!DOCTYPE<!DOCTYPE<!DOCTYPE<!DOCTYPE<!DOCTYPE<!DO-8<!DOCTYPE<!DOCTYPE<!DOCTYPE<!DOCTYPE<!DOCTYPE<!DOidth, initial-scale=1.0"/>
<title>PMO AI Studio</title>
</head>
<body style="margin:0;padding:0;background:#0A0B14;font-family:'Inter',Arial,sans-serif;color:#F0F2FF;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0B14;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- HEADER -->
      <tr><td style="background:linear-gradient(135deg,#0d1b2e,#1a2744);border-radius:16px 16px 0 0;padding:28px 32px;border-bottom:1px solid rgba(123,94,255,0.3);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;">
              ${LOGO_SVG}
            </td>
            <td style="vertical-align:middle;padding-left:12px;">
              <div style="font-size:18px;font-weight:700;color:#F0F2FF;">PMO AI Studio</div>
              <div style="font-size:11px;color:#7B5EFF;margin-top:2px;font-style:italic;">Pilotez. Apprenez. Excellez.</div>
            </td>
            <td align="right" style="vertical-align:middle;">
              <span style="background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);border-radius:20px;padding:4px 12px;font-size:11px;color:#22c55e;font-weight:600;">&#9679; En ligne</span>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- CONTENT -->
      <tr><td style="background:#0F1117;padding:32px;border-left:1px solid rgba(123,94,255,0.15);border-right:1px solid rgba(123,94,255,0.15);">
        ${content}
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="background:#080A11;border-radius:0 0 16px 16px;padding:20px 32px;border-top:1px solid rgba(123,94,255,0.2);border:1px solid rgba(123,94,255,0.15);border-top:none;">
        <p style="font-size:11px;color:#5A6080;margin:0 0 6px;text-align:center;">
          PMO AI Studio &mdash; Touil Abdelhafid, Paris &mdash; 
          <a href="https://pmo-ai-studio-v3.vercel.app" style="color:#7B5EFF;text-decoration:none;">pmo-ai-studio-v3.vercel.app</a>
        </p>
        <p style="font-size:10px;color:#3A4060;margin:0;text-align:center;">
          PMP&reg; et PMBOK&reg; sont des marques d&eacute;pos&eacute;es du PMI. PMO AI Studio est ind&eacute;pendant du PMI.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`

// ── 1. EMAIL BIENVENUE ────────────────────────────────────────────────────────
export const welcomeEmail = (name: string) => baseLayout(`
  <h1 style="font-size:22px;font-weight:800;color:#F0F2FF;margin:0 0 8px;">
    Bienvenue, ${name} ! &#127881;
  </h1>
  <p style="font-size:14px;color:#B8BCDC;line-height:1.7;margin:0 0 24px;">
    Votre compte PMO AI Studio est actif. Vous avez acc&egrave;s &agrave; votre copilote IA pour piloter, apprendre et exceller dans la gestion de projet.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:rgba(123,94,255,0.08);border:1px solid rgba(123,94,255,0.2);border-radius:12px;padding:16px;">
        <p style="font-size:13px;font-weight:700;color:#9B84FF;margin:0 0 10px;">&#128640; Pour bien d&eacute;marrer :</p>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="padding:4px 0;font-size:13px;color:#B8BCDC;">&#10003;&nbsp; Cr&eacute;ez votre premier projet via le <strong>Guide CP</strong></td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#B8BCDC;">&#10003;&nbsp; G&eacute;n&eacute;rez votre WBS en moins de 30 secondes</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#B8BCDC;">&#10003;&nbsp; Activez le suivi EVM pour piloter votre budget</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#B8BCDC;">&#10003;&nbsp; Pr&eacute;parez votre PMP&reg; avec le simulateur 225 questions</td></tr>
        </table>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <a href="https://pmo-ai-studio-v3.vercel.app/guide" style="display:inline-block;background:#7B5EFF;color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:24px;text-decoration:none;">
          &#127775; Cr&eacute;er mon premier projet
        </a>
      </td>
    </tr>
  </table>
`, "Bienvenue sur PMO AI Studio — votre copilote IA est prêt !")

// ── 2. EMAIL INVITATION PROJET ────────────────────────────────────────────────
export const inviteEmail = (inviter: string, projectName: string, role: string, inviteLink: string) => baseLayout(`
  <h1 style="font-size:20px;font-weight:800;color:#F0F2FF;margin:0 0 8px;">
    &#129309; Invitation &agrave; collaborer
  </h1>
  <p style="font-size:14px;color:#B8BCDC;line-height:1.7;margin:0 0 20px;">
    <strong style="color:#F0F2FF;">${inviter}</strong> vous invite &agrave; rejoindre le projet 
    <strong style="color:#9B84FF;">${projectName}</strong> en tant que <strong style="color:#22c55e;">${role}</strong>.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:16px;">
        <p style="font-size:12px;color:#22c55e;font-weight:700;margin:0 0 6px;">PROJET</p>
        <p style="font-size:16px;color:#F0F2FF;font-weight:700;margin:0 0 4px;">${projectName}</p>
        <p style="font-size:12px;color:#B8BCDC;margin:0;">R&ocirc;le assign&eacute; : <strong>${role}</strong></p>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <a href="${inviteLink}" style="display:inline-block;background:#7B5EFF;color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:24px;text-decoration:none;">
          &#128279; Acc&eacute;der au projet
        </a>
      </td>
    </tr>
  </table>
  <p style="font-size:11px;color:#5A6080;text-align:center;margin-top:16px;">
    Si vous n&apos;attendiez pas cette invitation, vous pouvez ignorer cet email.
  </p>
`, `Invitation : rejoignez ${projectName} sur PMO AI Studio`)

// ── 3. EMAIL RÉSUMÉ HEBDO ────────────────────────────────────────────────────
export const weeklyEmail = (projectName: string, score: number, avancement: number, cpi: number, spi: number, alerts: string[]) => {
  const scoreColor = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444"
  const scoreLabel = score >= 70 ? "VERT" : score >= 40 ? "AMBRE" : "ROUGE"
  const scoreBg = score >= 70 ? "rgba(34,197,94,0.08)" : score >= 40 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)"
  const scoreBorder = score >= 70 ? "rgba(34,197,94,0.2)" : score >= 40 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"

  return baseLayout(`
  <h1 style="font-size:20px;font-weight:800;color:#F0F2FF;margin:0 0 4px;">
    &#128202; R&eacute;sum&eacute; hebdomadaire
  </h1>
  <p style="font-size:13px;color:#8B90B0;margin:0 0 20px;">${projectName}</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr>
      <td style="background:${scoreBg};border:1px solid ${scoreBorder};border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:32px;font-weight:800;color:${scoreColor};">${score}/100</div>
        <div style="font-size:12px;color:${scoreColor};font-weight:700;margin-top:4px;">Statut ${scoreLabel}</div>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom:20px;">
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="font-size:13px;color:#8B90B0;">Avancement</td>
      <td align="right" style="font-size:13px;color:#F0F2FF;font-weight:700;">${avancement}%</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="font-size:13px;color:#8B90B0;">CPI (Performance co&ucirc;t)</td>
      <td align="right" style="font-size:13px;color:${cpi >= 1 ? "#22c55e" : "#ef4444"};font-weight:700;">${cpi}</td>
    </tr>
    <tr>
      <td style="font-size:13px;color:#8B90B0;">SPI (Performance d&eacute;lai)</td>
      <td align="right" style="font-size:13px;color:${spi >= 1 ? "#22c55e" : "#ef4444"};font-weight:700;">${spi}</td>
    </tr>
  </table>

  ${alerts.length > 0 ? `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr>
      <td style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px;">
        <p style="font-size:12px;color:#ef4444;font-weight:700;margin:0 0 8px;">&#9888; Points d&apos;attention</p>
        ${alerts.map(a => `<p style="font-size:12px;color:#B8BCDC;margin:3px 0;">&#8226; ${a}</p>`).join("")}
      </td>
    </tr>
  </table>` : ""}

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <a href="https://pmo-ai-studio-v3.vercel.app/dashboard" style="display:inline-block;background:#7B5EFF;color:#fff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:24px;text-decoration:none;">
          &#128200; Voir le tableau de bord
        </a>
      </td>
    </tr>
  </table>
`, `Résumé hebdo — ${projectName} — Score ${score}/100`)
}

// ── 4. EMAIL EXPORT DOCUMENT ─────────────────────────────────────────────────
export const documentEmail = (name: string, docType: string, projectName: string, downloadLink: string) => baseLayout(`
  <h1 style="font-size:20px;font-weight:800;color:#F0F2FF;margin:0 0 8px;">
    &#128196; Document pr&ecirc;t &agrave; t&eacute;l&eacute;charger
  </h1>
  <p style="font-size:14px;color:#B8BCDC;line-height:1.7;margin:0 0 20px;">
    Votre document <strong style="color:#9B84FF;">${docType}</strong> pour le projet 
    <strong style="color:#F0F2FF;">${projectName}</strong> est pr&ecirc;t.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:rgba(123,94,255,0.08);border:1px solid rgba(123,94,255,0.2);border-radius:12px;padding:16px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:32px;padding-right:16px;">&#128196;</td>
            <td>
              <p style="font-size:14px;font-weight:700;color:#F0F2FF;margin:0;">${docType}</p>
              <p style="font-size:12px;color:#8B90B0;margin:4px 0 0;">${projectName}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <a href="${downloadLink}" style="display:inline-block;background:#7B5EFF;color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:24px;text-decoration:none;">
          &#11015; T&eacute;l&eacute;charger le document
        </a>
      </td>
    </tr>
  </table>
`, `Votre ${docType} est prêt — ${projectName}`)

// ── 5. EMAIL ALERTE PROJET ────────────────────────────────────────────────────
export const alertEmail = (projectName: string, alertType: string, message: string, actionLink: string) => {
  const isRed = alertType === "ROUGE" || alertType === "CRITIQUE"
  const color = isRed ? "#ef4444" : "#f59e0b"
  const bg = isRed ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)"
  const border = isRed ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"

  return baseLayout(`
  <h1 style="font-size:20px;font-weight:800;color:#F0F2FF;margin:0 0 8px;">
    &#9888; Alerte projet — ${alertType}
  </h1>
  <p style="font-size:13px;color:#8B90B0;margin:0 0 20px;">${projectName}</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:${bg};border:2px solid ${border};border-radius:12px;padding:20px;">
        <p style="font-size:13px;font-weight:700;color:${color};margin:0 0 8px;">${alertType}</p>
        <p style="font-size:13px;color:#B8BCDC;margin:0;line-height:1.6;">${message}</p>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <a href="${actionLink}" style="display:inline-block;background:${color};color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:24px;text-decoration:none;">
          &#128269; Voir le projet
        </a>
      </td>
    </tr>
  </table>
`, `Alerte ${alertType} — ${projectName}`)
}

// ── 6. EMAIL NOUVEAU PROJET ───────────────────────────────────────────────────
export const newProjectEmail = (name: string, projectName: string, scenario: string) => {
  const steps: Record<string, {icon:string, label:string, desc:string, tip:string}[]> = {
    initiation: [
      { icon:"📋", label:"1. WBS — Structure de découpage", desc:"Générez votre WBS en premier. C'est la colonne vertébrale du projet.", tip:"Conseil CP : Un WBS complet évite 80% des oublis de périmètre. Vérifiez que chaque livrable est mesurable." },
      { icon:"📅", label:"2. Gantt — Planning", desc:"Créez le planning à partir du WBS. Chaque tâche WBS devient une ligne Gantt.", tip:"Conseil CP : Identifiez le chemin critique. Les tâches sans marge sont vos risques planning majeurs." },
      { icon:"⚠️", label:"3. RAID — Risques et hypothèses", desc:"Documentez les risques dès le démarrage, pas en cours de route.", tip:"Conseil CP : Un risque identifié est à moitié géré. Évaluez probabilité × impact pour prioriser." },
      { icon:"💰", label:"4. Budget EVM — Valeur planifiée", desc:"Saisissez le BAC et planifiez la courbe S de valeur planifiée.", tip:"Conseil CP : La courbe S doit être réaliste — évitez le hockey stick (tout à la fin)." },
      { icon:"👥", label:"5. RACI — Responsabilités", desc:"Définissez qui fait quoi avant de commencer l'exécution.", tip:"Conseil CP : Chaque livrable doit avoir exactement 1 Accountable. Sinon, personne n'est vraiment responsable." },
      { icon:"📦", label:"6. Work Packages — Lots de travaux", desc:"Décomposez le WBS en lots de travaux assignables et estimables.", tip:"Conseil CP : Un Work Package bien défini = une estimation fiable = un planning crédible." },
    ],
    reprise: [
      { icon:"📊", label:"1. Budget EVM — État actuel", desc:"Commencez par l'EVM. Saisissez CPI et SPI actuels pour diagnostiquer.", tip:"Conseil CP : CPI < 1 = dépassement. SPI < 1 = retard. Ces deux indices résument l'état de santé." },
      { icon:"⚠️", label:"2. RAID — Risques actifs", desc:"Mettez à jour le registre des risques avec les problèmes connus.", tip:"Conseil CP : En reprise, les risques sont souvent déjà des problèmes. Traitez-les en RAID comme Issues." },
      { icon:"📋", label:"3. WBS — Révision périmètre", desc:"Vérifiez que le WBS correspond à la réalité actuelle du projet.", tip:"Conseil CP : Le scope creep est la 1ère cause de dépassement. Comparez WBS initial vs réel." },
      { icon:"📅", label:"4. Gantt — Replanification", desc:"Mettez à jour le planning avec les dates réelles et les nouvelles estimations.", tip:"Conseil CP : Soyez honnête sur les délais. Un planning optimiste non tenu détruit la confiance." },
    ],
    sauvetage: [
      { icon:"⚠️", label:"1. RAID — Problèmes critiques", desc:"Documentez TOUS les blocages. C'est la priorité absolue en mode crise.", tip:"Conseil CP : En crise, la transparence sauve les projets. Masquer les problèmes les aggrave." },
      { icon:"📊", label:"2. Budget EVM — Diagnostic", desc:"Analysez l'EAC (coût à terminaison) et les scénarios de récupération.", tip:"Conseil CP : Présentez 3 scénarios au commanditaire : optimiste, réaliste, pessimiste." },
      { icon:"📅", label:"3. Gantt — Plan de redressement", desc:"Créez un nouveau planning avec jalons de contrôle rapprochés.", tip:"Conseil CP : En mode sauvetage, les jalons de contrôle toutes les 2 semaines sont indispensables." },
    ],
    audit: [
      { icon:"📋", label:"1. WBS — Périmètre audit", desc:"Structurez votre WBS d'audit avec les domaines à évaluer.", tip:"Conseil CP : Un WBS d'audit bien structuré garantit une couverture exhaustive du périmètre." },
      { icon:"⚠️", label:"2. RAID — Constats et risques", desc:"Documentez les constats comme des risques ou problèmes dans le RAID.", tip:"Conseil CP : Chaque constat doit avoir une recommandation actionnable. Un constat sans action ne sert à rien." },
      { icon:"📊", label:"3. Budget — Coût vs valeur", desc:"Analysez le rapport coût/valeur du projet audité.", tip:"Conseil CP : La question centrale est : le Business Case est-il toujours justifié ?" },
    ],
  }

  const scenarioSteps = steps[scenario] ?? steps.initiation
  const stepsHtml = scenarioSteps.map(s => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="font-size:24px;padding-right:14px;vertical-align:top;width:36px;">${s.icon}</td>
            <td>
              <p style="font-size:13px;font-weight:700;color:#F0F2FF;margin:0 0 3px;">${s.label}</p>
              <p style="font-size:12px;color:#B8BCDC;margin:0 0 6px;line-height:1.5;">${s.desc}</p>
              <p style="font-size:11px;color:#7B5EFF;margin:0;font-style:italic;line-height:1.5;">&#128161; ${s.tip}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("")

  return baseLayout(`
  <h1 style="font-size:20px;font-weight:800;color:#F0F2FF;margin:0 0 4px;">
    &#127775; Nouveau projet cr&eacute;&eacute; !
  </h1>
  <p style="font-size:13px;color:#8B90B0;margin:0 0 20px;">${projectName}</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr>
      <td style="background:rgba(123,94,255,0.08);border:1px solid rgba(123,94,255,0.2);border-radius:12px;padding:16px;">
        <p style="font-size:13px;color:#9B84FF;font-weight:700;margin:0 0 4px;">Bonjour ${name},</p>
        <p style="font-size:13px;color:#B8BCDC;margin:0;line-height:1.6;">
          Votre projet <strong style="color:#F0F2FF;">${projectName}</strong> est cr&eacute;&eacute;. 
          Voici le guide de g&eacute;n&eacute;ration des outils dans l&apos;ordre recommand&eacute; par les meilleures pratiques PMO.
        </p>
      </td>
    </tr>
  </table>

  <p style="font-size:12px;font-weight:700;color:#9B84FF;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">
    Ordre de g&eacute;n&eacute;ration recommand&eacute;
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    ${stepsHtml}
  </table>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <a href="https://pmo-ai-studio-v3.vercel.app/projects" style="display:inline-block;background:#7B5EFF;color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:24px;text-decoration:none;">
          &#128640; D&eacute;marrer mon projet
        </a>
      </td>
    </tr>
  </table>
`, `Projet créé : ${projectName} — Guide de démarrage PMO`)
}
