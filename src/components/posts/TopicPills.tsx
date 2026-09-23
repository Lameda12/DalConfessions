import { CATEGORIES } from '@/data/categories'
import { TopicPill } from './TopicPill'

export function TopicPills() {
  return (
    <div className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
      {CATEGORIES.map((category) => (
        <TopicPill key={category.slug} category={category} />
      ))}
    </div>
  )
}
