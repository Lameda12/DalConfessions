import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CategorySlug } from '@/types'

export function useCategoryCounts() {
  return useQuery({
    queryKey: ['categoryCounts'],
    queryFn: async (): Promise<Record<CategorySlug, number>> => {
      const { data, error } = await supabase.from('category_counts').select('category, count')
      if (error) throw error

      const counts = {} as Record<CategorySlug, number>
      for (const row of data) counts[row.category as CategorySlug] = row.count
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
