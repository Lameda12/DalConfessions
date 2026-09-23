import { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PostCard } from '@/components/posts/PostCard'

export function SearchPage() {
  usePageMeta(
    'Search — DalConfessions',
    'Search anonymous Dal confessions by keyword, location, or tag — Killam, Coburg, Sexton, and more.',
  )

  const [query, setQuery] = useState('')
  const { data: results, isFetching, isError } = useSearch(query)

  return (
    <div>
      <h1 className="mb-4 font-display text-xl font-extrabold text-fg">Search</h1>

      <div className="relative mb-5">
        <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-light" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword or tag — Killam, Coburg, Sexton…"
          className="w-full rounded-full border border-hairline bg-surface py-3 pl-11 pr-4 text-sm text-fg outline-none placeholder:text-slate-light focus:border-dal-gold"
        />
      </div>

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-sm text-slate-light">Keep typing — at least 2 characters.</p>
      )}

      {isFetching && <p className="text-sm text-slate-light">Searching…</p>}

      {isError && (
        <p className="rounded-2xl border border-hairline bg-surface p-6 text-center text-sm text-slate">
          Search is unavailable right now. Try again in a moment.
        </p>
      )}

      {!isFetching && !isError && query.trim().length >= 2 && results?.length === 0 && (
        <p className="rounded-2xl border border-dashed border-hairline p-8 text-center text-sm text-slate-light">
          No confessions match "{query.trim()}".
        </p>
      )}

      <div className="flex flex-col gap-3">
        {results?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
