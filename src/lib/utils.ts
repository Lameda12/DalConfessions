import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** Every confession evaporates this many hours after it's posted. */
export const EVAPORATION_HOURS = 6

export function getExpiryDate(createdAtIso: string): Date {
  return new Date(new Date(createdAtIso).getTime() + EVAPORATION_HOURS * 60 * 60 * 1000)
}

export function formatTimeRemaining(createdAtIso: string): { text: string; urgent: boolean; gone: boolean } {
  const remainingMs = getExpiryDate(createdAtIso).getTime() - Date.now()

  if (remainingMs <= 0) return { text: 'gone', urgent: true, gone: true }

  const totalMin = Math.max(1, Math.ceil(remainingMs / 60_000))
  const hours = Math.floor(totalMin / 60)
  const minutes = totalMin % 60
  const text = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  return { text, urgent: remainingMs < 60 * 60 * 1000, gone: false }
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.round(diffMs / 1000)

  if (diffSec < 60) return 'just now'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  const diffWeek = Math.round(diffDay / 7)
  if (diffWeek < 5) return `${diffWeek}w ago`
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}
