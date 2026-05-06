"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CheckCircle2, Circle, ArrowRight, Wand2 } from "lucide-react"

const STEPS = [
  { id: 1, label: "Informations projet",   icon: "📋", done: false },
  { id: 2, label: "WBS Structure",          icon: "🗂️", done: false },
  { id: 3, label: "Planning Gantt",         icon: "📅", done: false },
  { id: 4, label: "Registre RAID",          icon: "⚠️", done: false },
  { id: 5, label: "Budget EVM",             icon: "💰", done: false },
  { id: 6, label: "Work Packages",          icon: "📦", done: false },
]

const ICONS = ["📋","🚀","💡","🏗️","🔬","📊","🎯","⚙️","🌐","🔧"]
const COLORS = ["#2563eb","#7c3aed","#059669","#d97706","#dc2626","#0891b2"]
const METHODS = ["PMI/PMBOK","Agile/Scrum","SAFe","PRINCE2","Hybride"]

export default function GuidePage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "", description: "", client: "",
    budget: "", start_date: "", end_date: "",
    team: "", methodology: "PMI/PMBOK",
    icon: "📋", color: "#2563eb"
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const createProject = async () => {
    if (!form.name) { toast.error("Le nom du projet est requis"); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const team = form.team.split(",").map(t => t.trim()).filter(Boolean)
    const { data, error } = await supabase.from("projects").insert({
      user_id: user!.id,
      name: form.name, description: form.description,
      client: form.client,
      budget: form.budget ? parseFloat(form.budget) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      team, methodology: form.methodology,
      icon: form.icon, color: form.color,
      status: "active", completion: 0
    }).select().single()
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success("Projet créé !")
    router.push(`/projects/${data.id}`)
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Wand2 size={20}/><span className="text-sm font-semibold uppercase tracking-wide">Guide Chef de Projet</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Créer un nouveau projet</h1>
          <p className="text-muted-foreground mt-1">Renseignez les informations et l'IA générera tous vos outils PMO automatiquement.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                step === s.id ? "bg-primary text-white" :
                step > s.id ? "bg-green-500/20 text-green-400" :
                "bg-muted text-muted-foreground"
              }`}>
                {step > s.id ? <CheckCircle2 size={12}/> : <Circle size={12}/>}
                {s.icon} {s.label}
              </div>
              {i < STEPS.length - 1 && <ArrowRight size={14} className="text-muted-foreground flex-shrink-0"/>}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">📋 Informations du projet</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1.5">Nom du projet *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Ex: Migration Plateforme JBoss"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="Contexte, objectifs, périmètre..."
                rows={3}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"/>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Client / Commanditaire</label>
              <input value={form.client} onChange={e => set("client", e.target.value)}
                placeholder="Ex: CNAM, BNP Paribas..."
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Budget (€)</label>
              <input type="number" value={form.budget} onChange={e => set("budget", e.target.value)}
                placeholder="Ex: 150000"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Date de début</label>
              <input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Date de fin</label>
              <input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Méthodologie</label>
              <select value={form.methodology} onChange={e => set("methodology", e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Équipe (séparée par virgules)</label>
              <input value={form.team} onChange={e => set("team", e.target.value)}
                placeholder="Alice, Bob, Charlie..."
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>

            {/* Icon picker */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Icône</label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => set("icon", ic)}
                    className={`w-9 h-9 rounded-lg text-lg transition-all ${form.icon === ic ? "bg-primary ring-2 ring-primary" : "bg-muted hover:bg-accent"}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Couleur</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => set("color", c)}
                    style={{ background: c }}
                    className={`w-9 h-9 rounded-lg transition-all ${form.color === c ? "ring-2 ring-white scale-110" : "opacity-70 hover:opacity-100"}`}/>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-background border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ background: form.color + "22", border: `1px solid ${form.color}44` }}>
              {form.icon}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{form.name || "Nom du projet"}</p>
              <p className="text-xs text-muted-foreground">{form.client || "Client"} · {form.methodology}</p>
            </div>
            {form.budget && (
              <span className="ml-auto text-sm font-medium" style={{ color: form.color }}>
                {parseInt(form.budget).toLocaleString("fr-FR")} €
              </span>
            )}
          </div>

          <button onClick={createProject} disabled={loading || !form.name}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? "⏳ Création..." : "✨ Créer le projet et accéder aux outils →"}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
