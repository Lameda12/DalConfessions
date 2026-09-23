import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePost } from '@/hooks/usePost'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PostCard } from '@/components/posts/PostCard'
import { CommentThread } from '@/components/comments/CommentThread'
import { CATEGORY_BY_SLUG } from '@/data/categories'

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: post, isLoading, isError } = usePost(id)

  usePageMeta(
    post ? `${post.content.slice(0, 60)}… — DalConfessions` : 'DalConfessions',
    post ? `${CATEGORY_BY_SLUG[post.category].label}: ${post.content.slice(0, 140)}` : undefined,
  )

  return (
    <div>
      <Link to="/" className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate hover:text-charcoal">
        <ArrowLeft size={16} /> Back to feed
      </Link>

      {isLoading && <div className="h-40 animate-pulse rounded-2xl bg-hairline/60" />}

      {isError && (
        <p className="rounded-2xl border border-hairline bg-white p-6 text-center text-sm text-slate">
          This confession couldn't be found. It may have been removed.
        </p>
      )}

      {post && (
        <>
          <PostCard post={post} detail />
          <CommentThread post={post} />
        </>
      )}
    </div>
  )
}
