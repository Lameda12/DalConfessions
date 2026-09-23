import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/data/categories'
import type { CategorySlug } from '@/types'

export function useCategoryCounts() {
  return useQuery({
    queryKey: ['categoryCounts'],
    queryFn: async (): Promise<Record<CategorySlug, number>> => {
      const counts = {} as Record<CategorySlug, number>

      await Promise.all(
        CATEGORIES.map(async ({ slug }) => {
          const { count, error } = await supabase
            .from('posts')
            .select('id', { count: 'exact', head: true })
            .eq('category', slug)
          if (error) throw error
          counts[slug] = count ?? 0
        }),
      )

      return counts
    },
    staleTime: 60_000,
  })
}

export function useTrendingTopics(limit = 5) {
  return useQuery({
    queryKey: ['trendingTopics', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts_feed')
        .select('id, content, tag, category, trending_score')
        .order('trending_score', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data
    },
    staleTime: 60_000,
  })
}
