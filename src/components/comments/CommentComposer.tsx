import { useState } from 'react'
import { useCreateComment } from '@/hooks/useCreateComment'
import { canPostNow } from '@/lib/deviceToken'
import type { Post } from '@/types'

interface CommentComposerProps {
  post: Post
  parentId?: string | null
  placeholder?: string
  autoFocus?: boolean
  onDone?: () => void
}

export function CommentComposer({ post, parentId, placeholder, autoFocus, onDone }: CommentComposerProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createComment = useCreateComment()

  const submit = async () => {
    if (!content.trim()) return
    const gate = canPostNow()
    if (!gate.allowed) {
      setError(`Slow down — try again in ${gate.retryInSeconds}s.`)
      return
    }

    await createComment.mutateAsync({ post, content, parentId })
    setContent('')
    setError(null)
    onDone?.()
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        autoFocus={autoFocus}
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, 500))}
        placeholder={placeholder ?? 'Add a comment...'}
        rows={2}
        className="w-full resize-none rounded-xl border border-hairline bg-off-white px-3.5 py-2.5 text-sm leading-relaxed text-charcoal outline-none placeholder:text-slate-light focus:border-dal-gold"
      />
      <div className="flex items-center justify-between">
        {error ? <span className="text-xs font-medium text-red-500">{error}</span> : <span />}
        <div className="flex items-center gap-2">
          {onDone && (
            <button type="button" onClick={onDone} className="text-xs font-semibold text-slate-light">
              Cancel
            </button>
          )}
          <button
            type="button"
            disabled={!content.trim() || createComment.isPending}
            onClick={submit}
            className="rounded-full bg-charcoal px-4 py-1.5 text-xs font-bold text-off-white disabled:opacity-40"
          >
            {createComment.isPending ? 'Posting…' : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}
