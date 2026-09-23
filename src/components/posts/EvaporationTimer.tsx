import { useEffect, useState } from 'react'
import { Hourglass } from 'lucide-react'
import { formatTimeRemaining, cn } from '@/lib/utils'

export function EvaporationTimer({ createdAt }: { createdAt: string }) {
  const [, forceTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const { text, urgent } = formatTimeRemaining(createdAt)

  return (
    <span
      title="Confessions evaporate 6 hours after they're posted"
      className={cn(
        'flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold',
        urgent ? 'text-red-500' : 'text-slate-light',
      )}
    >
      <Hourglass size={11} />
      vanishes in {text}
    </span>
  )
}
