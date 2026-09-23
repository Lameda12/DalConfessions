import { Link } from 'react-router-dom'
import { useCategoryCounts } from '@/hooks/useCategoryCounts'
import { usePageMeta } from '@/hooks/usePageMeta'
import { CATEGORIES } from '@/data/categories'

export function CategoriesPage() {
  usePageMeta(
    'Categories — DalConfessions',
    'Browse every DalConfessions topic: Campus Stories, Crushes, Killam Rants, and more.',
  )

  const { data: counts, isLoading } = useCategoryCounts()

  return (
    <div>
      <h1 className="mb-4 font-display text-xl font-extrabold text-fg">Categories</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to={`/categories/${c.slug}`}
            className="flex items-center justify-between rounded-2xl border border-hairline bg-surface p-4 transition-colors hover:border-dal-gold/60"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-dal-gold/15 text-xl">
                {c.emoji}
              </span>
              <span className="font-semibold text-fg">{c.label}</span>
            </div>
            <span className="text-sm font-bold text-slate-light tabular-nums">
              {isLoading ? '…' : (counts?.[c.slug] ?? 0)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
