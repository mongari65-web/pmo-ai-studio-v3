"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { useProject } from "@/hooks/useProject"
import Link from "next/link"
import { ArrowLeft, FileText, Download, Eye, CheckSquare, Square } from "lucide-react"

const SECTIONS = [
  { key: "wbs",           label: "WBS — Structure de découpage",  icon: "🗂️", desc: "Hiérarchie complète des livrables" },
  { key: "gantt",         label: "Planning Gantt",                 icon: "📅", desc: "Tâches, phases et chemin critique" },
  { key: "raid",          label: "Registre RAID",                  icon: "⚠️", desc: "Risques, actions, issues, décisions" },
  { key: "jalons",        label: "Jalons",                         icon: "🏁", desc: "Étapes clés et statuts" },
  { key: "budget",        label: "Budget EVM",                     icon: "💰", desc: "Analyse de la valeur acquise" },
  { key: "workpackages",  label: "Work Packages",                  icon: "📦", desc: "Lots de travaux et avancement" },
]

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const [selected, setSelected] = useState<string[]>(["all"])
  const [generating, setGenerating] = useState(false)

  const toggleAll = () => {
    if (selected.includes("all")) setSelected([])
    else setSelected(["all"])
  }

  const toggle = (key: string) => {
    const withoutAll = selected.filter(s => s !== "all")
    if (withoutAll.includes(key)) {
      setSelected(withoutAll.filter(s => s !== key))
    } else {
      const newSel = [...withoutAll, key]
      if (newSel.length === SECTIONS.length) setSelected(["all"])
      else setSelected(newSel)
    }
  }

  const isSelected = (key: string) => selected.includes("all") || selected.includes(key)

  const generatePDF = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/export/pdf/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: selected })
      })
      if (!res.ok) throw new Error("Erreur génération")
      const html = await res.text()

      // Ouvrir dans nouvelle fenêtre pour impression
      const w = window.open("", "_blank")!
      w.document.write(html)
      w.document.close()
    } catch (e: any) {
      alert("Erreur : " + e.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${id}`} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16}/>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText size={20}/> Rapport PDF complet
            </h1>
            <p className="text-sm text-muted-foreground">{project?.name}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-foreground font-medium mb-1">📄 Rapport professionnel multi-outils</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Génère un rapport PDF complet conforme PMBOK 7 avec page de couverture, sommaire, synthèse exécutive et tous les outils sélectionnés. Prêt pour le CODIR.
          </p>
        </div>

        {/* Section selector */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <p className="text-sm font-semibold text-foreground">Sections à inclure</p>
            <button onClick={toggleAll} className="flex items-center gap-2 text-xs text-primary hover:underline">
              {selected.includes("all") ? <CheckSquare size={14}/> : <Square size={14}/>}
              {selected.includes("all") ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
          </div>
          <div className="divide-y divide-border">
            {/* Synthèse toujours incluse */}
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/10">
              <CheckSquare size={16} className="text-green-400 flex-shrink-0"/>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">📊 Synthèse exécutive</p>
                <p className="text-xs text-muted-foreground">KPIs, alertes, résumé général — toujours incluse</p>
              </div>
              <span className="text-xs text-green-400 font-medium">Obligatoire</span>
            </div>
            {SECTIONS.map(s => (
              <button key={s.key} onClick={() => toggle(s.key)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/20 transition-colors text-left">
                {isSelected(s.key)
                  ? <CheckSquare size={16} className="text-primary flex-shrink-0"/>
                  : <Square size={16} className="text-muted-foreground flex-shrink-0"/>}
                <span className="text-lg flex-shrink-0">{s.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={generatePDF} disabled={generating || selected.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {generating ? (
              <>⏳ Génération en cours...</>
            ) : (
              <><Eye size={16}/> Aperçu & Impression PDF</>
            )}
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Le rapport s'ouvre dans un nouvel onglet · Utilisez Ctrl+P / ⌘+P pour enregistrer en PDF
        </p>
      </div>
    </AppLayout>
  )
}
