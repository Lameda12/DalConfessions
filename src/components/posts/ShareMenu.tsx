import { useState } from 'react'
import { Link2, ImageDown, Check } from 'lucide-react'
import { Sheet } from '@/components/common/Sheet'
import { renderShareCard } from '@/lib/shareCard'
import type { Post } from '@/types'

export function ShareMenu({ post, onClose }: { post: Post; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [rendering, setRendering] = useState(false)

  const shareUrl = `${window.location.origin}/post/${post.id}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable — noop, link is still visible below
    }
  }

  const downloadCard = async () => {
    setRendering(true)
    try {
      const blob = await renderShareCard(post)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dalconfessions.png'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setRendering(false)
    }
  }

  return (
    <Sheet title="Share this whisper" onClose={onClose}>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-3 rounded-xl border border-hairline px-4 py-3.5 text-left text-sm font-semibold text-charcoal transition-colors hover:border-dal-amber hover:bg-dal-gold/10"
        >
          {copied ? <Check size={18} className="text-dal-amber" /> : <Link2 size={18} className="text-slate" />}
          {copied ? 'Link copied!' : 'Copy clean link'}
        </button>
        <button
          type="button"
          onClick={downloadCard}
          disabled={rendering}
          className="flex items-center gap-3 rounded-xl border border-hairline px-4 py-3.5 text-left text-sm font-semibold text-charcoal transition-colors hover:border-dal-amber hover:bg-dal-gold/10 disabled:opacity-60"
        >
          <ImageDown size={18} className="text-slate" />
          {rendering ? 'Rendering image…' : 'Download image card (Stories / WhatsApp)'}
        </button>
      </div>
    </Sheet>
  )
}
