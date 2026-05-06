// PMO AI Studio — Robust generation engine with chunking + retry
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages"

export interface GenerateOptions {
  tool: string
  projectName: string
  projectDescription?: string
  budget?: string
  startDate?: string
  endDate?: string
  team?: string
  extra?: string
  chunkSize?: number
  maxRetries?: number
}

const TOOL_PROMPTS: Record<string, (o: GenerateOptions, chunk: number, total: number) => string> = {
  wbs: (o, chunk, total) => `Tu es expert PMBOK. Génère la partie ${chunk}/${total} du WBS pour "${o.projectName}".
Contexte: ${o.projectDescription ?? ""}. Budget: ${o.budget ?? ""}. Période: ${o.startDate} → ${o.endDate}.
Retourne UNIQUEMENT ce JSON (5 éléments max, niveaux 1-4):
{"items":[{"id":"${chunk}-1","code":"${chunk}.1","name":"Nom","level":1,"description":"desc courte","deliverable":"livrable","responsible":"CP","duration":"2sem","budget":"5000€","dependencies":""}]}`,

  gantt: (o, chunk, total) => `Tu es expert planning. Génère les tâches Gantt partie ${chunk}/${total} pour "${o.projectName}".
Période: ${o.startDate} → ${o.endDate}. Contexte: ${o.projectDescription ?? ""}.
Retourne UNIQUEMENT ce JSON (5 tâches max):
{"tasks":[{"id":"T${chunk}1","wbs":"${chunk}.1","name":"Tâche","phase":"Phase ${chunk}","start":"${o.startDate ?? "2025-01-01"}","end":"2025-02-01","duration":15,"responsible":"CP","progress":0,"dependencies":"","critical":false}]}`,

  raid: (o, chunk, total) => `Expert gestion risques. Génère partie ${chunk}/${total} du RAID pour "${o.projectName}".
Contexte: ${o.projectDescription ?? ""}. Chunk ${chunk}: ${chunk===1?"5 Risques":chunk===2?"5 Actions":chunk===3?"4 Issues":"4 Décisions"}.
Retourne UNIQUEMENT ce JSON:
{"items":[{"id":"${chunk===1?"R":chunk===2?"A":chunk===3?"I":"D"}1","category":"${chunk===1?"Risk":chunk===2?"Action":chunk===3?"Issue":"Decision"}","title":"titre","description":"desc","probability":"Élevé","impact":"Critique","priority":"Critique","owner":"CP","due_date":"2025-06-30","status":"Ouvert","mitigation":"action"}]}`,

  jalons: (o, chunk, total) => `Expert PMI. Génère jalons partie ${chunk}/${total} pour "${o.projectName}".
Période: ${o.startDate} → ${o.endDate}.
Retourne UNIQUEMENT ce JSON (4 jalons):
{"jalons":[{"id":"J${chunk}1","code":"M${chunk}","name":"Jalon","date":"${o.startDate ?? "2025-01-15"}","status":"Planifié","description":"desc","deliverables":"livrable","responsible":"CP","dependencies":""}]}`,

  budget: (o, chunk, total) => `Expert EVM. Génère budget partie ${chunk}/${total} pour "${o.projectName}".
Budget total: ${o.budget ?? "100000€"}. Contexte: ${o.projectDescription ?? ""}.
Retourne UNIQUEMENT ce JSON (5 lignes):
{"lines":[{"id":"B${chunk}1","phase":"Phase ${chunk}","workpackage":"WP","bac":20000,"pv":15000,"ev":12000,"ac":14000,"cpi":0.86,"spi":0.80,"eac":23255,"status":"En cours"}]}`,

  workpackages: (o, chunk, total) => `Expert PMBOK. Génère Work Packages partie ${chunk}/${total} pour "${o.projectName}".
Contexte: ${o.projectDescription ?? ""}.
Retourne UNIQUEMENT ce JSON (5 WP max):
{"workpackages":[{"id":"WP${chunk}01","code":"WP-${chunk}.01","name":"Nom WP","phase":"Phase ${chunk}","description":"desc","deliverables":"livrable","responsible":"CP","team":["Dev1"],"start":"${o.startDate ?? "2025-01-01"}","end":"2025-03-01","duration":45,"budget":15000,"status":"Planifié","completion":0,"dependencies":"","acceptance":"critères"}]}`,

  mindmap: (o) => `Expert gestion projet. Génère un Mind Map pour "${o.projectName}".
Contexte: ${o.projectDescription ?? ""}.
Retourne UNIQUEMENT ce JSON complet (8 branches, 3 sous-branches chacune, MAX 800 tokens):
{"center":"${o.projectName}","branches":[{"id":"B1","label":"Périmètre","color":"#3b82f6","children":[{"id":"B1-1","label":"Objectifs"},{"id":"B1-2","label":"Livrables"},{"id":"B1-3","label":"Exclusions"}]},{"id":"B2","label":"Planning","color":"#8b5cf6","children":[{"id":"B2-1","label":"Jalons"},{"id":"B2-2","label":"Gantt"},{"id":"B2-3","label":"Dépendances"}]},{"id":"B3","label":"Budget","color":"#f59e0b","children":[{"id":"B3-1","label":"Coûts directs"},{"id":"B3-2","label":"Réserves"},{"id":"B3-3","label":"EVM"}]},{"id":"B4","label":"Risques","color":"#ef4444","children":[{"id":"B4-1","label":"Identification"},{"id":"B4-2","label":"Mitigation"},{"id":"B4-3","label":"Surveillance"}]},{"id":"B5","label":"Équipe","color":"#10b981","children":[{"id":"B5-1","label":"Rôles"},{"id":"B5-2","label":"RACI"},{"id":"B5-3","label":"Formation"}]},{"id":"B6","label":"Communication","color":"#06b6d4","children":[{"id":"B6-1","label":"Parties prenantes"},{"id":"B6-2","label":"Réunions"},{"id":"B6-3","label":"Reporting"}]},{"id":"B7","label":"Qualité","color":"#84cc16","children":[{"id":"B7-1","label":"Standards"},{"id":"B7-2","label":"Tests"},{"id":"B7-3","label":"Revues"}]},{"id":"B8","label":"Clôture","color":"#f97316","children":[{"id":"B8-1","label":"RETEX"},{"id":"B8-2","label":"Archivage"},{"id":"B8-3","label":"Bilan"}]}]}`,
}

const CHUNK_CONFIG: Record<string, number> = {
  wbs: 4, gantt: 4, raid: 4, jalons: 3,
  budget: 3, workpackages: 4, mindmap: 1,
}

async function callClaude(prompt: string, maxTokens = 900): Promise<string> {
  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  })
  const data = await res.json()
  return data.content?.find((b: any) => b.type === "text")?.text ?? ""
}

function parseJSON(text: string): any {
  // Strip markdown fences, BOM, trailing commas
  let clean = text
    .replace(/```json\n?/g, "").replace(/```\n?/g, "")
    .replace(/^\uFEFF/, "").trim()
    // Fix common trailing comma issues
    .replace(/,(\s*[}\]])/g, "$1")
  return JSON.parse(clean)
}

export async function generateTool(options: GenerateOptions): Promise<any> {
  const { tool, maxRetries = 3 } = options
  const totalChunks = CHUNK_CONFIG[tool] ?? 1
  const promptFn = TOOL_PROMPTS[tool]
  if (!promptFn) throw new Error(`Unknown tool: ${tool}`)

  // Mindmap: single call
  if (totalChunks === 1) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const text = await callClaude(promptFn(options, 1, 1), 1100)
        return parseJSON(text)
      } catch (e) {
        if (attempt === maxRetries - 1) throw e
      }
    }
  }

  // Multi-chunk: call in parallel batches
  const results: any[] = []
  for (let chunk = 1; chunk <= totalChunks; chunk++) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const text = await callClaude(promptFn(options, chunk, totalChunks), 900)
        const parsed = parseJSON(text)
        results.push(parsed)
        break
      } catch (e) {
        if (attempt === maxRetries - 1) {
          console.error(`Chunk ${chunk} failed after ${maxRetries} retries`)
          results.push(null)
        }
      }
    }
  }

  // Merge all chunks
  const merged: any = {}
  const arrayKey = Object.keys(results.find(r => r) ?? {})[0]
  if (arrayKey) {
    merged[arrayKey] = results
      .filter(Boolean)
      .flatMap(r => r[arrayKey] ?? [])
  }
  return merged
}
