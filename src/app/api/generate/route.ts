import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  checkQuota, incrementQuota,
  getCache, setCache, makeCacheKey,
  TOOL_MODEL
} from "@/lib/ia-quota"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const body = await req.json()
    const { tool, projectName = "", projectDescription = "", ...rest } = body

    const quota = await checkQuota(user.id)
    if (!quota.allowed) {
      return NextResponse.json({
        error: quota.message,
        quota: { current: quota.current, limit: quota.limit, plan: quota.plan },
        upgrade: true
      }, { status: 429 })
    }

    const cacheKey = makeCacheKey(tool, projectName, projectDescription)
    const cached = await getCache(cacheKey)
    if (cached) {
      return NextResponse.json({
        data: cached,
        cached: true,
        quota: { current: quota.current, limit: quota.limit, plan: quota.plan }
      })
    }

    const model = TOOL_MODEL[tool] ?? TOOL_MODEL.default
    const prompt = buildPrompt(tool, projectName, projectDescription, rest)

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: "Tu es un expert PMO certifié PMP. Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaires. Génère des données réalistes et spécifiques au projet donné.",
        messages: [{ role: "user", content: prompt }]
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error("Claude API error: " + response.status + " — " + err)
    }

    const claudeData = await response.json()
    const rawText = claudeData.content?.[0]?.text ?? "{}"

    let parsed: any
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim()
      parsed = JSON.parse(cleaned)
    } catch {
      throw new Error("Réponse IA invalide — impossible de parser le JSON")
    }

    await incrementQuota(user.id)
    await setCache(cacheKey, tool, parsed)

    return NextResponse.json({
      data: parsed,
      cached: false,
      model,
      quota: { current: quota.current + 1, limit: quota.limit, plan: quota.plan }
    })

  } catch (e: any) {
    console.error("Generate error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

function buildPrompt(tool: string, name: string, desc: string, extra: any): string {
  const n = name
  const d = desc || "projet IT"
  const s = extra.startDate || extra.start_date || "2026-01-01"
  const e = extra.endDate || extra.end_date || "2026-06-30"
  const b = String(extra.budget || "100000")

  const prompts: Record<string, string> = {

    wbs: "Génère un WBS complet pour ce projet." +
      " Nom: " + n + ". Description: " + d + ". Budget total: " + b + "€. Période: " + s + " → " + e + "." +
      " CONTRAINTES: 15 éléments minimum, 3 niveaux (level 1=Phase, 2=Livrable, 3=Tâche)." +
      " La somme des budgets des éléments level 1 = " + b + "€." +
      " Noms et livrables spécifiques au type de projet (pas génériques)." +
      ' JSON: {"items":[{"id":"1","code":"1.0","name":"[PHASE]","level":1,"description":"[DESC]","deliverable":"[LIVRABLE]","responsible":"[ROLE]","duration":"[X sem]","budget":"[MONTANT]","dependencies":""},{"id":"2","code":"1.1","name":"[NOM]","level":2,"description":"[DESC]","deliverable":"[LIVRABLE]","responsible":"[ROLE]","duration":"[X sem]","budget":"[MONTANT]","dependencies":"1.0"}]}',

    gantt: "Génère un planning Gantt pour ce projet." +
      " Nom: " + n + ". Description: " + d + ". Période: " + s + " → " + e + "." +
      " CONTRAINTES: 15 tâches, dates réelles entre " + s + " et " + e + "." +
      " Avancement cohérent avec la date actuelle (mai 2026)." +
      " Dépendances logiques entre tâches. Chemin critique identifié." +
      ' JSON: {"tasks":[{"id":"T1","wbs":"1.0","name":"[NOM]","phase":"[PHASE]","start":"[DATE]","end":"[DATE]","duration":[JOURS],"responsible":"[ROLE]","progress":[0-100],"dependencies":"","critical":true}]}',

    raid: "Génère un registre RAID pour ce projet." +
      " Nom: " + n + ". Description: " + d + "." +
      " CONTRAINTES: 12 éléments (5 Risk, 3 Action, 2 Issue, 2 Decision)." +
      " Risques spécifiques au secteur du projet." +
      " category DOIT être exactement: Risk, Action, Issue ou Decision." +
      " priority: Critique, Haute, Moyenne ou Faible." +
      " status: Ouvert, En cours, Fermé ou Résolu." +
      ' JSON: {"items":[{"id":"R1","category":"Risk","title":"[TITRE]","description":"[DESC]","probability":"[Haute|Moyenne|Faible]","impact":"[Critique|Élevé|Moyen|Faible]","priority":"Critique","owner":"[ROLE]","due_date":"[DATE]","status":"Ouvert","mitigation":"[ACTION]"}]}',

    jalons: "Génère des jalons pour ce projet." +
      " Nom: " + n + ". Description: " + d + ". Période: " + s + " → " + e + "." +
      " CONTRAINTES: 7 jalons clés couvrant toutes les phases." +
      " Dates entre " + s + " et " + e + "." +
      ' JSON: {"jalons":[{"id":"M1","code":"M1","name":"[NOM JALON]","date":"[DATE]","status":"[Atteint|En cours|À venir|En retard]","deliverables":"[LIVRABLE]","responsible":"[ROLE]","description":"[DESC]"}]}',

    workpackages: "Génère des Work Packages détaillés pour ce projet." +
      " Nom: " + n + ". Description: " + d + ". Budget: " + b + "€. Période: " + s + " → " + e + "." +
      " CONTRAINTES STRICTES:" +
      " - 7 Work Packages couvrant tout le cycle de vie" +
      " - Somme des budgets = exactement " + b + "€" +
      " - Dates entre " + s + " et " + e +
      " - Chaque WP contient activities[] avec 4-5 activités spécifiques" +
      " - Chaque WP contient contributors[] avec 2-3 personnes" +
      " - Noms, activités et livrables spécifiques au projet: " + d +
      ' JSON: {"workpackages":[{"id":"WP001","code":"WP1","name":"[NOM]","phase":"[PHASE]","description":"[DESC]","objective":"[OBJECTIF]","deliverables":"[L1], [L2]","responsible":"[ROLE]","lead_profile":"[PROFIL]","lead_etp":"0,8","start":"[DATE]","end":"[DATE]","duration":[JOURS],"budget":[MONTANT],"status":"En cours","completion":[0-100],"dependencies":"","acceptance":"[CRITÈRES]","activities":["[ACT 1]","[ACT 2]","[ACT 3]","[ACT 4]"],"contributors":[{"profile":"[PROFIL]","name":"","etp":0.5,"criticality":"Haute"}]}]}',

    budget: "Génère un budget EVM pour ce projet." +
      " Nom: " + n + ". Description: " + d + ". Budget TOTAL: " + b + "€. Période: " + s + " → " + e + "." +
      " CONTRAINTES STRICTES:" +
      " - 6 lignes budgétaires correspondant aux phases" +
      " - Somme de tous les BAC = exactement " + b + "€" +
      " - Phases passées (avant mai 2026): EV et AC renseignés, CPI/SPI réalistes" +
      " - Phases futures: EV=0, AC=0, CPI=1.0, SPI=1.0" +
      " - EAC = BAC/CPI pour phases actives" +
      " - Noms de phases spécifiques au projet" +
      ' JSON: {"lines":[{"id":"B1","phase":"[PHASE]","workpackage":"[NOM WP]","bac":[MONTANT],"pv":[MONTANT],"ev":[MONTANT],"ac":[MONTANT],"cpi":[VALEUR],"spi":[VALEUR],"eac":[MONTANT],"status":"[Terminé|En cours|Planifié]"}]}',

    mindmap: "Génère une mind map pour ce projet." +
      " Nom: " + n + ". Description: " + d + ". Budget: " + b + "€." +
      " CONTRAINTES: 8 branches principales avec 3 sous-éléments chacune." +
      " Branches adaptées au type de projet." +
      ' JSON: {"center":"' + n + '","branches":[{"id":"B1","label":"[BRANCHE]","color":"#3b82f6","children":[{"id":"B1-1","label":"[SOUS]"},{"id":"B1-2","label":"[SOUS]"},{"id":"B1-3","label":"[SOUS]"}]}]}',

    pert: "Génère un réseau PERT pour ce projet." +
  " Nom: " + n + ". Description: " + d + ". Période: " + s + " → " + e + "." +
  " CONTRAINTES: 12 nœuds, structure séquentielle D→T1→T2→...→F, max 2 tâches parallèles, durées 5-30j, optimistic=durée-2, pessimistic=durée+5, noms spécifiques au projet." +
  ' JSON: {"nodes":[{"id":"D","name":"Début","duration":0,"optimistic":0,"pessimistic":0,"deps":[]},{"id":"T1","name":"[NOM SPÉCIFIQUE]","duration":[JOURS],"optimistic":[JOURS-2],"pessimistic":[JOURS+5],"deps":["D"]},{"id":"T2","name":"[NOM]","duration":[JOURS],"optimistic":[JOURS-2],"pessimistic":[JOURS+5],"deps":["T1"]},{"id":"F","name":"Fin","duration":0,"optimistic":0,"pessimistic":0,"deps":["T10"]}]}',

    documents: "Génère une liste de documents projet." +
      " Nom: " + n + ". Description: " + d + "." +
      " CONTRAINTES: 8 documents adaptés au type de projet." +
      ' JSON: {"documents":[{"id":"DOC1","type":"[TYPE]","title":"[TITRE]","version":"v1.0","status":"[Approuvé|En révision|Brouillon|Actif]","author":"[ROLE]","date":"' + s + '","summary":"[DESC]","priority":"[Critique|Élevé|Moyen]"}]}',
  }

  return prompts[tool] ?? "Génère des données JSON pour l'outil " + tool + " du projet: " + n + ". Description: " + d
}
