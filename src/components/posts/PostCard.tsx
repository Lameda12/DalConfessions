import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, MoreHorizontal, Flag, Share2 } from 'lucide-react'
import { CATEGORY_BY_SLUG } from '@/data/categories'
import { formatRelativeTime, cn } from '@/lib/utils'
import { VoteControl } from './VoteControl'
import { ReactionBar } from './ReactionBar'
import { BlurOverlay } from './BlurOverlay'
import { ShareMenu } from './ShareMenu'
import { ReportModal } from '@/components/common/ReportModal'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  commentCount?: number
  detail?: boolean
}

export function PostCard({ post, commentCount, detail = false }: PostCardProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const category = CATEGORY_BY_SLUG[post.category]
  const isReported = post.report_count >= 3

  const goToPost = () => {
    if (!detail) navigate(`/post/${post.id}`)
  }

  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    fn()
  }

  const content = <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-charcoal">{post.content}</p>

  return (
    <article
      onClick={goToPost}
      className={cn(
        'rounded-2xl border border-hairline bg-white p-4 transition-colors',
        !detail && 'cursor-pointer hover:border-dal-gold/60',
      )}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 rounded-full bg-charcoal/5 px-2.5 py-1 font-semibold text-charcoal">
            {category.emoji} {category.label}
          </span>
          {post.tag && <span className="text-slate-light">#{post.tag}</span>}
          <span className="text-slate-light">· {formatRelativeTime(post.created_at)}</span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={stop(() => setMenuOpen((v) => !v))}
            aria-label="More options"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-light transition-colors hover:bg-charcoal/5"
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={stop(() => setMenuOpen(false))} />
              <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-hairline bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={stop(() => {
                    setMenuOpen(false)
                    setShareOpen(true)
                  })}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-charcoal hover:bg-charcoal/5"
                >
                  <Share2 size={15} /> Share
                </button>
                <button
                  type="button"
                  onClick={stop(() => {
                    setMenuOpen(false)
                    setReportOpen(true)
                  })}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  <Flag size={15} /> Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {post.spoiler ? (
        <BlurOverlay variant="spoiler">{content}</BlurOverlay>
      ) : isReported ? (
        <BlurOverlay variant="reported">{content}</BlurOverlay>
      ) : (
        content
      )}

      <div className="mt-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VoteControl post={post} />
          <ReactionBar post={post} />
        </div>

        {!detail && (
          <div className="flex items-center gap-1 text-slate-light">
            <MessageCircle size={16} />
            <span className="text-xs font-semibold">{commentCount ?? ''}</span>
          </div>
        )}
      </div>

      {shareOpen && <ShareMenu post={post} onClose={() => setShareOpen(false)} />}
      {reportOpen && (
        <ReportModal targetType="post" targetId={post.id} onClose={() => setReportOpen(false)} />
      )}
    </article>
  )
}
