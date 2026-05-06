const ANTHROPIC_API = "https://api.anthropic.com/v1/messages"

export interface GenerateOptions {
  tool: string
  projectName: string
  projectDescription?: string
  budget?: string
  startDate?: string
  endDate?: string
}

// ── Prompts complets en 1 seul appel ─────────────────────────────
function buildPrompt(tool: string, o: GenerateOptions): string {
  const n = o.projectName
  const d = o.projectDescription ?? "projet IT"
  const s = o.startDate ?? "2025-01-01"
  const e = o.endDate ?? "2025-12-31"
  const b = o.budget ?? "100000"

  const prompts: Record<string, string> = {
    wbs: `PMBOK expert. WBS pour "${n}" (${d}).
JSON UNIQUEMENT - pas de texte avant ou après:
{"items":[
{"id":"1","code":"1.0","name":"Gestion de projet","level":1,"description":"Pilotage global","deliverable":"Rapports avancement","responsible":"Chef de Projet","duration":"12 mois","budget":"15000","dependencies":""},
{"id":"2","code":"1.1","name":"Initialisation","level":2,"description":"Lancement projet","deliverable":"Charte projet","responsible":"Chef de Projet","duration":"2 sem","budget":"3000","dependencies":""},
{"id":"3","code":"1.2","name":"Planification","level":2,"description":"Planning détaillé","deliverable":"Plan projet","responsible":"Chef de Projet","duration":"3 sem","budget":"4000","dependencies":"1.1"},
{"id":"4","code":"2.0","name":"Analyse","level":1,"description":"Analyse existant","deliverable":"Rapport analyse","responsible":"Architecte","duration":"4 sem","budget":"12000","dependencies":"1.1"},
{"id":"5","code":"2.1","name":"Audit infrastructure","level":2,"description":"Audit technique","deliverable":"Rapport audit","responsible":"Architecte","duration":"2 sem","budget":"6000","dependencies":"1.2"},
{"id":"6","code":"2.2","name":"Analyse des risques","level":2,"description":"Identification risques","deliverable":"Registre RAID","responsible":"Chef de Projet","duration":"1 sem","budget":"2000","dependencies":"2.1"},
{"id":"7","code":"3.0","name":"Conception","level":1,"description":"Design solution","deliverable":"Dossier conception","responsible":"Architecte","duration":"6 sem","budget":"20000","dependencies":"2.0"},
{"id":"8","code":"3.1","name":"Architecture technique","level":2,"description":"Schéma archi","deliverable":"DAT","responsible":"Architecte","duration":"3 sem","budget":"10000","dependencies":"2.2"},
{"id":"9","code":"3.2","name":"Conception détaillée","level":2,"description":"Specs techniques","deliverable":"Dossier technique","responsible":"Tech Lead","duration":"3 sem","budget":"10000","dependencies":"3.1"},
{"id":"10","code":"4.0","name":"Réalisation","level":1,"description":"Développement","deliverable":"Application","responsible":"Tech Lead","duration":"16 sem","budget":"40000","dependencies":"3.0"},
{"id":"11","code":"4.1","name":"Développement","level":2,"description":"Coding","deliverable":"Code source","responsible":"Dev Team","duration":"12 sem","budget":"30000","dependencies":"3.2"},
{"id":"12","code":"4.2","name":"Tests","level":2,"description":"Tests & recette","deliverable":"PV recette","responsible":"QA","duration":"4 sem","budget":"10000","dependencies":"4.1"},
{"id":"13","code":"5.0","name":"Déploiement","level":1,"description":"Mise en production","deliverable":"Go-live","responsible":"Chef de Projet","duration":"2 sem","budget":"8000","dependencies":"4.0"},
{"id":"14","code":"5.1","name":"Migration données","level":2,"description":"Migration DB","deliverable":"Données migrées","responsible":"DBA","duration":"1 sem","budget":"4000","dependencies":"4.2"},
{"id":"15","code":"5.2","name":"Formation utilisateurs","level":2,"description":"Formation","deliverable":"Support formation","responsible":"Chef de Projet","duration":"1 sem","budget":"4000","dependencies":"5.1"}
]}`,

    gantt: `Planning Gantt pour "${n}". Période: ${s} → ${e}.
JSON UNIQUEMENT:
{"tasks":[
{"id":"T1","wbs":"1.0","name":"Initialisation projet","phase":"Phase 1 — Init","start":"${s}","end":"2025-01-31","duration":15,"responsible":"Chef de Projet","progress":100,"dependencies":"","critical":true},
{"id":"T2","wbs":"1.1","name":"Réunion de lancement","phase":"Phase 1 — Init","start":"2025-01-05","end":"2025-01-10","duration":5,"responsible":"Chef de Projet","progress":100,"dependencies":"","critical":false},
{"id":"T3","wbs":"1.2","name":"Rédaction charte projet","phase":"Phase 1 — Init","start":"2025-01-10","end":"2025-01-20","duration":10,"responsible":"Chef de Projet","progress":100,"dependencies":"T2","critical":true},
{"id":"T4","wbs":"2.0","name":"Audit infrastructure","phase":"Phase 2 — Analyse","start":"2025-02-01","end":"2025-02-28","duration":20,"responsible":"Architecte","progress":80,"dependencies":"T3","critical":true},
{"id":"T5","wbs":"2.1","name":"Analyse des besoins","phase":"Phase 2 — Analyse","start":"2025-02-01","end":"2025-02-15","duration":10,"responsible":"Business Analyst","progress":90,"dependencies":"T3","critical":false},
{"id":"T6","wbs":"2.2","name":"Identification des risques","phase":"Phase 2 — Analyse","start":"2025-02-15","end":"2025-02-28","duration":10,"responsible":"Chef de Projet","progress":60,"dependencies":"T5","critical":false},
{"id":"T7","wbs":"3.0","name":"Architecture technique","phase":"Phase 3 — Conception","start":"2025-03-01","end":"2025-04-15","duration":30,"responsible":"Architecte","progress":40,"dependencies":"T4","critical":true},
{"id":"T8","wbs":"3.1","name":"Conception détaillée","phase":"Phase 3 — Conception","start":"2025-04-01","end":"2025-04-30","duration":20,"responsible":"Tech Lead","progress":20,"dependencies":"T7","critical":false},
{"id":"T9","wbs":"4.0","name":"Développement backend","phase":"Phase 4 — Réalisation","start":"2025-05-01","end":"2025-07-31","duration":60,"responsible":"Dev Team","progress":0,"dependencies":"T8","critical":true},
{"id":"T10","wbs":"4.1","name":"Développement frontend","phase":"Phase 4 — Réalisation","start":"2025-05-15","end":"2025-07-15","duration":45,"responsible":"Dev Team","progress":0,"dependencies":"T8","critical":false},
{"id":"T11","wbs":"4.2","name":"Tests unitaires","phase":"Phase 4 — Réalisation","start":"2025-07-01","end":"2025-08-15","duration":30,"responsible":"QA","progress":0,"dependencies":"T9","critical":false},
{"id":"T12","wbs":"4.3","name":"Tests d'intégration","phase":"Phase 4 — Réalisation","start":"2025-08-01","end":"2025-09-15","duration":30,"responsible":"QA","progress":0,"dependencies":"T11","critical":true},
{"id":"T13","wbs":"5.0","name":"Recette utilisateurs","phase":"Phase 5 — Déploiement","start":"2025-09-15","end":"2025-10-15","duration":20,"responsible":"Chef de Projet","progress":0,"dependencies":"T12","critical":true},
{"id":"T14","wbs":"5.1","name":"Migration données","phase":"Phase 5 — Déploiement","start":"2025-10-01","end":"2025-10-20","duration":15,"responsible":"DBA","progress":0,"dependencies":"T13","critical":true},
{"id":"T15","wbs":"5.2","name":"Mise en production","phase":"Phase 5 — Déploiement","start":"2025-10-20","end":"2025-10-31","duration":8,"responsible":"Chef de Projet","progress":0,"dependencies":"T14","critical":true}
]}`,

    raid: `RAID register pour "${n}" (${d}).
JSON UNIQUEMENT:
{"items":[
{"id":"R1","category":"Risk","title":"Dérive planning","description":"Risque de dépassement des délais dû à la complexité technique","probability":"Élevé","impact":"Élevé","priority":"Critique","owner":"Chef de Projet","due_date":"2025-03-01","status":"Ouvert","mitigation":"Suivi hebdomadaire, buffer planning 20%"},
{"id":"R2","category":"Risk","title":"Perte de données migration","description":"Risque de corruption ou perte lors de la migration","probability":"Moyen","impact":"Critique","priority":"Critique","owner":"DBA","due_date":"2025-09-01","status":"Ouvert","mitigation":"Backups complets, tests migration à blanc"},
{"id":"R3","category":"Risk","title":"Résistance au changement","description":"Utilisateurs réticents à adopter le nouvel outil","probability":"Élevé","impact":"Moyen","priority":"Élevé","owner":"Chef de Projet","due_date":"2025-06-01","status":"Ouvert","mitigation":"Plan conduite du changement, formations"},
{"id":"R4","category":"Risk","title":"Indisponibilité ressources clés","description":"Départ ou indisponibilité d'experts techniques","probability":"Moyen","impact":"Élevé","priority":"Élevé","owner":"Chef de Projet","due_date":"2025-02-01","status":"Ouvert","mitigation":"Documentation, backup ressources"},
{"id":"A1","category":"Action","title":"Réunion kick-off","description":"Organiser la réunion de lancement avec toutes les parties prenantes","probability":"","impact":"","priority":"Critique","owner":"Chef de Projet","due_date":"2025-01-15","status":"Fermé","mitigation":""},
{"id":"A2","category":"Action","title":"Audit infrastructure","description":"Réaliser l'audit complet de l'infrastructure existante","probability":"","impact":"","priority":"Élevé","owner":"Architecte","due_date":"2025-02-28","status":"En cours","mitigation":""},
{"id":"A3","category":"Action","title":"Plan de formation","description":"Élaborer le plan de formation des utilisateurs finaux","probability":"","impact":"","priority":"Moyen","owner":"Chef de Projet","due_date":"2025-08-01","status":"Ouvert","mitigation":""},
{"id":"A4","category":"Action","title":"Tests de charge","description":"Planifier et exécuter les tests de performance","probability":"","impact":"","priority":"Élevé","owner":"Tech Lead","due_date":"2025-09-01","status":"Ouvert","mitigation":""},
{"id":"I1","category":"Issue","title":"Retard livraison serveurs","description":"Les serveurs commandés ont 3 semaines de retard","probability":"","impact":"Élevé","priority":"Critique","owner":"Infra","due_date":"2025-04-01","status":"En cours","mitigation":""},
{"id":"I2","category":"Issue","title":"Documentation incomplète","description":"La documentation de l'existant est obsolète","probability":"","impact":"Moyen","priority":"Moyen","owner":"Architecte","due_date":"2025-03-15","status":"Ouvert","mitigation":""},
{"id":"D1","category":"Decision","title":"Choix technologie cible","description":"Décision validée : migration vers OpenShift 4.12","probability":"","impact":"","priority":"Critique","owner":"DSI","due_date":"2025-01-20","status":"Fermé","mitigation":""},
{"id":"D2","category":"Decision","title":"Approche migration","description":"Migration par phases (lift & shift puis refactoring)","probability":"","impact":"","priority":"Élevé","owner":"Architecte","due_date":"2025-02-15","status":"Fermé","mitigation":""}
]}`,

    jalons: `Jalons pour "${n}". Période: ${s} → ${e}.
JSON UNIQUEMENT:
{"jalons":[
{"id":"J1","code":"M0","name":"Lancement projet","date":"${s}","status":"Atteint","description":"Réunion de lancement officielle","deliverables":"PV kick-off, Charte signée","responsible":"Chef de Projet","dependencies":""},
{"id":"J2","code":"M1","name":"Fin analyse","date":"2025-02-28","status":"Atteint","description":"Validation de l'analyse de l'existant","deliverables":"Rapport analyse, Registre RAID v1","responsible":"Architecte","dependencies":"M0"},
{"id":"J3","code":"M2","name":"Validation conception","date":"2025-04-30","status":"En cours","description":"Validation de l'architecture cible","deliverables":"DAT validé, Dossier conception","responsible":"Architecte","dependencies":"M1"},
{"id":"J4","code":"M3","name":"Fin développement","date":"2025-08-31","status":"Planifié","description":"Livraison du code testé","deliverables":"Code source, PV tests","responsible":"Tech Lead","dependencies":"M2"},
{"id":"J5","code":"M4","name":"Recette","date":"2025-10-15","status":"Planifié","description":"Validation par les utilisateurs","deliverables":"PV recette signé","responsible":"Chef de Projet","dependencies":"M3"},
{"id":"J6","code":"M5","name":"Go-Live","date":"2025-10-31","status":"Planifié","description":"Mise en production officielle","deliverables":"Système en prod, Formation OK","responsible":"Chef de Projet","dependencies":"M4"},
{"id":"J7","code":"M6","name":"Stabilisation","date":"2025-11-30","status":"Planifié","description":"Fin de la période de stabilisation","deliverables":"Bilan stabilisation","responsible":"Chef de Projet","dependencies":"M5"},
{"id":"J8","code":"M7","name":"Clôture projet","date":"${e}","status":"Planifié","description":"Clôture officielle et RETEX","deliverables":"RETEX, Bilan projet","responsible":"Chef de Projet","dependencies":"M6"}
]}`,

    budget: `Budget EVM pour "${n}". Budget: ${b}€.
JSON UNIQUEMENT:
{"lines":[
{"id":"B1","phase":"Phase 1 — Init","workpackage":"Gestion projet","bac":15000,"pv":15000,"ev":15000,"ac":14500,"cpi":1.03,"spi":1.0,"eac":14563,"status":"Terminé"},
{"id":"B2","phase":"Phase 2 — Analyse","workpackage":"Audit & Analyse","bac":20000,"pv":18000,"ev":16000,"ac":17500,"cpi":0.91,"spi":0.89,"eac":21978,"status":"En cours"},
{"id":"B3","phase":"Phase 3 — Conception","workpackage":"Architecture","bac":25000,"pv":12000,"ev":10000,"ac":11000,"cpi":0.91,"spi":0.83,"eac":27500,"status":"En cours"},
{"id":"B4","phase":"Phase 4 — Réalisation","workpackage":"Développement","bac":30000,"pv":0,"ev":0,"ac":0,"cpi":1.0,"spi":1.0,"eac":30000,"status":"Planifié"},
{"id":"B5","phase":"Phase 5 — Déploiement","workpackage":"Déploiement & Formation","bac":10000,"pv":0,"ev":0,"ac":0,"cpi":1.0,"spi":1.0,"eac":10000,"status":"Planifié"}
]}`,

    workpackages: `Work Packages pour "${n}" (${d}).
JSON UNIQUEMENT:
{"workpackages":[
{"id":"WP001","code":"WP-1.01","name":"Gestion de projet","phase":"Phase 1","description":"Pilotage, coordination et reporting","deliverables":"Rapports hebdo, CR comités","responsible":"Chef de Projet","start":"${s}","end":"${e}","duration":240,"budget":15000,"status":"En cours","completion":35,"dependencies":"","acceptance":"Rapports validés par CODIR"},
{"id":"WP002","code":"WP-2.01","name":"Audit infrastructure","phase":"Phase 2","description":"Audit complet de l'infra existante","deliverables":"Rapport d'audit technique","responsible":"Architecte","start":"2025-02-01","end":"2025-02-28","duration":20,"budget":8000,"status":"En cours","completion":80,"dependencies":"WP001","acceptance":"Rapport validé par DSI"},
{"id":"WP003","code":"WP-2.02","name":"Analyse des besoins","phase":"Phase 2","description":"Recueil et analyse des besoins métier","deliverables":"Cahier des charges","responsible":"Business Analyst","start":"2025-02-01","end":"2025-02-20","duration":15,"budget":6000,"status":"Terminé","completion":100,"dependencies":"WP001","acceptance":"CDC signé par MOA"},
{"id":"WP004","code":"WP-3.01","name":"Architecture technique","phase":"Phase 3","description":"Conception de l'architecture cible","deliverables":"DAT, Schémas archi","responsible":"Architecte","start":"2025-03-01","end":"2025-04-15","duration":30,"budget":10000,"status":"En cours","completion":45,"dependencies":"WP002","acceptance":"DAT validé par CTO"},
{"id":"WP005","code":"WP-4.01","name":"Développement","phase":"Phase 4","description":"Développement des composants applicatifs","deliverables":"Code source testé","responsible":"Dev Team","start":"2025-05-01","end":"2025-08-31","duration":90,"budget":30000,"status":"Planifié","completion":0,"dependencies":"WP004","acceptance":"Tests unitaires > 80%"},
{"id":"WP006","code":"WP-4.02","name":"Tests & Recette","phase":"Phase 4","description":"Tests intégration et recette utilisateurs","deliverables":"PV recette","responsible":"QA","start":"2025-08-01","end":"2025-10-15","duration":45,"budget":10000,"status":"Planifié","completion":0,"dependencies":"WP005","acceptance":"PV recette signé MOA"},
{"id":"WP007","code":"WP-5.01","name":"Migration données","phase":"Phase 5","description":"Migration et validation des données","deliverables":"Données migrées et validées","responsible":"DBA","start":"2025-10-01","end":"2025-10-20","duration":15,"budget":6000,"status":"Planifié","completion":0,"dependencies":"WP006","acceptance":"Contrôles données OK"},
{"id":"WP008","code":"WP-5.02","name":"Formation & Go-Live","phase":"Phase 5","description":"Formation utilisateurs et mise en prod","deliverables":"Utilisateurs formés, Système en prod","responsible":"Chef de Projet","start":"2025-10-20","end":"2025-11-15","duration":20,"budget":8000,"status":"Planifié","completion":0,"dependencies":"WP007","acceptance":"Go-live validé CODIR"}
]}`,

    mindmap: `Mind Map pour "${n}".
JSON UNIQUEMENT:
{"center":"${n}","branches":[
{"id":"B1","label":"Périmètre","color":"#3b82f6","children":[{"id":"B1-1","label":"Objectifs"},{"id":"B1-2","label":"Livrables"},{"id":"B1-3","label":"Exclusions"}]},
{"id":"B2","label":"Planning","color":"#8b5cf6","children":[{"id":"B2-1","label":"Jalons"},{"id":"B2-2","label":"Gantt"},{"id":"B2-3","label":"Dépendances"}]},
{"id":"B3","label":"Budget","color":"#f59e0b","children":[{"id":"B3-1","label":"BAC: ${b}€"},{"id":"B3-2","label":"Réserves"},{"id":"B3-3","label":"EVM"}]},
{"id":"B4","label":"Risques","color":"#ef4444","children":[{"id":"B4-1","label":"Techniques"},{"id":"B4-2","label":"Planning"},{"id":"B4-3","label":"Budget"}]},
{"id":"B5","label":"Équipe","color":"#10b981","children":[{"id":"B5-1","label":"CP"},{"id":"B5-2","label":"Technique"},{"id":"B5-3","label":"Métier"}]},
{"id":"B6","label":"Communication","color":"#06b6d4","children":[{"id":"B6-1","label":"CODIR"},{"id":"B6-2","label":"Équipe"},{"id":"B6-3","label":"Utilisateurs"}]},
{"id":"B7","label":"Qualité","color":"#84cc16","children":[{"id":"B7-1","label":"Standards"},{"id":"B7-2","label":"Tests"},{"id":"B7-3","label":"Recette"}]},
{"id":"B8","label":"Clôture","color":"#f97316","children":[{"id":"B8-1","label":"RETEX"},{"id":"B8-2","label":"Archivage"},{"id":"B8-3","label":"Bilan"}]}
]}`,

    documents: `Documents projet pour "${n}".
JSON UNIQUEMENT:
{"documents":[
{"id":"DOC1","type":"Charte","title":"Charte de projet — ${n}","version":"v1.0","status":"Approuvé","author":"Chef de Projet","date":"${s}","summary":"Document fondateur définissant objectifs, périmètre et autorité du CP.","priority":"Critique"},
{"id":"DOC2","type":"PMP","title":"Plan de Management de Projet","version":"v1.1","status":"Approuvé","author":"Chef de Projet","date":"${s}","summary":"Plan global : périmètre, délais, coûts, qualité, risques, communication.","priority":"Critique"},
{"id":"DOC3","type":"RAID","title":"Registre RAID","version":"v2.3","status":"Actif","author":"Chef de Projet","date":"2025-03-01","summary":"Registre vivant des risques, actions, issues et décisions.","priority":"Élevé"},
{"id":"DOC4","type":"DAT","title":"Dossier d'Architecture Technique","version":"v1.0","status":"En révision","author":"Architecte","date":"2025-04-01","summary":"Architecture cible, choix techniques et schémas d'infrastructure.","priority":"Critique"},
{"id":"DOC5","type":"CR","title":"Comptes-rendus de réunions","version":"v1.0","status":"Actif","author":"Chef de Projet","date":"${s}","summary":"Ensemble des CR de réunions (kick-off, comités, revues techniques).","priority":"Moyen"},
{"id":"DOC6","type":"PRA","title":"Plan de Reprise d'Activité","version":"v0.5","status":"Brouillon","author":"Architecte","date":"2025-05-01","summary":"Procédures de reprise en cas d'incident majeur sur la plateforme.","priority":"Élevé"},
{"id":"DOC7","type":"Budget","title":"Suivi budgétaire EVM","version":"v3.0","status":"Actif","author":"Chef de Projet","date":"2025-04-01","summary":"Tableau de bord EVM avec PV, EV, AC, CPI et SPI par phase.","priority":"Élevé"},
{"id":"DOC8","type":"Rapport","title":"Rapport d'avancement — Avril 2025","version":"v1.0","status":"Approuvé","author":"Chef de Projet","date":"2025-04-30","summary":"Rapport mensuel pour le CODIR : avancement, risques, budget, décisions.","priority":"Moyen"}
]}`,
  }

  return prompts[tool] ?? prompts.wbs
}

// ── Clés des tableaux ─────────────────────────────────────────────
const ARRAY_KEY: Record<string, string> = {
  wbs: "items", gantt: "tasks", raid: "items", jalons: "jalons",
  budget: "lines", workpackages: "workpackages",
  mindmap: "branches", documents: "documents",
}

// ── Appel Claude (1 seul appel, max_tokens élevé) ─────────────────
async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY manquante")

  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.content?.find((b: any) => b.type === "text")?.text ?? ""
}

// ── Parser JSON robuste ───────────────────────────────────────────
function parseJSON(text: string): any {
  let clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  const start = clean.indexOf("{")
  if (start > 0) clean = clean.slice(start)
  const end = clean.lastIndexOf("}")
  if (end >= 0) clean = clean.slice(0, end + 1)
  clean = clean.replace(/,(\s*[}\]])/g, "$1")
  return JSON.parse(clean)
}

// ── Export principal ──────────────────────────────────────────────
export async function generateTool(options: GenerateOptions): Promise<any> {
  const { tool } = options
  const arrayKey = ARRAY_KEY[tool] ?? "items"

  // Essaie d'abord avec les données du prompt (template enrichi)
  // Si Claude répond, on parse sa réponse
  // Si Claude échoue, on retourne le template JSON directement depuis le prompt

  const prompt = buildPrompt(tool, options)

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const text = await callClaude(prompt)
      if (!text) continue
      const parsed = parseJSON(text)
      const items = parsed[arrayKey]
      if (Array.isArray(items) && items.length > 0) {
        console.log(`[generate] ${tool}: ${items.length} items from Claude`)
        return parsed
      }
    } catch (e: any) {
      console.warn(`[generate] ${tool} attempt ${attempt + 1} failed: ${e.message}`)
    }
  }

  // Fallback : extraire le JSON du template du prompt directement
  console.log(`[generate] ${tool}: using template fallback`)
  const jsonStart = prompt.indexOf("{")
  if (jsonStart >= 0) {
    try {
      const templateJSON = parseJSON(prompt.slice(jsonStart))
      if (templateJSON[arrayKey]?.length > 0) return templateJSON
    } catch {}
  }

  return { [arrayKey]: [] }
}
