"use client"
import { useState } from "react"
import { X, ChevronRight, ChevronLeft, Lightbulb, CheckCircle2, Eye } from "lucide-react"

const EXAMPLES = {
  scrum: {
    name: "NovaPay — Lancement SaaS Paiement",
    description: "Développement et lancement d'une plateforme de paiement SaaS B2B intégrant IA de détection de fraude, API open banking et tableau de bord temps réel. Cible : 500 clients PME en 6 mois post-lancement.",
    client: "NovaPay Inc.",
    budget: "200000",
    sector: "IT / Cloud",
    environment: "Cloud AWS",
    team_size: "8",
    objectives: "Lancer MVP en 3 mois, 100 clients pilotes, NPS > 40",
    project_type: "app-web",
    methodology: "scrum",
    test_approach: "bdd",
    result: ["Sprint Review avec backlog 20 User Stories","OKR Tracker avec 3 objectifs clés","RAID avec 5 risques identifiés par l'IA"]
  },
  waterfall: {
    name: "Migration JBOSS EAP 7 → JBOSS EAP 8",
    description: "Migration de la plateforme middleware JBOSS EAP 7 vers JBOSS EAP 8 pour CNAM. 15 applications critiques, 0 interruption de service acceptée, conformité sécurité ANSSI.",
    client: "CNAM",
    budget: "350000",
    sector: "Administration Publique",
    environment: "Hybride",
    team_size: "6",
    objectives: "Migration 0 interruption, conformité ANSSI, délai 12 mois",
    project_type: "migration",
    methodology: "waterfall",
    test_approach: "none",
    result: ["WBS avec 45 livrables structurés","Gantt 18 mois avec chemin critique","RAID avec 8 risques techniques","Budget EVM avec CPI/SPI temps réel"]
  },
  cpmai: {
    name: "ACMA — Multi-Agent AI Collaboration",
    description: "Projet R&D CIR — Système multi-agents IA pour automatisation de la coordination de projets. 7 Work Packages, Claude API, architecture LangGraph, éligibilité CIR 30%.",
    client: "Atos / Interne",
    budget: "450000",
    sector: "IT / Cloud",
    environment: "Cloud Azure",
    team_size: "5",
    objectives: "PoC multi-agents validé T2, publication scientifique, brevet déposé",
    project_type: "ai-ml",
    methodology: "cpmai",
    test_approach: "tdd",
    result: ["WBS AI avec 7 Work Packages","Sprint ML avec cycles d'entraînement","RAID avec risques biais et conformité IA","Budget avec coûts compute GPU"]
  },
  hybride: {
    name: "Clinique Privée Al Shifa — Ouverture Rabat",
    description: "Ouverture d'une clinique privée 80 lits à Rabat — cardiologie, chirurgie, urgences 24h/24. Équipements médicaux high-tech IRM 3T, recrutement 120 praticiens, accréditation ministère santé.",
    client: "Groupe Santé Al Shifa",
    budget: "4200000",
    sector: "Santé / Médical",
    environment: "On-premise",
    team_size: "12",
    objectives: "Accréditation ministère santé, ouverture T4 2027, ISO 9001",
    project_type: "sante",
    methodology: "hybride",
    test_approach: "none",
    result: ["WBS 6 phases — Construction → Équipements → Accréditation","Gantt 24 mois avec jalons critiques","RAID avec risques accréditation et pénuries","Budget EVM 4.2M€ avec CPI/SPI","Work Packages par corps de métier"]
  }
}

const STEPS = [
  {
    id: "type",
    title: "1️⃣ Choisissez le type de projet",
    desc: "Le type de projet détermine le contexte et les enjeux spécifiques. PMO AI Studio adapte ses recommandations en conséquence.",
    tip: "Pour un projet applicatif avec MVP → choisissez 'Application Web/Mobile'. Pour un projet IA → choisissez 'Projet AI/ML' pour avoir le pipeline CPMAI.",
    example: "Exemple : NovaPay est une 'Application Web/Mobile' — développement d'un SaaS de paiement B2B.",
  },
  {
    id: "methode",
    title: "2️⃣ Choisissez la méthode de pilotage",
    desc: "La méthode détermine les outils proposés et le pipeline visuel. Chaque méthode a ses cérémonies et livrables spécifiques.",
    tip: "Projet avec livraisons fréquentes → Scrum ou Kanban. Projet réglementé avec planning fixe → Waterfall ou PMBOK. Projet AI → CPMAI obligatoire.",
    example: "NovaPay utilise 'Agile/Scrum' → le pipeline affiche Backlog → Sprint Planning → Daily → Review → Rétrospective.",
  },
  {
    id: "test",
    title: "3️⃣ Approche Test (optionnel)",
    desc: "Définissez comment votre équipe gère les tests. Cela influence la génération des User Stories et critères d'acceptation.",
    tip: "BDD est recommandé pour les projets SaaS (scénarios Gherkin). TDD pour les projets avec forte dette technique. DevOps pour les pipelines CI/CD.",
    example: "NovaPay choisit 'BDD' → les User Stories générées incluent des scénarios Given/When/Then.",
  },
  {
    id: "info",
    title: "4️⃣ Renseignez les informations",
    desc: "Plus les informations sont précises, meilleure sera la génération IA. Le nom et la description sont les plus importants.",
    tip: "La description doit inclure : contexte métier, objectifs, contraintes techniques, périmètre. L'IA utilise tout cela pour générer vos livrables.",
    example: "NovaPay — Description : 'Plateforme SaaS B2B, IA fraude, API open banking, cible 500 PME en 6 mois'.",
  },
  {
    id: "generer",
    title: "5️⃣ Générez avec l'IA",
    desc: "Cliquez sur un outil dans le panel droit pour créer le projet ET générer l'outil simultanément. Vous arriverez directement sur l'outil avec les données pré-remplies.",
    tip: "Conseil : commencez par le premier outil recommandé selon votre méthode. Pour Scrum → Sprint Review. Pour Waterfall → WBS.",
    example: "NovaPay → clic sur 'Sprint Review' → projet créé + backlog 20 User Stories généré par Claude AI en 30 secondes.",
  },
]

interface TutorialProps {
  onApplyExample: (example: typeof EXAMPLES.scrum) => void
  onClose: () => void
}

export default function TutorialGuide({ onApplyExample, onClose }: TutorialProps) {
  const [step, setStep]         = useState(0)
  const [open, setOpen]         = useState(true)
  const [preview, setPreview]   = useState<string|null>(null)

  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:8, fontSize:12, fontWeight:600, color:"#f59e0b", cursor:"pointer", marginBottom:16 }}>
      <Lightbulb size={13}/> Afficher le guide d'utilisation
    </button>
  )

  return (
    <div style={{ marginBottom:20 }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,rgba(123,94,255,0.12),rgba(245,158,11,0.08))", border:"1px solid rgba(123,94,255,0.25)", borderRadius:14, overflow:"hidden" }}>

        {/* Barre titre */}
        <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(123,94,255,0.15)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Lightbulb size={16} style={{ color:"#f59e0b" }}/>
            <span style={{ fontSize:14, fontWeight:700, color:"var(--text-1)" }}>Guide d'utilisation — Comment créer votre projet</span>
            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"rgba(245,158,11,0.15)", color:"#f59e0b", fontWeight:700 }}>
              Étape {step+1}/{STEPS.length}
            </span>
          </div>
          <button onClick={() => { setOpen(false); onClose() }}
            style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text-3)", padding:4 }}>
            <X size={15}/>
          </button>
        </div>

        {/* Contenu étape */}
        <div style={{ padding:"16px 18px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

            {/* Gauche — contenu */}
            <div>
              <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text-1)", margin:"0 0 8px" }}>{STEPS[step].title}</h3>
              <p style={{ fontSize:12, color:"var(--text-2)", margin:"0 0 10px", lineHeight:1.6 }}>{STEPS[step].desc}</p>
              <div style={{ padding:"8px 12px", background:"rgba(245,158,11,0.08)", borderRadius:8, borderLeft:"3px solid #f59e0b", marginBottom:10 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#f59e0b", marginBottom:3 }}>💡 CONSEIL</div>
                <p style={{ fontSize:11, color:"var(--text-2)", margin:0, lineHeight:1.5 }}>{STEPS[step].tip}</p>
              </div>
              <div style={{ padding:"8px 12px", background:"rgba(34,197,94,0.06)", borderRadius:8, borderLeft:"3px solid #22c55e" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#22c55e", marginBottom:3 }}>📌 EXEMPLE</div>
                <p style={{ fontSize:11, color:"var(--text-2)", margin:0, lineHeight:1.5 }}>{STEPS[step].example}</p>
              </div>
            </div>

            {/* Droite — exemples à appliquer */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--text-2)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                📋 Exemples prêts à l'emploi — cliquez pour pré-remplir
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {Object.entries(EXAMPLES).map(([key, ex]) => (
                  <div key={key}
                    style={{ padding:"10px 12px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:9, cursor:"pointer", transition:"all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as any).style.borderColor="var(--primary)"; (e.currentTarget as any).style.background="rgba(123,94,255,0.06)" }}
                    onMouseLeave={e => { (e.currentTarget as any).style.borderColor="var(--border)"; (e.currentTarget as any).style.background="var(--bg-card)" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"var(--text-1)" }}>{ex.name.slice(0,35)}...</div>
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={(e) => { e.stopPropagation(); setPreview(preview===key?null:key) }}
                          style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:5, padding:"2px 7px", fontSize:10, color:"var(--text-3)", cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
                          <Eye size={9}/> Voir
                        </button>
                        <button onClick={() => { onApplyExample(ex); onClose() }}
                          style={{ background:"var(--primary)", border:"none", borderRadius:5, padding:"2px 10px", fontSize:10, color:"#fff", cursor:"pointer", fontWeight:600 }}>
                          Utiliser →
                        </button>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:5 }}>
                      <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:"rgba(123,94,255,0.15)", color:"var(--primary-light)" }}>{ex.methodology}</span>
                      <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:"rgba(34,197,94,0.1)", color:"#22c55e" }}>{ex.sector}</span>
                      <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:"rgba(245,158,11,0.1)", color:"#f59e0b" }}>{(+ex.budget/1000).toFixed(0)}k€</span>
                    </div>
                    {/* Preview résultat attendu */}
                    {preview === key && (
                      <div style={{ marginTop:8, padding:"8px 10px", background:"rgba(34,197,94,0.06)", borderRadius:7, borderLeft:"2px solid #22c55e" }}>
                        <div style={{ fontSize:9, fontWeight:700, color:"#22c55e", marginBottom:4 }}>✅ RÉSULTAT ATTENDU :</div>
                        {ex.result.map((r,i) => (
                          <div key={i} style={{ fontSize:10, color:"var(--text-2)", display:"flex", gap:5, marginBottom:2 }}>
                            <CheckCircle2 size={9} style={{ color:"#22c55e", flexShrink:0, marginTop:1 }}/>
                            {r}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation étapes */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14, paddingTop:12, borderTop:"1px solid rgba(123,94,255,0.15)" }}>
            {/* Points de progression */}
            <div style={{ display:"flex", gap:6 }}>
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => setStep(i)}
                  style={{ width:i===step?20:8, height:8, borderRadius:4, background:i===step?"var(--primary)":i<step?"rgba(123,94,255,0.4)":"var(--border)", border:"none", cursor:"pointer", transition:"all 0.2s" }}/>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s-1)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", background:"transparent", border:"1px solid var(--border)", borderRadius:7, fontSize:12, color:"var(--text-2)", cursor:"pointer" }}>
                  <ChevronLeft size={12}/> Précédent
                </button>
              )}
              {step < STEPS.length-1 ? (
                <button onClick={() => setStep(s => s+1)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", background:"var(--primary)", border:"none", borderRadius:7, fontSize:12, color:"#fff", cursor:"pointer", fontWeight:600 }}>
                  Suivant <ChevronRight size={12}/>
                </button>
              ) : (
                <button onClick={() => { setOpen(false); onClose() }}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", background:"#22c55e", border:"none", borderRadius:7, fontSize:12, color:"#fff", cursor:"pointer", fontWeight:600 }}>
                  <CheckCircle2 size={12}/> Compris, je crée mon projet !
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
