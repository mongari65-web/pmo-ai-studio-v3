import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Démo — MigrateCloud Pro | PMO AI Studio',
  description: 'Explorez un projet de migration Azure complet géré avec PMO AI Studio. Gantt, EVM, RAID, WBS, RACI et tous les outils PMO en lecture seule.',
}

// ── Données démo statiques ──────────────────────────────────

const DEMO_PROJECT = {
  name: 'MigrateCloud Pro — Migration Azure',
  client: 'Banque Régionale du Maghreb',
  budget: '850 000€',
  start: 'Janvier 2026',
  end: 'Juin 2027',
  duration: '18 mois',
  team: 12,
  health: 72,
  progress: 34,
  cpi: '0.94',
  spi: '0.87',
  eac: '903 000€',
}

const GANTT_TASKS = [
  { phase: 'Initialisation', task: 'Charte de projet & gouvernance',   start: 1, dur: 2, pct: 100, color: '#7B5EFF' },
  { phase: 'Initialisation', task: 'Audit infrastructure existante',   start: 2, dur: 3, pct: 100, color: '#7B5EFF' },
  { phase: 'Conception',     task: 'Architecture cible Azure',         start: 4, dur: 4, pct: 85,  color: '#3b82f6' },
  { phase: 'Conception',     task: 'Plan de migration par vagues',      start: 5, dur: 3, pct: 80,  color: '#3b82f6' },
  { phase: 'Infrastructure', task: 'Déploiement Landing Zone Azure',   start: 7, dur: 5, pct: 60,  color: '#22c55e' },
  { phase: 'Infrastructure', task: 'Configuration réseau & sécurité',  start: 9, dur: 4, pct: 45,  color: '#22c55e' },
  { phase: 'Migration',      task: 'Vague 1 — Applications critiques', start: 11, dur: 6, pct: 30, color: '#f59e0b' },
  { phase: 'Migration',      task: 'Vague 2 — Applications secondaires',start: 14, dur: 5, pct: 10,color: '#f59e0b' },
  { phase: 'Tests',          task: 'Tests performance & sécurité',     start: 16, dur: 3, pct: 5,  color: '#ef4444' },
  { phase: 'Clôture',        task: 'Formation utilisateurs & go-live',  start: 17, dur: 2, pct: 0,  color: '#64748b' },
]

const RAID_ITEMS = [
  { type: 'R', title: 'Indisponibilité pendant migration AS400',    prio: 'Critique', status: 'Ouvert',    color: '#ef4444', mitigation: 'Architecture dual-run + tests failover' },
  { type: 'R', title: 'Non-conformité réglementaire DORA/NIS2',     prio: 'Critique', status: 'En cours',  color: '#ef4444', mitigation: 'Audit conformité + certification ISO 27001' },
  { type: 'R', title: 'Résistance au changement équipes métier',    prio: 'Haute',    status: 'Ouvert',    color: '#f59e0b', mitigation: 'Programme change management 3 mois' },
  { type: 'R', title: 'Dépassement budgétaire (+15%)',              prio: 'Haute',    status: 'Surveillé', color: '#f59e0b', mitigation: 'Réserve contingente 128k€ identifiée' },
  { type: 'A', title: 'Valider architecture cible avec RSSI',       prio: 'Haute',    status: 'En cours',  color: '#3b82f6', mitigation: 'Réunion RSSI semaine 12' },
  { type: 'A', title: 'Commander licences Azure Enterprise',        prio: 'Moyen',    status: 'Terminé',   color: '#22c55e', mitigation: 'Contrat signé — économie 120k€/an' },
  { type: 'I', title: 'Retard livraison connecteurs legacy',        prio: 'Haute',    status: 'Ouvert',    color: '#ef4444', mitigation: 'Plan B : développement connecteur custom' },
  { type: 'D', title: 'Choix région Azure : France Central',       prio: 'Info',     status: 'Clos',      color: '#22c55e', mitigation: 'Décision COMEX du 15/01/2026' },
]

const WBS_ITEMS = [
  { level: 0, code: '1.0', label: 'MigrateCloud Pro — Migration Azure', color: '#0078D4' },
  { level: 1, code: '1.1', label: 'Initialisation & Gouvernance',       color: '#7B5EFF' },
  { level: 2, code: '1.1.1', label: 'Charte de projet',                color: '#94a3b8' },
  { level: 2, code: '1.1.2', label: 'Comité de pilotage',               color: '#94a3b8' },
  { level: 1, code: '1.2', label: 'Architecture & Conception',          color: '#3b82f6' },
  { level: 2, code: '1.2.1', label: 'Architecture cible Azure',         color: '#94a3b8' },
  { level: 2, code: '1.2.2', label: 'Sécurité & Conformité',            color: '#94a3b8' },
  { level: 1, code: '1.3', label: 'Infrastructure Cloud',               color: '#22c55e' },
  { level: 2, code: '1.3.1', label: 'Landing Zone Azure',               color: '#94a3b8' },
  { level: 2, code: '1.3.2', label: 'Réseau & VPN',                     color: '#94a3b8' },
  { level: 2, code: '1.3.3', label: 'Sécurité & IAM',                   color: '#94a3b8' },
  { level: 1, code: '1.4', label: 'Migration Applications',             color: '#f59e0b' },
  { level: 2, code: '1.4.1', label: 'Vague 1 — Apps critiques',         color: '#94a3b8' },
  { level: 2, code: '1.4.2', label: 'Vague 2 — Apps secondaires',       color: '#94a3b8' },
  { level: 1, code: '1.5', label: 'Tests & Recette',                    color: '#ef4444' },
  { level: 1, code: '1.6', label: 'Formation & Go-Live',                color: '#64748b' },
]

const RACI = [
  { task: 'Architecture Azure',     DSI: 'A', Chef: 'R', Archi: 'R', Metier: 'C', RSSI: 'C', DG: 'I' },
  { task: 'Migration données',      DSI: 'A', Chef: 'R', Archi: 'C', Metier: 'I', RSSI: 'C', DG: 'I' },
  { task: 'Tests sécurité',         DSI: 'C', Chef: 'A', Archi: 'C', Metier: 'I', RSSI: 'R', DG: 'I' },
  { task: 'Formation utilisateurs', DSI: 'I', Chef: 'A', Archi: 'I', Metier: 'R', RSSI: 'I', DG: 'C' },
  { task: 'Go-Live décision',       DSI: 'C', Chef: 'R', Archi: 'C', Metier: 'C', RSSI: 'C', DG: 'A' },
]

const RESOURCES = [
  { name: 'Karim Benali',   role: 'Chef de Projet',      dispo: 100, status: 'Occupé',     skills: ['PMO','Azure','Gouvernance'], rate: 850 },
  { name: 'Sophie Martin',  role: 'Architecte Cloud',    dispo: 80,  status: 'Occupé',     skills: ['Azure','DevOps','Sécurité'], rate: 950 },
  { name: 'Mehdi Alaoui',   role: 'Expert Migration',    dispo: 100, status: 'Occupé',     skills: ['Azure Migrate','SQL','AS400'], rate: 800 },
  { name: 'Fatima Zahra',   role: 'RSSI / Sécurité',     dispo: 50,  status: 'Partiel',    skills: ['ISO27001','DORA','NIS2'], rate: 900 },
  { name: 'Thomas Dupont',  role: 'Dev / Intégration',   dispo: 100, status: 'Occupé',     skills: ['API','Python','Terraform'], rate: 720 },
  { name: 'Leila Bennis',   role: 'Change Management',   dispo: 60,  status: 'Partiel',    skills: ['Formation','Communication'], rate: 650 },
]

const EVM_DATA = [
  { m: 'Jan', pv: 42, ev: 38, ac: 41 },
  { m: 'Fév', pv: 89, ev: 82, ac: 88 },
  { m: 'Mar', pv: 145, ev: 131, ac: 142 },
  { m: 'Avr', pv: 210, ev: 188, ac: 201 },
  { m: 'Mai', pv: 289, ev: 251, ac: 269 },
  { m: 'Jun', pv: 0, ev: 0, ac: 0 },
]

const TOOLS = [
  { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
  { id: 'gantt',     label: '📅 Gantt',     icon: '📅' },
  { id: 'evm',       label: '💰 EVM',       icon: '💰' },
  { id: 'raid',      label: '⚠️ RAID',      icon: '⚠️' },
  { id: 'wbs',       label: '🗂️ WBS',       icon: '🗂️' },
  { id: 'raci',      label: '👥 RACI',      icon: '👥' },
  { id: 'ressources',label: '🧑‍💼 Ressources',icon: '🧑‍💼' },
]

export default function DemoPage() {
  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',Arial,sans-serif", background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>

      {/* ── BANNIÈRE CTA ── */}
      <div style={{ background: 'linear-gradient(135deg,#7B5EFF,#3b82f6)', padding: '10px 5%', textAlign: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#fff', fontWeight: 600 }}>
          👁️ Mode lecture seule — Projet de démonstration &nbsp;·&nbsp;
          <Link href="/auth/inscription" style={{ color: '#fde68a', fontWeight: 800, textDecoration: 'none' }}>
            Créez votre propre projet gratuitement →
          </Link>
        </p>
      </div>

      {/* ── HEADER PROJET ── */}
      <div style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '24px 5%' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,120,212,0.2)', border: '1px solid rgba(0,120,212,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>☁️</div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#f1f5f9' }}>{DEMO_PROJECT.name}</h1>
                <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>Client : {DEMO_PROJECT.client} · {DEMO_PROJECT.start} → {DEMO_PROJECT.end}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', fontWeight: 600 }}>🟢 En cours</span>
              <span style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>👁️ Lecture seule</span>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10 }}>
            {[
              { label: 'Avancement',  value: `${DEMO_PROJECT.progress}%`, color: '#7B5EFF' },
              { label: 'Budget BAC',  value: DEMO_PROJECT.budget,          color: '#3b82f6' },
              { label: 'CPI',         value: DEMO_PROJECT.cpi,             color: '#f59e0b' },
              { label: 'SPI',         value: DEMO_PROJECT.spi,             color: '#ef4444' },
              { label: 'EAC',         value: DEMO_PROJECT.eac,             color: '#f97316' },
              { label: 'Durée',       value: DEMO_PROJECT.duration,        color: '#22c55e' },
              { label: 'Équipe',      value: `${DEMO_PROJECT.team} pers.`, color: '#06b6d4' },
            ].map(k => (
              <div key={k.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAVIGATION OUTILS ── */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 5%', position: 'sticky', top: 45, zIndex: 90 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 4, overflowX: 'auto' }}>
          {TOOLS.map((t, i) => (
            <a key={t.id} href={`#${t.id}`} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '14px 18px',
              fontSize: 13, fontWeight: 600, color: i === 0 ? '#7B5EFF' : '#94a3b8',
              textDecoration: 'none', borderBottom: i === 0 ? '2px solid #7B5EFF' : '2px solid transparent',
              whiteSpace: 'nowrap', transition: 'color 0.2s',
            }}>
              {t.label}
            </a>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 5%', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── GANTT ── */}
        <section id="gantt">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              📅 Planning Gantt
              <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b', background: 'rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: 20 }}>10 tâches · 18 mois</span>
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600, width: 200 }}>Tâche</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600, width: 80 }}>Avancement</th>
                    {Array.from({length: 18}, (_, i) => (
                      <th key={i} style={{ padding: '8px 4px', color: '#475569', fontWeight: 500, fontSize: 10, textAlign: 'center', minWidth: 32 }}>M{i+1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {GANTT_TASKS.map((t, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 12px', color: '#e2e8f0', fontSize: 12 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: t.color, marginRight: 6 }}>●</span>
                        {t.task}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                            <div style={{ width: `${t.pct}%`, height: '100%', background: t.color, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 10, color: '#64748b' }}>{t.pct}%</span>
                        </div>
                      </td>
                      {Array.from({length: 18}, (_, m) => {
                        const inTask = m >= t.start - 1 && m < t.start - 1 + t.dur
                        const done   = inTask && t.pct === 100
                        return (
                          <td key={m} style={{ padding: '6px 2px', textAlign: 'center' }}>
                            {inTask && (
                              <div style={{ height: 14, borderRadius: 3, background: done ? t.color : `${t.color}55`, border: `1px solid ${t.color}88` }} />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── EVM ── */}
        <section id="evm">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              💰 Earned Value Management
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* KPIs EVM */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'PV — Valeur Planifiée',  value: '289 000€', color: '#3b82f6', sub: 'Budget prévu à ce jour' },
                  { label: 'EV — Valeur Acquise',    value: '251 000€', color: '#7B5EFF', sub: 'Travail réellement fait' },
                  { label: 'AC — Coût Réel',         value: '269 000€', color: '#f59e0b', sub: 'Dépenses engagées' },
                  { label: 'CV — Écart Coût',        value: '-18 000€', color: '#ef4444', sub: 'Sur budget' },
                  { label: 'SV — Écart Délai',       value: '-38 000€', color: '#ef4444', sub: 'En retard' },
                  { label: 'EAC — Prévision finale', value: '903 000€', color: '#f97316', sub: 'Coût estimé à fin' },
                ].map(k => (
                  <div key={k.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: `3px solid ${k.color}` }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{k.label}</p>
                      <p style={{ fontSize: 10, color: '#475569', margin: '2px 0 0' }}>{k.sub}</p>
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
                  </div>
                ))}
              </div>
              {/* Courbe S simplifiée */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px', fontWeight: 600 }}>Courbe S — PV / EV / AC (k€)</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, paddingBottom: 8 }}>
                  {EVM_DATA.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 130 }}>
                        <div style={{ flex: 1, background: '#3b82f6', borderRadius: '2px 2px 0 0', height: d.pv ? `${d.pv/3}px` : 0 }} />
                        <div style={{ flex: 1, background: '#7B5EFF', borderRadius: '2px 2px 0 0', height: d.ev ? `${d.ev/3}px` : 0 }} />
                        <div style={{ flex: 1, background: '#f59e0b', borderRadius: '2px 2px 0 0', height: d.ac ? `${d.ac/3}px` : 0 }} />
                      </div>
                      <span style={{ fontSize: 9, color: '#475569' }}>{d.m}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'center' }}>
                  {[['#3b82f6','PV'],['#7B5EFF','EV'],['#f59e0b','AC']].map(([c,l]) => (
                    <span key={l as string} style={{ fontSize: 10, color: c as string }}>■ {l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── RAID ── */}
        <section id="raid">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ RAID Register
              <span style={{ fontSize: 11, color: '#64748b', background: 'rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: 20 }}>8 entrées · 3 critiques</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RAID_ITEMS.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 80px 90px 200px', gap: 12, alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, borderLeft: `3px solid ${r.color}` }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: r.color, background: `${r.color}22`, width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.type}</span>
                  <p style={{ fontSize: 13, color: '#e2e8f0', margin: 0, fontWeight: 500 }}>{r.title}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: `${r.color}22`, color: r.color, textAlign: 'center' }}>{r.prio}</span>
                  <span style={{ fontSize: 10, color: r.status === 'Terminé' || r.status === 'Clos' ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>{r.status}</span>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{r.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WBS ── */}
        <section id="wbs">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px' }}>🗂️ Work Breakdown Structure</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {WBS_ITEMS.map((w, i) => (
                <div key={i} style={{
                  paddingLeft: w.level === 0 ? 0 : w.level === 1 ? 20 : 44,
                  padding: `7px 12px 7px ${w.level === 0 ? 12 : w.level === 1 ? 28 : 52}px`,
                  background: w.level === 0 ? `rgba(0,120,212,0.15)` : w.level === 1 ? 'rgba(255,255,255,0.04)' : 'transparent',
                  borderRadius: 7,
                  borderLeft: w.level > 0 ? `2px solid ${w.color}44` : 'none',
                  marginLeft: w.level === 1 ? 12 : w.level === 2 ? 28 : 0,
                }}>
                  <span style={{ fontSize: 10, color: '#475569', marginRight: 8, fontFamily: 'monospace' }}>{w.code}</span>
                  <span style={{ fontSize: w.level === 0 ? 14 : w.level === 1 ? 13 : 12, fontWeight: w.level === 0 ? 800 : w.level === 1 ? 700 : 400, color: w.level === 0 ? '#0078D4' : w.level === 1 ? w.color : '#94a3b8' }}>{w.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RACI ── */}
        <section id="raci">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px' }}>👥 Matrice RACI</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px', color: '#64748b', fontWeight: 600 }}>Activité</th>
                    {['DSI','Chef Projet','Architecte','Métier','RSSI','DG'].map(r => (
                      <th key={r} style={{ padding: '10px 14px', color: '#64748b', fontWeight: 600, textAlign: 'center', fontSize: 11 }}>{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RACI.map((row, i) => {
                    const vals = [row.DSI, row.Chef, row.Archi, row.Metier, row.RSSI, row.DG]
                    const colors: Record<string, string> = { R: '#7B5EFF', A: '#ef4444', C: '#f59e0b', I: '#22c55e' }
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 14px', color: '#e2e8f0', fontSize: 13 }}>{row.task}</td>
                        {vals.map((v, j) => (
                          <td key={j} style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 800, width: 28, height: 28, borderRadius: 8, background: `${colors[v]}22`, color: colors[v], border: `1px solid ${colors[v]}44`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{v}</span>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                {[['#7B5EFF','R — Responsable'],['#ef4444','A — Approbateur'],['#f59e0b','C — Consulté'],['#22c55e','I — Informé']].map(([c,l]) => (
                  <span key={l as string} style={{ fontSize: 11, color: c as string, fontWeight: 600 }}>■ {l}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── RESSOURCES ── */}
        <section id="ressources">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px' }}>🧑‍💼 Gestion des Ressources</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {RESOURCES.map((r, i) => (
                <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#7B5EFF,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {r.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{r.name}</p>
                      <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{r.role} · {r.rate}€/j</p>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: r.dispo === 100 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: r.dispo === 100 ? '#ef4444' : '#f59e0b' }}>
                      {r.status}
                    </span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: '#64748b' }}>Disponibilité</span>
                      <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{r.dispo}%</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                      <div style={{ width: `${r.dispo}%`, height: '100%', background: r.dispo > 70 ? '#ef4444' : '#f59e0b', borderRadius: 2 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {r.skills.map(s => (
                      <span key={s} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(123,94,255,0.15)', color: '#a78bfa', border: '1px solid rgba(123,94,255,0.2)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ textAlign: 'center', padding: '40px 20px', background: 'linear-gradient(135deg,rgba(123,94,255,0.1),rgba(59,130,246,0.1))', borderRadius: 20, border: '1px solid rgba(123,94,255,0.2)' }}>
          <p style={{ fontSize: 13, color: '#7B5EFF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Vous venez de voir la puissance de PMO AI Studio</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', margin: '0 0 14px', letterSpacing: '-0.5px' }}>
            Créez votre projet en moins de 2 minutes
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: '0 0 32px' }}>
            Gantt · EVM · RAID · WBS · RACI · Ressources · IA intégrée — tout ça pour votre vrai projet.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/inscription" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg,#7B5EFF,#3b82f6)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(123,94,255,0.4)' }}>
              Commencer gratuitement →
            </Link>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>
              Voir les plans →
            </Link>
          </div>
          <p style={{ fontSize: 12, color: '#475569', marginTop: 16 }}>✓ Sans carte bancaire · ✓ Accès immédiat · ✓ Support inclus</p>
        </section>

      </div>
    </div>
  )
}
