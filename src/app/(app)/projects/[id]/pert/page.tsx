"use client"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, GitMerge, Zap, Check, X, Pencil, AlertTriangle, Route } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────
interface PERTTask {
  id: string; name: string; duration: number; deps: string[]
  optimistic?: number; pessimistic?: number
  est: number; eft: number; lst: number; lft: number; slack: number; critical: boolean
  x: number; y: number
  // Optimisation
  crashDuration?: number; crashCost?: number
  fastTrack?: boolean
}

const R = 44

// ── Calcul PERT ───────────────────────────────────────────────
function computePERT(tasks: PERTTask[]): PERTTask[] {
  const map = new Map(tasks.map(t => [t.id, { ...t, est:0, eft:0, lst:0, lft:0, slack:0, critical:false }]))
  const visited = new Set<string>()
  const order: string[] = []
  const visit = (id: string) => {
    if (visited.has(id)) return; visited.add(id)
    const t = map.get(id)!
    t.deps.forEach(d => { if (map.has(d)) visit(d) })
    order.push(id)
  }
  ;[...map.keys()].forEach(visit)
  order.forEach(id => {
    const t = map.get(id)!
    t.est = t.deps.length > 0 ? Math.max(...t.deps.map(d => map.get(d)?.eft ?? 0)) : 0
    t.eft = t.est + t.duration
  })
  const maxEFT = Math.max(...[...map.values()].map(t => t.eft), 0)
  ;[...order].reverse().forEach(id => {
    const t = map.get(id)!
    const succs = [...map.values()].filter(s => s.deps.includes(id))
    t.lft = succs.length > 0 ? Math.min(...succs.map(s => s.lst)) : maxEFT
    t.lst = t.lft - t.duration
    t.slack = Math.round((t.lst - t.est) * 100) / 100
    t.critical = t.slack <= 0
  })
  return [...map.values()]
}

// ── Auto-layout ───────────────────────────────────────────────
function autoLayout(tasks: PERTTask[]): PERTTask[] {
  const map = new Map(tasks.map(t => [t.id, t]))
  const rank: Record<string, number> = {}
  const vis = new Set<string>()
  const getrank = (id: string, d = 0): number => {
    if (d > 100) return 0
    if (rank[id] !== undefined) return rank[id]
    if (vis.has(id)) return 0; vis.add(id)
    const t = map.get(id)
    if (!t) { rank[id] = 0; return 0 }
    rank[id] = t.deps.length === 0 ? 0 : Math.max(...t.deps.map(dep => getrank(dep, d+1))) + 1
    return rank[id]
  }
  tasks.forEach(t => getrank(t.id))
  const cols: Record<number, string[]> = {}
  Object.entries(rank).forEach(([id, r]) => { if (!cols[r]) cols[r] = []; cols[r].push(id) })
  const maxRank = Math.max(...Object.values(rank), 0)
  const maxColSize = Math.max(...Object.values(cols).map(c => c.length), 1)
  const COL_W = Math.max(150, Math.min(200, 1400 / (maxRank + 1)))
  const ROW_H = Math.max(120, Math.min(160, 700 / maxColSize))
  const MARGIN_X = 120
  const CENTER_Y = Math.max(260, (maxColSize * ROW_H) / 2 + 100)
  return tasks.map(t => {
    const r = rank[t.id] ?? 0
    const col = cols[r] ?? [t.id]
    const idx = col.indexOf(t.id)
    const colH = col.length * ROW_H
    return { ...t, x: MARGIN_X + r * COL_W, y: CENTER_Y - colH / 2 + idx * ROW_H + ROW_H / 2 }
  })
}

// ── Composant cercle PERT ─────────────────────────────────────
function PERTCircle({ task, selected, onSelect, onDrag, dragging }: any) {
  const critColor = "#dc2626"; const normColor = "#185FA5"
  const fillColor = task.critical ? "#fef2f2" : "#EFF6FF"
  const strokeColor = task.critical ? critColor : normColor
  const strokeW = selected ? 3 : task.critical ? 2.5 : 1.5

  return (
    <g transform={`translate(${task.x},${task.y})`}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
      onMouseDown={onDrag} onClick={onSelect}>
      <circle r={R+2} fill="rgba(0,0,0,0.08)" transform="translate(2,2)"/>
      <circle r={R} fill={fillColor} stroke={strokeColor} strokeWidth={strokeW}/>
      {task.critical && <circle r={R+6} fill="none" stroke={critColor} strokeWidth={1} strokeDasharray="4,3" opacity={0.5}/>}
      {selected && <circle r={R+8} fill="none" stroke="#7B5EFF" strokeWidth={2} strokeDasharray="4,3"/>}

      {/* Quadrants */}
      <line x1={-R} y1="0" x2={R} y2="0" stroke={strokeColor} strokeWidth={0.8} opacity={0.6}/>
      <line x1="0" y1={-R} x2="0" y2={R} stroke={strokeColor} strokeWidth={0.8} opacity={0.6}/>

      {/* ID centre */}
      <text textAnchor="middle" dy="5" fontSize="13" fontWeight="800" fill={task.critical ? critColor : normColor}>{task.id}</text>

      {/* EST haut-gauche */}
      <text x={-R/2} y={-R/2+4} textAnchor="middle" fontSize="10" fontWeight="600" fill={task.critical?"#991b1b":"#1e40af"}>{task.est}</text>
      {/* EFT haut-droit */}
      <text x={R/2} y={-R/2+4} textAnchor="middle" fontSize="10" fontWeight="600" fill={task.critical?"#991b1b":"#1e40af"}>{task.eft}</text>
      {/* LST bas-gauche */}
      <text x={-R/2} y={R/2+4} textAnchor="middle" fontSize="10" fontWeight="600" fill={task.critical?"#7f1d1d":"#1e3a8a"}>{task.lst}</text>
      {/* LFT bas-droit */}
      <text x={R/2} y={R/2+4} textAnchor="middle" fontSize="10" fontWeight="600" fill={task.critical?"#7f1d1d":"#1e3a8a"}>{task.lft}</text>

      {/* Nom + durée sous le cercle */}
      <text y={R+14} textAnchor="middle" fontSize="9" fill={task.critical?critColor:normColor} fontWeight="600">
        {task.name.length > 14 ? task.name.slice(0,13)+"…" : task.name}
      </text>
      <text y={R+25} textAnchor="middle" fontSize="9" fill="#94a3b8">{task.duration}j · m:{task.slack}j</text>

      {/* Badge critique */}
      {task.critical && (
        <g transform={`translate(${R-10},-${R-10})`}>
          <circle r={9} fill={critColor}/>
          <text textAnchor="middle" dy="4" fontSize="10" fill="#fff">!</text>
        </g>
      )}
    </g>
  )
}

// ── Flèche ────────────────────────────────────────────────────
function Arrow({ from, to, critical, fastTrack }: any) {
  const dx = to.x - from.x; const dy = to.y - from.y
  const dist = Math.sqrt(dx*dx + dy*dy)
  if (dist === 0) return null
  const ux = dx/dist; const uy = dy/dist
  const sx = from.x + ux*R; const sy = from.y + uy*R
  const ex = to.x - ux*(R+4); const ey = to.y - uy*(R+4)
  const color = fastTrack ? "#f59e0b" : critical ? "#dc2626" : "#475569"
  const sw = critical ? 2.5 : fastTrack ? 2 : 1.5
  const dash = fastTrack ? "6,3" : "none"
  const mx = (sx+ex)/2; const my = (sy+ey)/2

  return (
    <g>
      <defs>
        <marker id={`arr-${from.id}-${to.id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={color}/>
        </marker>
      </defs>
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={sw} strokeDasharray={dash}
        markerEnd={`url(#arr-${from.id}-${to.id})`} opacity={critical?1:0.7}/>
      <rect x={mx-16} y={my-9} width={32} height={16} rx={4} fill={color} opacity={0.15}/>
      <text x={mx} y={my+4} textAnchor="middle" fontSize="9" fill={color} fontWeight="600">{to.duration}j</text>
    </g>
  )
}

// ── Page principale ───────────────────────────────────────────
export default function PERTPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory, deleteHistory } = useToolData(id, "pert")

  const [tasks, setTasks]       = useState<PERTTask[]>([])
  const [tab, setTab]           = useState<"diagram"|"critical"|"tasks">("diagram")
  const [selected, setSelected] = useState<string|null>(null)
  const [scale, setScale]       = useState(1)
  const [offset, setOffset]     = useState({ x: 120, y: 80 })
  const [draggingNode, setDraggingNode] = useState<{ id:string; ox:number; oy:number }|null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart]   = useState({ x:0, y:0 })
  const svgRef = useRef<SVGSVGElement>(null)

  // Formulaire ajout tâche
  const [newTask, setNewTask]   = useState({ id:"", name:"", duration:5, deps:"", optimistic:0, pessimistic:0 })
  const [editId, setEditId]     = useState<string|null>(null)
  const [editBuf, setEditBuf]   = useState<Partial<PERTTask>>({})

  // Fast Track / Crashing
  const [ftTask, setFtTask]     = useState<string|null>(null)
  const [crashTask, setCrashTask] = useState<string|null>(null)
  const [crashDays, setCrashDays] = useState(1)
  const [crashCost, setCrashCost] = useState(5000)

  useEffect(() => {
    if (data?.tasks?.length) {
      const laid = autoLayout(computePERT(data.tasks))
      setTasks(laid)
    }
  }, [data])

  const computed = useMemo(() => computePERT(tasks), [tasks])
  const criticalPath = useMemo(() => computed.filter(t => t.critical), [computed])
  const projectDuration = useMemo(() => Math.max(...computed.map(t => t.eft), 0), [computed])
  const selectedTask = computed.find(t => t.id === selected) ?? null

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération PERT en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"pert", projectName:project.name, projectDescription:project.description, startDate:project.start_date, endDate:project.end_date })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const raw = json.data?.nodes ?? json.data?.tasks ?? []
      const enriched: PERTTask[] = raw.map((n: any, i: number) => ({
        id: n.id ?? "T"+(i+1), name: n.name ?? "Tâche "+(i+1),
        duration: n.duration ?? 5,
        deps: n.deps ?? n.dependencies ?? [],
        optimistic: n.optimistic ?? Math.max(1, (n.duration??5)-2),
        pessimistic: n.pessimistic ?? (n.duration??5)+3,
        est:0, eft:0, lst:0, lft:0, slack:0, critical:false, x:0, y:0
      }))
      const laid = autoLayout(computePERT(enriched))
      setTasks(laid); await save({ tasks: laid })
      toast.success("PERT généré — " + laid.length + " tâches")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const saveTasks = async (t: PERTTask[]) => { setTasks(t); await save({ tasks: t }) }

  const addTask = () => {
    if (!newTask.id || !newTask.name) { toast.error("ID et nom obligatoires"); return }
    if (tasks.find(t => t.id === newTask.id)) { toast.error("ID déjà utilisé"); return }
    const deps = newTask.deps ? newTask.deps.split(",").map(s=>s.trim()).filter(Boolean) : []
    const t: PERTTask = { ...newTask, deps, est:0, eft:0, lst:0, lft:0, slack:0, critical:false, x:0, y:0 }
    const newTasks = autoLayout(computePERT([...tasks, t]))
    saveTasks(newTasks)
    setNewTask({ id:"", name:"", duration:5, deps:"", optimistic:0, pessimistic:0 })
    toast.success("Tâche ajoutée")
  }

  const deleteTask = (tid: string) => {
    const updated = tasks.filter(t => t.id !== tid).map(t => ({ ...t, deps: t.deps.filter(d => d !== tid) }))
    saveTasks(autoLayout(computePERT(updated)))
  }

  const applyFastTrack = (tid: string) => {
    const updated = tasks.map(t => t.id === tid ? { ...t, fastTrack: !t.fastTrack } : t)
    saveTasks(computePERT(updated))
    toast.success("Fast Track appliqué — tâche parallélisée")
    setFtTask(null)
  }

  const applyCrashing = (tid: string) => {
    const updated = tasks.map(t => t.id === tid
      ? { ...t, duration: Math.max(1, t.duration - crashDays), crashCost: (t.crashCost??0) + crashCost }
      : t)
    const relaid = autoLayout(computePERT(updated))
    saveTasks(relaid)
    toast.success("Crashing appliqué — durée réduite de " + crashDays + "j · coût +" + crashCost.toLocaleString() + "€")
    setCrashTask(null)
  }

  // ── Drag nœuds ────────────────────────────────────────────────
  const onNodeMouseDown = useCallback((e: React.MouseEvent, tid: string) => {
    e.stopPropagation()
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const t = tasks.find(t => t.id === tid)!
    setDraggingNode({ id: tid, ox: (e.clientX - rect.left)/scale - t.x, oy: (e.clientY - rect.top)/scale - t.y })
  }, [tasks, scale])

  const onSVGMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    if (draggingNode) {
      const nx = (e.clientX - rect.left)/scale - draggingNode.ox
      const ny = (e.clientY - rect.top)/scale - draggingNode.oy
      setTasks(prev => prev.map(t => t.id === draggingNode.id ? { ...t, x:nx, y:ny } : t))
    } else if (isPanning) {
      setOffset(o => ({ x: o.x + e.movementX, y: o.y + e.movementY }))
    }
  }, [draggingNode, isPanning, scale])

  const onSVGMouseUp = useCallback(() => {
    if (draggingNode) { save({ tasks }); setDraggingNode(null) }
    setIsPanning(false)
  }, [draggingNode, tasks])

  const onSVGMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as SVGElement).tagName === "svg" || (e.target as SVGElement).tagName === "rect") {
      setIsPanning(true)
    }
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScale(s => Math.min(3, Math.max(0.25, s * (e.deltaY > 0 ? 0.9 : 1.1))))
  }, [])

  const toRows = () => computed.map(t => ({ ID:t.id, Tâche:t.name, Durée:t.duration+"j", EST:t.est, EFT:t.eft, LST:t.lst, LFT:t.lft, Marge:t.slack, Critique:t.critical?"Oui":"Non", Dépendances:t.deps.join(", ")||"—" }))

  const TABS = [
    { id:"diagram",  label:"🔵 Diagramme PERT" },
    { id:"critical", label:"🔴 Chemin Critique" },
    { id:"tasks",    label:"⚙️ Tâches & Optimisation" },
  ] as const

  return (
    <AppLayout>
      <ToolLayout title="Réseau PERT" icon="🔵" subtitle="// ANALYSE DU RÉSEAU"
        history={history} onLoadHistory={(e) => { loadHistory(e); if(e.data?.tasks) { const laid=autoLayout(computePERT(e.data.tasks)); setTasks(laid) } }}
        onGenerate={generate} generateLabel="Générer PERT" generating={loading}
        exportRows={toRows()} exportFilename={"PERT_"+(project?.name??"")} projectId={id} toolType="pert" projectName={project?.name}>

        {/* KPIs globaux */}
        {computed.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:16 }}>
            {[
              { label:"Tâches",          value:computed.length,       color:"var(--primary)" },
              { label:"Durée projet",    value:projectDuration+"j",   color:"#3b82f6" },
              { label:"Tâches critiques",value:criticalPath.length,   color:"#ef4444" },
              { label:"Marge max",       value:Math.max(...computed.map(t=>t.slack))+"j", color:"#22c55e" },
              { label:"Fast Track / Crashing", value:tasks.filter(t=>t.fastTrack||t.crashCost).length, color:"#f59e0b" },
            ].map(k => (
              <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.value}</div>
                <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:4, marginBottom:16, width:"fit-content" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:"6px 16px", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer", border:"none", background:tab===t.id?"var(--primary-bg)":"transparent", color:tab===t.id?"var(--primary-light)":"var(--text-2)" }}>
              {t.label}
            </button>
          ))}
        </div>

        {computed.length === 0 && !loading && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔵</div>
            <p style={{ color:"var(--text-2)", fontSize:15 }}>Aucun réseau PERT</p>
            <p style={{ color:"var(--text-3)", fontSize:13 }}>Cliquez sur "Générer PERT"</p>
          </div>
        )}

        {/* ═══ ONGLET 1 : DIAGRAMME ═══ */}
        {tab === "diagram" && computed.length > 0 && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
            {/* Légende */}
            <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ fontSize:11, fontWeight:600, color:"var(--text-2)" }}>Légende :</span>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text-2)" }}>
                <div style={{ width:12, height:12, borderRadius:"50%", background:"#fef2f2", border:"2px solid #dc2626" }}/> Chemin critique
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text-2)" }}>
                <div style={{ width:12, height:12, borderRadius:"50%", background:"#eff6ff", border:"2px solid #185FA5" }}/> Tâche normale
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text-2)" }}>
                <div style={{ width:20, height:2, background:"#f59e0b", borderTop:"2px dashed #f59e0b" }}/> Fast Track
              </div>
              <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                <button onClick={() => setScale(s => Math.min(3,s*1.2))} style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:6, cursor:"pointer" }}><ZoomIn size={13}/></button>
                <button onClick={() => setScale(s => Math.max(0.25,s*0.8))} style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:6, cursor:"pointer" }}><ZoomOut size={13}/></button>
                <button onClick={() => { setScale(1); setOffset({x:120,y:80}) }} style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:6, cursor:"pointer" }}><RotateCcw size={12}/></button>
              </div>
            </div>

            {/* SVG */}
            <div style={{ overflow:"auto", background:"#0f172a", cursor:isPanning?"grabbing":"default" }}>
              <svg ref={svgRef}
                width={Math.max(1200, computed.length * 180)}
                height={Math.max(500, Math.max(...computed.map(t=>t.y), 0) + 160)}
                onMouseMove={onSVGMouseMove} onMouseUp={onSVGMouseUp}
                onMouseDown={onSVGMouseDown} onWheel={onWheel}>
                <rect width="100%" height="100%" fill="#0f172a"/>
                {/* Grille */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)"/>

                <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
                  {/* Flèches */}
                  {computed.map(task =>
                    task.deps.map(depId => {
                      const from = computed.find(t => t.id === depId)
                      if (!from) return null
                      const isCrit = from.critical && task.critical
                      const isFT = task.fastTrack || from.fastTrack
                      return <Arrow key={depId+"-"+task.id} from={from} to={task} critical={isCrit} fastTrack={isFT}/>
                    })
                  )}
                  {/* Nœuds */}
                  {computed.map(task => (
                    <PERTCircle key={task.id} task={task}
                      selected={selected===task.id}
                      onSelect={() => setSelected(task.id===selected?null:task.id)}
                      onDrag={(e: React.MouseEvent) => onNodeMouseDown(e, task.id)}
                      dragging={draggingNode?.id===task.id}/>
                  ))}
                </g>
              </svg>
            </div>

            {/* Détail nœud sélectionné */}
            {selectedTask && (
              <div style={{ padding:"12px 16px", borderTop:"1px solid var(--border)", background:selectedTask.critical?"rgba(239,68,68,0.05)":"var(--bg)", display:"flex", gap:20, flexWrap:"wrap", alignItems:"center" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:selectedTask.critical?"#dc2626":"var(--text-1)", margin:0 }}>{selectedTask.id} — {selectedTask.name}</p>
                  <p style={{ fontSize:11, color:"var(--text-3)", margin:"2px 0 0" }}>Durée : {selectedTask.duration}j · Dépend de : {selectedTask.deps.join(", ")||"—"}</p>
                </div>
                {[
                  { label:"EST", value:selectedTask.est, color:"#3b82f6" },
                  { label:"EFT", value:selectedTask.eft, color:"#3b82f6" },
                  { label:"LST", value:selectedTask.lst, color:"#7c3aed" },
                  { label:"LFT", value:selectedTask.lft, color:"#7c3aed" },
                  { label:"Marge", value:selectedTask.critical?"Critique ⚠️":selectedTask.slack+"j", color:selectedTask.critical?"#ef4444":"#22c55e" },
                ].map(k => (
                  <div key={k.label} style={{ textAlign:"center", padding:"6px 12px", background:"var(--bg-card)", borderRadius:8, border:"1px solid var(--border)" }}>
                    <p style={{ fontSize:10, color:"var(--text-3)", margin:"0 0 2px", textTransform:"uppercase" }}>{k.label}</p>
                    <p style={{ fontSize:15, fontWeight:700, color:k.color, margin:0 }}>{k.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding:"6px 12px", background:"#0f172a", borderTop:"1px solid #1e293b" }}>
              <span style={{ fontSize:10, color:"#475569" }}>Molette = zoom · Glisser fond = déplacer · Cliquer cercle = détail · Glisser cercle = repositionner</span>
            </div>
          </div>
        )}

        {/* ═══ ONGLET 2 : CHEMIN CRITIQUE ═══ */}
        {tab === "critical" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Résumé */}
            <div style={{ background:"rgba(239,68,68,0.05)", border:"2px solid #ef4444", borderRadius:12, padding:"16px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <AlertTriangle size={18} style={{ color:"#ef4444" }}/>
                <h3 style={{ fontSize:14, fontWeight:700, color:"#ef4444", margin:0 }}>Chemin Critique — Durée projet : {projectDuration}j</h3>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                {criticalPath.map((t, i) => (
                  <div key={t.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <div style={{ background:"#ef4444", borderRadius:8, padding:"4px 12px", fontSize:12, fontWeight:700, color:"#fff" }}>
                      {t.id}<br/><span style={{ fontSize:10, fontWeight:400 }}>{t.name.slice(0,12)}</span>
                    </div>
                    {i < criticalPath.length-1 && <span style={{ color:"#ef4444", fontSize:16, fontWeight:700 }}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline chemin critique */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
              <h4 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 16px" }}>📅 Timeline du chemin critique</h4>
              <div style={{ position:"relative" }}>
                <div style={{ height:3, background:"#ef4444", borderRadius:2, marginBottom:20 }}/>
                <div style={{ display:"grid", gridTemplateColumns:"repeat("+criticalPath.length+",1fr)", gap:8 }}>
                  {criticalPath.map((t, i) => (
                    <div key={t.id} style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 12px", position:"relative" }}>
                      <div style={{ position:"absolute", top:-22, left:"50%", transform:"translateX(-50%)", width:14, height:14, borderRadius:"50%", background:"#ef4444", border:"2px solid var(--bg-card)" }}/>
                      <div style={{ fontSize:11, fontWeight:700, color:"#ef4444", marginBottom:4 }}>{t.id} — {t.name}</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3, fontSize:10 }}>
                        <div style={{ color:"var(--text-3)" }}>Début: <span style={{ color:"#3b82f6", fontWeight:600 }}>{t.est}j</span></div>
                        <div style={{ color:"var(--text-3)" }}>Fin: <span style={{ color:"#3b82f6", fontWeight:600 }}>{t.eft}j</span></div>
                        <div style={{ color:"var(--text-3)" }}>Durée: <span style={{ color:"#ef4444", fontWeight:700 }}>{t.duration}j</span></div>
                        <div style={{ color:"var(--text-3)" }}>Marge: <span style={{ color:"#ef4444", fontWeight:700 }}>0j ⚠️</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tâches non critiques */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
              <h4 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>🟢 Tâches avec marge (non critiques)</h4>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {computed.filter(t => !t.critical).sort((a,b) => b.slack-a.slack).map(t => (
                  <div key={t.id} style={{ background:"rgba(34,197,94,0.06)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#22c55e", marginBottom:4 }}>{t.id} — {t.name}</div>
                    <div style={{ fontSize:10, color:"var(--text-3)" }}>Durée: {t.duration}j · Marge libre: <span style={{ color:"#22c55e", fontWeight:700 }}>{t.slack}j</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ ONGLET 3 : TÂCHES & OPTIMISATION ═══ */}
        {tab === "tasks" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Tableau tâches */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <h4 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:0 }}>📋 Toutes les tâches</h4>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ background:"var(--bg)" }}>
                      {["ID","Tâche","Durée","Optimiste","Pessimiste","Dépendances","EST","EFT","Marge","Statut","Actions"].map(h => (
                        <th key={h} style={{ padding:"8px 10px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", whiteSpace:"nowrap", textTransform:"uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {computed.map((task, idx) => {
                      const isEditing = editId === task.id
                      return (
                        <tr key={task.id} style={{ borderBottom:"1px solid var(--border)", background:task.critical?"rgba(239,68,68,0.04)":(idx%2===0?"var(--bg-card)":"var(--bg)"), borderLeft:"3px solid "+(task.critical?"#ef4444":"#185FA5") }}>
                          {isEditing ? (
                            <>
                              <td style={{ padding:"6px 8px" }}><input value={editBuf.id??""} onChange={e=>setEditBuf(p=>({...p,id:e.target.value}))} style={{ width:50, fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                              <td style={{ padding:"6px 8px" }}><input value={editBuf.name??""} onChange={e=>setEditBuf(p=>({...p,name:e.target.value}))} style={{ width:120, fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                              <td style={{ padding:"6px 8px" }}><input type="number" value={editBuf.duration??0} onChange={e=>setEditBuf(p=>({...p,duration:+e.target.value}))} min={1} style={{ width:55, fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                              <td style={{ padding:"6px 8px" }}><input type="number" value={editBuf.optimistic??0} onChange={e=>setEditBuf(p=>({...p,optimistic:+e.target.value}))} min={1} style={{ width:55, fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                              <td style={{ padding:"6px 8px" }}><input type="number" value={editBuf.pessimistic??0} onChange={e=>setEditBuf(p=>({...p,pessimistic:+e.target.value}))} min={1} style={{ width:55, fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                              <td style={{ padding:"6px 8px" }}><input value={(editBuf.deps??[]).join(",")} onChange={e=>setEditBuf(p=>({...p,deps:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))} style={{ width:100, fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                              <td colSpan={3} style={{ padding:"6px 8px", fontSize:10, color:"var(--text-3)" }}>Recalculé auto</td>
                              <td colSpan={1}/>
                              <td style={{ padding:"6px 8px" }}>
                                <div style={{ display:"flex", gap:4 }}>
                                  <button onClick={() => { const updated = tasks.map(t => t.id===task.id?{...t,...editBuf,deps:editBuf.deps??t.deps}:t); saveTasks(autoLayout(computePERT(updated))); setEditId(null) }} style={{ padding:"3px 7px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:5, cursor:"pointer" }}><Check size={11}/></button>
                                  <button onClick={() => setEditId(null)} style={{ padding:"3px 7px", background:"transparent", border:"1px solid var(--border)", borderRadius:5, cursor:"pointer", color:"var(--text-3)" }}><X size={11}/></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={{ padding:"8px 10px", fontWeight:700, color:task.critical?"#ef4444":"#185FA5" }}>{task.id}</td>
                              <td style={{ padding:"8px 10px", color:"var(--text-1)", fontWeight:500 }}>{task.name}</td>
                              <td style={{ padding:"8px 10px", fontWeight:700, color:task.critical?"#ef4444":"var(--text-1)" }}>{task.duration}j</td>
                              <td style={{ padding:"8px 10px", color:"#22c55e" }}>{task.optimistic??"-"}j</td>
                              <td style={{ padding:"8px 10px", color:"#f59e0b" }}>{task.pessimistic??"-"}j</td>
                              <td style={{ padding:"8px 10px", color:"var(--text-3)", fontSize:11 }}>{task.deps.join(", ")||"—"}</td>
                              <td style={{ padding:"8px 10px", color:"#3b82f6", fontWeight:600 }}>{task.est}</td>
                              <td style={{ padding:"8px 10px", color:"#3b82f6", fontWeight:600 }}>{task.eft}</td>
                              <td style={{ padding:"8px 10px" }}>
                                <span style={{ fontSize:11, padding:"2px 8px", borderRadius:8, background:task.critical?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.1)", color:task.critical?"#ef4444":"#22c55e", fontWeight:600 }}>
                                  {task.critical?"CRIT.":task.slack+"j"}
                                </span>
                              </td>
                              <td style={{ padding:"8px 10px" }}>
                                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                                  {task.fastTrack && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:6, background:"rgba(245,158,11,0.15)", color:"#f59e0b", fontWeight:600 }}>FT</span>}
                                  {(task.crashCost??0)>0 && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:6, background:"rgba(239,68,68,0.15)", color:"#ef4444", fontWeight:600 }}>CR +{(task.crashCost??0).toLocaleString()}€</span>}
                                </div>
                              </td>
                              <td style={{ padding:"8px 10px" }}>
                                <div style={{ display:"flex", gap:3 }}>
                                  <button onClick={() => { setEditId(task.id); setEditBuf({...task}) }} style={{ padding:"3px 6px", background:"transparent", border:"1px solid var(--border)", borderRadius:5, cursor:"pointer", color:"var(--text-3)" }}><Pencil size={11}/></button>
                                  <button onClick={() => setFtTask(ftTask===task.id?null:task.id)} title="Fast Track" style={{ padding:"3px 6px", background:task.fastTrack?"rgba(245,158,11,0.15)":"transparent", border:"1px solid "+(task.fastTrack?"#f59e0b":"var(--border)"), borderRadius:5, cursor:"pointer", color:task.fastTrack?"#f59e0b":"var(--text-3)" }}><GitMerge size={11}/></button>
                                  <button onClick={() => setCrashTask(crashTask===task.id?null:task.id)} title="Crashing" style={{ padding:"3px 6px", background:(task.crashCost??0)>0?"rgba(239,68,68,0.1)":"transparent", border:"1px solid "+((task.crashCost??0)>0?"#ef4444":"var(--border)"), borderRadius:5, cursor:"pointer", color:(task.crashCost??0)>0?"#ef4444":"var(--text-3)" }}><Zap size={11}/></button>
                                  <button onClick={() => deleteTask(task.id)} style={{ padding:"3px 6px", background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:5, cursor:"pointer", color:"#ef4444" }}><Trash2 size={11}/></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fast Track panel */}
            {ftTask && (
              <div style={{ background:"rgba(245,158,11,0.08)", border:"2px solid #f59e0b", borderRadius:12, padding:"16px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <GitMerge size={16} style={{ color:"#f59e0b" }}/>
                  <h4 style={{ fontSize:13, fontWeight:700, color:"#f59e0b", margin:0 }}>Fast Tracking — {ftTask}</h4>
                </div>
                <p style={{ fontSize:12, color:"var(--text-2)", margin:"0 0 12px", lineHeight:1.5 }}>
                  Paralléliser cette tâche avec sa/ses prédécesseur(s) pour réduire la durée du projet. <strong style={{ color:"#f59e0b" }}>Risque accru</strong> — nécessite coordination renforcée.
                </p>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => applyFastTrack(ftTask)} style={{ padding:"7px 18px", background:"#f59e0b", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    ✓ Appliquer Fast Track
                  </button>
                  <button onClick={() => setFtTask(null)} style={{ padding:"7px 14px", background:"transparent", border:"1px solid var(--border)", borderRadius:8, fontSize:12, color:"var(--text-2)", cursor:"pointer" }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Crashing panel */}
            {crashTask && (
              <div style={{ background:"rgba(239,68,68,0.08)", border:"2px solid #ef4444", borderRadius:12, padding:"16px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <Zap size={16} style={{ color:"#ef4444" }}/>
                  <h4 style={{ fontSize:13, fontWeight:700, color:"#ef4444", margin:0 }}>Crashing — {crashTask}</h4>
                </div>
                <p style={{ fontSize:12, color:"var(--text-2)", margin:"0 0 12px", lineHeight:1.5 }}>
                  Ajouter des ressources pour réduire la durée de cette tâche. <strong style={{ color:"#ef4444" }}>Coût supplémentaire</strong> — à appliquer en priorité sur le chemin critique.
                </p>
                <div style={{ display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
                  <div>
                    <div style={{ fontSize:11, color:"var(--text-3)", marginBottom:4 }}>Réduction (jours)</div>
                    <input type="number" value={crashDays} onChange={e=>setCrashDays(+e.target.value)} min={1} max={computed.find(t=>t.id===crashTask)?.duration??1}
                      style={{ width:80, fontSize:13, fontWeight:700, border:"2px solid #ef4444", borderRadius:6, padding:"4px 8px", background:"var(--bg)", color:"var(--text-1)", textAlign:"center" }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:"var(--text-3)", marginBottom:4 }}>Coût supplémentaire (€)</div>
                    <input type="number" value={crashCost} onChange={e=>setCrashCost(+e.target.value)} min={0} step={1000}
                      style={{ width:120, fontSize:13, fontWeight:700, border:"2px solid #ef4444", borderRadius:6, padding:"4px 8px", background:"var(--bg)", color:"var(--text-1)", textAlign:"center" }}/>
                  </div>
                  <button onClick={() => applyCrashing(crashTask)} style={{ padding:"7px 18px", background:"#ef4444", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    ⚡ Appliquer Crashing
                  </button>
                  <button onClick={() => setCrashTask(null)} style={{ padding:"7px 14px", background:"transparent", border:"1px solid var(--border)", borderRadius:8, fontSize:12, color:"var(--text-2)", cursor:"pointer" }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Ajout tâche */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h4 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>+ Ajouter une tâche</h4>
              <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 80px 80px 80px 1fr auto", gap:8, alignItems:"flex-end" }}>
                <div>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>ID *</div>
                  <input value={newTask.id} onChange={e=>setNewTask(p=>({...p,id:e.target.value.toUpperCase()}))} placeholder="T10" style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)", fontWeight:700 }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Nom *</div>
                  <input value={newTask.name} onChange={e=>setNewTask(p=>({...p,name:e.target.value}))} placeholder="Nom de la tâche" style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)" }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Durée (j)</div>
                  <input type="number" value={newTask.duration} onChange={e=>setNewTask(p=>({...p,duration:+e.target.value}))} min={1} style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)" }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Optimiste</div>
                  <input type="number" value={newTask.optimistic} onChange={e=>setNewTask(p=>({...p,optimistic:+e.target.value}))} min={1} style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)" }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Pessimiste</div>
                  <input type="number" value={newTask.pessimistic} onChange={e=>setNewTask(p=>({...p,pessimistic:+e.target.value}))} min={1} style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)" }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Dépendances (ex: T1,T2)</div>
                  <input value={newTask.deps} onChange={e=>setNewTask(p=>({...p,deps:e.target.value}))} placeholder="T1,T2" style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)" }}/>
                </div>
                <button onClick={addTask} style={{ padding:"7px 16px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
                  <Plus size={13}/> Ajouter
                </button>
              </div>
            </div>

            {/* Guide Fast Track / Crashing */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:10, padding:"14px 16px" }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#f59e0b", margin:"0 0 6px", display:"flex", alignItems:"center", gap:6 }}>
                  <GitMerge size={14}/> Fast Tracking (PMI 7th ed.)
                </p>
                <p style={{ fontSize:11, color:"var(--text-2)", margin:0, lineHeight:1.6 }}>
                  Paralléliser des activités normalement séquentielles. Réduit la durée sans coût supplémentaire mais augmente les risques de reprises et retravail. Applicable uniquement si les dépendances sont flexibles.
                </p>
              </div>
              <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"14px 16px" }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#ef4444", margin:"0 0 6px", display:"flex", alignItems:"center", gap:6 }}>
                  <Zap size={14}/> Crashing (PMI 7th ed.)
                </p>
                <p style={{ fontSize:11, color:"var(--text-2)", margin:0, lineHeight:1.6 }}>
                  Ajouter des ressources (humaines, matérielles) sur les tâches du chemin critique pour réduire leur durée. Génère un coût supplémentaire. Rapport coût/bénéfice à analyser avant application.
                </p>
              </div>
            </div>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
