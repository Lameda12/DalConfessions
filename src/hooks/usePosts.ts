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

      if (tab === 'trending') {
        query = query.order('trending_score', { ascending: false })
      } else if (tab === 'latest') {
        query = query.order('created_at', { ascending: false })
      } else if (tab === 'top-week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte('created_at', weekAgo).order('net_score', { ascending: false })
      } else {
        query = query.order('net_score', { ascending: false })
      }

      const { data, error } = await query.limit(60)
      if (error) throw error
      return data as Post[]
    },
    staleTime: 30_000,
  })
}
