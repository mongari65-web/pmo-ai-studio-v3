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

    // ── Auth ───────────────────────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const body = await req.json()
    const { tool, projectName = "", projectDescription = "", ...rest } = body

    // ── Vérifier le quota ─────────────────────────────────────
    const quota = await checkQuota(user.id)
    if (!quota.allowed) {
      return NextResponse.json({
        error: quota.message,
        quota: { current: quota.current, limit: quota.limit, plan: quota.plan },
        upgrade: true
      }, { status: 429 })
    }

    // ── Vérifier le cache ─────────────────────────────────────
    const cacheKey = makeCacheKey(tool, projectName, projectDescription)
    const cached = await getCache(cacheKey)
    if (cached) {
      return NextResponse.json({
        data: cached,
        cached: true,
        quota: { current: quota.current, limit: quota.limit, plan: quota.plan }
      })
    }

    // ── Choisir le bon modèle ─────────────────────────────────
    const model = TOOL_MODEL[tool] ?? TOOL_MODEL.default

    // ── Construire le prompt selon l'outil ────────────────────
    const prompt = buildPrompt(tool, projectName, projectDescription, rest)

    // ── Appel Claude API ──────────────────────────────────────
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
        messages: [{ role: "user", content: prompt }],
        system: `Tu es un expert PMO. Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaires. Sois précis et professionnel.`
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Claude API error: ${response.status} — ${err}`)
    }

    const claudeData = await response.json()
    const rawText = claudeData.content?.[0]?.text ?? "{}"

    // Parser JSON
    let parsed: any
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim()
      parsed = JSON.parse(cleaned)
    } catch {
      throw new Error("Réponse IA invalide — impossible de parser le JSON")
    }

    // ── Incrémenter le quota (seulement si succès) ────────────
    await incrementQuota(user.id)

    // ── Sauvegarder en cache ──────────────────────────────────
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

// ── Prompts par outil ────────────────────────────────────────
function buildPrompt(tool: string, name: string, desc: string, extra: any): string {
  const ctx = `Projet: "${name}". Description: "${desc}".`

  const prompts: Record<string, string> = {
    wbs: `${ctx} Génère un WBS complet en JSON: {"items":[{"code":"1.0","name":"Phase","level":1,"deliverable":"...","responsible":"...","duration":"X sem","budget":0}]}. 20-30 éléments sur 3 niveaux.`,

    gantt: `${ctx} Génère un planning Gantt en JSON: {"tasks":[{"wbs":"1.1","name":"Tâche","phase":"Phase 1","start":"2026-01-01","end":"2026-01-15","duration":10,"responsible":"CP","progress":0,"critical":false,"dependencies":""}]}. 15-20 tâches réalistes.`,

    raid: `${ctx} Génère un registre RAID en JSON: {"items":[{"id":"R001","category":"Risk","title":"...","description":"...","probability":"Élevé","impact":"Critique","priority":"Critique","owner":"CP","due_date":"2026-03-01","status":"Ouvert","mitigation":"..."}]}. 10-15 éléments variés (R/A/I/D).`,

    jalons: `${ctx} Génère des jalons en JSON: {"jalons":[{"code":"M1","name":"Kick-off","date":"2026-01-15","status":"À venir","deliverables":"Charte signée","responsible":"CP"}]}. 6-8 jalons clés.`,

    workpackages: `${ctx} Génère des work packages en JSON: {"workpackages":[{"code":"WP1","name":"...","phase":"Phase 1","responsible":"...","budget":10000,"start":"2026-01-01","end":"2026-02-28","completion":0,"status":"À démarrer","description":"..."}]}. 8-12 WPs.`,

    mindmap: `${ctx} Génère une mind map en JSON: {"nodes":[{"id":"root","label":"${name}","parent":null,"level":0},{"id":"n1","label":"Périmètre","parent":"root","level":1}]}. 20-25 nœuds sur 3 niveaux.`,

    budget: `${ctx} Génère un budget EVM en JSON: {"tasks":[{"phase":"Phase 1","name":"WP1","bac":50000,"pv":[5000,10000,15000,20000,25000,30000,35000,40000,45000,50000,50000,50000],"ev":[0,0,0,0,0,0,0,0,0,0,0,0],"ac":[0,0,0,0,0,0,0,0,0,0,0,0],"status":"À démarrer"}]}. 8-10 tâches avec BAC réaliste.`,

    pert: `${ctx} Génère un réseau PERT en JSON: {"nodes":[{"id":"T1","name":"Initialisation","duration":5,"deps":[]},{"id":"T2","name":"Analyse","duration":10,"deps":["T1"]}]}. 8-12 nœuds avec dépendances réalistes.`,
  }

  return prompts[tool] ?? `${ctx} Génère des données JSON pour l'outil "${tool}" adapté au contexte du projet.`
}
