import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CategorySlug, FeedTab, Post } from '@/types'

interface UsePostsOptions {
  tab: FeedTab
  category?: CategorySlug
}

export function usePosts({ tab, category }: UsePostsOptions) {
  return useQuery({
    queryKey: ['posts', tab, category ?? null],
    queryFn: async (): Promise<Post[]> => {
      let query = supabase.from('posts_feed').select('*')

      if (category) query = query.eq('category', category)

      query =
        tab === 'trending'
          ? query.order('trending_score', { ascending: false })
          : query.order('created_at', { ascending: false })

      const { data, error } = await query.limit(60)
      if (error) throw error
      return data as Post[]
    },
    staleTime: 30_000,
    // Confessions evaporate after 6 hours — keep the feed honest without
    // requiring a manual refresh.
    refetchInterval: 60_000,
  })
}
