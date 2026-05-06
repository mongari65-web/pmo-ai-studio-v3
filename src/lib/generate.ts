// PMO AI Studio — Generate engine v2 (robust chunking + merge)
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages"

export interface GenerateOptions {
  tool: string
  projectName: string
  projectDescription?: string
  budget?: string
  startDate?: string
  endDate?: string
  extra?: string
}

// ── Prompts par outil ─────────────────────────────────────────────
function buildPrompt(tool: string, opts: GenerateOptions, chunk: number, totalChunks: number): string {
  const { projectName: n, projectDescription: d = "", budget: b = "", startDate: s = "2025-01-01", endDate: e = "2025-12-31" } = opts
  const chunkNote = totalChunks > 1 ? ` (partie ${chunk}/${totalChunks})` : ""

  const prompts: Record<string, string> = {
    wbs: `Expert PMBOK. Génère 5 éléments WBS${chunkNote} pour le projet "${n}" (${d}).
Retourne UNIQUEMENT ce JSON valide, rien d'autre:
{"items":[{"id":"${chunk}1","code":"${chunk}.1","name":"Initialisation","level":1,"description":"Phase d'init","deliverable":"Charte projet","responsible":"Chef de Projet","duration":"2 sem","budget":"5000","dependencies":""}]}
Varie les niveaux (1 à 3), les noms, descriptions. 5 items exactement.`,

    gantt: `Expert planning. Génère 5 tâches Gantt${chunkNote} pour "${n}".
Période: ${s} → ${e}.
Retourne UNIQUEMENT ce JSON valide:
{"tasks":[{"id":"T${chunk}1","wbs":"${chunk}.1","name":"Cadrage projet","phase":"Phase ${chunk}","start":"${s}","end":"2025-02-01","duration":15,"responsible":"Chef de Projet","progress":0,"dependencies":"","critical":${chunk === 1}}]}
5 tâches exactement, phases différentes.`,

    raid: `Expert risques PMI. Génère des éléments RAID${chunkNote} pour "${n}" (${d}).
${chunk === 1 ? "Génère 4 Risques (Risk)" : chunk === 2 ? "Génère 4 Actions (Action)" : chunk === 3 ? "Génère 3 Issues (Issue)" : "Génère 3 Décisions (Decision)"}
Retourne UNIQUEMENT ce JSON valide:
{"items":[{"id":"${chunk === 1 ? "R" : chunk === 2 ? "A" : chunk === 3 ? "I" : "D"}1","category":"${chunk === 1 ? "Risk" : chunk === 2 ? "Action" : chunk === 3 ? "Issue" : "Decision"}","title":"Titre court","description":"Description détaillée","probability":"Élevé","impact":"Critique","priority":"Critique","owner":"Chef de Projet","due_date":"2025-06-30","status":"Ouvert","mitigation":"Plan de mitigation"}]}`,

    jalons: `Expert PMI. Génère 4 jalons${chunkNote} pour "${n}". Période: ${s} → ${e}.
Retourne UNIQUEMENT ce JSON valide:
{"jalons":[{"id":"J${chunk}1","code":"M${chunk}","name":"Lancement","date":"${s}","status":"Planifié","description":"Desc","deliverables":"Charte signée","responsible":"Chef de Projet","dependencies":""}]}
4 jalons avec dates réalistes entre ${s} et ${e}.`,

    budget: `Expert EVM. Génère 5 lignes budget${chunkNote} pour "${n}". Budget total: ${b || "100000"} EUR.
Retourne UNIQUEMENT ce JSON valide:
{"lines":[{"id":"B${chunk}1","phase":"Phase ${chunk}","workpackage":"Initialisation","bac":20000,"pv":15000,"ev":12000,"ac":14000,"cpi":0.86,"spi":0.80,"eac":23255,"status":"En cours"}]}
5 lignes avec valeurs EVM cohérentes.`,

    workpackages: `Expert PMBOK. Génère 5 Work Packages${chunkNote} pour "${n}" (${d}).
Retourne UNIQUEMENT ce JSON valide:
{"workpackages":[{"id":"WP${chunk}01","code":"WP-${chunk}.01","name":"Cadrage","phase":"Phase ${chunk}","description":"Description WP","deliverables":"Livrable","responsible":"Chef de Projet","start":"${s}","end":"2025-03-01","duration":45,"budget":15000,"status":"Planifié","completion":0,"dependencies":"","acceptance":"Critères acceptation"}]}
5 WP avec données réalistes.`,

    mindmap: `Expert gestion projet. Génère un Mind Map COMPLET pour "${n}" (${d}).
Retourne UNIQUEMENT ce JSON valide (8 branches, 3 sous-branches chacune):
{"center":"${n}","branches":[{"id":"B1","label":"Périmètre","color":"#3b82f6","children":[{"id":"B1-1","label":"Objectifs"},{"id":"B1-2","label":"Livrables"},{"id":"B1-3","label":"Exclusions"}]},{"id":"B2","label":"Planning","color":"#8b5cf6","children":[{"id":"B2-1","label":"Jalons clés"},{"id":"B2-2","label":"Gantt"},{"id":"B2-3","label":"Dépendances"}]},{"id":"B3","label":"Budget","color":"#f59e0b","children":[{"id":"B3-1","label":"Coûts directs"},{"id":"B3-2","label":"Réserves"},{"id":"B3-3","label":"EVM"}]},{"id":"B4","label":"Risques","color":"#ef4444","children":[{"id":"B4-1","label":"Identification"},{"id":"B4-2","label":"Mitigation"},{"id":"B4-3","label":"Surveillance"}]},{"id":"B5","label":"Équipe","color":"#10b981","children":[{"id":"B5-1","label":"Rôles"},{"id":"B5-2","label":"RACI"},{"id":"B5-3","label":"Formation"}]},{"id":"B6","label":"Communication","color":"#06b6d4","children":[{"id":"B6-1","label":"Parties prenantes"},{"id":"B6-2","label":"Réunions"},{"id":"B6-3","label":"Reporting"}]},{"id":"B7","label":"Qualité","color":"#84cc16","children":[{"id":"B7-1","label":"Standards"},{"id":"B7-2","label":"Tests"},{"id":"B7-3","label":"Revues"}]},{"id":"B8","label":"Clôture","color":"#f97316","children":[{"id":"B8-1","label":"RETEX"},{"id":"B8-2","label":"Archivage"},{"id":"B8-3","label":"Bilan"}]}]}`,

    documents: `Expert PMI. Génère une liste de 8 documents projet pour "${n}" (${d}).
Retourne UNIQUEMENT ce JSON valide:
{"documents":[{"id":"DOC1","type":"Charte Projet","title":"Charte de projet — ${n}","version":"v1.0","status":"Brouillon","author":"Chef de Projet","date":"${s}","summary":"Document de référence définissant les objectifs, périmètre et autorité du CP.","priority":"Critique"},{"id":"DOC2","type":"PMP","title":"Plan de Management de Projet","version":"v1.0","status":"Brouillon","author":"Chef de Projet","date":"${s}","summary":"Plan global couvrant périmètre, délais, coûts, risques et communication.","priority":"Critique"},{"id":"DOC3","type":"RAID","title":"Registre RAID","version":"v1.0","status":"Actif","author":"Chef de Projet","date":"${s}","summary":"Registre des risques, actions, issues et décisions du projet.","priority":"Élevé"},{"id":"DOC4","type":"PRA","title":"Plan de Reprise d'Activité","version":"v1.0","status":"Brouillon","author":"Chef de Projet","date":"${s}","summary":"Procédures de reprise en cas d'incident majeur.","priority":"Élevé"},{"id":"DOC5","type":"CR Réunion","title":"Compte-rendu de réunion de lancement","version":"v1.0","status":"Approuvé","author":"Chef de Projet","date":"${s}","summary":"CR de la réunion de kick-off avec toutes les parties prenantes.","priority":"Moyen"},{"id":"DOC6","type":"WBS","title":"Structure de découpage du travail","version":"v1.0","status":"Approuvé","author":"Chef de Projet","date":"${s}","summary":"Décomposition hiérarchique de l'ensemble des livrables du projet.","priority":"Critique"},{"id":"DOC7","type":"Budget","title":"Budget prévisionnel et suivi EVM","version":"v1.0","status":"Brouillon","author":"Chef de Projet","date":"${s}","summary":"Suivi budgétaire avec indicateurs Earned Value Management.","priority":"Élevé"},{"id":"DOC8","type":"Rapport","title":"Rapport d'avancement mensuel","version":"v1.0","status":"Brouillon","author":"Chef de Projet","date":"${s}","summary":"Rapport mensuel de suivi destiné au comité de pilotage.","priority":"Moyen"}]}`,
  }

  return prompts[tool] ?? prompts.wbs
}

// ── Nombre de chunks par outil ────────────────────────────────────
const CHUNK_CONFIG: Record<string, number> = {
  wbs: 4, gantt: 3, raid: 4, jalons: 2,
  budget: 3, workpackages: 3, mindmap: 1, documents: 1,
}

// ── Clé du tableau dans la réponse ───────────────────────────────
const ARRAY_KEY: Record<string, string> = {
  wbs: "items", gantt: "tasks", raid: "items", jalons: "jalons",
  budget: "lines", workpackages: "workpackages", mindmap: "branches", documents: "documents",
}

// ── Appel Claude ─────────────────────────────────────────────────
async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY manquante dans .env.local")

  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.content?.find((b: any) => b.type === "text")?.text ?? ""
  if (!text) throw new Error("Réponse Claude vide")
  return text
}

// ── Parser JSON robuste ───────────────────────────────────────────
function parseJSON(text: string): any {
  // Extract JSON from markdown fences or raw text
  let clean = text
    .replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/```\s*$/m, "")
    .replace(/^\uFEFF/, "")
    .trim()

  // Find first { or [ and last } or ]
  const firstBrace = clean.indexOf("{")
  const firstBracket = clean.indexOf("[")
  let start = -1
  if (firstBrace >= 0 && firstBracket >= 0) start = Math.min(firstBrace, firstBracket)
  else if (firstBrace >= 0) start = firstBrace
  else if (firstBracket >= 0) start = firstBracket

  if (start > 0) clean = clean.slice(start)

  const lastBrace = clean.lastIndexOf("}")
  const lastBracket = clean.lastIndexOf("]")
  const end = Math.max(lastBrace, lastBracket)
  if (end >= 0) clean = clean.slice(0, end + 1)

  // Fix trailing commas
  clean = clean.replace(/,(\s*[}\]])/g, "$1")

  return JSON.parse(clean)
}

// ── Fonction principale ───────────────────────────────────────────
export async function generateTool(options: GenerateOptions): Promise<any> {
  const { tool } = options
  const totalChunks = CHUNK_CONFIG[tool] ?? 1
  const arrayKey = ARRAY_KEY[tool] ?? "items"
  const MAX_RETRIES = 3

  // MindMap & Documents : appel unique
  if (totalChunks === 1) {
    let lastError: any
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const text = await callClaude(buildPrompt(tool, options, 1, 1))
        const parsed = parseJSON(text)
        return parsed
      } catch (e) {
        lastError = e
        console.error(`[generate] ${tool} attempt ${attempt + 1} failed:`, e)
      }
    }
    throw lastError
  }

  // Multi-chunks : appels séquentiels avec retry
  const allItems: any[] = []

  for (let chunk = 1; chunk <= totalChunks; chunk++) {
    let success = false
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const text = await callClaude(buildPrompt(tool, options, chunk, totalChunks))
        const parsed = parseJSON(text)
        const chunkItems = parsed[arrayKey]
        if (Array.isArray(chunkItems) && chunkItems.length > 0) {
          allItems.push(...chunkItems)
          console.log(`[generate] ${tool} chunk ${chunk}/${totalChunks}: ${chunkItems.length} items`)
          success = true
          break
        } else {
          console.warn(`[generate] ${tool} chunk ${chunk} returned empty array, retrying...`)
        }
      } catch (e) {
        console.error(`[generate] ${tool} chunk ${chunk} attempt ${attempt + 1} failed:`, e)
      }
    }
    if (!success) console.warn(`[generate] ${tool} chunk ${chunk} failed after ${MAX_RETRIES} retries`)
  }

  return { [arrayKey]: allItems }
}
