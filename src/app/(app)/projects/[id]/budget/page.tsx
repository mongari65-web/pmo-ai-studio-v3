'use client'
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Pencil, Check, X, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface BudgetLine {
  id: string; phase: string; workpackage: string
  bac: number; pv: number; ev: number; ac: number
  cpi: number; spi: number; eac: number; status: string
}

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  "Terminé":  { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  "En cours": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  "Planifié": { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  "En retard":{ color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
}

function KPICard({ label, value, sub, color, trend }: any) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold" style={{ color }}>{value}</p>
        <Icon size={18} style={{ color }} />
      </div>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function fmt(n: number) {
  return n >= 1000 ? `${(n/1000).toFixed(0)}k€` : `${n}€`
}

export default function BudgetPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "budget")
  const [lines, setLines] = useState<BudgetLine[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [editRow, setEditRow] = useState<BudgetLine | null>(null)
  const [activeTab, setActiveTab] = useState<"chart" | "table">("chart")

  useEffect(() => { if (data?.lines) setLines(data.lines) }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération Budget EVM...")
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "budget", projectName: project.name, projectDescription: project.description, budget: project.budget })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newLines = json.data?.lines ?? []
      setLines(newLines); await save({ lines: newLines })
      toast.success(`Budget généré — ${newLines.length} phases`)
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  // KPIs globaux
  const totalBAC = lines.reduce((s, l) => s + l.bac, 0)
  const totalEV  = lines.reduce((s, l) => s + l.ev, 0)
  const totalAC  = lines.reduce((s, l) => s + l.ac, 0)
  const totalPV  = lines.reduce((s, l) => s + l.pv, 0)
  const globalCPI = totalAC > 0 ? (totalEV / totalAC) : 1
  const globalSPI = totalPV > 0 ? (totalEV / totalPV) : 1
  const globalEAC = globalCPI > 0 ? (totalBAC / globalCPI) : totalBAC
  const CV = totalEV - totalAC
  const SV = totalEV - totalPV

  // Courbe S data
  const chartData = lines.map(l => ({
    name: l.phase.replace("Phase ", "P").replace(" —", ""),
    PV: l.pv, EV: l.ev, AC: l.ac, BAC: l.bac
  }))

  const startEdit = (l: BudgetLine) => { setEditId(l.id); setEditRow({ ...l }) }
  const cancelEdit = () => { setEditId(null); setEditRow(null) }
  const confirmEdit = async () => {
    if (!editRow) return
    const r = { ...editRow }
    r.cpi = r.ac > 0 ? parseFloat((r.ev / r.ac).toFixed(2)) : 1
    r.spi = r.pv > 0 ? parseFloat((r.ev / r.pv).toFixed(2)) : 1
    r.eac = r.cpi > 0 ? parseFloat((r.bac / r.cpi).toFixed(0)) : r.bac
    const updated = lines.map(l => l.id === r.id ? r : l)
    setLines(updated); setEditId(null); setEditRow(null)
    await save({ lines: updated })
  }

  const toRows = () => lines.map(l => ({
    Phase: l.phase, WP: l.workpackage, BAC: l.bac, PV: l.pv,
    EV: l.ev, AC: l.ac, CPI: l.cpi, SPI: l.spi, EAC: l.eac, Statut: l.status
  }))

  return (
    <AppLayout>
      <ToolLayout title="Budget EVM" icon="💰" subtitle="// EARNED VALUE MANAGEMENT"
        history={history}
        onLoadHistory={(e) => { loadHistory(e); if (e.data?.lines) setLines(e.data.lines) }}
        onGenerate={generate} generateLabel="Générer Budget EVM" generating={loading}
        exportRows={toRows()} exportFilename={`Budget_${project?.name ?? ""}`}
        projectName={project?.name}>

        {lines.length === 0 && !loading && (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-3">💰</div>
            <p className="font-semibold text-foreground mb-1">Aucun budget EVM</p>
            <p className="text-sm text-muted-foreground">Cliquez sur "Générer Budget EVM" pour démarrer</p>
          </div>
        )}

        {lines.length > 0 && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-6 gap-3">
              <KPICard label="BAC Total" value={fmt(totalBAC)} sub="Budget at Completion" color="#60a5fa" trend="none"/>
              <KPICard label="Valeur Acquise" value={fmt(totalEV)} sub="Earned Value" color="#a78bfa" trend="none"/>
              <KPICard label="Coût Réel" value={fmt(totalAC)} sub="Actual Cost" color="#f59e0b" trend="none"/>
              <KPICard label="CPI" value={globalCPI.toFixed(2)} sub={CV >= 0 ? `CV: +${fmt(CV)}` : `CV: ${fmt(CV)}`} color={globalCPI >= 1 ? "#22c55e" : "#ef4444"} trend={globalCPI >= 1 ? "up" : "down"}/>
              <KPICard label="SPI" value={globalSPI.toFixed(2)} sub={SV >= 0 ? `SV: +${fmt(SV)}` : `SV: ${fmt(SV)}`} color={globalSPI >= 1 ? "#22c55e" : "#ef4444"} trend={globalSPI >= 1 ? "up" : "down"}/>
              <KPICard label="EAC Prévision" value={fmt(globalEAC)} sub={`Écart: ${fmt(globalEAC - totalBAC)}`} color={globalEAC <= totalBAC ? "#22c55e" : "#ef4444"} trend={globalEAC <= totalBAC ? "up" : "down"}/>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
              {(["chart", "table"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {tab === "chart" ? "📈 Courbes S" : "📋 Tableau"}
                </button>
              ))}
            </div>

            {/* Courbes S */}
            {activeTab === "chart" && (
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-sm font-semibold text-foreground mb-4">Courbes S — PV / EV / AC par phase</p>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="acGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }}/>
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={v => `${v/1000}k`}/>
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                      labelStyle={{ color: "#e2e8f0" }}
                      formatter={(v: any) => [`${v.toLocaleString("fr-FR")} €`]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }}/>
                    <Area type="monotone" dataKey="BAC" stroke="#475569" strokeDasharray="4 4" strokeWidth={1.5} fill="none" name="BAC (Baseline)"/>
                    <Area type="monotone" dataKey="PV" stroke="#3b82f6" strokeWidth={2} fill="url(#pvGrad)" name="PV (Valeur Planifiée)"/>
                    <Area type="monotone" dataKey="EV" stroke="#a78bfa" strokeWidth={2} fill="url(#evGrad)" name="EV (Valeur Acquise)"/>
                    <Area type="monotone" dataKey="AC" stroke="#f59e0b" strokeWidth={2} fill="url(#acGrad)" name="AC (Coût Réel)"/>
                  </AreaChart>
                </ResponsiveContainer>

                {/* CPI/SPI mini chart */}
                <p className="text-sm font-semibold text-foreground mt-6 mb-4">Indices de performance CPI / SPI</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={lines.map(l => ({ name: l.phase.split("—")[1]?.trim() ?? l.phase, CPI: l.cpi, SPI: l.spi }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }}/>
                    <YAxis domain={[0.5, 1.5]} tick={{ fill: "#64748b", fontSize: 11 }}/>
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} labelStyle={{ color: "#e2e8f0" }}/>
                    <Legend wrapperStyle={{ fontSize: 12 }}/>
                    <Line type="monotone" dataKey="CPI" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="CPI (coût)"/>
                    <Line type="monotone" dataKey="SPI" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4 }} name="SPI (délai)"/>
                    {/* Ligne de référence à 1 */}
                    <Line type="monotone" data={[{ name: "", CPI: 1 }, { name: "", CPI: 1 }]} dataKey="CPI" stroke="#475569" strokeDasharray="4 4" strokeWidth={1} name="Référence (1.0)" dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Tableau éditable */}
            {activeTab === "table" && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-primary/20 border-b border-border">
                      {["Phase","Work Package","BAC","PV","EV","AC","CPI","SPI","EAC","Statut",""].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map(line => {
                      const cfg = STATUS_CFG[line.status] ?? { color: "#64748b", bg: "transparent" }
                      const isEdit = editId === line.id
                      return (
                        <tr key={line.id} className="border-b border-border hover:bg-accent/20 transition-colors group">
                          {isEdit && editRow ? (
                            <>
                              <td className="px-2 py-1.5"><input value={editRow.phase} onChange={e => setEditRow({...editRow, phase: e.target.value})} className="w-full bg-background border border-primary/40 rounded px-2 py-1 text-xs"/></td>
                              <td className="px-2 py-1.5"><input value={editRow.workpackage} onChange={e => setEditRow({...editRow, workpackage: e.target.value})} className="w-full bg-background border border-primary/40 rounded px-2 py-1 text-xs"/></td>
                              {(["bac","pv","ev","ac"] as const).map(k => (
                                <td key={k} className="px-2 py-1.5">
                                  <input type="number" value={editRow[k]} onChange={e => setEditRow({...editRow, [k]: +e.target.value})} className="w-20 bg-background border border-primary/40 rounded px-2 py-1 text-xs"/>
                                </td>
                              ))}
                              <td className="px-3 py-1.5 text-xs text-muted-foreground">{editRow.ac > 0 ? (editRow.ev/editRow.ac).toFixed(2) : "1.00"}</td>
                              <td className="px-3 py-1.5 text-xs text-muted-foreground">{editRow.pv > 0 ? (editRow.ev/editRow.pv).toFixed(2) : "1.00"}</td>
                              <td className="px-3 py-1.5 text-xs text-muted-foreground">{editRow.ac > 0 ? Math.round(editRow.bac/(editRow.ev/editRow.ac)).toLocaleString() : editRow.bac}</td>
                              <td className="px-2 py-1.5">
                                <select value={editRow.status} onChange={e => setEditRow({...editRow, status: e.target.value})} className="bg-background border border-primary/40 rounded px-1 py-1 text-xs">
                                  {["Planifié","En cours","Terminé","En retard"].map(s => <option key={s}>{s}</option>)}
                                </select>
                              </td>
                              <td className="px-2 py-1.5">
                                <div className="flex gap-1">
                                  <button onClick={confirmEdit} className="p-1 text-green-400 hover:bg-green-500/10 rounded"><Check size={13}/></button>
                                  <button onClick={cancelEdit} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><X size={13}/></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2.5 text-xs font-medium text-foreground">{line.phase}</td>
                              <td className="px-3 py-2.5 text-xs text-muted-foreground">{line.workpackage}</td>
                              <td className="px-3 py-2.5 text-xs text-blue-400 font-medium">{line.bac.toLocaleString()}</td>
                              <td className="px-3 py-2.5 text-xs text-foreground">{line.pv.toLocaleString()}</td>
                              <td className="px-3 py-2.5 text-xs text-purple-400">{line.ev.toLocaleString()}</td>
                              <td className="px-3 py-2.5 text-xs text-amber-400">{line.ac.toLocaleString()}</td>
                              <td className="px-3 py-2.5 text-xs font-bold" style={{ color: line.cpi >= 1 ? "#22c55e" : "#ef4444" }}>{line.cpi.toFixed(2)}</td>
                              <td className="px-3 py-2.5 text-xs font-bold" style={{ color: line.spi >= 1 ? "#22c55e" : "#ef4444" }}>{line.spi.toFixed(2)}</td>
                              <td className="px-3 py-2.5 text-xs text-foreground">{line.eac.toLocaleString()}</td>
                              <td className="px-3 py-2.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: cfg.bg, color: cfg.color }}>{line.status}</span>
                              </td>
                              <td className="px-3 py-2.5">
                                <button onClick={() => startEdit(line)} className="text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Éditer</button>
                              </td>
                            </>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                  {/* Totaux */}
                  <tfoot>
                    <tr className="bg-muted/50 border-t-2 border-border font-bold">
                      <td className="px-3 py-2.5 text-xs text-foreground" colSpan={2}>TOTAL</td>
                      <td className="px-3 py-2.5 text-xs text-blue-400">{totalBAC.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-xs text-foreground">{totalPV.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-xs text-purple-400">{totalEV.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-xs text-amber-400">{totalAC.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-xs font-bold" style={{ color: globalCPI >= 1 ? "#22c55e" : "#ef4444" }}>{globalCPI.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-xs font-bold" style={{ color: globalSPI >= 1 ? "#22c55e" : "#ef4444" }}>{globalSPI.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-xs text-foreground">{Math.round(globalEAC).toLocaleString()}</td>
                      <td colSpan={2}/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
