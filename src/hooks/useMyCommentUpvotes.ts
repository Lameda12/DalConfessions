import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getDeviceToken } from '@/lib/deviceToken'

export function useMyCommentUpvotes(postId: string | undefined) {
  return useQuery({
    queryKey: ['myCommentUpvotes', postId],
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase
        .from('comment_reactions')
        .select('comment_id, comments!inner(post_id)')
        .eq('client_token', getDeviceToken())
        .eq('comments.post_id', postId)
      if (error) throw error
      return new Set(data.map((r) => r.comment_id as string))
    },
    enabled: Boolean(postId),
    staleTime: 60_000,
  })
}
