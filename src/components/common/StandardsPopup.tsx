import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'

const STORAGE_KEY = 'dalconfessions:standards-seen'

function hasSeenStandards(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY))
  } catch {
    return false
  }
}

export function StandardsPopup() {
  const [visible, setVisible] = useState(() => !hasSeenStandards())

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-charcoal/60 p-0 backdrop-blur-sm md:items-center md:p-4">
      <div className="w-full max-w-md animate-rise rounded-t-3xl bg-surface p-6 shadow-2xl md:rounded-3xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-dal-gold/15">
          <ShieldCheck size={24} className="text-dal-amber" />
        </div>
        <h2 className="font-display text-xl font-extrabold text-fg">Before you whisper&hellip;</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          DalConfessions is anonymous, but it's still Dal. Keep it human.
        </p>
        <ul className="mt-4 flex flex-col gap-2.5 text-sm text-fg">
          <li className="flex gap-2">
            <span>🚫</span> No names, no doxxing — not even initials or usernames.
          </li>
          <li className="flex gap-2">
            <span>🚫</span> No harassment, hate speech, or targeted callouts.
          </li>
          <li className="flex gap-2">
            <span>🚩</span> One tap reports anything that crosses the line.
          </li>
          <li className="flex gap-2">
            <span>⏳</span> Every confession vanishes 6 hours after it's posted. Once said, once forgotten.
          </li>
        </ul>
        <button
          type="button"
          onClick={dismiss}
          className="mt-6 w-full rounded-full bg-charcoal py-3.5 text-sm font-bold text-ink-fg transition-transform active:scale-[0.98]"
        >
          Got it, I'm in
        </button>
      </div>
    </div>
  )
}
