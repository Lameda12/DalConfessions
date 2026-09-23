import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePosts } from '@/hooks/usePosts'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PostCard } from '@/components/posts/PostCard'
import { TopicPills } from '@/components/posts/TopicPills'
import { FEED_TABS, CATEGORY_BY_SLUG } from '@/data/categories'
import { cn } from '@/lib/utils'
import type { CategorySlug, FeedTab } from '@/types'

export function FeedPage() {
  const { slug } = useParams<{ slug?: string }>()
  const category = slug as CategorySlug | undefined
  const [tab, setTab] = useState<FeedTab>('trending')

  const categoryMeta = category ? CATEGORY_BY_SLUG[category] : undefined

  usePageMeta(
    categoryMeta ? `${categoryMeta.label} — DalConfessions` : 'DalConfessions — Anonymous Dal Community',
    categoryMeta
      ? `Anonymous ${categoryMeta.label} confessions from Dalhousie students, gone 6 hours after they're posted.`
      : 'Anonymous confessions from Dalhousie students. Every post vanishes 6 hours after it goes up.',
  )

  const { data: posts, isLoading, isError } = usePosts({ tab, category })

  return (
    <div>
      {categoryMeta ? (
        <div className="mb-4 flex items-center gap-2">
          <Link to="/categories" className="text-slate-light hover:text-fg">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-display text-xl font-extrabold text-fg">
            {categoryMeta.emoji} {categoryMeta.label}
          </h1>
        </div>
      ) : (
        <div className="mb-4">
          <TopicPills />
        </div>
      )}

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-full border border-hairline bg-surface p-1">
        {FEED_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition-colors sm:text-sm',
              tab === t.id ? 'bg-charcoal text-dal-gold' : 'text-slate hover:text-fg',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-hairline/60 dark:bg-white/10" />
          ))}
        </div>
      )}

      {isError && (
        <p className="rounded-2xl border border-hairline bg-surface p-6 text-center text-sm text-slate">
          Couldn't load the feed. Check your Supabase connection and try again.
        </p>
      )}

      {!isLoading && !isError && posts?.length === 0 && (
        <p className="rounded-2xl border border-dashed border-hairline p-8 text-center text-sm text-slate-light">
          Nothing here yet. Be the first to whisper something.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
