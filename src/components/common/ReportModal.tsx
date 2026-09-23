import { useState } from 'react'
import { Flag, Check } from 'lucide-react'
import { Sheet } from './Sheet'
import { REPORT_REASONS } from '@/data/categories'
import { useReport } from '@/hooks/useReport'
import type { ReportReason } from '@/types'

interface ReportModalProps {
  targetType: 'post' | 'comment'
  targetId: string
  postId?: string
  onClose: () => void
}

export function ReportModal({ targetType, targetId, postId, onClose }: ReportModalProps) {
  const report = useReport()
  const [submittedReason, setSubmittedReason] = useState<ReportReason | null>(null)

  const submit = (reason: ReportReason) => {
    setSubmittedReason(reason)
    report.mutate({ targetType, targetId, reason, postId })
  }

  if (submittedReason) {
    return (
      <Sheet title="Report received" onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dal-gold/15">
            <Check size={22} className="text-dal-amber" />
          </div>
          <p className="text-sm text-slate">
            Thanks for keeping Dal safe. We've logged this report — three or more and it auto-blurs until reviewed.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-bold text-off-white"
          >
            Done
          </button>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet title="Report this" onClose={onClose}>
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-charcoal/5 p-3 text-xs text-slate">
        <Flag size={14} className="shrink-0 text-dal-amber" />
        Reports are anonymous. Pick the reason that fits best.
      </div>
      <div className="flex flex-col gap-2">
        {REPORT_REASONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => submit(value)}
            className="rounded-xl border border-hairline px-4 py-3 text-left text-sm font-semibold text-charcoal transition-colors hover:border-dal-amber hover:bg-dal-gold/10"
          >
            {label}
          </button>
        ))}
      </div>
    </Sheet>
  )
}
