import { CAMPUS_REACTIONS } from '@/data/categories'
import { cn } from '@/lib/utils'
import { useMyReactions } from '@/hooks/useMyReactions'
import { useToggleReaction } from '@/hooks/useToggleReaction'
import type { Post } from '@/types'

export function ReactionBar({ post }: { post: Post }) {
  const { data: mine } = useMyReactions(post.id)
  const toggle = useToggleReaction()

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {CAMPUS_REACTIONS.map(({ type, emoji, label }) => {
        const active = mine?.has(type) ?? false
        const count = post.reaction_counts?.[type] ?? 0

        return (
          <button
            key={type}
            type="button"
            title={label}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggle.mutate({ postId: post.id, reaction: type })
            }}
            className={cn(
              'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
              active
                ? 'border-dal-amber bg-dal-gold/20 text-dal-amber'
                : 'border-hairline bg-surface text-slate hover:border-dal-gold/50',
            )}
          >
            <span className={active ? 'animate-pop' : undefined}>{emoji}</span>
            {count > 0 && <span className="tabular-nums">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
