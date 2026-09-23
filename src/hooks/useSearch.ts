import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types'

export function useSearch(query: string) {
  const trimmed = query.trim()

  return useQuery({
    queryKey: ['search', trimmed],
    queryFn: async (): Promise<Post[]> => {
      const { data, error } = await supabase.rpc('search_posts', { p_query: trimmed })
      if (error) throw error
      return data as Post[]
    },
    enabled: trimmed.length >= 2,
  })
}
