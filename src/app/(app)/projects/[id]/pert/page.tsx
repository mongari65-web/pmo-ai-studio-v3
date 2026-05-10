"use client"
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"

interface PERTNode {
  id: string; name: string; x: number; y: number
  duration_o: number; duration_m: number; duration_p: number
  duration_exp: number; variance: number
  est: number; eft: number; lst: number; lft: number; slack: number
  critical: boolean; phase: string
}
interface PERTEdge { from: string; to: string; label?: string }
interface PERTData { nodes: PERTNode[]; edges: PERTEdge[] }

const PHASE_COLORS = ["#2563eb","#7c3aed","#059669","#d97706","#dc2626"]

function calcPERT(nodes: PERTNode[], edges: PERTEdge[]): PERTNode[] {
  const map = new Map(nodes.map(n => [n.id, { ...n }]))

  // Forward pass (EST/EFT)
  const visited = new Set<string>()
  const visit = (id: string) => {
    if (visited.has(id)) return
    visited.add(id)
    const node = map.get(id)!
    const preds = edges.filter(e => e.to === id).map(e => map.get(e.from))
    node.est = preds.length > 0 ? Math.max(...preds.map(p => p?.eft ?? 0)) : 0
    node.eft = node.est + node.duration_exp
    edges.filter(e => e.from === id).forEach(e => visit(e.to))
  }
  nodes.forEach(n => { if (!edges.some(e => e.to === n.id)) visit(n.id) })

  // Backward pass (LST/LFT)
  const maxEFT = Math.max(...[...map.values()].map(n => n.eft))
  const backVisited = new Set<string>()
  const backVisit = (id: string) => {
    if (backVisited.has(id)) return
    backVisited.add(id)
    const node = map.get(id)!
    const succs = edges.filter(e => e.from === id).map(e => map.get(e.to))
    node.lft = succs.length > 0 ? Math.min(...succs.map(s => s?.lst ?? maxEFT)) : maxEFT
    node.lst = node.lft - node.duration_exp
    node.slack = node.lst - node.est
    node.critical = node.slack === 0
    edges.filter(e => e.to === id).forEach(e => backVisit(e.from))
  }
  ;[...map.values()].filter(n => !edges.some(e => e.from === n.id)).forEach(n => backVisit(n.id))

  return [...map.values()]
}

export default function PERTPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "pert")
  const [pert, setPert] = useState<PERTData>({ nodes: [], edges: [] })
  const [selected, setSelected] = useState<string | null>(null)
  const [draggingNode, setDraggingNode] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [panning, setPanning] = useState<{ startX: number; startY: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (data?.nodes) {
      const recalc = calcPERT(data.nodes, data.edges ?? [])
      setPert({ nodes: recalc, edges: data.edges ?? [] })
    }
  }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération PERT...")
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "pert", projectName: project.name, projectDescription: project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      // Générer layout automatique
      const rawNodes: Omit<PERTNode,"est"|"eft"|"lst"|"lft"|"slack"|"critical">[] = json.data?.nodes ?? generateDefaultPERT(project.name)
      const edges: PERTEdge[] = json.data?.edges ?? []

      // Layout en colonnes
      const phases = Array.from(new Set(rawNodes.map(n => n.phase)))
      const nodesWithPos = rawNodes.map((n, i) => {
        const phaseIdx = phases.indexOf(n.phase)
        const phaseNodes = rawNodes.filter(nn => nn.phase === n.phase)
        const nodeInPhase = phaseNodes.indexOf(n as any)
        return {
          ...n,
          x: 120 + phaseIdx * 220,
          y: 80 + nodeInPhase * 120,
          est: 0, eft: 0, lst: 0, lft: 0, slack: 0, critical: false
        }
      })
      const recalc = calcPERT(nodesWithPos, edges)
      const newPert = { nodes: recalc, edges }
      setPert(newPert); await save(newPert)
      toast.success(`PERT généré — ${recalc.length} nœuds`)
    } catch(e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  function generateDefaultPERT(name: string) {
    const phases = ["Initialisation","Analyse","Conception","Réalisation","Clôture"]
    return phases.flatMap((phase, pi) => {
      const count = [1, 2, 3, 2, 1][pi]
      return Array.from({ length: count }, (_, i) => ({
        id: `N${pi}${i}`, name: `${phase} ${i+1}`, phase,
        duration_o: 2+pi, duration_m: 4+pi*2, duration_p: 8+pi*3,
        duration_exp: Math.round((2+pi + 4*(4+pi*2) + 8+pi*3) / 6),
        variance: Math.pow((8+pi*3 - (2+pi)) / 6, 2),
      }))
    })
  }

  // Drag node
  const onNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    setSelected(nodeId)
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    const node = pert.nodes.find(n => n.id === nodeId)!
    setDraggingNode({ id: nodeId, ox: svgPt.x - node.x, oy: svgPt.y - node.y })
  }

  const onSVGMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNode) {
      const svg = svgRef.current!
      const pt = svg.createSVGPoint()
      pt.x = e.clientX; pt.y = e.clientY
      const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse())
      setPert(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === draggingNode.id
          ? { ...n, x: svgPt.x - draggingNode.ox, y: svgPt.y - draggingNode.oy } : n)
      }))
    }
    if (panning) {
      const dx = e.clientX - panning.startX
      const dy = e.clientY - panning.startY
      setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }))
      setPanning({ startX: e.clientX, startY: e.clientY })
    }
  }

  const onSVGMouseUp = async () => {
    if (draggingNode) { await save(pert) }
    setDraggingNode(null); setPanning(null)
  }

  const onSVGMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setSelected(null)
      setPanning({ startX: e.clientX, startY: e.clientY })
    }
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setTransform(t => ({ ...t, scale: Math.min(3, Math.max(0.3, t.scale * delta)) }))
  }

  const selectedNode = pert.nodes.find(n => n.id === selected)
  const phases = Array.from(new Set(pert.nodes.map(n => n.phase)))

  return (
    <AppLayout>
      <ToolLayout title="Diagramme PERT" icon="🔀" subtitle="// PERT — CHEMIN CRITIQUE"
        history={history}
        onLoadHistory={(e) => { loadHistory(e); if (e.data?.nodes) { const r = calcPERT(e.data.nodes, e.data.edges??[]); setPert({ nodes: r, edges: e.data.edges??[] }) }}}
        onGenerate={generate} generateLabel="Générer PERT" generating={loading}
        projectName={project?.name}
        jsonData={pert}
        exportFilename={`PERT_${project?.name ?? ""}`}>

        {pert.nodes.length === 0 && !loading && (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-3">🔀</div>
            <p className="font-semibold text-foreground mb-1">Aucun diagramme PERT</p>
            <p className="text-sm text-muted-foreground">Cliquez sur "Générer PERT"</p>
          </div>
        )}

        {pert.nodes.length > 0 && (
          <div className="space-y-3">
            {/* Legend */}
            <div className="flex gap-4 flex-wrap items-center">
              {phases.map((p, i) => (
                <div key={p} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: PHASE_COLORS[i % PHASE_COLORS.length] }}/>
                  <span className="text-xs text-muted-foreground">{p}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-3 h-3 rounded-sm bg-red-500"/>
                <span className="text-xs text-muted-foreground">Chemin critique</span>
              </div>
              <span className="text-xs text-muted-foreground">Molette = zoom · Clic+glisser = déplacer</span>
            </div>

            {/* SVG */}
            <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ height: 560 }}>
              <svg ref={svgRef} width="100%" height="100%"
                onMouseMove={onSVGMouseMove} onMouseUp={onSVGMouseUp}
                onMouseDown={onSVGMouseDown} onWheel={onWheel}
                style={{ cursor: panning ? "grabbing" : "grab" }}>

                <defs>
                  <pattern id="pertgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                  </pattern>
                  <marker id="pertarrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#475569"/>
                  </marker>
                  <marker id="critarrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#ef4444"/>
                  </marker>
                </defs>

                <rect width="100%" height="100%" fill="url(#pertgrid)" opacity="0.5"/>

                <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
                  {/* Edges */}
                  {pert.edges.map((edge, i) => {
                    const from = pert.nodes.find(n => n.id === edge.from)
                    const to = pert.nodes.find(n => n.id === edge.to)
                    if (!from || !to) return null
                    const isCrit = from.critical && to.critical
                    return (
                      <g key={i}>
                        <line x1={from.x + 60} y1={from.y + 35} x2={to.x - 60} y2={to.y + 35}
                          stroke={isCrit ? "#ef4444" : "#475569"}
                          strokeWidth={isCrit ? 2.5 : 1.5}
                          strokeDasharray={isCrit ? "none" : "4 3"}
                          markerEnd={`url(#${isCrit ? "critarrow" : "pertarrow"})`}/>
                        {edge.label && (
                          <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 + 30}
                            textAnchor="middle" fill="#64748b" fontSize="9">{edge.label}</text>
                        )}
                      </g>
                    )
                  })}

                  {/* Nodes */}
                  {pert.nodes.map(node => {
                    const phaseIdx = phases.indexOf(node.phase)
                    const color = PHASE_COLORS[phaseIdx % PHASE_COLORS.length]
                    const isSelected = selected === node.id
                    const isCrit = node.critical
                    return (
                      <g key={node.id} onMouseDown={e => onNodeMouseDown(e, node.id)}
                        style={{ cursor: "grab" }}>
                        {/* Node box */}
                        <rect x={node.x - 60} y={node.y} width={120} height={70} rx={6}
                          fill="#0f172a" stroke={isCrit ? "#ef4444" : color}
                          strokeWidth={isSelected ? 3 : isCrit ? 2 : 1.5}
                          filter={isSelected ? `drop-shadow(0 0 6px ${color})` : "none"}/>

                        {/* Header */}
                        <rect x={node.x - 60} y={node.y} width={120} height={18} rx={6}
                          fill={isCrit ? "#7f1d1d" : color + "33"}/>
                        <rect x={node.x - 60} y={node.y + 12} width={120} height={6}
                          fill={isCrit ? "#7f1d1d" : color + "33"}/>

                        {/* Name */}
                        <text x={node.x} y={node.y + 12} textAnchor="middle"
                          fill={isCrit ? "#fca5a5" : "#f1f5f9"} fontSize="9" fontWeight="600">
                          {node.name.length > 16 ? node.name.slice(0, 15) + "…" : node.name}
                        </text>

                        {/* EST | EFT */}
                        <line x1={node.x - 60} y1={node.y + 28} x2={node.x + 60} y2={node.y + 28} stroke="#1e293b" strokeWidth={0.5}/>
                        <line x1={node.x} y1={node.y + 18} x2={node.x} y2={node.y + 28} stroke="#1e293b" strokeWidth={0.5}/>
                        <text x={node.x - 30} y={node.y + 26} textAnchor="middle" fill="#60a5fa" fontSize="9">EST: {node.est}</text>
                        <text x={node.x + 30} y={node.y + 26} textAnchor="middle" fill="#60a5fa" fontSize="9">EFT: {node.eft}</text>

                        {/* Duration */}
                        <text x={node.x} y={node.y + 42} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">
                          {node.duration_exp}j
                        </text>
                        <text x={node.x} y={node.y + 53} textAnchor="middle" fill="#475569" fontSize="8">
                          o:{node.duration_o} m:{node.duration_m} p:{node.duration_p}
                        </text>

                        {/* LST | LFT */}
                        <line x1={node.x - 60} y1={node.y + 57} x2={node.x + 60} y2={node.y + 57} stroke="#1e293b" strokeWidth={0.5}/>
                        <line x1={node.x} y1={node.y + 57} x2={node.x} y2={node.y + 70} stroke="#1e293b" strokeWidth={0.5}/>
                        <text x={node.x - 30} y={node.y + 66} textAnchor="middle" fill="#a78bfa" fontSize="9">LST: {node.lst}</text>
                        <text x={node.x + 30} y={node.y + 66} textAnchor="middle" fill="#a78bfa" fontSize="9">LFT: {node.lft}</text>

                        {/* Slack badge */}
                        {node.slack === 0 && (
                          <rect x={node.x + 38} y={node.y + 2} width={20} height={12} rx={3} fill="#ef4444"/>
                        )}
                        {node.slack === 0 && (
                          <text x={node.x + 48} y={node.y + 11} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">CR</text>
                        )}
                        {node.slack > 0 && (
                          <text x={node.x + 50} y={node.y + 11} textAnchor="end" fill="#22c55e" fontSize="8">▼{node.slack}</text>
                        )}
                      </g>
                    )
                  })}
                </g>
              </svg>
            </div>

            {/* Selected node detail */}
            {selectedNode && (
              <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tâche</p>
                  <p className="text-sm font-semibold text-foreground">{selectedNode.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedNode.phase}</p>
                </div>
                {[
                  { label: "Durée espérée", value: `${selectedNode.duration_exp}j`, color: "#e2e8f0" },
                  { label: "EST / EFT", value: `${selectedNode.est} / ${selectedNode.eft}`, color: "#60a5fa" },
                  { label: "LST / LFT", value: `${selectedNode.lst} / ${selectedNode.lft}`, color: "#a78bfa" },
                  { label: "Marge libre", value: selectedNode.slack === 0 ? "Critique ⚠️" : `${selectedNode.slack}j`, color: selectedNode.slack === 0 ? "#ef4444" : "#22c55e" },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
