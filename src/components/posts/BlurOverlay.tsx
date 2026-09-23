import { useState, type ReactNode } from 'react'
import { EyeOff, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlurOverlayProps {
  children: ReactNode
  variant: 'spoiler' | 'reported'
}

export function BlurOverlay({ children, variant }: BlurOverlayProps) {
  const [revealed, setRevealed] = useState(false)

  if (revealed) return <>{children}</>

  const isSpoiler = variant === 'spoiler'

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none select-none blur-md">
        {children}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setRevealed(true)
        }}
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl text-center',
          isSpoiler ? 'bg-charcoal/70' : 'bg-charcoal/80',
        )}
      >
        {isSpoiler ? (
          <EyeOff size={20} className="text-dal-gold" />
        ) : (
          <TriangleAlert size={20} className="text-dal-gold" />
        )}
        <span className="px-4 text-xs font-semibold leading-snug text-off-white">
          {isSpoiler
            ? 'Spoiler / trigger warning — tap to reveal'
            : 'Reported by multiple people — tap to view anyway'}
        </span>
      </button>
    </div>
  )
}
