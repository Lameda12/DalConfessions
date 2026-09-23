import { useState } from 'react'
import { ChevronUp, Flag, Reply } from 'lucide-react'
import { formatRelativeTime, cn } from '@/lib/utils'
import { BlurOverlay } from '@/components/posts/BlurOverlay'
import { ReportModal } from '@/components/common/ReportModal'
import { CommentComposer } from './CommentComposer'
import { useToggleCommentUpvote } from '@/hooks/useToggleCommentUpvote'
import { useMyCommentUpvotes } from '@/hooks/useMyCommentUpvotes'
import type { Comment, Post } from '@/types'

interface CommentNode extends Comment {
  children: CommentNode[]
}

interface CommentItemProps {
  comment: CommentNode
  post: Post
  depth?: number
}

export function CommentItem({ comment, post, depth = 0 }: CommentItemProps) {
  const [replying, setReplying] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const { data: myUpvotes } = useMyCommentUpvotes(post.id)
  const toggleUpvote = useToggleCommentUpvote()

  const upvoted = myUpvotes?.has(comment.id) ?? false
  const isReported = comment.report_count >= 3
  const isOP = comment.pseudonym === 'OP'

  const body = <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">{comment.content}</p>

  return (
    <div className={cn(depth > 0 && 'ml-4 border-l-2 border-hairline pl-3.5 sm:ml-6')}>
      <div className="py-2.5">
        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className={cn('font-bold', isOP ? 'text-dal-amber' : 'text-fg')}>{comment.pseudonym}</span>
          <span className="text-slate-light">· {formatRelativeTime(comment.created_at)}</span>
        </div>

        {isReported ? <BlurOverlay variant="reported">{body}</BlurOverlay> : body}

        <div className="mt-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggleUpvote.mutate({ commentId: comment.id, postId: post.id })}
            className={cn(
              'flex items-center gap-1 text-xs font-semibold transition-colors',
              upvoted ? 'text-dal-amber' : 'text-slate-light hover:text-fg',
            )}
          >
            <ChevronUp size={15} className={upvoted ? 'animate-pop' : undefined} />
            {comment.upvotes > 0 ? comment.upvotes : 'Upvote'}
          </button>
          <button
            type="button"
            onClick={() => setReplying((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-light hover:text-fg"
          >
            <Reply size={14} /> Reply
          </button>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-light hover:text-red-500"
          >
            <Flag size={13} />
          </button>
        </div>

        {replying && (
          <div className="mt-2.5">
            <CommentComposer
              post={post}
              parentId={comment.id}
              autoFocus
              placeholder={`Reply to ${comment.pseudonym}...`}
              onDone={() => setReplying(false)}
            />
          </div>
        )}
      </div>

      {comment.children.length > 0 && (
        <div className="flex flex-col">
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} post={post} depth={depth + 1} />
          ))}
        </div>
      )}

      {reportOpen && (
        <ReportModal
          targetType="comment"
          targetId={comment.id}
          postId={post.id}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  )
}
