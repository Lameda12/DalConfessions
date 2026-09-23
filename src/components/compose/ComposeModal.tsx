import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TriangleAlert, EyeOff, Hourglass } from 'lucide-react'
import { Sheet } from '@/components/common/Sheet'
import { useCompose } from '@/context/ComposeContext'
import { useCreatePost } from '@/hooks/useCreatePost'
import { checkModeration } from '@/lib/moderation'
import { canPostNow } from '@/lib/deviceToken'
import { CATEGORIES } from '@/data/categories'
import { cn } from '@/lib/utils'
import type { CategorySlug } from '@/types'

const MAX_LENGTH = 500

export function ComposeModal() {
  const { isOpen, defaultCategory, closeCompose } = useCompose()
  const navigate = useNavigate()
  const createPost = useCreatePost()

  const [content, setContent] = useState('')
  const [category, setCategory] = useState<CategorySlug>(defaultCategory ?? 'campus-stories')
  const [tag, setTag] = useState('')
  const [spoiler, setSpoiler] = useState(false)
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory ?? 'campus-stories')
      setRateLimitMsg(null)
    }
  }, [isOpen, defaultCategory])

  if (!isOpen) return null

  const remaining = MAX_LENGTH - content.length
  const flag = checkModeration(content)
  const canSubmit = content.trim().length > 0 && remaining >= 0 && !createPost.isPending

  const handleClose = () => {
    setContent('')
    setTag('')
    setSpoiler(false)
    closeCompose()
  }

  const handleSubmit = async () => {
    const gate = canPostNow()
    if (!gate.allowed) {
      setRateLimitMsg(`You're posting a lot — try again in ${gate.retryInSeconds}s.`)
      return
    }

    const post = await createPost.mutateAsync({ content, category, tag, spoiler })
    handleClose()
    navigate(`/post/${post.id}`)
  }

  return (
    <Sheet title="Whisper something to Dal" onClose={handleClose} maxWidth="max-w-lg">
      <p className="-mt-2 mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-light">
        <Hourglass size={12} className="text-dal-amber" />
        Vanishes in 6 hours. Say it, then let it go.
      </p>
      <textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? Nobody will know it's you..."
        rows={5}
        className="w-full resize-none rounded-2xl border border-hairline bg-off-white p-4 text-[15px] leading-relaxed text-fg outline-none placeholder:text-slate-light focus:border-dal-gold"
      />

      <div className="mt-1 flex items-center justify-between">
        <div className="min-h-[1.25rem]">
          {flag && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-dal-amber">
              <TriangleAlert size={13} />
              {flag.message}
            </p>
          )}
        </div>
        <span className={cn('text-xs font-semibold tabular-nums', remaining < 0 ? 'text-red-500' : 'text-slate-light')}>
          {remaining}
        </span>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-light">Topic</label>
        <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors',
                category === c.slug
                  ? 'border-dal-gold bg-dal-gold text-charcoal'
                  : 'border-hairline text-slate hover:border-dal-gold/50',
              )}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-light">
          Tag (optional)
        </label>
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value.slice(0, 30))}
          placeholder="e.g. Killam, Coburg, Sexton"
          className="w-full rounded-xl border border-hairline bg-off-white px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-slate-light focus:border-dal-gold"
        />
      </div>

      <button
        type="button"
        onClick={() => setSpoiler((v) => !v)}
        className={cn(
          'mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
          spoiler ? 'border-dal-amber bg-dal-gold/10 text-dal-amber' : 'border-hairline text-slate',
        )}
      >
        <span className="flex items-center gap-2">
          <EyeOff size={16} />
          Spoiler / trigger warning
        </span>
        <span
          className={cn(
            'flex h-5 w-9 items-center rounded-full p-0.5 transition-colors',
            spoiler ? 'justify-end bg-dal-amber' : 'justify-start bg-hairline',
          )}
        >
          <span className="h-4 w-4 rounded-full bg-white shadow" />
        </span>
      </button>

      {rateLimitMsg && <p className="mt-3 text-xs font-medium text-red-500">{rateLimitMsg}</p>}
      {createPost.isError && (
        <p className="mt-3 text-xs font-medium text-red-500">Something went wrong posting that. Try again.</p>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="mt-5 w-full rounded-full bg-charcoal py-3.5 text-sm font-bold text-ink-fg transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {createPost.isPending ? 'Posting…' : 'Post anonymously'}
      </button>
    </Sheet>
  )
}
