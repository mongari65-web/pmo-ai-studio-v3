"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Plus, Pencil, Check, X, GitMerge, Zap } from "lucide-react"

interface PERTNode {
  id: string; name: string; x: number; y: number
  duration_o: number; duration_m: number; duration_p: number
  duration_exp: number; variance: number
  est: number; eft: number; lst: number; lft: number; slack: number
  critical: boolean; phase: string
}
interface PERTEdge { from: string; to: string }
interface PERTData { nodes: PERTNode[]; edges: PERTEdge[] }

const PHASE_COLORS = ["#2563eb","#7c3aed","#059669","#d97706","#dc2626","#0891b2"]
const NODE_W = 130; const NODE_H = 80

// ── Calcul PERT (forward + backward pass) ────────────────────
function calcPERT(nodes: PERTNode[], edges: PERTEdge[]): PERTNode[] {
  const map = new Map(nodes.map(n => [n.id, { ...n, est:0, eft:0, lst:0, lft:0, slack:0, critical:false }]))

  // Forward pass
  const topo: string[] = []
  const inDeg = new Map(nodes.map(n => [n.id, 0]))
  edges.forEach(e => inDeg.set(e.to, (inDeg.get(e.to)??0)+1))
  const queue = [...map.keys()].filter(id => (inDeg.get(id)??0) === 0)
  const visited = new Set<string>()
  while (queue.length) {
    const id = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    topo.push(id)
    const node = map.get(id)!
    const preds = edges.filter(e => e.to === id).map(e => map.get(e.from))
    node.est = preds.length > 0 ? Math.max(...preds.map(p => p?.eft ?? 0)) : 0
    node.eft = node.est + node.duration_exp
    edges.filter(e => e.from === id).forEach(e => {
      inDeg.set(e.to, (inDeg.get(e.to)??1)-1)
      if ((inDeg.get(e.to)??0) === 0) queue.push(e.to)
    })
  }

  // Backward pass
  const maxEFT = Math.max(...[...map.values()].map(n => n.eft), 0)
  ;[...topo].reverse().forEach(id => {
    const node = map.get(id)!
    const succs = edges.filter(e => e.from === id).map(e => map.get(e.to))
    node.lft = succs.length > 0 ? Math.min(...succs.map(s => s?.lst ?? maxEFT)) : maxEFT
    node.lst = node.lft - node.duration_exp
    node.slack = Math.round((node.lst - node.est) * 100) / 100
    node.critical = node.slack <= 0.01
  })

  return [...map.values()]
}

// ── Layout automatique en colonnes par phase ─────────────────
function autoLayout(nodes: PERTNode[]): PERTNode[] {
  const phases = Array.from(new Set(nodes.map(n => n.phase)))
  return nodes.map(n => {
    const pi = phases.indexOf(n.phase)
    const phaseNodes = nodes.filter(nn => nn.phase === n.phase)
    const ni = phaseNodes.findIndex(nn => nn.id === n.id)
    const totalH = phaseNodes.length * (NODE_H + 30)
    return { ...n, x: 80 + pi * (NODE_W + 80), y: 60 + ni * (NODE_H + 30) - totalH/2 + 200 }
  })
}

// ── Compression PMI ──────────────────────────────────────────
function fastTrack(nodes: PERTNode[], edges: PERTEdge[]): { nodes: PERTNode[]; edges: PERTEdge[] } {
  // Fast tracking: paralléliser les phases critiques
  const critNodes = nodes.filter(n => n.critical)
  const newEdges = [...edges]
  // Supprimer 50% des dépendances entre nœuds critiques successifs
  const critEdges = edges.filter(e => {
    const from = nodes.find(n => n.id === e.from)
    const to = nodes.find(n => n.id === e.to)
    return from?.critical && to?.critical
  })
  const toRemove = critEdges.slice(0, Math.floor(critEdges.length / 2))
  const filteredEdges = newEdges.filter(e => !toRemove.some(r => r.from === e.from && r.to === e.to))
  return { nodes, edges: filteredEdges }
}

function crashing(nodes: PERTNode[]): PERTNode[] {
  // Crashing: réduire la durée des tâches critiques vers duration_o
  return nodes.map(n => {
    if (!n.critical) return n
    const newDur = Math.max(n.duration_o, Math.round(n.duration_exp * 0.75))
    return { ...n, duration_exp: newDur, eft: n.est + newDur }
  })
}

export default function PERTPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "pert")
  const [pert, setPert] = useState<PERTData>({ nodes: [], edges: [] })
  const [selected, setSelected] = useState<string|null>(null)
  const [editNode, setEditNode] = useState<PERTNode|null>(null)
  const [addingEdge, setAddingEdge] = useState<string|null>(null) // from node id
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 40, y: 20 })
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number }|null>(null)
  const [panning, setPanning] = useState<{ sx: number; sy: number; ox: number; oy: number }|null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data?.nodes?.length > 0) {
      const recalc = calcPERT(data.nodes, data.edges ?? [])
      setPert({ nodes: recalc, edges: data.edges ?? [] })
    }
  }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération PERT...")
    try {
      // Générer depuis les tâches Gantt si disponibles
      const phases = ["Initialisation","Analyse","Conception","Réalisation","Déploiement"]
      const rawNodes: PERTNode[] = []
      const rawEdges: PERTEdge[] = []
      let nodeId = 0

      phases.forEach((phase, pi) => {
        const count = [1, 2, 3, 2, 1][pi]
        const phaseNodeIds: string[] = []
        for (let i = 0; i < count; i++) {
          const id = `N${pi}_${i}`
          const o = 2 + pi, m = 4 + pi * 2, p = 8 + pi * 3
          const exp = Math.round((o + 4*m + p) / 6)
          const variance = Math.pow((p-o)/6, 2)
          rawNodes.push({
            id, name: `${phase} ${count > 1 ? i+1 : ""}`.trim(), phase,
            duration_o: o, duration_m: m, duration_p: p,
            duration_exp: exp, variance,
            x: 0, y: 0, est: 0, eft: 0, lst: 0, lft: 0, slack: 0, critical: false
          })
          phaseNodeIds.push(id)
          nodeId++
        }
        // Liens intra-phase (série)
        for (let i = 0; i < phaseNodeIds.length - 1; i++) {
          rawEdges.push({ from: phaseNodeIds[i], to: phaseNodeIds[i+1] })
        }
        // Liens inter-phase (dernier nœud phase précédente → premier nœud phase courante)
        if (pi > 0) {
          const prevPhase = phases[pi-1]
          const prevNodes = rawNodes.filter(n => n.phase === prevPhase)
          rawEdges.push({ from: prevNodes[prevNodes.length-1].id, to: phaseNodeIds[0] })
        }
      })

      const laid = autoLayout(rawNodes)
      const recalc = calcPERT(laid, rawEdges)
      const newPert = { nodes: recalc, edges: rawEdges }
      setPert(newPert); await save(newPert)
      toast.success(`PERT généré — ${recalc.length} nœuds, ${rawEdges.length} liens`)
    } catch(e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const savePert = useCallback(async (p: PERTData) => {
    const recalc = calcPERT(p.nodes, p.edges)
    const updated = { nodes: recalc, edges: p.edges }
    setPert(updated); await save(updated)
  }, [save])

  // ── Wheel zoom ───────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      setScale(s => Math.min(3, Math.max(0.2, s * (e.deltaY > 0 ? 0.9 : 1.1))))
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [])

  // ── SVG coords helper ────────────────────────────────────────
  const svgCoords = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = containerRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - offset.x) / scale,
      y: (e.clientY - rect.top - offset.y) / scale,
    }
  }

  // ── Mouse events ─────────────────────────────────────────────
  const onNodeMouseDown = (e: React.MouseEvent, node: PERTNode) => {
    e.stopPropagation()
    if (addingEdge) {
      // Créer un lien
      if (addingEdge !== node.id && !pert.edges.some(ed => ed.from === addingEdge && ed.to === node.id)) {
        const newEdges = [...pert.edges, { from: addingEdge, to: node.id }]
        savePert({ ...pert, edges: newEdges })
        toast.success("Lien créé")
      }
      setAddingEdge(null)
      return
    }
    setSelected(node.id)
    const pt = svgCoords(e)
    setDragging({ id: node.id, ox: pt.x - node.x, oy: pt.y - node.y })
  }

  const onSVGMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).tagName === "svg" || (e.target as SVGElement).tagName === "rect") {
      setSelected(null); setAddingEdge(null)
      setPanning({ sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y })
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const pt = svgCoords(e)
      setPert(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === dragging.id ? { ...n, x: pt.x - dragging.ox, y: pt.y - dragging.oy } : n) }))
    }
    if (panning) {
      setOffset({ x: panning.ox + (e.clientX - panning.sx), y: panning.oy + (e.clientY - panning.sy) })
    }
  }

  const onMouseUp = async () => {
    if (dragging) await savePert(pert)
    setDragging(null); setPanning(null)
  }

  const deleteEdge = async (from: string, to: string) => {
    const newEdges = pert.edges.filter(e => !(e.from === from && e.to === to))
    await savePert({ ...pert, edges: newEdges })
    toast.success("Lien supprimé")
  }

  const applyFastTrack = async () => {
    const { nodes, edges } = fastTrack(pert.nodes, pert.edges)
    await savePert({ nodes, edges })
    toast.success("Fast Tracking appliqué — tâches critiques parallélisées")
  }

  const applyCrashing = async () => {
    const nodes = crashing(pert.nodes)
    await savePert({ ...pert, nodes })
    toast.success("Crashing appliqué — durées critiques réduites vers optimiste")
  }

  const phases = Array.from(new Set(pert.nodes.map(n => n.phase)))
  const phaseColor = (phase: string) => PHASE_COLORS[phases.indexOf(phase) % PHASE_COLORS.length]
  const totalDuration = Math.max(...pert.nodes.map(n => n.eft), 0)
  const critPath = pert.nodes.filter(n => n.critical).map(n => n.name).join(" → ")

  // ── Arrow path between nodes ─────────────────────────────────
  const edgePath = (from: PERTNode, to: PERTNode) => {
    const x1 = from.x + NODE_W, y1 = from.y + NODE_H/2
    const x2 = to.x, y2 = to.y + NODE_H/2
    const mx = (x1 + x2) / 2
    return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
  }

  return (
    <AppLayout>
      <ToolLayout title="Diagramme PERT" icon="🔀" subtitle="// PERT — CHEMIN CRITIQUE"
        history={history}
        onLoadHistory={(e) => { loadHistory(e); if(e.data?.nodes) { const r = calcPERT(e.data.nodes, e.data.edges??[]); setPert({ nodes: r, edges: e.data.edges??[] }) }}}
        onGenerate={generate} generateLabel="Générer PERT" generating={loading}
        projectName={project?.name} jsonData={pert}
        exportFilename={`PERT_${project?.name??""}`}>

        {pert.nodes.length === 0 && !loading && (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-3">🔀</div>
            <p className="font-semibold text-foreground mb-1">Aucun diagramme PERT</p>
            <p className="text-sm text-muted-foreground">Cliquez sur "Générer PERT"</p>
          </div>
        )}

        {pert.nodes.length > 0 && (
          <div className="space-y-3">
            {/* KPIs + compression PMI */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-card border border-border rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Durée totale</p>
                <p className="text-xl font-bold text-foreground">{totalDuration}j</p>
              </div>
              <div className="bg-card border border-red-500/20 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Nœuds critiques</p>
                <p className="text-xl font-bold text-red-400">{pert.nodes.filter(n=>n.critical).length}</p>
              </div>
              <div className="col-span-2 bg-card border border-border rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Chemin critique</p>
                <p className="text-xs text-red-400 font-medium truncate">{critPath || "—"}</p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-2 flex-wrap items-center">
              {/* Phase legend */}
              {phases.map((p,i) => (
                <div key={p} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: PHASE_COLORS[i%PHASE_COLORS.length] }}/>
                  <span className="text-xs text-muted-foreground">{p}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-8 h-0.5 bg-red-500"/>
                <span className="text-xs text-muted-foreground">Critique</span>
              </div>

              {/* PMI Compression */}
              <div className="ml-auto flex gap-2">
                <button onClick={applyFastTrack}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/20 transition-colors"
                  title="Fast Tracking — paralléliser les tâches critiques">
                  <GitMerge size={13}/> Fast Tracking
                </button>
                <button onClick={applyCrashing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/20 transition-colors"
                  title="Crashing — réduire les durées critiques (coût supplémentaire)">
                  <Zap size={13}/> Crashing
                </button>
                <button onClick={() => setAddingEdge(addingEdge ? null : "select")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${addingEdge ? "bg-blue-500 border-blue-500 text-white" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
                  title="Créer un lien : cliquez sur le nœud source puis le nœud cible">
                  <Plus size={13}/> {addingEdge ? "Cliquez la cible" : "Ajouter lien"}
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex gap-1 bg-card border border-border rounded-lg p-0.5">
                <button onClick={() => setScale(s => Math.min(3, s*1.2))} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded" title="Zoom +"><ZoomIn size={13}/></button>
                <button onClick={() => setScale(s => Math.max(0.2, s*0.8))} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded" title="Zoom -"><ZoomOut size={13}/></button>
                <span className="flex items-center px-1.5 text-[10px] text-muted-foreground min-w-8 justify-center">{Math.round(scale*100)}%</span>
                <button onClick={() => { setScale(1); setOffset({ x: 40, y: 20 }) }} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded" title="Reset"><RotateCcw size={12}/></button>
              </div>
            </div>

            {addingEdge && addingEdge !== "select" && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2 text-xs text-blue-400">
                Source : <strong>{pert.nodes.find(n=>n.id===addingEdge)?.name}</strong> — Cliquez maintenant sur le nœud de destination
              </div>
            )}

            {/* SVG Canvas */}
            <div ref={containerRef}
              className="bg-card border border-border rounded-xl overflow-hidden relative"
              style={{ height: 560, cursor: addingEdge ? "crosshair" : panning ? "grabbing" : "grab" }}
              onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>

              {/* Zoom indicator */}
              <div className="absolute bottom-3 left-3 z-10">
                <span className="text-xs text-muted-foreground bg-card/80 border border-border rounded px-2 py-1">
                  Molette = zoom · Glisser = déplacer · Cliquer nœud = sélectionner
                </span>
              </div>

              <svg ref={svgRef} width="100%" height="100%"
                onMouseDown={onSVGMouseDown}
                style={{ display: "block" }}>
                <defs>
                  <pattern id="pertgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40 0L0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                  </pattern>
                  {/* Normal arrow */}
                  <marker id="arrow-normal" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#475569"/>
                  </marker>
                  {/* Critical arrow */}
                  <marker id="arrow-critical" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#ef4444"/>
                  </marker>
                </defs>

                <rect width="100%" height="100%" fill="url(#pertgrid)" opacity="0.6"/>

                <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>

                  {/* ── EDGES ── */}
                  {pert.edges.map((edge, i) => {
                    const from = pert.nodes.find(n => n.id === edge.from)
                    const to = pert.nodes.find(n => n.id === edge.to)
                    if (!from || !to) return null
                    const isCrit = from.critical && to.critical
                    const path = edgePath(from, to)
                    // Midpoint for delete button
                    const mx = (from.x + NODE_W + to.x) / 2
                    const my = (from.y + to.y + NODE_H) / 2
                    return (
                      <g key={`${edge.from}-${edge.to}`}>
                        <path d={path} fill="none"
                          stroke={isCrit ? "#ef4444" : "#475569"}
                          strokeWidth={isCrit ? 2.5 : 1.5}
                          strokeDasharray={isCrit ? "none" : "none"}
                          markerEnd={`url(#arrow-${isCrit ? "critical" : "normal"})`}
                          style={{ filter: isCrit ? "drop-shadow(0 0 3px rgba(239,68,68,0.5))" : "none" }}/>
                        {/* Invisible wider click target */}
                        <path d={path} fill="none" stroke="transparent" strokeWidth={12}
                          style={{ cursor: "pointer" }}
                          onClick={() => deleteEdge(edge.from, edge.to)}>
                          <title>Cliquer pour supprimer ce lien</title>
                        </path>
                      </g>
                    )
                  })}

                  {/* ── NODES ── */}
                  {pert.nodes.map(node => {
                    const color = phaseColor(node.phase)
                    const isSel = selected === node.id
                    const isCrit = node.critical
                    const isAddSrc = addingEdge === node.id

                    return (
                      <g key={node.id}
                        onMouseDown={e => onNodeMouseDown(e, node)}
                        onClick={() => { if (!addingEdge || addingEdge === "select") { setAddingEdge(node.id); setSelected(node.id) } }}
                        style={{ cursor: addingEdge ? "crosshair" : "grab" }}>

                        {/* Shadow/glow for critical */}
                        {isCrit && (
                          <rect x={node.x-2} y={node.y-2} width={NODE_W+4} height={NODE_H+4} rx={8}
                            fill="none" stroke="#ef4444" strokeWidth={1} opacity={0.3}/>
                        )}

                        {/* Main box */}
                        <rect x={node.x} y={node.y} width={NODE_W} height={NODE_H} rx={6}
                          fill="#0f172a"
                          stroke={isAddSrc ? "#60a5fa" : isSel ? color : isCrit ? "#ef4444" : color}
                          strokeWidth={isAddSrc ? 3 : isSel ? 2.5 : isCrit ? 2 : 1.5}/>

                        {/* Header bar */}
                        <rect x={node.x} y={node.y} width={NODE_W} height={16} rx={6} fill={isCrit ? "#7f1d1d" : color + "55"}/>
                        <rect x={node.x} y={node.y+10} width={NODE_W} height={6} fill={isCrit ? "#7f1d1d" : color + "55"}/>

                        {/* Name */}
                        <text x={node.x + NODE_W/2} y={node.y + 12} textAnchor="middle"
                          fill={isCrit ? "#fca5a5" : "#f1f5f9"} fontSize="9" fontWeight="600">
                          {node.name.length > 17 ? node.name.slice(0,16)+"…" : node.name}
                        </text>

                        {/* Divider */}
                        <line x1={node.x} y1={node.y+22} x2={node.x+NODE_W} y2={node.y+22} stroke="#1e293b" strokeWidth={0.5}/>
                        <line x1={node.x+NODE_W/2} y1={node.y+16} x2={node.x+NODE_W/2} y2={node.y+22} stroke="#1e293b" strokeWidth={0.5}/>

                        {/* EST | EFT */}
                        <text x={node.x+NODE_W/4} y={node.y+20} textAnchor="middle" fill="#60a5fa" fontSize="8">EST:{node.est}</text>
                        <text x={node.x+3*NODE_W/4} y={node.y+20} textAnchor="middle" fill="#60a5fa" fontSize="8">EFT:{node.eft}</text>

                        {/* Duration center */}
                        <text x={node.x+NODE_W/2} y={node.y+42} textAnchor="middle"
                          fill={isCrit?"#fca5a5":"#f1f5f9"} fontSize="16" fontWeight="700">{node.duration_exp}j</text>

                        {/* o/m/p */}
                        <text x={node.x+NODE_W/2} y={node.y+53} textAnchor="middle" fill="#475569" fontSize="8">
                          o:{node.duration_o} m:{node.duration_m} p:{node.duration_p}
                        </text>

                        {/* Divider bottom */}
                        <line x1={node.x} y1={node.y+57} x2={node.x+NODE_W} y2={node.y+57} stroke="#1e293b" strokeWidth={0.5}/>
                        <line x1={node.x+NODE_W/2} y1={node.y+57} x2={node.x+NODE_W/2} y2={node.y+NODE_H} stroke="#1e293b" strokeWidth={0.5}/>

                        {/* LST | LFT */}
                        <text x={node.x+NODE_W/4} y={node.y+69} textAnchor="middle" fill="#a78bfa" fontSize="8">LST:{node.lst}</text>
                        <text x={node.x+3*NODE_W/4} y={node.y+69} textAnchor="middle" fill="#a78bfa" fontSize="8">LFT:{node.lft}</text>

                        {/* Critical badge */}
                        {isCrit ? (
                          <g>
                            <rect x={node.x+NODE_W-26} y={node.y+1} width={24} height={13} rx={3} fill="#ef4444"/>
                            <text x={node.x+NODE_W-14} y={node.y+10} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">CR</text>
                          </g>
                        ) : (
                          <text x={node.x+NODE_W-4} y={node.y+12} textAnchor="end" fill="#22c55e" fontSize="8">▼{node.slack.toFixed(0)}</text>
                        )}
                      </g>
                    )
                  })}
                </g>
              </svg>
            </div>

            {/* Edit panel */}
            {selected && !addingEdge && (() => {
              const node = pert.nodes.find(n => n.id === selected)
              if (!node) return null
              if (editNode?.id === selected) {
                return (
                  <div className="bg-card border border-primary/40 rounded-xl p-4">
                    <p className="text-sm font-semibold text-foreground mb-3">✏️ Modifier : {editNode.name}</p>
                    <div className="grid grid-cols-5 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground block mb-1">Nom</label>
                        <input value={editNode.name} onChange={e => setEditNode({...editNode, name:e.target.value})}
                          className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground"/>
                      </div>
                      {[
                        { label:"Optimiste (o)", key:"duration_o" },
                        { label:"Probable (m)", key:"duration_m" },
                        { label:"Pessimiste (p)", key:"duration_p" },
                        { label:"Phase", key:"phase" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                          <input type={f.key.includes("duration")?"number":"text"}
                            value={(editNode as any)[f.key]}
                            onChange={e => {
                              const val = f.key.includes("duration") ? +e.target.value : e.target.value
                              const updated: any = {...editNode, [f.key]: val}
                              if (f.key.includes("duration")) {
                                updated.duration_exp = Math.round((updated.duration_o + 4*updated.duration_m + updated.duration_p) / 6)
                                updated.variance = Math.pow((updated.duration_p - updated.duration_o)/6, 2)
                              }
                              setEditNode(updated)
                            }}
                            className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground"/>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={async () => {
                        const updated = pert.nodes.map(n => n.id===editNode.id ? editNode : n)
                        await savePert({ ...pert, nodes: updated })
                        setEditNode(null); toast.success("Nœud mis à jour")
                      }} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium">
                        <Check size={13}/> Sauvegarder
                      </button>
                      <button onClick={() => setEditNode(null)} className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs">
                        Annuler
                      </button>
                      <button onClick={async () => {
                        const newNodes = pert.nodes.filter(n => n.id !== selected)
                        const newEdges = pert.edges.filter(e => e.from !== selected && e.to !== selected)
                        await savePert({ nodes: newNodes, edges: newEdges })
                        setSelected(null); setEditNode(null)
                        toast.success("Nœud supprimé")
                      }} className="ml-auto px-3 py-1.5 bg-destructive/20 text-destructive rounded-lg text-xs">
                        Supprimer nœud
                      </button>
                    </div>
                  </div>
                )
              }
              return (
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-6 flex-wrap">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Nœud sélectionné</p>
                    <p className="font-semibold text-foreground">{node.name}</p>
                    <p className="text-xs text-muted-foreground">{node.phase}</p>
                  </div>
                  {[
                    { label:"Durée espérée", value:`${node.duration_exp}j`, color:"#e2e8f0" },
                    { label:"o/m/p", value:`${node.duration_o}/${node.duration_m}/${node.duration_p}`, color:"#94a3b8" },
                    { label:"EST → EFT", value:`${node.est} → ${node.eft}`, color:"#60a5fa" },
                    { label:"LST → LFT", value:`${node.lst} → ${node.lft}`, color:"#a78bfa" },
                    { label:"Marge", value:node.critical?"Critique ⚠️":`${node.slack.toFixed(0)}j`, color:node.critical?"#ef4444":"#22c55e" },
                    { label:"Variance", value:node.variance.toFixed(2), color:"#f59e0b" },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                      <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => setEditNode({...node})}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-lg text-xs transition-colors">
                      <Pencil size={13}/> Modifier
                    </button>
                    <button onClick={() => setAddingEdge(node.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs">
                      <Plus size={13}/> Lier
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Guide compression PMI */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-purple-400 mb-1 flex items-center gap-1.5"><GitMerge size={12}/> Fast Tracking (PMI)</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Paralléliser des tâches normalement séquentielles. Réduit la durée mais augmente les risques. Applique automatiquement sur le chemin critique.</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1.5"><Zap size={12}/> Crashing (PMI)</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Ajouter des ressources pour réduire les durées critiques vers leur estimé optimiste. Coût supplémentaire mais délai garanti.</p>
              </div>
            </div>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
