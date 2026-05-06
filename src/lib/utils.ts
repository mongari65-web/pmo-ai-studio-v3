import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric" })
}
export function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n)
}
