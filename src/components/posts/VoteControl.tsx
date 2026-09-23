import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMyReactions } from '@/hooks/useMyReactions'
import { useToggleReaction } from '@/hooks/useToggleReaction'
import type { Post } from '@/types'

interface VoteControlProps {
  post: Post
  orientation?: 'horizontal' | 'vertical'
}

export function VoteControl({ post, orientation = 'horizontal' }: VoteControlProps) {
  const { data: mine } = useMyReactions(post.id)
  const toggle = useToggleReaction()

  const upvoted = mine?.has('upvote') ?? false
  const downvoted = mine?.has('downvote') ?? false
  const net = post.upvotes - post.downvotes

  const vote = (kind: 'upvote' | 'downvote') => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle.mutate({ postId: post.id, reaction: kind })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full border border-hairline bg-off-white p-1',
        orientation === 'vertical' && 'flex-col',
      )}
    >
      <button
        type="button"
        onClick={vote('upvote')}
        aria-label="Upvote"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
          upvoted ? 'bg-dal-gold text-charcoal' : 'text-slate hover:bg-charcoal/5',
        )}
      >
        <ChevronUp size={18} className={upvoted ? 'animate-pop' : undefined} />
      </button>
      <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums text-charcoal">{net}</span>
      <button
        type="button"
        onClick={vote('downvote')}
        aria-label="Downvote"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
          downvoted ? 'bg-slate text-off-white' : 'text-slate hover:bg-charcoal/5',
        )}
      >
        <ChevronDown size={18} className={downvoted ? 'animate-pop' : undefined} />
      </button>
    </div>
  )
}
