"use client"
import { NavButtons } from "@/components/ui/BackButton"
'use client'
import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts"
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react"

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

interface Task {
  id: string; wbs: string; name: string
  pv: number[]; ev: number[]; ac: number[]
  bac: number; responsible: string; phase: string
}

interface EVMData {
  tasks: Task[]
  currentPeriod: number
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M€`
  if (n >= 1000) return `${(n/1000).toFixed(0)}k€`
  return `${n}€`
}

function KPIBadge({ label, value, sub, color, good }: any) {
  const Icon = good === null ? Minus : good ? TrendingUp : TrendingDown
  return (
    <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, padding:"10px 14px", minWidth:100 }}>
      <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{label}</p>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <p style={{ fontSize:20, fontWeight:700, color }}>{value}</p>
        <Icon size={16} color={color}/>
      </div>
      {sub && <p style={{ fontSize:10, color:"var(--text-2)", marginTop:2 }}>{sub}</p>}
    </div>
  )
}

export default function BudgetEVMPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "budget")
  const [evm, setEvm] = useState<EVMData>({ tasks: [], currentPeriod: new Date().getMonth() })
  const [tab, setTab] = useState<"rapport"|"pv"|"ev"|"ac"|"courbe"|"guide">("rapport")

  useEffect(() => {
    if (data?.tasks) setEvm(data as EVMData)
    else if (data?.lines) {
      // Migration depuis l'ancien format
      const tasks: Task[] = (data.lines as any[]).map((l: any, i: number) => ({
        id: l.id ?? `T${i}`,
        wbs: `${i+1}.0`,
        name: l.workpackage ?? l.phase,
        phase: l.phase,
        responsible: "Chef de Projet",
        bac: l.bac ?? 0,
        pv: Array(12).fill(0).map((_,m) => m <= (evm.currentPeriod) ? Math.round(l.pv / (evm.currentPeriod+1)) : 0),
        ev: Array(12).fill(0).map((_,m) => m <= (evm.currentPeriod) ? Math.round(l.ev / (evm.currentPeriod+1)) : 0),
        ac: Array(12).fill(0).map((_,m) => m <= (evm.currentPeriod) ? Math.round(l.ac / (evm.currentPeriod+1)) : 0),
      }))
      setEvm({ tasks, currentPeriod: new Date().getMonth() })
    }
  }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération Budget EVM...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"budget", projectName: project.name, projectDescription: project.description, budget: project.budget, startDate: project.start_date, endDate: project.end_date })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      // Convertir en format EVM avancé
      const lines = json.data?.lines ?? []
      const cp = new Date().getMonth()
      const tasks: Task[] = lines.map((l: any, i: number) => {
        const monthlyPV = Math.round(l.pv / (cp + 1))
        const monthlyEV = Math.round(l.ev / (cp + 1))
        const monthlyAC = Math.round(l.ac / (cp + 1))
        return {
          id: l.id ?? `T${i}`, wbs: `${i+1}.0`, name: l.workpackage, phase: l.phase,
          responsible: "Chef de Projet", bac: l.bac,
          pv: Array(12).fill(0).map((_,m) => m <= cp ? monthlyPV * (m+1) : l.bac),
          ev: Array(12).fill(0).map((_,m) => m <= cp ? monthlyEV * (m+1) : 0),
          ac: Array(12).fill(0).map((_,m) => m <= cp ? monthlyAC * (m+1) : 0),
        }
      })
      const newEvm = { tasks, currentPeriod: cp }
      setEvm(newEvm); await save(newEvm)
      toast.success(`Budget EVM généré — ${tasks.length} tâches`)
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const cp = evm.currentPeriod

  // KPIs période courante
  const totalPV  = evm.tasks.reduce((s,t) => s + (t.pv[cp] ?? 0), 0)
  const totalEV  = evm.tasks.reduce((s,t) => s + (t.ev[cp] ?? 0), 0)
  const totalAC  = evm.tasks.reduce((s,t) => s + (t.ac[cp] ?? 0), 0)
  const totalBAC = evm.tasks.reduce((s,t) => s + t.bac, 0)
  const CV  = totalEV - totalAC
  const SV  = totalEV - totalPV
  const CPI = totalAC > 0 ? totalEV / totalAC : 1
  const SPI = totalPV > 0 ? totalEV / totalPV : 1
  const EAC = CPI > 0 ? totalBAC / CPI : totalBAC
  const ETC = EAC - totalAC
  const TCPI = (totalBAC - totalEV) > 0 ? (totalBAC - totalEV) / (totalBAC - totalAC) : 1

  // Courbe S cumulée
  const curveData = MONTHS.map((m, i) => ({
    name: m,
    PV: evm.tasks.reduce((s,t) => s + (t.pv[i] ?? 0), 0),
    EV: i <= cp ? evm.tasks.reduce((s,t) => s + (t.ev[i] ?? 0), 0) : null,
    AC: i <= cp ? evm.tasks.reduce((s,t) => s + (t.ac[i] ?? 0), 0) : null,
    BAC: totalBAC,
  }))

  // Éditer une cellule
  const editCell = useCallback((taskId: string, type: "pv"|"ev"|"ac", month: number, val: number) => {
    setEvm(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId) return t
        const arr = [...t[type]]
        arr[month] = val
        return { ...t, [type]: arr }
      })
    }))
  }, [])

  const saveEvm = async () => {
    await save(evm)
    toast.success("Sauvegardé")
  }

  const TABS = [
    { key:"rapport", label:"📊 Rapport EVM" },
    { key:"pv",      label:"📋 Feuille PV" },
    { key:"ev",      label:"📋 Feuille EV" },
    { key:"ac",      label:"📋 Feuille AC" },
    { key:"courbe",  label:"📈 Courbe S" },
    { key:"guide",   label:"ℹ️ Guide EVM" },
  ] as const

  const MonthlyTable = ({ type }: { type: "pv"|"ev"|"ac" }) => {
    const totals = MONTHS.map((_,i) => evm.tasks.reduce((s,t) => s + (t[type][i]??0), 0))
    const grandTotal = evm.tasks.reduce((s,t) => s + t.bac, 0)
    const typeLabel = type === "pv" ? "PV (Planned Value)" : type === "ev" ? "EV (Earned Value)" : "AC (Actual Cost)"
    const typeColor = type === "pv" ? "#3b82f6" : type === "ev" ? "#a78bfa" : "#f59e0b"
    return (
      <div>
        <div style={{ background:"#0f172a", border:`1px solid ${typeColor}33`, borderRadius:8, padding:"10px 14px", marginBottom:12 }}>
          <p style={{ fontSize:12, color: typeColor, fontWeight:600 }}>{typeLabel}</p>
          <p style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>
            {type === "pv" ? "Budget cumulatif prévu à chaque période — calculé depuis le BAC." :
             type === "ev" ? "Valeur du travail réellement accompli à chaque période." :
             "Coût réel engagé à chaque période."}
          </p>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"linear-gradient(135deg,#1d4ed8,#2563eb)" }}>
                <th style={{ padding:"8px 10px", textAlign:"left", color:"#fff", fontSize:11, width:60 }}>WBS</th>
                <th style={{ padding:"8px 10px", textAlign:"left", color:"#fff", fontSize:11, minWidth:160 }}>Tâche</th>
                <th style={{ padding:"8px 10px", textAlign:"right", color:"#f59e0b", fontSize:11, width:70 }}>TBC</th>
                {MONTHS.map((m,i) => (
                  <th key={m} style={{ padding:"8px 6px", textAlign:"right", fontSize:10, width:58,
                    color: i === cp ? "#60a5fa" : "#94a3b8",
                    background: i === cp ? "rgba(59,130,246,0.15)" : "transparent" }}>
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evm.tasks.map((task, ri) => (
                <tr key={task.id} style={{ borderBottom:"1px solid #0f172a", background: ri%2===0?"#0f172a":"#0a0f1a" }}>
                  <td style={{ padding:"6px 10px", color:"var(--text-3)", fontFamily:"monospace" }}>{task.wbs}</td>
                  <td style={{ padding:"6px 10px", color:"var(--border)", fontWeight:500 }}>{task.name}</td>
                  <td style={{ padding:"6px 10px", textAlign:"right", color:"#f59e0b", fontWeight:700 }}>
                    {task.bac.toLocaleString("fr-FR")}
                  </td>
                  {MONTHS.map((_,mi) => {
                    const val = task[type][mi] ?? 0
                    return (
                      <td key={mi} style={{ padding:"3px 4px", background: mi===cp?"rgba(59,130,246,0.08)":"transparent" }}>
                        <input
                          type="number"
                          value={val === 0 ? "" : val}
                          onChange={e => editCell(task.id, type, mi, parseInt(e.target.value)||0)}
                          onBlur={saveEvm}
                          placeholder="–"
                          style={{
                            width:"100%", background:"transparent", border:"none", outline:"none",
                            textAlign:"right", fontSize:11, padding:"2px 4px", borderRadius:4,
                            color: val > 0 ? (mi===cp ? "#60a5fa" : "#94a3b8") : "#334155",
                            cursor:"text"
                          }}
                          onFocus={e => { e.target.style.background="#1e293b"; e.target.style.color="var(--border)" }}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background:"#1e293b", borderTop:"2px solid #2563eb" }}>
                <td colSpan={2} style={{ padding:"8px 10px", color:"#60a5fa", fontWeight:700, fontSize:12 }}>
                  Total {type.toUpperCase()}
                </td>
                <td style={{ padding:"8px 10px", textAlign:"right", color:"#f59e0b", fontWeight:700 }}>
                  {grandTotal.toLocaleString("fr-FR")}
                </td>
                {totals.map((t,i) => (
                  <td key={i} style={{ padding:"8px 6px", textAlign:"right", fontWeight:700, fontSize:11,
                    color: i===cp ? "#60a5fa" : "var(--border)",
                    background: i===cp ? "rgba(59,130,246,0.15)" : "transparent" }}>
                    {t > 0 ? t.toLocaleString("fr-FR") : "–"}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <ToolLayout title="Budget et Suivi EVM" icon="💰" subtitle="// EARNED VALUE MANAGEMENT"
        history={history}
        onLoadHistory={(e) => { loadHistory(e); if(e.data?.tasks) setEvm(e.data) }}
        onGenerate={generate} generateLabel="Générer depuis WBS" generating={loading}
        exportRows={evm.tasks.map(t => ({ WBS:t.wbs, Tâche:t.name, BAC:t.bac, PV_courant:t.pv[cp]??0, EV_courant:t.ev[cp]??0, AC_courant:t.ac[cp]??0 }))}
        exportFilename={`BudgetEVM_${project?.name??""}`}
        projectName={project?.name}>

        {/* Barre KPIs période */}
        <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12, color:"var(--text-3)", fontWeight:500 }}>Période courante :</span>
              <select value={cp} onChange={e => setEvm(prev => ({...prev, currentPeriod: +e.target.value}))}
                style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:6, color:"#60a5fa", padding:"4px 10px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                {MONTHS.map((m,i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <span style={{ fontSize:12, color:"var(--text-3)" }}>BAC total : <strong style={{ color:"var(--border)" }}>{fmt(totalBAC)}</strong></span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:8 }}>
            <KPIBadge label="PV" value={fmt(totalPV)} sub="Planifié" color="#3b82f6" good={null}/>
            <KPIBadge label="EV" value={fmt(totalEV)} sub="Acquis" color="#a78bfa" good={null}/>
            <KPIBadge label="AC" value={fmt(totalAC)} sub="Réel" color="#f59e0b" good={null}/>
            <KPIBadge label="CV" value={fmt(CV)} sub={CV>=0?"OK":"Dépassement"} color={CV>=0?"#22c55e":"#ef4444"} good={CV>=0}/>
            <KPIBadge label="SV" value={fmt(SV)} sub={SV>=0?"En avance":"Retard"} color={SV>=0?"#22c55e":"#ef4444"} good={SV>=0}/>
            <KPIBadge label="CPI" value={CPI.toFixed(2)} sub="Perf coût" color={CPI>=1?"#22c55e":"#ef4444"} good={CPI>=1}/>
            <KPIBadge label="SPI" value={SPI.toFixed(2)} sub="Perf délai" color={SPI>=1?"#22c55e":"#ef4444"} good={SPI>=1}/>
            <KPIBadge label="EAC" value={fmt(EAC)} sub="Prévision" color={EAC<=totalBAC?"#22c55e":"#ef4444"} good={EAC<=totalBAC}/>
          </div>
        </div>

        {/* 6 Onglets */}
        <div style={{ display:"flex", gap:4, marginBottom:16, flexWrap:"wrap" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              style={{
                padding:"7px 14px", borderRadius:8, border:"1px solid", fontSize:12, fontWeight:600, cursor:"pointer",
                borderColor: tab===t.key ? "var(--primary)" : "#1e293b",
                background: tab===t.key ? "#1e3a5f" : "#0f172a",
                color: tab===t.key ? "#60a5fa" : "#64748b",
                transition:"all 0.15s"
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu par onglet */}
        {evm.tasks.length === 0 && !loading && (
          <div style={{ background:"#0f172a", border:"1px dashed #1e293b", borderRadius:12, padding:48, textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>💰</div>
            <p style={{ fontSize:16, fontWeight:600, color:"var(--text-3)" }}>Aucun budget EVM</p>
            <p style={{ fontSize:13, color:"var(--text-2)", marginTop:8 }}>Cliquez sur "Générer depuis WBS" pour démarrer</p>
          </div>
        )}

        {/* RAPPORT */}
        {tab === "rapport" && evm.tasks.length > 0 && (
          <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid #1e293b", display:"flex", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontSize:16, fontWeight:700, color:"#f1f5f9" }}>{project?.name}</p>
                <p style={{ fontSize:12, color:"var(--text-3)" }}>Rapport Earned Value Analysis</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:12, color:"#60a5fa", fontWeight:600 }}>Période : {MONTHS[cp]}</p>
                <p style={{ fontSize:11, color:"var(--text-2)" }}>{new Date().toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"linear-gradient(135deg,#1d4ed8,#2563eb)" }}>
                  {["WBS","Tâche","BAC","PV","EV","AC","CV","CPI","SPI","EAC"].map(h => (
                    <th key={h} style={{ padding:"8px 10px", textAlign:"left", color:"#fff", fontSize:10, fontWeight:700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evm.tasks.map((t,i) => {
                  const pv = t.pv[cp]??0, ev = t.ev[cp]??0, ac = t.ac[cp]??0
                  const cv = ev-ac, cpi = ac>0?ev/ac:1, spi = pv>0?ev/pv:1
                  const eac = cpi>0?t.bac/cpi:t.bac
                  return (
                    <tr key={t.id} style={{ borderBottom:"1px solid #0f172a", background:i%2===0?"#0f172a":"#0a0f1a" }}>
                      <td style={{ padding:"7px 10px", color:"var(--text-3)", fontFamily:"monospace" }}>{t.wbs}</td>
                      <td style={{ padding:"7px 10px", color:"var(--border)", fontWeight:500 }}>{t.name}</td>
                      <td style={{ padding:"7px 10px", color:"#f59e0b", fontWeight:700 }}>{t.bac.toLocaleString("fr-FR")}</td>
                      <td style={{ padding:"7px 10px", color:"#3b82f6" }}>{pv.toLocaleString("fr-FR")}</td>
                      <td style={{ padding:"7px 10px", color:"#a78bfa" }}>{ev.toLocaleString("fr-FR")}</td>
                      <td style={{ padding:"7px 10px", color:"#f59e0b" }}>{ac.toLocaleString("fr-FR")}</td>
                      <td style={{ padding:"7px 10px", color:cv>=0?"#22c55e":"#ef4444", fontWeight:600 }}>{cv.toLocaleString("fr-FR")}</td>
                      <td style={{ padding:"7px 10px", color:cpi>=1?"#22c55e":"#ef4444", fontWeight:700 }}>{cpi.toFixed(2)}</td>
                      <td style={{ padding:"7px 10px", color:spi>=1?"#22c55e":"#ef4444", fontWeight:700 }}>{spi.toFixed(2)}</td>
                      <td style={{ padding:"7px 10px", color:eac<=t.bac?"#22c55e":"#ef4444" }}>{Math.round(eac).toLocaleString("fr-FR")}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background:"#1e293b", borderTop:"2px solid #2563eb", fontWeight:700 }}>
                  <td colSpan={2} style={{ padding:"8px 10px", color:"#60a5fa", fontSize:13 }}>TOTAL</td>
                  <td style={{ padding:"8px 10px", color:"#f59e0b" }}>{totalBAC.toLocaleString("fr-FR")}</td>
                  <td style={{ padding:"8px 10px", color:"#3b82f6" }}>{totalPV.toLocaleString("fr-FR")}</td>
                  <td style={{ padding:"8px 10px", color:"#a78bfa" }}>{totalEV.toLocaleString("fr-FR")}</td>
                  <td style={{ padding:"8px 10px", color:"#f59e0b" }}>{totalAC.toLocaleString("fr-FR")}</td>
                  <td style={{ padding:"8px 10px", color:CV>=0?"#22c55e":"#ef4444" }}>{CV.toLocaleString("fr-FR")}</td>
                  <td style={{ padding:"8px 10px", color:CPI>=1?"#22c55e":"#ef4444" }}>{CPI.toFixed(2)}</td>
                  <td style={{ padding:"8px 10px", color:SPI>=1?"#22c55e":"#ef4444" }}>{SPI.toFixed(2)}</td>
                  <td style={{ padding:"8px 10px", color:EAC<=totalBAC?"#22c55e":"#ef4444" }}>{Math.round(EAC).toLocaleString("fr-FR")}</td>
                </tr>
                <tr style={{ background:"#0f172a", borderTop:"1px solid #1e293b" }}>
                  <td colSpan={10} style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", gap:24, fontSize:11, color:"var(--text-3)" }}>
                      <span>ETC : <strong style={{ color:"var(--border)" }}>{fmt(ETC)}</strong></span>
                      <span>TCPI : <strong style={{ color:TCPI<=1?"#22c55e":"#ef4444" }}>{TCPI.toFixed(2)}</strong></span>
                      <span>Écart BAC : <strong style={{ color:EAC<=totalBAC?"#22c55e":"#ef4444" }}>{fmt(EAC-totalBAC)}</strong></span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {tab === "pv" && <MonthlyTable type="pv"/>}
        {tab === "ev" && <MonthlyTable type="ev"/>}
        {tab === "ac" && <MonthlyTable type="ac"/>}

        {/* COURBE S */}
        {tab === "courbe" && evm.tasks.length > 0 && (
          <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <p style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>Courbe S — EVM dynamique</p>
              <p style={{ fontSize:11, color:"var(--text-2)" }}>Mise à jour automatique à chaque saisie</p>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={curveData} margin={{ top:10, right:30, left:20, bottom:10 }}>
                <defs>
                  <linearGradient id="pvG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="evG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="acG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:11 }}/>
                <YAxis tick={{ fill:"#64748b", fontSize:11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
                <Tooltip
                  contentStyle={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:8 }}
                  labelStyle={{ color:"var(--border)", fontWeight:600 }}
                  formatter={(v: any, name: any) => [v ? `${v.toLocaleString("fr-FR")} €` : "–", name]}
                />
                <Legend wrapperStyle={{ fontSize:12 }}/>
                <ReferenceLine y={totalBAC} stroke="#475569" strokeDasharray="6 3" label={{ value:`BAC ${fmt(totalBAC)}`, position:"right", fill:"#64748b", fontSize:10 }}/>
                <ReferenceLine y={EAC} stroke="#7c3aed" strokeDasharray="4 2" label={{ value:`EAC ${fmt(EAC)}`, position:"right", fill:"#7c3aed", fontSize:10 }}/>
                <ReferenceLine x={MONTHS[cp]} stroke="var(--primary)" strokeWidth={2} label={{ value:"Auj.", position:"top", fill:"#60a5fa", fontSize:10 }}/>
                <Area type="monotone" dataKey="BAC" stroke="#475569" strokeDasharray="4 4" strokeWidth={1} fill="none" name="BAC (Baseline)"/>
                <Area type="monotone" dataKey="PV" stroke="#3b82f6" strokeWidth={2.5} fill="url(#pvG)" name="PV Planifié" dot={false}/>
                <Area type="monotone" dataKey="EV" stroke="#a78bfa" strokeWidth={2.5} fill="url(#evG)" name="EV Acquis" connectNulls={false} dot={{ r:4, fill:"#a78bfa" }}/>
                <Area type="monotone" dataKey="AC" stroke="#f59e0b" strokeWidth={2.5} fill="url(#acG)" name="AC Réel" connectNulls={false} dot={{ r:4, fill:"#f59e0b" }}/>
              </AreaChart>
            </ResponsiveContainer>

            {/* Annotations SV/CV/ETC */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:16 }}>
              {[
                { label:"Schedule Variance", value:fmt(SV), sub:SV>=0?"En avance":"En retard", color:SV>=0?"#22c55e":"#ef4444" },
                { label:"Cost Variance", value:fmt(CV), sub:CV>=0?"Sous budget":"Dépassement", color:CV>=0?"#22c55e":"#ef4444" },
                { label:"Estimate to Complete", value:fmt(ETC), sub:"Reste à dépenser", color:"#60a5fa" },
                { label:"TCPI", value:TCPI.toFixed(2), sub:"Efficacité requise", color:TCPI<=1?"#22c55e":"#ef4444" },
              ].map(item => (
                <div key={item.label} style={{ background:"#0a0f1a", border:`1px solid ${item.color}33`, borderRadius:8, padding:"10px 12px" }}>
                  <p style={{ fontSize:10, color:"var(--text-3)", marginBottom:4 }}>{item.label}</p>
                  <p style={{ fontSize:18, fontWeight:700, color:item.color }}>{item.value}</p>
                  <p style={{ fontSize:10, color:item.color, opacity:0.7 }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GUIDE EVM */}
        {tab === "guide" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { term:"PV — Planned Value", def:"Budget cumulatif prévu à chaque période, calculé automatiquement depuis le BAC et les dates du WBS. Ne pas modifier — c'est la référence de base du projet.", color:"#3b82f6" },
              { term:"EV — Earned Value", def:"Valeur monétaire du travail réellement accompli. EV = BAC × % d'avancement. Mesure ce qu'on a réellement produit.", color:"#a78bfa" },
              { term:"AC — Actual Cost", def:"Coût réel engagé pour réaliser le travail. Saisissez les coûts réels chaque mois dans la Feuille AC.", color:"#f59e0b" },
              { term:"CV — Cost Variance", def:"CV = EV – AC. Positif = sous budget. Négatif = dépassement budgétaire.", color:"#22c55e" },
              { term:"SV — Schedule Variance", def:"SV = EV – PV. Positif = en avance. Négatif = en retard sur le planning.", color:"#22c55e" },
              { term:"CPI — Cost Performance Index", def:"CPI = EV / AC. CPI > 1 = efficace (sous budget). CPI < 1 = inefficace (sur budget). Objectif : CPI ≥ 1.", color:"#22c55e" },
              { term:"SPI — Schedule Performance Index", def:"SPI = EV / PV. SPI > 1 = en avance. SPI < 1 = en retard. Objectif : SPI ≥ 1.", color:"#60a5fa" },
              { term:"EAC — Estimate at Completion", def:"Prévision du coût final. EAC = BAC / CPI. Si CPI < 1, le projet coûtera plus que prévu.", color:"#ef4444" },
              { term:"ETC — Estimate to Complete", def:"ETC = EAC – AC. Coût restant à engager pour terminer le projet.", color:"#60a5fa" },
              { term:"TCPI — To-Complete Performance Index", def:"Efficacité requise pour respecter le BAC. TCPI = (BAC–EV)/(BAC–AC). TCPI > 1 = effort supplémentaire requis.", color:"#f59e0b" },
            ].map(item => (
              <div key={item.term} style={{ background:"#0f172a", border:`1px solid ${item.color}22`, borderLeft:`3px solid ${item.color}`, borderRadius:8, padding:"12px 14px" }}>
                <p style={{ fontSize:12, fontWeight:700, color:item.color, marginBottom:6 }}>{item.term}</p>
                <p style={{ fontSize:12, color:"var(--text-3)", lineHeight:1.6 }}>{item.def}</p>
              </div>
            ))}
          </div>
        )}

      </ToolLayout>
    </AppLayout>
  )
}
