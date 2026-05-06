
// lib/exportAll.ts — Exports universels : Excel, PDF, Word, PPTX, Notion, Gmail, Drive

// ── EXCEL ─────────────────────────────────────────────────────────
export function exportExcel(rows: Record<string, any>[], filename: string, sheetName = "Export") {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csvRows = [
    headers.join("\t"),
    ...rows.map(r => headers.map(h => {
      const v = r[h] ?? ""
      return String(v).includes("\t") ? `"${v}"` : String(v)
    }).join("\t"))
  ]
  const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "application/vnd.ms-excel;charset=utf-8" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `${filename}.xls`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ── PDF (via impression navigateur) ──────────────────────────────
export function exportPDF(elementId: string, title: string, projectName = "") {
  const el = document.getElementById(elementId)
  if (!el) return
  const w = window.open("", "_blank")!
  w.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Inter', Arial, sans-serif; padding: 32px; color: #1e293b; background: #fff; }
      h1 { font-size: 20px; font-weight: 700; color: #1e40af; margin-bottom: 4px; }
      .subtitle { font-size: 12px; color: #64748b; margin-bottom: 24px; }
      table { border-collapse: collapse; width: 100%; margin-top: 16px; }
      th { background: #1e40af; color: white; padding: 8px 12px; font-size: 11px; text-align: left; font-weight: 600; }
      td { border: 1px solid #e2e8f0; padding: 7px 12px; font-size: 11px; }
      tr:nth-child(even) { background: #f8fafc; }
      .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #1e40af; }
      .logo { font-size: 14px; font-weight: 700; color: #1e40af; }
      .date { font-size: 11px; color: #94a3b8; }
      @media print { body { padding: 16px; } }
    </style>
  </head><body>
    <div class="header">
      <div class="logo">PMO AI Studio</div>
      <div class="date">${new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })}</div>
    </div>
    <h1>${title}</h1>
    <div class="subtitle">${projectName}</div>
    ${el.innerHTML}
  </body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => { w.print() }, 600)
}

// ── WORD (.docx via HTML blob) ─────────────────────────────────
export function exportWord(content: string, filename: string, title: string) {
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
      <style>
        body { font-family: Calibri, Arial; font-size: 11pt; color: #1e293b; }
        h1 { font-size: 16pt; color: #1e40af; font-weight: bold; margin-bottom: 6pt; }
        h2 { font-size: 13pt; color: #2563eb; font-weight: bold; margin-top: 12pt; }
        table { border-collapse: collapse; width: 100%; margin-top: 8pt; }
        th { background: #1e40af; color: white; padding: 6pt; font-size: 10pt; font-weight: bold; }
        td { border: 1px solid #cbd5e1; padding: 5pt; font-size: 10pt; }
        tr:nth-child(even) { background: #f8fafc; }
        .header { border-bottom: 2pt solid #1e40af; padding-bottom: 8pt; margin-bottom: 16pt; }
        .meta { font-size: 9pt; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>PMO AI Studio — ${title}</h1>
        <p class="meta">Généré le ${new Date().toLocaleDateString("fr-FR")} | ${filename}</p>
      </div>
      ${content}
    </body>
    </html>`
  const blob = new Blob(["\uFEFF" + html], {
    type: "application/msword;charset=utf-8"
  })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `${filename}.doc`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ── PPTX (via API route) ──────────────────────────────────────
export async function exportPPTX(
  title: string,
  slides: Array<{ title: string; content: string[] }>,
  filename: string
) {
  try {
    const res = await fetch("/api/export/pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slides, filename })
    })
    if (!res.ok) throw new Error("PPTX export failed")
    const blob = await res.blob()
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${filename}.pptx`
    a.click()
    URL.revokeObjectURL(a.href)
  } catch (e: any) {
    console.error("PPTX export:", e)
    alert("Export PPTX : " + e.message)
  }
}

// ── GMAIL ─────────────────────────────────────────────────────
export function exportGmail(subject: string, body: string) {
  const url = `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(url, "_blank")
}

// ── GOOGLE DRIVE ──────────────────────────────────────────────
export async function exportDrive(content: string, filename: string, mimeType = "text/plain") {
  try {
    const res = await fetch("/api/export/drive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, filename, mimeType })
    })
    const data = await res.json()
    if (data.url) window.open(data.url, "_blank")
    else alert("Drive: " + (data.message ?? "Erreur inconnue"))
  } catch (e: any) {
    alert("Export Drive : configurez /api/export/drive avec le MCP Google Drive")
  }
}

// ── NOTION ────────────────────────────────────────────────────
export async function exportNotion(title: string, content: string) {
  try {
    const res = await fetch("/api/export/notion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content })
    })
    const data = await res.json()
    if (data.url) window.open(data.url, "_blank")
    else alert("Notion: " + (data.message ?? "Erreur inconnue"))
  } catch (e: any) {
    alert("Export Notion : configurez /api/export/notion avec le MCP Notion")
  }
}

// ── CSV ───────────────────────────────────────────────────────
export function exportCSV(rows: Record<string, any>[], filename: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(";"),
    ...rows.map(r => headers.map(h => {
      const v = String(r[h] ?? "")
      return v.includes(";") || v.includes('"') || v.includes("\n")
        ? `"${v.replace(/"/g, '""')}"` : v
    }).join(";"))
  ].join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ── JSON ──────────────────────────────────────────────────────
export function exportJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `${filename}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ── PNG (canvas/SVG screenshot) ───────────────────────────────
export function exportSVGasPNG(svgElement: SVGElement, filename: string) {
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  const img = new Image()
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(svgBlob)
  img.onload = () => {
    canvas.width = img.width || 1000
    canvas.height = img.height || 700
    ctx.fillStyle = "#0a0f1a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    const a = document.createElement("a")
    a.href = canvas.toDataURL("image/png")
    a.download = `${filename}.png`
    a.click()
    URL.revokeObjectURL(url)
  }
  img.src = url
}

// ── Helper : rows depuis tableau générique ────────────────────
export function tableToRows(items: any[]): Record<string, any>[] {
  if (!items.length) return []
  return items.map(item => {
    const row: Record<string, any> = {}
    Object.entries(item).forEach(([k, v]) => {
      if (k !== "id") row[k] = v
    })
    return row
  })
}
