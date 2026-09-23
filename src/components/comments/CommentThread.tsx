import { useMemo } from 'react'
import { useComments } from '@/hooks/useComments'
import { CommentComposer } from './CommentComposer'
import { CommentItem } from './CommentItem'
import type { Comment, Post } from '@/types'

interface CommentNode extends Comment {
  children: CommentNode[]
}

function buildTree(comments: Comment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>()
  const roots: CommentNode[] = []

  for (const c of comments) nodes.set(c.id, { ...c, children: [] })

  for (const c of comments) {
    const node = nodes.get(c.id)!
    if (c.parent_id && nodes.has(c.parent_id)) {
      nodes.get(c.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export function CommentThread({ post }: { post: Post }) {
  const { data: comments, isLoading } = useComments(post.id)
  const tree = useMemo(() => buildTree(comments ?? []), [comments])

  return (
    <div className="mt-5">
      <h2 className="mb-3 font-display text-sm font-bold text-fg">
        Comments {comments?.length ? `(${comments.length})` : ''}
      </h2>

      <div className="mb-4 rounded-2xl border border-hairline bg-surface p-3.5">
        <CommentComposer post={post} placeholder="Say something... you're anonymous here." />
      </div>

      {isLoading && <p className="text-sm text-slate-light">Loading comments…</p>}

      {!isLoading && tree.length === 0 && (
        <p className="rounded-2xl border border-dashed border-hairline p-6 text-center text-sm text-slate-light">
          No comments yet. Be the first anon to weigh in.
        </p>
      )}

      <div className="flex flex-col divide-y divide-hairline rounded-2xl border border-hairline bg-surface px-3.5">
        {tree.map((node) => (
          <CommentItem key={node.id} comment={node} post={post} />
        ))}
      </div>
    </div>
  )
}
