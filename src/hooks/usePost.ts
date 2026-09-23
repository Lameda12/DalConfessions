import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types'

export function usePost(postId: string | undefined) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async (): Promise<Post> => {
      const { data, error } = await supabase.from('posts_feed').select('*').eq('id', postId).single()
      if (error) throw error
      return data as Post
    },
    enabled: Boolean(postId),
    refetchInterval: 60_000,
  })
}
