import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Comment } from '@/types'

export function useComments(postId: string | undefined) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Comment[]
    },
    enabled: Boolean(postId),
  })
}
