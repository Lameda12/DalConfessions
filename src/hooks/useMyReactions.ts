import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getDeviceToken } from '@/lib/deviceToken'
import type { ReactionKind } from '@/types'

/** Which of the current device's reactions are active on this post. */
export function useMyReactions(postId: string | undefined) {
  return useQuery({
    queryKey: ['myReactions', postId],
    queryFn: async (): Promise<Set<ReactionKind>> => {
      const { data, error } = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('post_id', postId)
        .eq('client_token', getDeviceToken())
      if (error) throw error
      return new Set(data.map((r) => r.reaction_type as ReactionKind))
    },
    enabled: Boolean(postId),
    staleTime: 60_000,
  })
}
