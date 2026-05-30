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
        max_tokens: ["wbs","workpackages","gantt","budget","sprint"].includes(tool) ? 8192 : ["raid","raci","communication"].includes(tool) ? 6144 : 4096,
        system: "Tu es un expert PMO certifié en gestion de projet. Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaires. Génère des données réalistes et spécifiques au projet donné.",
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
      // Nettoyage robuste
      let cleaned = rawText.replace(/```json\s*/gi, "").replace(/```/g, "").trim()
      // Extraire le JSON si entouré de texte
      const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
      if (jsonMatch) cleaned = jsonMatch[0]
      parsed = JSON.parse(cleaned)
    } catch {
      // Tentative de récupération — extraire entre { et }
      try {
        const start = rawText.indexOf("{")
        const end   = rawText.lastIndexOf("}")
        if (start !== -1 && end !== -1) {
          parsed = JSON.parse(rawText.slice(start, end + 1))
        } else {
          throw new Error("no json")
        }
      } catch {
        console.error("Raw response:", rawText.slice(0, 500))
        throw new Error("Réponse IA invalide — impossible de parser le JSON. Raw: " + rawText.slice(0, 200))
      }
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
  // Calculer le mois courant relatif au projet
  const today = new Date()
  const startDateObj = new Date(s)
  const todayMonth = today.getFullYear() * 12 + today.getMonth()
  const startMonth = startDateObj.getFullYear() * 12 + startDateObj.getMonth()
  const cp = Math.max(0, Math.min(11, todayMonth - startMonth))
  const cpLabel = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"][cp]
  const isFuture = startDateObj > today
  const isNew = isFuture || cp === 0

  const prompts: Record<string, string> = {

    wbs: "Génère un WBS complet pour ce projet." +
      " Nom: " + n + ". Description: " + d + ". Budget total: " + b + "€. Période: " + s + " → " + e + "." +
      " CONTRAINTES: 10 éléments, 3 niveaux (level 1=Phase, 2=Livrable, 3=Tâche)." +
      " La somme des budgets des éléments level 1 = " + b + "€." +
      " Noms et livrables spécifiques au type de projet (pas génériques)." +
      ' JSON: {"items":[{"id":"1","code":"1.0","name":"[PHASE]","level":1,"description":"[DESC]","deliverable":"[LIVRABLE]","responsible":"[ROLE]","duration":"[X sem]","budget":"[MONTANT]","dependencies":""},{"id":"2","code":"1.1","name":"[NOM]","level":2,"description":"[DESC]","deliverable":"[LIVRABLE]","responsible":"[ROLE]","duration":"[X sem]","budget":"[MONTANT]","dependencies":"1.0"}]}',

    gantt: "Génère un planning Gantt pour ce projet." +
      " Nom: " + n + ". Description: " + d + ". Période: " + s + " → " + e + "." +
      " CONTRAINTES: 10 tâches, dates réelles entre " + s + " et " + e + "." +
      " Avancement cohérent avec la date actuelle (mai 2026)." +
      " Dépendances logiques entre tâches. Chemin critique identifié." +
      ' JSON: {"tasks":[{"id":"T1","wbs":"1.0","name":"[NOM]","phase":"[PHASE]","start":"[DATE]","end":"[DATE]","duration":[JOURS],"responsible":"[ROLE]","progress":[0-100],"dependencies":"","critical":true}]}',

    raid: "Génère un registre RAID pour ce projet." +
      " Nom: " + n + ". Description: " + d + "." +
      " CONTRAINTES: 8 éléments (3 Risk, 2 Action, 2 Issue, 1 Decision)." +
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
      " - Autant de Work Packages que nécessaire selon le périmètre du projet" +
      " - Somme des budgets = exactement " + b + "€" +
      " - Dates entre " + s + " et " + e +
      " - Chaque WP contient activities[] avec 4-5 activités spécifiques" +
      " - Chaque WP contient contributors[] avec 2-3 personnes" +
      " - Noms, activités et livrables spécifiques au projet: " + d +
      ' JSON: {"workpackages":[{"id":"WP001","code":"WP1","name":"[NOM]","phase":"[PHASE]","description":"[DESC]","objective":"[OBJECTIF]","deliverables":"[L1], [L2]","responsible":"[ROLE]","lead_profile":"[PROFIL]","lead_etp":"0,8","start":"[DATE]","end":"[DATE]","duration":[JOURS],"budget":[MONTANT],"status":"En cours","completion":[0-100],"dependencies":"","acceptance":"[CRITÈRES]","activities":["[ACT 1]","[ACT 2]","[ACT 3]","[ACT 4]"],"contributors":[{"profile":"[PROFIL]","name":"","etp":0.5,"criticality":"Haute"}]}]}',

    budget: "Génère un budget EVM pour ce projet." +
      " Nom: " + n + ". Description: " + d + ". Budget TOTAL: " + b + "€. Période: " + s + " → " + e + "." +
      " Aujourd\'hui = " + cpLabel + " 2026 = index mois " + cp + " (Jan=0, Fév=1, Mar=2, Avr=3, Mai=4, Jun=5...)." +
      " CONTRAINTES STRICTES:" +
      " - 6 tâches/phases spécifiques au projet, noms détaillés" +
      " - Somme de tous les BAC = exactement " + b + "€" +
      " - currentPeriod = " + cp + " (" + cpLabel + " 2026)" +
      " - Chaque tâche a pv[], ev[], ac[] = tableaux de 12 valeurs mensuelles (index 0=Jan à 11=Déc)" +
      " - pv[]: distribution réaliste en forme de S selon la phase du projet (montée progressive, plateau, descente)" +
      " - Pour phases déjà démarrées (index 0 à " + cp + "): pv, ev, ac renseignés avec valeurs réalistes" +
      " - Pour phases futures (index " + (cp+1) + " à 11): pv progressif selon planning, ev=0, ac=0" +
      " - Phases en retard: sum(ev[0.." + cp + "]) < sum(pv[0.." + cp + "]), ac légèrement > ev" +
      " - Phases futures: ev[0..11]=0, ac[0..11]=0" +
      " - sum(pv[0..11]) pour chaque tâche doit être cohérent avec son BAC (pas x10)" +
      (isFuture ? " - PROJET FUTUR: ev et ac = 0 sur tous les mois, pv commence à partir de l'index " + cp + "." : "") +
      " - CPI global réaliste entre 0.75 et 0.95 pour un projet en difficulté" +
      ' JSON: {"currentPeriod":4,"tasks":[{"id":"T1","wbs":"1.0","name":"[NOM PHASE DÉTAILLÉ]","phase":"[PHASE]","responsible":"[RÔLE]","bac":[MONTANT],"pv":[v0,v1,v2,v3,v4,v5,v6,v7,v8,v9,v10,v11],"ev":[v0,v1,v2,v3,v4,0,0,0,0,0,0,0],"ac":[v0,v1,v2,v3,v4,0,0,0,0,0,0,0]}]}',

    mindmap: "Génère une mind map pour ce projet." +
      " Nom: " + n + ". Description: " + d + ". Budget: " + b + "€." +
      " CONTRAINTES: 8 branches principales avec 3 sous-éléments chacune." +
      " Branches adaptées au type de projet." +
      ' JSON: {"center":"' + n + '","branches":[{"id":"B1","label":"[BRANCHE]","color":"#3b82f6","children":[{"id":"B1-1","label":"[SOUS]"},{"id":"B1-2","label":"[SOUS]"},{"id":"B1-3","label":"[SOUS]"}]}]}',

    pert: "Génère un réseau PERT pour ce projet." +
  " Nom: " + n + ". Description: " + d + ". Période: " + s + " → " + e + "." +
  " CONTRAINTES: 12 nœuds, structure séquentielle D→T1→T2→...→F, max 2 tâches parallèles, durées 5-30j, optimistic=durée-2, pessimistic=durée+5, noms spécifiques au projet." +
  ' JSON: {"nodes":[{"id":"D","name":"Début","duration":0,"optimistic":0,"pessimistic":0,"deps":[]},{"id":"T1","name":"[NOM SPÉCIFIQUE]","duration":[JOURS],"optimistic":[JOURS-2],"pessimistic":[JOURS+5],"deps":["D"]},{"id":"T2","name":"[NOM]","duration":[JOURS],"optimistic":[JOURS-2],"pessimistic":[JOURS+5],"deps":["T1"]},{"id":"F","name":"Fin","duration":0,"optimistic":0,"pessimistic":0,"deps":["T10"]}]}',


    okr: "Génère des OKRs pour ce projet." +
      " Nom: " + n + ". Description: " + d + "." +
      " CONTRAINTES: 4 objectifs stratégiques avec 3 KRs chacun, trimestres Q2-Q4 2026, catégories variées (Stratégique/Client/Qualité/Finance)." +
      ' JSON: {"objectives":[{"id":"O1","title":"[OBJECTIF]","description":"[DESC]","owner":"Chef de Projet","quarter":"Q2 2026","category":"Stratégique","keyResults":[{"id":"KR1","text":"[RÉSULTAT MESURABLE]","unit":"%","target":100,"current":0,"weight":1},{"id":"KR2","text":"[RÉSULTAT]","unit":"€","target":50000,"current":0,"weight":1},{"id":"KR3","text":"[RÉSULTAT]","unit":"items","target":10,"current":0,"weight":1}]}]}',
    sprint: "Génère une revue de sprint Agile pour ce projet." +
      " Nom: " + n + ". Description: " + d + "." +
      " CONTRAINTES: 2 sprints de 2 semaines, 5-7 user stories chacun, vélocité réaliste, rétrospective complète." +
      ' JSON: {"sprints":[{"id":"S1","num":1,"goal":"[OBJECTIF SPRINT]","startDate":"2026-05-01","endDate":"2026-05-14","velocity":0,"plannedPoints":34,"completedPoints":28,"stories":[{"id":"US1","title":"[US titre]","points":5,"status":"Terminé","assignee":"Dev Lead","priority":"Haute"},{"id":"US2","title":"[US titre]","points":3,"status":"Terminé","assignee":"Dev","priority":"Moyenne"}],"demo":"[DEMO NOTES]","retro":{"bien":["[POINT POSITIF]","[POINT POSITIF]"],"ameliorer":["[AMÉLIORATION]"],"actions":["[ACTION]"]}}]}',
    swot: "Génère une analyse SWOT pour ce projet." +
      " Nom: " + n + ". Description: " + d + "." +
      " CONTRAINTES: 4 forces, 3 faiblesses, 4 opportunités, 3 menaces, spécifiques au projet. 3 recommandations stratégiques." +
      ' JSON: {"S":[{"text":"[FORCE SPÉCIFIQUE]","score":4},{"text":"[FORCE]","score":3}],"W":[{"text":"[FAIBLESSE]","score":3}],"O":[{"text":"[OPPORTUNITÉ]","score":4}],"T":[{"text":"[MENACE]","score":3}],"strategic":["[RECOMMANDATION STRATÉGIQUE 1]","[RECOMMANDATION 2]","[RECOMMANDATION 3]"]}',
    communication: "Génère un plan de communication pour ce projet." +
      " Nom: " + n + ". Description: " + d + "." +
      " CONTRAINTES: 8 parties prenantes, canaux variés (Email/Réunion/Teams/Dashboard/Rapport), fréquences variées, influence/intérêt différenciés." +
      ' JSON: {"items":[{"stakeholder":"[NOM/RÔLE]","role":"[TITRE]","influence":"Élevée","interest":"Élevé","message":"[MESSAGE CLÉ]","channel":"Email","frequency":"Hebdomadaire","format":"Email","owner":"Chef de Projet","status":"Actif"}]}',
    decisions: "Génère un registre de décisions pour ce projet." +
      " Nom: " + n + ". Description: " + d + "." +
      " CONTRAINTES: 6 décisions importantes, dates réalistes, impacts variés (Critique/Élevé/Moyen), statuts variés." +
      ' JSON: {"items":[{"num":"DEC-001","date":"2026-05-01","title":"[TITRE DÉCISION]","description":"[CONTEXTE]","decision":"[DÉCISION PRISE]","owner":"Chef de Projet","deadline":"2026-06-01","status":"Appliquée","impact":"Élevé","tags":"Architecture","notes":""}]}',
    raci: "Génère une matrice RACI pour ce projet." +
      " Nom: " + n + ". Description: " + d + "." +
      " CONTRAINTES: 10 activités par phase, 5 acteurs (Chef de Projet/Sponsor/Équipe/Client/MOE), 1 seul A par activité." +
      ' JSON: {"actors":["Chef de Projet","Sponsor","Équipe Technique","Client","MOE"],"rows":[{"activity":"[ACTIVITÉ]","phase":"[PHASE]","responsible":"Chef de Projet","accountable":"Sponsor","consulted":"Client","informed":"MOE","notes":""}]}',
    "fiche-mission": "Génère une fiche de mission pour ce projet." +
      " Nom: " + n + ". Description: " + d + ". Budget: " + b + "€. Période: " + s + " → " + e + "." +
      ' JSON: {"fiche":{"codeMission":"' + n.slice(0,3).toUpperCase() + '001","version":"1.0","dateCreation":"' + s + '","dateRevision":"","client":"[CLIENT]","direction":"[DIRECTION]","contexte":"[CONTEXTE DÉTAILLÉ]","enjeux":"[ENJEUX BUSINESS]","intitule":"' + n + '","type":"Projet","perimetre":"[PÉRIMÈTRE INCLUS]","horsPerimetre":"[EXCLUSIONS]","objectifPrincipal":"[OBJECTIF PRINCIPAL]","objectifsSecondaires":["[OBJ 2]","[OBJ 3]"],"livrables":[{"titre":"[LIVRABLE]","echeance":"' + e + '","format":"Document Word"}],"chefProjet":"[NOM CP]","equipe":"[ÉQUIPE]","budget":"' + b + '€","duree":"[DURÉE]","instances":"COPIL mensuel, CODIR trimestriel","frequence":"Mensuel","escalade":"[ESCALADE]","contraintes":"[CONTRAINTES]","risquesPrincipaux":"[RISQUES]","hypotheses":"[HYPOTHÈSES]","commanditaire":"[SPONSOR]","dateValidation":"' + s + '"}}',
    "codir-commentary": "Génère un commentaire de rapport CODIR pour ce projet." +
      " Contexte: " + d + "." +
      " CONTRAINTES: synthèse factuelle 3-4 phrases, 3 décisions concrètes, 4 prochaines étapes avec responsables." +
      ' JSON: {"commentary":"[SYNTHÈSE FACTUELLE 3-4 PHRASES sur avancement, budget et risques]","decisions":["[DÉCISION 1 à prendre]","[DÉCISION 2]","[DÉCISION 3]"],"nextSteps":["[ACTION 1 — Responsable — Délai]","[ACTION 2]","[ACTION 3]","[ACTION 4]"]}',
    documents: "Génère une liste de documents projet." +
      " Nom: " + n + ". Description: " + d + "." +
      " CONTRAINTES: 8 documents adaptés au type de projet." +
      ' JSON: {"documents":[{"id":"DOC1","type":"[TYPE]","title":"[TITRE]","version":"v1.0","status":"[Approuvé|En révision|Brouillon|Actif]","author":"[ROLE]","date":"' + s + '","summary":"[DESC]","priority":"[Critique|Élevé|Moyen]"}]}',
  }

  return prompts[tool] ?? "Génère des données JSON pour l'outil " + tool + " du projet: " + n + ". Description: " + d
}
