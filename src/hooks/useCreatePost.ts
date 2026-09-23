import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getDeviceToken, recordPost } from '@/lib/deviceToken'
import type { CategorySlug } from '@/types'

interface NewPostInput {
  content: string
  category: CategorySlug
  tag?: string
  spoiler: boolean
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: NewPostInput) => {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: input.content.trim(),
          category: input.category,
          tag: input.tag?.trim() || null,
          spoiler: input.spoiler,
          client_token: getDeviceToken(),
        })
        .select()
        .single()

      if (error) throw error
      recordPost()
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['categoryCounts'] })
    },
  })
}
