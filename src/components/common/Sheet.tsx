import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface SheetProps {
  title: string
  onClose: () => void
  children: ReactNode
  maxWidth?: string
}

export function Sheet({ title, onClose, children, maxWidth = 'max-w-md' }: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-charcoal/60 backdrop-blur-sm md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} animate-rise rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-charcoal">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate transition-colors hover:bg-charcoal/5"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
