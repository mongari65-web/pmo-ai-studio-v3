export type TokenMap = Record<string, string>

// Dictionnaire de termes métier sensibles à maintenir manuellement.
// Ajoute ici tes clients, codes projets récurrents, noms d'organismes, etc.
const SENSITIVE_TERMS: string[] = [
  "CNAM",
  "ANFSI",
  "FR.CNAME2.PRJ.DR",
  "CEA Saclay",
  "ORANO",
  "FRAMATOME",
  "Atos",
  // ... complète au fil de l'eau
]

const REGEX_PATTERNS: { type: string; pattern: RegExp }[] = [
  { type: "EMAIL", pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { type: "TEL", pattern: /(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}/g },
  { type: "IBAN", pattern: /\b[A-Z]{2}\d{2}[\s]?[A-Z0-9]{4}[\s]?\d{4,}[\s]?[A-Z0-9]*\b/g },
  { type: "SIRET", pattern: /\b\d{3}[\s]?\d{3}[\s]?\d{3}[\s]?\d{5}\b/g },
]

export function anonymize(text: string): { anonymized: string; tokenMap: TokenMap } {
  if (!text) return { anonymized: text, tokenMap: {} }

  let result = text
  const tokenMap: TokenMap = {}
  const counter: Record<string, number> = {}

  // 1. Termes métier (dictionnaire), insensible à la casse
  for (const term of SENSITIVE_TERMS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`\\b${escaped}\\b`, "gi")
    if (regex.test(result)) {
      counter.TERM = (counter.TERM || 0) + 1
      const token = `[TERME_${counter.TERM}]`
      tokenMap[token] = term
      result = result.replace(regex, token)
    }
  }

  // 2. Patterns génériques (email, tel, IBAN, SIRET)
  for (const { type, pattern } of REGEX_PATTERNS) {
    result = result.replace(pattern, (match) => {
      counter[type] = (counter[type] || 0) + 1
      const token = `[${type}_${counter[type]}]`
      tokenMap[token] = match
      return token
    })
  }

  return { anonymized: result, tokenMap }
}

export function deanonymize(text: string, tokenMap: TokenMap): string {
  if (!text) return text
  let result = text
  for (const [token, original] of Object.entries(tokenMap)) {
    result = result.split(token).join(original)
  }
  return result
}

// Fusionne plusieurs tokenMaps (utile quand on anonymise plusieurs champs séparément)
export function mergeTokenMaps(...maps: TokenMap[]): TokenMap {
  return Object.assign({}, ...maps)
}
