import { Feather } from 'lucide-react'
import { useCompose } from '@/context/ComposeContext'

export function ComposeFab() {
  const { openCompose } = useCompose()

  return (
    <button
      type="button"
      onClick={() => openCompose()}
      className="fixed inset-x-4 bottom-[76px] z-30 flex items-center gap-2 rounded-full bg-charcoal px-5 py-3.5 text-sm font-semibold text-off-white shadow-[0_10px_30px_-8px_rgba(28,28,30,0.55)] transition-transform active:scale-[0.97] md:hidden"
    >
      <Feather size={18} className="text-dal-gold" />
      <span className="flex-1 text-left text-slate-light">Whisper something to Dal&hellip;</span>
    </button>
  )
}
