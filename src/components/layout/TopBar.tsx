import { NavLink } from 'react-router-dom'
import { PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCompose } from '@/context/ComposeContext'

const DESKTOP_NAV = [
  { to: '/', label: 'Feed', end: true },
  { to: '/categories', label: 'Categories', end: false },
  { to: '/search', label: 'Search', end: false },
]

export function TopBar() {
  const { openCompose } = useCompose()

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-off-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-charcoal font-display text-base font-extrabold text-dal-gold">
            D
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-charcoal">
            DalConfessions
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {DESKTOP_NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-charcoal text-dal-gold' : 'text-slate hover:bg-charcoal/5 hover:text-charcoal',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => openCompose()}
          className="hidden items-center gap-2 rounded-full bg-dal-gold px-4 py-2 text-sm font-bold text-charcoal shadow-sm transition-transform hover:brightness-95 active:scale-[0.97] md:flex"
        >
          <PenLine size={16} />
          Whisper something
        </button>
      </div>
    </header>
  )
}
