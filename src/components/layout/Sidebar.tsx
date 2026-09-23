import { Link } from 'react-router-dom'
import { Flame, ShieldCheck } from 'lucide-react'
import { useTrendingTopics } from '@/hooks/useCategoryCounts'
import { CATEGORY_BY_SLUG } from '@/data/categories'

const RULES = [
  'No names. No doxxing. Not even initials.',
  'No harassment or targeted callouts.',
  'Keep it Dal-relevant, keep it kind-ish.',
  'Report anything that crosses the line.',
]

export function Sidebar() {
  const { data: trending } = useTrendingTopics(5)

  return (
    <aside className="sticky top-[73px] hidden h-fit w-[320px] shrink-0 flex-col gap-4 lg:flex">
      <div className="rounded-2xl border border-hairline bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Flame size={18} className="text-dal-amber" />
          <h2 className="font-display text-sm font-bold text-charcoal">Trending right now</h2>
        </div>
        <ul className="flex flex-col gap-3">
          {trending?.map((post) => (
            <li key={post.id}>
              <Link
                to={`/post/${post.id}`}
                className="block text-sm leading-snug text-slate transition-colors hover:text-charcoal"
              >
                <span className="mr-1.5">{CATEGORY_BY_SLUG[post.category as keyof typeof CATEGORY_BY_SLUG]?.emoji}</span>
                {post.content.length > 90 ? `${post.content.slice(0, 90)}…` : post.content}
              </Link>
            </li>
          ))}
          {!trending?.length && <li className="text-sm text-slate-light">Nothing trending yet.</li>}
        </ul>
      </div>

      <div className="rounded-2xl border border-hairline bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck size={18} className="text-dal-amber" />
          <h2 className="font-display text-sm font-bold text-charcoal">Campus rules</h2>
        </div>
        <ul className="flex flex-col gap-2.5">
          {RULES.map((rule) => (
            <li key={rule} className="text-sm leading-snug text-slate">
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
