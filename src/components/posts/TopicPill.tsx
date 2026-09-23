import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { CategoryMeta } from '@/data/categories'

interface TopicPillProps {
  category: CategoryMeta
  active?: boolean
  count?: number
}

export function TopicPill({ category, active, count }: TopicPillProps) {
  return (
    <Link
      to={`/categories/${category.slug}`}
      className={cn(
        'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
        active
          ? 'border-dal-gold bg-dal-gold text-charcoal'
          : 'border-hairline bg-white text-slate hover:border-dal-gold/60 hover:text-charcoal',
      )}
    >
      <span>{category.emoji}</span>
      {category.label}
      {typeof count === 'number' && <span className="text-xs opacity-60">{count}</span>}
    </Link>
  )
}
