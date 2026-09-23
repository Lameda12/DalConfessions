import { NavLink } from 'react-router-dom'
import { Home, Grid2x2, Search, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCompose } from '@/context/ComposeContext'

const NAV_ITEMS = [
  { to: '/', label: 'Feed', icon: Home, end: true },
  { to: '/categories', label: 'Categories', icon: Grid2x2, end: false },
  { to: '/search', label: 'Search', icon: Search, end: false },
]

export function BottomNav() {
  const { openCompose } = useCompose()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-off-white/95 backdrop-blur safe-bottom md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-dal-amber' : 'text-slate',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => openCompose()}
          className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-slate transition-colors active:text-dal-amber"
        >
          <PenLine size={22} strokeWidth={2} />
          Compose
        </button>
      </div>
    </nav>
  )
}
