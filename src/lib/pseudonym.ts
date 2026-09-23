import type { Comment } from '@/types'

// Flavoured, Dal-themed anon handles. Handed out in order of first
// appearance within a thread so the same commenter keeps the same
// pseudonym for that thread (but nowhere else — still fully anonymous).
const NICKNAME_POOL = [
  'Tiger #1',
  'Tiger #2',
  'Seaside Anon',
  'Killam Anon',
  'Studley Anon',
  'Grawood Anon',
  'Coburg Anon',
  'Sexton Anon',
  'Quad Anon',
  'Shuttle Anon',
  'Agricola Anon',
  'LSC Anon',
]

export function computePseudonym(
  existingComments: Comment[],
  postAuthorToken: string,
  clientToken: string,
): string {
  if (clientToken === postAuthorToken) return 'OP'

  const sorted = [...existingComments].sort((a, b) => a.created_at.localeCompare(b.created_at))
  const firstSeenOrder: string[] = []
  const pseudonymByToken = new Map<string, string>()

  for (const c of sorted) {
    if (c.client_token === postAuthorToken) continue
    if (!pseudonymByToken.has(c.client_token)) {
      pseudonymByToken.set(c.client_token, c.pseudonym)
      firstSeenOrder.push(c.client_token)
    }
  }

  const existing = pseudonymByToken.get(clientToken)
  if (existing) return existing

  const index = firstSeenOrder.length
  const cycle = Math.floor(index / NICKNAME_POOL.length) + 1
  const base = NICKNAME_POOL[index % NICKNAME_POOL.length]
  return cycle === 1 ? base : `${base} (${cycle})`
}
