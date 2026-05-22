"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Plus, Trash2, Zap } from "lucide-react"

interface SWOTItem { id:string; text:string; score:number; category:"S"|"W"|"O"|"T" }
interface SWOTData { items:SWOTItem[]; strategic:string[] }

const QUAD = {
  S: { label:"Forces",    emoji:"💪", color:"#22c55e", bg:"rgba(34,197,94,0.08)",   border:"rgba(34,197,94,0.25)",   desc:"Avantages internes" },
  W: { label:"Faiblesses",emoji:"⚠️", color:"#ef4444", bg:"rgba(239,68,68,0.08)",   border:"rgba(239,68,68,0.25)",   desc:"Points à améliorer" },
  O: { label:"Opportunités",emoji:"🚀",color:"#3b82f6", bg:"rgba(59,130,246,0.08)",  border:"rgba(59,130,246,0.25)",  desc:"Facteurs externes positifs" },
  T: { label:"Menaces",   emoji:"🛡️", color:"#f59e0b", bg:"rgba(245,158,11,0.08)",  border:"rgba(245,158,11,0.25)",  desc:"Risques externes" },
} as const

export default function SWOTPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory, deleteHistory } = useToolData(id, "swot")

  const [items, setItems]       = useState<SWOTItem[]>([])
  const [strategic, setStrategic] = useState<string[]>([])
  const [newTexts, setNewTexts] = useState<Record<string,string>>({ S:"", W:"", O:"", T:"" })
  const [newScores, setNewScores] = useState<Record<string,number>>({ S:3, W:3, O:3, T:3 })
  const [activeQuad, setActiveQuad] = useState<"S"|"W"|"O"|"T"|null>(null)

  useState(() => {
    if (data?.items?.length) setItems(data.items)
    if (data?.strategic?.length) setStrategic(data.strategic)
  })

  const saveAll = async (its:SWOTItem[], strat:string[]) => {
    setItems(its); setStrategic(strat); await save({ items:its, strategic:strat })
  }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération SWOT en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"swot", projectName:project.name, projectDescription:project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const raw = json.data
      const newItems: SWOTItem[] = []
      ;(["S","W","O","T"] as const).forEach(cat => {
        const arr = raw?.[cat] ?? raw?.[cat.toLowerCase()] ?? []
        arr.forEach((t:any, i:number) => newItems.push({
          id: cat+Date.now()+i, text: typeof t==="string"?t:t.text??t.item??"",
          score: t.score??3, category:cat
        }))
      })
      const strat = raw?.strategic ?? raw?.strategies ?? []
      await saveAll(newItems, strat)
      toast.success("SWOT généré — "+newItems.length+" éléments")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const addItem = (cat:"S"|"W"|"O"|"T") => {
    if (!newTexts[cat]) return
    const it: SWOTItem = { id:cat+Date.now(), text:newTexts[cat], score:newScores[cat], category:cat }
    const updated = [...items, it]
    saveAll(updated, strategic)
    setNewTexts(p => ({ ...p, [cat]:"" }))
    toast.success("Élément ajouté")
  }

  const deleteItem = (id:string) => saveAll(items.filter(i=>i.id!==id), strategic)

  const scoreColor = (s:number) => s>=4?"#22c55e":s>=3?"#f59e0b":"#ef4444"

  const toRows = () => items.map(i => ({ Catégorie:QUAD[i.category].label, Texte:i.text, Score:i.score }))

  // Calcul scores globaux
  const globalScores = (["S","W","O","T"] as const).map(cat => ({
    cat, ...QUAD[cat],
    total: items.filter(i=>i.category===cat).reduce((s,i)=>s+i.score,0),
    count: items.filter(i=>i.category===cat).length,
  }))

  return (
    <AppLayout>
      <ToolLayout title="Matrice SWOT" icon="🔍" subtitle="// ANALYSE STRATÉGIQUE"
        history={history} onLoadHistory={(e) => { loadHistory(e); if(e.data?.items) { setItems(e.data.items); setStrategic(e.data.strategic??[]) } }}
        onGenerate={generate} generateLabel="Générer SWOT" generating={loading}
        exportRows={toRows()} exportFilename={"SWOT_"+(project?.name??"")} projectName={project?.name}
        gammaType="codir" gammaData={data}>

        {/* Scores globaux */}
        {items.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
            {globalScores.map(q => (
              <div key={q.cat} style={{ background:q.bg, border:"1px solid "+q.border, borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{q.emoji}</div>
                <div style={{ fontSize:11, fontWeight:700, color:q.color, marginBottom:2 }}>{q.label}</div>
                <div style={{ fontSize:20, fontWeight:900, color:q.color }}>{q.count} items</div>
                <div style={{ fontSize:10, color:"var(--text-3)" }}>Score moy: {q.count>0?(q.total/q.count).toFixed(1):"-"}/5</div>
              </div>
            ))}
          </div>
        )}

        {/* Matrice 2×2 */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          {(["S","W","O","T"] as const).map(cat => {
            const q = QUAD[cat]
            const catItems = items.filter(i=>i.category===cat)
            const isActive = activeQuad===cat
            return (
              <div key={cat} style={{ background:q.bg, border:"2px solid "+(isActive?q.color:q.border), borderRadius:12, padding:"14px 16px", transition:"border-color 0.15s" }}>
                {/* Header */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:20 }}>{q.emoji}</span>
                  <div>
                    <h3 style={{ fontSize:13, fontWeight:800, color:q.color, margin:0 }}>{q.label}</h3>
                    <p style={{ fontSize:10, color:"var(--text-3)", margin:0 }}>{q.desc}</p>
                  </div>
                  <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color:q.color, background:q.color+"22", padding:"2px 8px", borderRadius:8 }}>{catItems.length}</span>
                </div>

                {/* Items */}
                <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10, minHeight:60 }}>
                  {catItems.map(item => (
                    <div key={item.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:"var(--bg-card)", borderRadius:7, border:"1px solid var(--border)" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:scoreColor(item.score), flexShrink:0 }}/>
                      <span style={{ flex:1, fontSize:11, color:"var(--text-1)", lineHeight:1.4 }}>{item.text}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:scoreColor(item.score), flexShrink:0 }}>{item.score}/5</span>
                      <button onClick={()=>deleteItem(item.id)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text-3)", padding:2, flexShrink:0 }}><Trash2 size={10}/></button>
                    </div>
                  ))}
                  {catItems.length===0 && <p style={{ fontSize:11, color:"var(--text-3)", textAlign:"center", padding:"10px 0" }}>Aucun élément</p>}
                </div>

                {/* Ajout inline */}
                <div style={{ display:"flex", gap:6 }}>
                  <input value={newTexts[cat]} onChange={e=>setNewTexts(p=>({...p,[cat]:e.target.value}))}
                    onFocus={()=>setActiveQuad(cat)} onBlur={()=>setActiveQuad(null)}
                    onKeyDown={e=>e.key==="Enter"&&addItem(cat)}
                    placeholder={"Ajouter une "+q.label.toLowerCase().slice(0,-1)+"..."}
                    style={{ flex:1, fontSize:11, border:"1px solid "+q.border, borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)", outline:"none" }}/>
                  <select value={newScores[cat]} onChange={e=>setNewScores(p=>({...p,[cat]:+e.target.value}))}
                    style={{ width:50, fontSize:11, border:"1px solid "+q.border, borderRadius:6, padding:"5px 4px", background:"var(--bg)", color:q.color, fontWeight:700 }}>
                    {[1,2,3,4,5].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={()=>addItem(cat)} style={{ padding:"5px 10px", background:q.color, color:"#fff", border:"none", borderRadius:6, cursor:"pointer" }}>
                    <Plus size={12}/>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recommandations stratégiques IA */}
        {strategic.length > 0 && (
          <div style={{ background:"rgba(123,94,255,0.08)", border:"1px solid rgba(123,94,255,0.25)", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <Zap size={14} style={{ color:"var(--primary-light)" }}/>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--primary-light)", margin:0 }}>Recommandations stratégiques IA</h3>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {strategic.map((s,i) => (
                <div key={i} style={{ display:"flex", gap:10, padding:"8px 12px", background:"var(--bg-card)", borderRadius:8, border:"1px solid rgba(123,94,255,0.15)" }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"var(--primary-light)", flexShrink:0 }}>{i+1}.</span>
                  <span style={{ fontSize:12, color:"var(--text-1)", lineHeight:1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && !loading && (
          <div style={{ textAlign:"center", padding:"50px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Matrice SWOT vide</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez ou saisissez vos forces, faiblesses, opportunités et menaces</p>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
