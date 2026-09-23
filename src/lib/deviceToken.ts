const STORAGE_KEY = 'dalconfessions:device-token'
const RATE_LIMIT_KEY = 'dalconfessions:recent-posts'
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_POSTS = 3

function randomToken(): string {
  if ('randomUUID' in crypto) return crypto.randomUUID().replace(/-/g, '')
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

export function getDeviceToken(): string {
  try {
    let token = localStorage.getItem(STORAGE_KEY)
    if (!token) {
      token = randomToken()
      localStorage.setItem(STORAGE_KEY, token)
    }
    return token
  } catch {
    return randomToken()
  }
}

/** Soft client-side rate limit so one device can't rapid-fire posts. */
export function canPostNow(): { allowed: boolean; retryInSeconds?: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY)
    const timestamps: number[] = raw ? JSON.parse(raw) : []
    const now = Date.now()
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

    if (recent.length >= RATE_LIMIT_MAX_POSTS) {
      const retryInSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - recent[0])) / 1000)
      return { allowed: false, retryInSeconds }
    }
    return { allowed: true }
  } catch {
    return { allowed: true }
  }
}

export function recordPost(): void {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY)
    const timestamps: number[] = raw ? JSON.parse(raw) : []
    const now = Date.now()
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    recent.push(now)
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent))
  } catch {
    // localStorage unavailable (private mode) — fail open, server has no hard limit either.
  }
}
