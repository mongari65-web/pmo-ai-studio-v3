"use client"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, GitMerge, Zap, Check, X } from "lucide-react"

// ── Types ────────────────────────────────────────────────────
interface PERTTask {
  id: string        // identifiant unique ex: "T1"
  name: string      // nom de la tâche
  duration: number  // durée (jours/semaines)
  deps: string[]    // liste des ids dépendances
  // calculés automatiquement
  est: number; eft: number; lst: number; lft: number; slack: number; critical: boolean
  // position SVG
  x: number; y: number
}

interface PERTData { tasks: PERTTask[] }

const R = 48 // rayon cercle

// ── Calcul PERT (forward + backward pass) ────────────────────
function computePERT(tasks: PERTTask[]): PERTTask[] {
  const map = new Map(tasks.map(t => [t.id, { ...t, est:0, eft:0, lst:0, lft:0, slack:0, critical:false }]))

  // Topological sort
  const visited = new Set<string>()
  const order: string[] = []
  const visit = (id: string) => {
    if (visited.has(id)) return
    visited.add(id)
    const t = map.get(id)!
    t.deps.forEach(d => { if (map.has(d)) visit(d) })
    order.push(id)
  }
  ;[...map.keys()].forEach(visit)

  // Forward pass (EST/EFT)
  order.forEach(id => {
    const t = map.get(id)!
    t.est = t.deps.length > 0
      ? Math.max(...t.deps.map(d => map.get(d)?.eft ?? 0))
      : 0
    t.eft = t.est + t.duration
  })

  // Backward pass (LST/LFT)
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

// ── Auto-layout en colonnes par rang ─────────────────────────
function autoLayout(tasks: PERTTask[]): PERTTask[] {
  const map = new Map(tasks.map(t => [t.id, t]))

  // Calculer le rang (niveau dans le réseau)
  const rank: Record<string, number> = {}
  const visited = new Set<string>()
  const getrank = (id: string, depth = 0): number => {
    if (depth > 100) return 0 // protection cycle
    if (rank[id] !== undefined) return rank[id]
    if (visited.has(id)) return 0
    visited.add(id)
    const t = map.get(id)
    if (!t) { rank[id] = 0; return 0 }
    rank[id] = t.deps.length === 0 ? 0 : Math.max(...t.deps.map(d => getrank(d, depth+1))) + 1
    return rank[id]
  }
  tasks.forEach(t => getrank(t.id))

  // Grouper par rang — tâches du même rang = parallèles = même colonne
  const cols: Record<number, string[]> = {}
  Object.entries(rank).forEach(([id, r]) => {
    if (!cols[r]) cols[r] = []
    cols[r].push(id)
  })

  const maxRank = Math.max(...Object.values(rank), 0)
  const maxColSize = Math.max(...Object.values(cols).map(c => c.length), 1)

  // Espacement adaptatif
  const COL_W = Math.max(140, Math.min(180, 1200 / (maxRank + 1)))
  const ROW_H = Math.max(110, Math.min(150, 600 / maxColSize))
  const MARGIN_X = 80
  const CENTER_Y = Math.max(200, (maxColSize * ROW_H) / 2 + 80)

  const result = tasks.map(t => {
    const r = rank[t.id] ?? 0
    const col = cols[r] ?? [t.id]
    const idx = col.indexOf(t.id)
    const colH = col.length * ROW_H
    return {
      ...t,
      x: MARGIN_X + r * COL_W,
      y: CENTER_Y - colH / 2 + idx * ROW_H + ROW_H / 2
    }
  })
  return result
}

// ── Composant cercle PERT ─────────────────────────────────────
function PERTCircle({ task, selected, onSelect, onDrag, dragging }: {
  task: PERTTask; selected: boolean
  onSelect: () => void; onDrag: (e: React.MouseEvent) => void; dragging: boolean
}) {
  const color = task.critical ? "#dc2626" : "#185FA5"
  const fill  = task.critical ? "#fef2f2" : "#eff6ff"
  const textC = task.critical ? "#991b1b" : "#1e40af"

  return (
    <g transform={`translate(${task.x},${task.y})`}
      onMouseDown={onDrag} onClick={onSelect}
      style={{ cursor: dragging ? "grabbing" : "grab" }}>

      {/* Ombre */}
      <circle r={R+2} fill="rgba(0,0,0,0.06)" transform="translate(2,2)"/>

      {/* Cercle principal */}
      <circle r={R} fill={fill} stroke={color} strokeWidth={selected ? 3 : 2}
        filter={selected ? `drop-shadow(0 0 6px ${color}88)` : "none"}/>

      {/* Lignes de division */}
      {/* Horizontal */}
      <line x1={-R} y1={0} x2={R} y2={0} stroke={color} strokeWidth={1.5}/>
      {/* Vertical haut */}
      <line x1={0} y1={-R} x2={0} y2={0} stroke={color} strokeWidth={1.5}/>
      {/* Vertical bas */}
      <line x1={0} y1={0} x2={0} y2={R} stroke={color} strokeWidth={1.5}/>

      {/* Quadrants : EST (haut gauche), EFT (haut droit), LST (bas gauche), LFT (bas droit) */}
      {/* Numéro au centre */}
      <text x={0} y={6} textAnchor="middle" fontSize="16" fontWeight="800" fill={color}>{task.id}</text>

      {/* EST haut gauche */}
      <text x={-R/2} y={-R/2+8} textAnchor="middle" fontSize="10" fontWeight="700" fill={textC}>{task.est}</text>
      {/* EFT haut droit */}
      <text x={R/2}  y={-R/2+8} textAnchor="middle" fontSize="10" fontWeight="700" fill={textC}>{task.eft}</text>
      {/* LST bas gauche */}
      <text x={-R/2} y={R/2+8}  textAnchor="middle" fontSize="10" fontWeight="700" fill={textC}>{task.lst}</text>
      {/* LFT bas droit */}
      <text x={R/2}  y={R/2+8}  textAnchor="middle" fontSize="10" fontWeight="700" fill={textC}>{task.lft}</text>

      {/* Badge critique */}
      {task.critical && (
        <g transform={`translate(${R-14},-${R-14})`}>
          <circle r={9} fill="#dc2626"/>
          <text x={0} y={4} textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">CR</text>
        </g>
      )}
    </g>
  )
}

// ── Flèche entre deux cercles ─────────────────────────────────
function Arrow({ from, to, label, critical }: { from: PERTTask; to: PERTTask; label: string; critical: boolean }) {
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx*dx + dy*dy)
  const ux = dx/len, uy = dy/len
  const x1 = from.x + ux*R, y1 = from.y + uy*R
  const x2 = to.x - ux*(R+6), y2 = to.y - uy*(R+6)
  const mx = (x1+x2)/2, my = (y1+y2)/2
  const color = critical ? "#dc2626" : "#64748b"

  return (
    <g>
      <defs>
        <marker id={`arr-${critical?"c":"n"}`} markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
          <polygon points="0 0,8 3,0 6" fill={color}/>
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={critical ? 2.5 : 1.5}
        markerEnd={`url(#arr-${critical?"c":"n"})`}
        style={{ filter: critical ? `drop-shadow(0 0 3px ${color}80)` : "none" }}/>
      {/* Label durée sur l'arc */}
      <rect x={mx-18} y={my-10} width={36} height={18} rx={4}
        fill="#fff" stroke={color} strokeWidth={1} opacity={0.9}/>
      <text x={mx} y={my+5} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
        {label}
      </text>
    </g>
  )
}

// ── Page principale ────────────────────────────────────────────
export default function PERTPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "pert")

  const [tasks, setTasks] = useState<PERTTask[]>([])
  const [selected, setSelected] = useState<string|null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 40, y: 60 })
  const [draggingNode, setDraggingNode] = useState<{ id:string; startX:number; startY:number; nodeX:number; nodeY:number }|null>(null)
  const [panning, setPanning] = useState<{ startX:number; startY:number; ox:number; oy:number }|null>(null)
  const [editingRow, setEditingRow] = useState<string|null>(null)
  const [editBuf, setEditBuf] = useState<Partial<PERTTask>>({})
  const [showAddRow, setShowAddRow] = useState(false)
  const [newTask, setNewTask] = useState({ id:"", name:"", duration:5, deps:"" })

  // Auto-incrément ID
  const nextId = useMemo(() => {
    const nums = tasks.map(t => parseInt(t.id.replace(/[^0-9]/g, ""))).filter(n => !isNaN(n))
    return nums.length > 0 ? `T${Math.max(...nums) + 1}` : "T1"
  }, [tasks])
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Charger les données
  useEffect(() => {
    if (data?.tasks?.length > 0) {
      const computed = computePERT(data.tasks)
      setTasks(computed)
    }
  }, [data])

  // Recalculer PERT à chaque changement de tâches
  const computed = useMemo(() => computePERT(tasks), [tasks])

  const saveTasks = useCallback(async (newTasks: PERTTask[]) => {
    const recalc = computePERT(newTasks)
    setTasks(recalc)
    await save({ tasks: recalc })
  }, [save])

  // Générer PERT depuis le WBS du projet
  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération PERT depuis le WBS...")
    try {
      // Charger le WBS depuis Supabase
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: wbsData } = await supabase
        .from("project_tools")
        .select("data")
        .eq("project_id", id)
        .eq("tool_type", "wbs")
        .single()

      // Charger aussi le Gantt si disponible
      const { data: ganttData } = await supabase
        .from("project_tools")
        .select("data")
        .eq("project_id", id)
        .eq("tool_type", "gantt")
        .single()

      let rawTasks: PERTTask[] = []

      // Depuis le WBS (priorité)
      if (wbsData?.data?.items?.length > 0) {
        const items = (wbsData!.data.items as any[]).filter((i: any) => i.level === 2 || (i.code && i.code.includes(".")))
        // Regrouper les tâches par phase (code N1 = première partie ex: "1" pour 1.0, 1.1)
        const phaseMap: Record<string, any[]> = {}
        items.forEach((item: any) => {
          const phaseKey = String(item.code ?? "").split(".")[0] || "1"
          if (!phaseMap[phaseKey]) phaseMap[phaseKey] = []
          phaseMap[phaseKey].push(item)
        })
        const phases = Object.keys(phaseMap).sort()

        rawTasks.push({ id:"D", name:"Début", duration:0, deps:[], est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0 })
        let taskCounter = 0
        let prevPhaseIds: string[] = ["D"]

        phases.forEach(phaseKey => {
          const phaseItems = phaseMap[phaseKey]
          const currentPhaseIds: string[] = []

          // Tâches de la même phase démarrent EN PARALLÈLE depuis la fin de la phase précédente
          phaseItems.forEach((item: any) => {
            taskCounter++
            const taskId = `T${taskCounter}`
            const durStr = String(item.duration ?? "5")
            const durNum = parseInt(durStr.replace(/[^0-9]/g, "") || "5")
            rawTasks.push({
              id: taskId,
              name: item.name ?? `Tâche ${taskCounter}`,
              duration: isNaN(durNum) ? 5 : durNum,
              deps: [...prevPhaseIds], // dépend de TOUTES les tâches de la phase précédente
              est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0
            })
            currentPhaseIds.push(taskId)
          })
          prevPhaseIds = currentPhaseIds
        })
        rawTasks.push({ id:"F", name:"Fin", duration:0, deps:[...prevPhaseIds], est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0 })
        toast.success(`PERT généré depuis le WBS — ${rawTasks.length} nœuds`)
      }
      // Depuis le Gantt
      else if (ganttData?.data?.tasks?.length > 0) {
        const gtasks = (ganttData!.data.tasks as any[])
        rawTasks.push({ id:"D", name:"Début", duration:0, deps:[], est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0 })
        gtasks.forEach((t: any, i: number) => {
          const tid = `T${i+1}`
          const deps = t.dependencies
            ? t.dependencies.split(",").map((d: string) => d.trim()).filter(Boolean).map((_: any, j: number) => j===0?"D":`T${j}`)
            : [i===0?"D":`T${i}`]
          rawTasks.push({
            id: tid, name: t.name ?? `Tâche ${i+1}`,
            duration: t.duration ?? 5, deps,
            est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0
          })
        })
        rawTasks.push({ id:"F", name:"Fin", duration:0, deps:[`T${gtasks.length}`], est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0 })
        toast.success(`PERT généré depuis le Gantt — ${rawTasks.length} nœuds`)
      }
      // Fallback exemple
      else {
        rawTasks = [
          { id:"D",  name:"Début",          duration:0,  deps:[],           est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0 },
          { id:"T1", name:"Initialisation", duration:5,  deps:["D"],        est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0 },
          { id:"T2", name:"Analyse",        duration:10, deps:["T1"],       est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0 },
          { id:"T3", name:"Conception",     duration:8,  deps:["T1"],       est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0 },
          { id:"T4", name:"Développement",  duration:15, deps:["T2"],       est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0 },
          { id:"T5", name:"Tests",          duration:7,  deps:["T3","T4"],  est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0 },
          { id:"F",  name:"Fin",            duration:0,  deps:["T5"],       est:0,eft:0,lst:0,lft:0,slack:0,critical:false,x:0,y:0 },
        ]
        toast.info("Générez d'abord un WBS ou un Gantt pour un PERT basé sur votre projet")
      }

      const withLayout = autoLayout(rawTasks)
      await saveTasks(withLayout)
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  // Ajouter une tâche
  const addTask = async () => {
    if (!newTask.id.trim() || !newTask.name.trim()) { toast.error("ID et nom requis"); return }
    if (tasks.find(t => t.id === newTask.id)) { toast.error("ID déjà utilisé"); return }
    const deps = newTask.deps.split(",").map(d=>d.trim()).filter(Boolean)
    const t: PERTTask = {
      id: newTask.id.trim(), name: newTask.name.trim(),
      duration: newTask.duration, deps,
      est:0, eft:0, lst:0, lft:0, slack:0, critical:false,
      x:0, y:0
    }
    const newList = autoLayout([...tasks, t])
    await saveTasks(newList)
    setNewTask({ id:"", name:"", duration:5, deps:"" })
    setShowAddRow(false)
    toast.success(`Tâche ${t.id} ajoutée`)
  }

  // Supprimer une tâche
  const deleteTask = async (tid: string) => {
    const newList = tasks.filter(t=>t.id!==tid).map(t=>({...t, deps:t.deps.filter(d=>d!==tid)}))
    const withLayout = autoLayout(newList)
    await saveTasks(withLayout)
    if (selected===tid) setSelected(null)
    toast.success(`Tâche ${tid} supprimée`)
  }

  // Éditer une ligne du tableau
  const startEdit = (t: PERTTask) => {
    setEditingRow(t.id)
    setEditBuf({ id:t.id, name:t.name, duration:t.duration, deps:t.deps })
  }
  const cancelEdit = () => { setEditingRow(null); setEditBuf({}) }
  const confirmEdit = async () => {
    const deps = typeof editBuf.deps === "string"
      ? (editBuf.deps as string).split(",").map(d=>d.trim()).filter(Boolean)
      : (editBuf.deps as string[]|undefined) ?? []
    const newList = tasks.map(t => t.id===editingRow
      ? { ...t, name:editBuf.name??t.name, duration:editBuf.duration??t.duration, deps }
      : t)
    const withLayout = autoLayout(newList)
    await saveTasks(withLayout)
    setEditingRow(null); setEditBuf({})
    toast.success("Tâche mise à jour")
  }

  // Relayout
  const relayout = async () => {
    const withLayout = autoLayout(tasks)
    await saveTasks(withLayout)
    toast.success("Diagramme réorganisé")
  }

  // ── Wheel zoom ───────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const h = (e: WheelEvent) => {
      e.preventDefault()
      setScale(s => Math.min(3, Math.max(0.25, s * (e.deltaY>0?0.9:1.1))))
    }
    el.addEventListener("wheel", h, { passive:false })
    return () => el.removeEventListener("wheel", h)
  }, [])

  // ── Mouse events SVG ─────────────────────────────────────────
  const svgCoords = (e: MouseEvent | React.MouseEvent): {x:number;y:number} => {
    const rect = containerRef.current!.getBoundingClientRect()
    return { x:(e.clientX-rect.left-offset.x)/scale, y:(e.clientY-rect.top-offset.y)/scale }
  }

  const onNodeMouseDown = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    setSelected(taskId)
    const node = tasks.find(t=>t.id===taskId)!
    setDraggingNode({ id:taskId, startX:e.clientX, startY:e.clientY, nodeX:node.x, nodeY:node.y })
  }

  const onSVGMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).tagName==="svg" || (e.target as SVGElement).tagName==="rect") {
      setSelected(null)
      setPanning({ startX:e.clientX, startY:e.clientY, ox:offset.x, oy:offset.y })
    }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingNode) {
        const dx = (e.clientX-draggingNode.startX)/scale
        const dy = (e.clientY-draggingNode.startY)/scale
        setTasks(prev => prev.map(t => t.id===draggingNode.id
          ? { ...t, x:draggingNode.nodeX+dx, y:draggingNode.nodeY+dy } : t))
      }
      if (panning) {
        setOffset({ x:panning.ox+(e.clientX-panning.startX), y:panning.oy+(e.clientY-panning.startY) })
      }
    }
    const onUp = async () => {
      if (draggingNode) await save({ tasks })
      setDraggingNode(null); setPanning(null)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [draggingNode, panning, tasks, scale, save])

  // ── Dimensions SVG ───────────────────────────────────────────
  const svgW = computed.reduce((m,t)=>Math.max(m,t.x+R+80),600)
  const svgH = computed.reduce((m,t)=>Math.max(m,Math.abs(t.y)+R+80),400)

  const selectedTask = computed.find(t=>t.id===selected)
  const totalDur = Math.max(...computed.map(t=>t.eft),0)
  const critCount = computed.filter(t=>t.critical).length

  const INPUT = { style:{ width:"100%", padding:"5px 8px", border:"1px solid var(--border)", borderRadius:"var(--r6)", fontSize:12, color:"var(--text-1)", background:"#fff", outline:"none" } as const }

  return (
    <AppLayout>
      <ToolLayout title="Diagramme PERT" icon="🔀" subtitle="// PERT — CHEMIN CRITIQUE"
        history={history}
        onLoadHistory={e=>{ loadHistory(e); if(e.data?.tasks){const r=computePERT(e.data.tasks);setTasks(r)}}}
        onGenerate={generate} generateLabel="Générer PERT" generating={loading}
        projectName={project?.name} jsonData={{ tasks:computed }}
        exportFilename={`PERT_${project?.name??""}`}>

        {/* KPIs */}
        {computed.length>0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
            {[
              { label:"Tâches",        value:computed.length,                            color:"var(--primary)" },
              { label:"Durée totale",  value:`${totalDur}j`,                             color:"var(--text-1)" },
              { label:"Nœuds critiques",value:critCount,                                 color:"#dc2626" },
              { label:"Marge max",     value:`${Math.max(...computed.map(t=>t.slack),0)}j`, color:"#27500A" },
            ].map(k=>(
              <div key={k.label} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r8)", padding:"12px 14px" }}>
                <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.6px", margin:"0 0 4px" }}>{k.label}</p>
                <p style={{ fontSize:20, fontWeight:700, color:k.color, margin:0 }}>{k.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Layout 2 colonnes : tableau + SVG */}
        <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:14 }}>

          {/* ── TABLEAU DES TÂCHES ── */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", overflow:"hidden", alignSelf:"start" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", borderBottom:"1px solid var(--border)", background:"var(--bg)" }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text-1)" }}>📋 Tâches & Dépendances</span>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={relayout}
                  style={{ fontSize:11, padding:"4px 10px", background:"var(--primary-bg)", border:"1px solid #B5D4F4", borderRadius:"var(--r6)", color:"var(--primary-t)", cursor:"pointer" }}>
                  ♻️ Relayout
                </button>
                <button onClick={()=>{ setShowAddRow(true); setNewTask(p=>({...p, id:nextId})) }}
                  style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, padding:"4px 10px", background:"var(--primary)", border:"none", borderRadius:"var(--r6)", color:"#fff", cursor:"pointer" }}>
                  <Plus size={12}/> Ajouter
                </button>
              </div>
            </div>

            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"var(--bg)", borderBottom:"1px solid var(--border)" }}>
                  {["ID","Nom","Durée","Dépendances","EST","EFT","Marge",""].map(h=>(
                    <th key={h} style={{ padding:"7px 10px", textAlign:"left", fontSize:10, fontWeight:600, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Ligne d'ajout */}
                {showAddRow && (
                  <tr style={{ background:"#eff6ff", borderBottom:"1px solid var(--border)" }}>
                    <td style={{ padding:"6px 8px" }}>
                      <input value={newTask.id} onChange={e=>setNewTask(p=>({...p,id:e.target.value}))} placeholder="T6" {...INPUT}/>
                    </td>
                    <td style={{ padding:"6px 8px" }}>
                      <input value={newTask.name} onChange={e=>setNewTask(p=>({...p,name:e.target.value}))} placeholder="Nom..." {...INPUT}/>
                    </td>
                    <td style={{ padding:"6px 8px" }}>
                      <input type="number" value={newTask.duration} onChange={e=>setNewTask(p=>({...p,duration:+e.target.value}))} min={1} style={{...INPUT.style, width:55}}/>
                    </td>
                    <td style={{ padding:"6px 8px" }}>
                      <input value={newTask.deps} onChange={e=>setNewTask(p=>({...p,deps:e.target.value}))} placeholder="T1,T2" {...INPUT}/>
                    </td>
                    <td colSpan={3}/>
                    <td style={{ padding:"6px 8px" }}>
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={addTask}
                          style={{ padding:"4px 12px", background:"#185FA5", color:"#fff", border:"none", borderRadius:"var(--r6)", cursor:"pointer", fontSize:12, fontWeight:600 }}>
                          ✓ Ajouter
                        </button>
                        <button onClick={()=>setShowAddRow(false)}
                          style={{ padding:"4px 8px", background:"var(--danger-bg)", color:"var(--danger)", border:"1px solid #FCA5A5", borderRadius:"var(--r6)", cursor:"pointer", fontSize:12 }}>
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {computed.map((task,i) => (
                  <tr key={task.id}
                    onClick={()=>setSelected(task.id===selected?null:task.id)}
                    style={{ borderBottom:"1px solid var(--border)", background:task.id===selected?"#eff6ff":task.critical?"#fef2f2":i%2===0?"#fff":"var(--bg)", cursor:"pointer", borderLeft:`3px solid ${task.critical?"#dc2626":"transparent"}` }}>

                    {editingRow===task.id ? (
                      <>
                        <td style={{ padding:"5px 8px" }}>
                          <span style={{ fontSize:12, fontWeight:700, color:task.critical?"#dc2626":"var(--primary)" }}>{task.id}</span>
                        </td>
                        <td style={{ padding:"5px 8px" }}>
                          <input value={editBuf.name??""} onChange={e=>setEditBuf(p=>({...p,name:e.target.value}))} {...INPUT}/>
                        </td>
                        <td style={{ padding:"5px 8px" }}>
                          <input type="number" value={editBuf.duration??0} onChange={e=>setEditBuf(p=>({...p,duration:+e.target.value}))} min={1} style={{...INPUT.style,width:55}}/>
                        </td>
                        <td style={{ padding:"5px 8px" }}>
                          <input value={Array.isArray(editBuf.deps)?(editBuf.deps as string[]).join(","):((editBuf.deps as any)??"")} 
                            onChange={e=>setEditBuf(p=>({...p,deps:e.target.value.split(",").map((d:string)=>d.trim()).filter(Boolean)}))} placeholder="T1,T2" {...INPUT}/>
                        </td>
                        <td colSpan={3}/>
                        <td style={{ padding:"5px 8px" }}>
                          <div style={{ display:"flex", gap:4 }}>
                            <button onClick={confirmEdit} style={{ padding:"3px 8px", background:"#185FA5", color:"#fff", border:"none", borderRadius:"var(--r6)", cursor:"pointer" }}>✓</button>
                            <button onClick={cancelEdit} style={{ padding:"3px 8px", background:"var(--border)", color:"var(--text-1)", border:"none", borderRadius:"var(--r6)", cursor:"pointer" }}>✕</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding:"7px 10px", fontWeight:700, color:task.critical?"#dc2626":"var(--primary)" }}>{task.id}</td>
                        <td style={{ padding:"7px 10px", color:"var(--text-1)", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={task.name}>{task.name}</td>
                        <td style={{ padding:"7px 10px", textAlign:"center", fontWeight:600, color:"var(--text-1)" }}>{task.duration}j</td>
                        <td style={{ padding:"7px 10px", color:"var(--text-2)", fontSize:11 }}>{task.deps.join(", ")||"—"}</td>
                        <td style={{ padding:"7px 10px", textAlign:"center", color:"#185FA5", fontWeight:600 }}>{task.est}</td>
                        <td style={{ padding:"7px 10px", textAlign:"center", color:"#185FA5", fontWeight:600 }}>{task.eft}</td>
                        <td style={{ padding:"7px 10px", textAlign:"center", fontWeight:700, color:task.critical?"#dc2626":"#27500A" }}>
                          {task.critical ? <span style={{ fontSize:10, background:"#FCEBEB", color:"#A32D2D", borderRadius:10, padding:"2px 6px" }}>Critique</span> : task.slack+"j"}
                        </td>
                        <td style={{ padding:"7px 10px" }}>
                          <div style={{ display:"flex", gap:4, opacity:0 }} className="row-actions"
                            onMouseEnter={e=>(e.currentTarget as any).style.opacity=1}
                            onMouseLeave={e=>(e.currentTarget as any).style.opacity=0}>
                            <button onClick={e=>{e.stopPropagation();startEdit(task)}}
                              style={{ fontSize:10, padding:"2px 7px", background:"var(--primary-bg)", border:"1px solid #B5D4F4", borderRadius:"var(--r6)", color:"var(--primary-t)", cursor:"pointer" }}>✏️</button>
                            <button onClick={e=>{e.stopPropagation();deleteTask(task.id)}}
                              style={{ fontSize:10, padding:"2px 7px", background:"#FCEBEB", border:"1px solid #FCA5A5", borderRadius:"var(--r6)", color:"#A32D2D", cursor:"pointer" }}>🗑️</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Légende */}
            <div style={{ padding:"10px 14px", borderTop:"1px solid var(--border)", background:"var(--bg)", display:"flex", gap:12, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:12, height:12, borderRadius:"50%", background:"#fef2f2", border:"2px solid #dc2626" }}/>
                <span style={{ fontSize:10, color:"var(--text-3)" }}>Chemin critique</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:12, height:12, borderRadius:"50%", background:"#eff6ff", border:"2px solid #185FA5" }}/>
                <span style={{ fontSize:10, color:"var(--text-3)" }}>Normal</span>
              </div>
              <span style={{ fontSize:10, color:"var(--text-3)", marginLeft:"auto" }}>Clic → sélectionner · Glisser → déplacer</span>
            </div>
          </div>

          {/* ── DIAGRAMME PERT SVG ── */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", overflow:"hidden", display:"flex", flexDirection:"column" }}>
            {/* Toolbar SVG */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderBottom:"1px solid var(--border)", background:"var(--bg)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                {/* Légende quadrants */}
                <div style={{ background:"#fff", border:"1px solid var(--border)", borderRadius:"var(--r6)", padding:"4px 10px", fontSize:10, color:"var(--text-2)" }}>
                  <span style={{ color:"#185FA5", fontWeight:600 }}>EST | EFT</span> · ID · <span style={{ color:"#185FA5", fontWeight:600 }}>LST | LFT</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <button onClick={()=>setScale(s=>Math.min(3,s*1.2))} style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", border:"1px solid var(--border)", borderRadius:"var(--r6)", cursor:"pointer" }}><ZoomIn size={13}/></button>
                <button onClick={()=>setScale(s=>Math.max(0.25,s*0.8))} style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", border:"1px solid var(--border)", borderRadius:"var(--r6)", cursor:"pointer" }}><ZoomOut size={13}/></button>
                <span style={{ fontSize:10, color:"var(--text-3)", minWidth:32, textAlign:"center" }}>{Math.round(scale*100)}%</span>
                <button onClick={()=>{setScale(1);setOffset({x:40,y:60})}} style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", border:"1px solid var(--border)", borderRadius:"var(--r6)", cursor:"pointer" }}><RotateCcw size={12}/></button>
              </div>
            </div>

            {/* SVG canvas avec scroll horizontal garanti */}
            <div style={{
              width: "100%",
              overflowX: "scroll",
              overflowY: "hidden",
              minHeight: 500,
              position: "relative",
              background: "repeating-linear-gradient(0deg,transparent,transparent 39px,#f1f5f9 39px,#f1f5f9 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#f1f5f9 39px,#f1f5f9 40px)",
              borderBottom: "1px solid var(--border)"
            }}>
              {/* Hint */}
              <div style={{ position:"absolute", bottom:8, left:12, fontSize:10, color:"var(--text-3)", zIndex:10, background:"rgba(255,255,255,0.8)", padding:"2px 8px", borderRadius:4 }}>
                Molette = zoom · Glisser fond = déplacer · Glisser cercle = repositionner · Scrollbar bas = naviguer
              </div>

              <svg
                ref={svgRef}
                width={Math.max(2400, computed.length * 200)}
                height={Math.max(520, svgH + 120)}
                onMouseDown={onSVGMouseDown}
                onWheel={e => {
                  e.preventDefault()
                  setScale(s => Math.min(3, Math.max(0.25, s * (e.deltaY > 0 ? 0.9 : 1.1))))
                }}
                style={{ display:"block", cursor: panning ? "grabbing" : draggingNode ? "grabbing" : "grab" }}>

                <defs>
                  <marker id="arr-c" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                    <polygon points="0 0,8 3,0 6" fill="#dc2626"/>
                  </marker>
                  <marker id="arr-n" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                    <polygon points="0 0,8 3,0 6" fill="#64748b"/>
                  </marker>
                </defs>

                <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>

                  {/* ── Flèches ── */}
                  {computed.flatMap(task =>
                    task.deps.map(depId => {
                      const from = computed.find(t=>t.id===depId)
                      if (!from) return null
                      const isCrit = from.critical && task.critical
                      return (
                        <Arrow key={`${depId}-${task.id}`}
                          from={from} to={task}
                          label={`${task.name.slice(0,2)} ${task.duration}`}
                          critical={isCrit}/>
                      )
                    })
                  )}

                  {/* Message si vide */}
                  {computed.length===0 && (
                    <g transform="translate(400,200)">
                      <text textAnchor="middle" fontSize="14" fill="#94a3b8" dy="-10">Ajoutez une tâche dans le tableau</text>
                      <text textAnchor="middle" fontSize="12" fill="#cbd5e1" dy="15">ou cliquez sur "Générer PERT"</text>
                    </g>
                  )}

                  {/* ── Nœuds ── */}
                  {computed.map(task => (
                    <PERTCircle key={task.id} task={task}
                      selected={selected===task.id}
                      onSelect={()=>setSelected(task.id===selected?null:task.id)}
                      onDrag={e=>onNodeMouseDown(e,task.id)}
                      dragging={draggingNode?.id===task.id}/>
                  ))}
                </g>
              </svg>
            </div>

            {/* Détail nœud            {/* Détail nœud sélectionné */}
            {selectedTask && (
              <div style={{ padding:"12px 16px", borderTop:"1px solid var(--border)", background:selectedTask.critical?"#fef2f2":"var(--bg)", display:"flex", gap:20, flexWrap:"wrap", alignItems:"center" }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:selectedTask.critical?"#dc2626":"var(--text-1)", margin:0 }}>{selectedTask.id} — {selectedTask.name}</p>
                  <p style={{ fontSize:11, color:"var(--text-3)", margin:"2px 0 0" }}>Durée : {selectedTask.duration}j · Dépend de : {selectedTask.deps.join(", ")||"—"}</p>
                </div>
                {[
                  { label:"EST", value:selectedTask.est, color:"#185FA5" },
                  { label:"EFT", value:selectedTask.eft, color:"#185FA5" },
                  { label:"LST", value:selectedTask.lst, color:"#3C3489" },
                  { label:"LFT", value:selectedTask.lft, color:"#3C3489" },
                  { label:"Marge", value:selectedTask.critical?"Critique ⚠️":`${selectedTask.slack}j`, color:selectedTask.critical?"#A32D2D":"#27500A" },
                ].map(k=>(
                  <div key={k.label} style={{ textAlign:"center" }}>
                    <p style={{ fontSize:10, color:"var(--text-3)", margin:"0 0 2px", textTransform:"uppercase" }}>{k.label}</p>
                    <p style={{ fontSize:15, fontWeight:700, color:k.color, margin:0 }}>{k.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Guide */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginTop:14 }}>
          <div style={{ background:"#EEEDFE", border:"1px solid #C4C2F5", borderRadius:"var(--r8)", padding:"12px 14px" }}>
            <p style={{ fontSize:11, fontWeight:600, color:"#3C3489", margin:"0 0 4px" }}>
              <GitMerge size={12} style={{ display:"inline", marginRight:4 }}/>Fast Tracking (PMI)
            </p>
            <p style={{ fontSize:11, color:"#4C4A8A", margin:0, lineHeight:1.5 }}>
              Paralléliser des tâches normalement séquentielles pour réduire la durée du projet. Risque accru.
            </p>
          </div>
          <div style={{ background:"#FAEEDA", border:"1px solid #EF9F27", borderRadius:"var(--r8)", padding:"12px 14px" }}>
            <p style={{ fontSize:11, fontWeight:600, color:"#854F0B", margin:"0 0 4px" }}>
              <Zap size={12} style={{ display:"inline", marginRight:4 }}/>Crashing (PMI)
            </p>
            <p style={{ fontSize:11, color:"#7A4809", margin:0, lineHeight:1.5 }}>
              Ajouter des ressources sur les tâches critiques pour réduire leur durée. Coût supplémentaire.
            </p>
          </div>
        </div>

      </ToolLayout>
    </AppLayout>
  )
}
